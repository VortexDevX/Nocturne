import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { cleanText } from "../textParser";
import { processContent } from "../textProcessor";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturePath = path.join(__dirname, "fixtures", "hard-wrapped-nbsp.txt");
const fixture = fs.readFileSync(fixturePath, "utf-8");

describe("cleanText", () => {
  it("normalizes non-breaking spaces and reflows hard-wrapped text", () => {
    const longWrappedInput = [
      "Chapter 255: Entrance as a Character (1)",
      ...Array.from({ length: 22 }, (_, i) =>
        i % 2 === 0
          ? "My\u00A0voice\u00A0didn’t\u00A0sound\u00A0like\u00A0me.\u00A0It\u00A0was\u00A0only\u00A0a\u00A0moment\u00A0but\u00A0it\u00A0felt\u00A0like\u00A0I\u00A0had\u00A0become\u00A0a"
          : "different\u00A0existence\u00A0and\u00A0came\u00A0back.\u00A0A\u00A0terrible\u00A0sensation\u00A0remained\u00A0in\u00A0my\u00A0entire\u00A0body."
      ),
    ].join("\n");

    const cleaned = cleanText(longWrappedInput, { reflowHardWrappedLines: true });

    expect(cleaned).not.toContain("\u00A0");
    expect(cleaned).toContain("had become a different existence");
    expect(cleaned).not.toContain("had become a\ndifferent existence");
  });

  it("preserves original hard line breaks when reflow is disabled", () => {
    const cleaned = cleanText(fixture, { reflowHardWrappedLines: false });
    expect(cleaned).toContain("had become a\ndifferent existence");
    expect(cleaned).toContain("to check\nthe Attributes Window");
  });
});

describe("processContent", () => {
  it("keeps a hard-wrapped file in a single paragraph when original mode is used", () => {
    const paragraphs = processContent(fixture, { reflowHardWrappedLines: false });
    expect(paragraphs.length).toBe(1);
  });

  it("creates cleaner paragraphs for reading mode", () => {
    const paragraphs = processContent(fixture, { reflowHardWrappedLines: true });
    expect(paragraphs.length).toBe(1);
    expect(paragraphs[0]).toContain(
      "I couldn’t clearly remember what had happened. I asked the Fourth Wall to check"
    );
  });
});
