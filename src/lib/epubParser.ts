import JSZip from "jszip";

function resolveRelativePath(baseFilePath: string, relativePath: string): string {
  if (!relativePath) return "";
  if (relativePath.startsWith("/")) return relativePath.slice(1);

  const baseParts = baseFilePath.split("/");
  baseParts.pop();

  const relativeParts = relativePath.split("/");
  for (const part of relativeParts) {
    if (!part || part === ".") continue;
    if (part === "..") {
      baseParts.pop();
    } else {
      baseParts.push(part);
    }
  }

  return baseParts.join("/");
}

export async function parseEpub(file: File): Promise<string> {
  const zip = await JSZip.loadAsync(file);
  let text = "";

  const orderedFiles: string[] = [];
  const containerFile = zip.file("META-INF/container.xml");

  if (containerFile) {
    const containerXml = await containerFile.async("string");
    const containerDoc = new DOMParser().parseFromString(containerXml, "application/xml");
    const rootFilePath =
      containerDoc.querySelector("rootfile")?.getAttribute("full-path") || "";

    const opfPath =
      rootFilePath ||
      Object.values(zip.files).find((f) => !f.dir && f.name.endsWith(".opf"))?.name ||
      "";

    if (opfPath) {
      const opfFile = zip.file(opfPath);
      const opfXml = opfFile ? await opfFile.async("string") : "";

      if (opfXml) {
        const opfDoc = new DOMParser().parseFromString(opfXml, "application/xml");
        const manifest = new Map<string, string>();

        opfDoc.querySelectorAll("manifest > item").forEach((item) => {
          const id = item.getAttribute("id");
          const href = item.getAttribute("href");
          const mediaType = item.getAttribute("media-type") || "";

          if (
            id &&
            href &&
            (mediaType.includes("html") || href.endsWith(".xhtml") || href.endsWith(".html"))
          ) {
            manifest.set(id, resolveRelativePath(opfPath, href));
          }
        });

        opfDoc.querySelectorAll("spine > itemref").forEach((itemRef) => {
          const idRef = itemRef.getAttribute("idref");
          const filePath = idRef ? manifest.get(idRef) : undefined;
          if (filePath) {
            orderedFiles.push(filePath);
          }
        });
      }
    }
  }

  const fallbackFiles = Object.values(zip.files)
    .filter((f) => !f.dir && (f.name.endsWith(".xhtml") || f.name.endsWith(".html")))
    .map((f) => f.name)
    .sort((a, b) => a.localeCompare(b));

  const files = orderedFiles.length > 0 ? orderedFiles : fallbackFiles;

  for (const filePath of files) {
    const chapterFile = zip.file(filePath);
    if (!chapterFile) continue;
    const html = await chapterFile.async("string");
    const doc = new DOMParser().parseFromString(html, "text/html");
    doc.querySelectorAll("script, style").forEach((node) => node.remove());
    const plain = doc.body?.textContent?.replace(/\s+\n/g, "\n").trim() || "";

    if (!plain) continue;

    text += plain + "\n\n";
  }

  return text.trim();
}
