import { cleanText } from "./textParser";

export type ContentProcessingOptions = {
  reflowHardWrappedLines?: boolean;
};

export type SearchOptions = {
  caseSensitive?: boolean;
  wholeWord?: boolean;
};

type MatchRange = { paragraphIndex: number; start: number; end: number };

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function createSearchRegex(query: string, options: SearchOptions = {}): RegExp | null {
  if (!query || query.length < 2) return null;

  const escapedQuery = escapeRegex(query);
  const source = options.wholeWord
    ? `(^|[^\\p{L}\\p{N}_])(${escapedQuery})(?=$|[^\\p{L}\\p{N}_])`
    : `(${escapedQuery})`;

  return new RegExp(source, options.caseSensitive ? "gu" : "giu");
}

function collectMatches(
  paragraphs: string[],
  query: string,
  options: SearchOptions = {}
): MatchRange[] {
  const regex = createSearchRegex(query, options);
  if (!regex) return [];

  const matches: MatchRange[] = [];

  paragraphs.forEach((paragraph, paragraphIndex) => {
    regex.lastIndex = 0;
    let match = regex.exec(paragraph);

    while (match) {
      const matchedText = options.wholeWord ? match[2] : match[1];
      const startIndex =
        options.wholeWord && typeof match.index === "number"
          ? match.index + (match[1]?.length ?? 0)
          : match.index;

      matches.push({
        paragraphIndex,
        start: startIndex,
        end: startIndex + matchedText.length,
      });

      match = regex.exec(paragraph);
    }
  });

  return matches;
}

export function processContent(
  content: string,
  options: ContentProcessingOptions = {}
): string[] {
  if (!content) return [];

  const normalized = cleanText(content, {
    reflowHardWrappedLines: options.reflowHardWrappedLines ?? true,
  });

  return normalized
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

export function countMatches(
  paragraphs: string[],
  query: string,
  options: SearchOptions = {}
): number {
  return collectMatches(paragraphs, query, options).length;
}

export function getMatchIndices(
  paragraphs: string[],
  query: string,
  options: SearchOptions = {}
): MatchRange[] {
  return collectMatches(paragraphs, query, options);
}
