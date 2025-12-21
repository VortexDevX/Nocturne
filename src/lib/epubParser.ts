import JSZip from "jszip";

export async function parseEpub(file: File): Promise<string> {
  const zip = await JSZip.loadAsync(file);
  let text = "";

  const files = Object.values(zip.files).filter(
    (f) => !f.dir && (f.name.endsWith(".xhtml") || f.name.endsWith(".html"))
  );

  for (const file of files) {
    const html = await file.async("string");

    // strip tags
    const plain = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&");

    text += plain + "\n\n";
  }

  return text.trim();
}
