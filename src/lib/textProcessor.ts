export function processContent(content: string): string[] {
  if (!content) return [];

  return content
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

export function countMatches(paragraphs: string[], query: string): number {
  if (!query || query.length < 2) return 0;

  const queryLower = query.toLowerCase();
  let count = 0;

  paragraphs.forEach((paragraph) => {
    const textLower = paragraph.toLowerCase();
    let pos = 0;
    while ((pos = textLower.indexOf(queryLower, pos)) !== -1) {
      count++;
      pos += 1;
    }
  });

  return count;
}

export function getMatchIndices(
  paragraphs: string[],
  query: string
): { paragraphIndex: number; start: number; end: number }[] {
  if (!query || query.length < 2) return [];

  const queryLower = query.toLowerCase();
  const matches: { paragraphIndex: number; start: number; end: number }[] = [];

  paragraphs.forEach((paragraph, paragraphIndex) => {
    const textLower = paragraph.toLowerCase();
    let pos = 0;
    while ((pos = textLower.indexOf(queryLower, pos)) !== -1) {
      matches.push({
        paragraphIndex,
        start: pos,
        end: pos + query.length,
      });
      pos += 1;
    }
  });

  return matches;
}
