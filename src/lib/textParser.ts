export function cleanText(raw: string): string {
  return (
    raw
      // handle escaped junk text like "\r"
      .replace(/\\r\\n/g, "\n")
      .replace(/\\r/g, "\n")

      // normalize real line endings
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")

      // remove trailing spaces
      .replace(/[ \t]+$/gm, "")

      // collapse 3+ newlines into 2
      .replace(/\n{3,}/g, "\n\n")

      .trim()
  );
}
