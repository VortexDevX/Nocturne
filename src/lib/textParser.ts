type CleanTextOptions = {
  reflowHardWrappedLines?: boolean;
};

const TERMINAL_PUNCTUATION = /[.!?…"'”’)\]\u300d\u300f\u3011]$/;
const SPACE_NORMALIZATION_REGEX = /[\u00A0\u2007\u202F]/g;
const ZERO_WIDTH_REGEX = /[\u200B\uFEFF]/g;

function isLikelyHardWrapped(lines: string[]): boolean {
  const nonEmpty = lines.filter((line) => line.trim().length > 0);
  if (nonEmpty.length < 20) return false;

  const blankRatio = 1 - nonEmpty.length / lines.length;
  if (blankRatio > 0.15) return false;

  const lengths = nonEmpty.map((line) => line.length);
  const avgLength = lengths.reduce((sum, value) => sum + value, 0) / lengths.length;
  if (avgLength < 35 || avgLength > 120) return false;

  const continuationLines = nonEmpty.filter(
    (line) => !TERMINAL_PUNCTUATION.test(line.trim())
  ).length;
  const continuationRatio = continuationLines / nonEmpty.length;

  return continuationRatio > 0.25;
}

function reflowHardWrappedText(text: string): string {
  const lines = text.split("\n");
  const paragraphs: string[] = [];
  let buffer = "";

  const flush = () => {
    const value = buffer.trim();
    if (value) paragraphs.push(value);
    buffer = "";
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trim();

    if (!line) {
      flush();
      return;
    }

    if (!buffer) {
      buffer = line;
      return;
    }

    if (buffer.endsWith("-") && /^[A-Za-z]/.test(line)) {
      buffer = buffer.slice(0, -1) + line;
      return;
    }

    if (TERMINAL_PUNCTUATION.test(buffer)) {
      flush();
      buffer = line;
      return;
    }

    buffer += ` ${line}`;
  });

  flush();
  return paragraphs.join("\n\n");
}

export function cleanText(raw: string, options: CleanTextOptions = {}): string {
  const { reflowHardWrappedLines = true } = options;

  let text = raw
    // handle escaped junk text like "\r"
    .replace(/\\r\\n/g, "\n")
    .replace(/\\r/g, "\n")
    // normalize real line endings
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    // normalize odd spaces often found in scraped TXT files
    .replace(SPACE_NORMALIZATION_REGEX, " ")
    .replace(ZERO_WIDTH_REGEX, "")
    // remove trailing spaces
    .replace(/[ \t]+$/gm, "");

  if (reflowHardWrappedLines) {
    const lines = text.split("\n");
    if (isLikelyHardWrapped(lines)) {
      text = reflowHardWrappedText(text);
    }
  }

  return text
    // collapse 3+ newlines into 2
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
