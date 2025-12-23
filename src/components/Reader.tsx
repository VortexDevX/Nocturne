"use client";

import { useMemo } from "react";
import { ReaderSettings, FONT_STACKS } from "@/lib/readerSettings";
import { processContent, getMatchIndices } from "@/lib/textProcessor";

type Props = {
  content: string;
  settings: ReaderSettings;
  searchQuery?: string;
  currentMatchIndex?: number;
};

export default function Reader({
  content,
  settings,
  searchQuery = "",
  currentMatchIndex = 0,
}: Props) {
  // Process content into paragraphs
  const paragraphs = useMemo(() => processContent(content), [content]);

  // Get all match positions
  const matches = useMemo(
    () => getMatchIndices(paragraphs, searchQuery),
    [paragraphs, searchQuery]
  );

  // Get current match info
  const currentMatch = matches[currentMatchIndex];

  // Render paragraph with highlights
  const renderParagraph = (text: string, paragraphIndex: number) => {
    if (!searchQuery || searchQuery.length < 2) {
      return text;
    }

    // Get matches for this paragraph
    const paragraphMatches = matches.filter(
      (m) => m.paragraphIndex === paragraphIndex
    );

    if (paragraphMatches.length === 0) {
      return text;
    }

    const parts: React.ReactNode[] = [];
    let lastEnd = 0;

    paragraphMatches.forEach((match) => {
      const isCurrent =
        currentMatch &&
        currentMatch.paragraphIndex === paragraphIndex &&
        currentMatch.start === match.start;

      // Text before match
      if (match.start > lastEnd) {
        parts.push(
          <span key={`t-${paragraphIndex}-${lastEnd}`}>
            {text.slice(lastEnd, match.start)}
          </span>
        );
      }

      // Highlighted match
      parts.push(
        <mark
          key={`m-${paragraphIndex}-${match.start}`}
          data-current-match={isCurrent ? "true" : undefined}
          style={{
            backgroundColor: isCurrent ? "var(--accent)" : "var(--accentMuted)",
            color: isCurrent ? "white" : "inherit",
            borderRadius: "2px",
            padding: "1px 2px",
          }}
        >
          {text.slice(match.start, match.end)}
        </mark>
      );

      lastEnd = match.end;
    });

    // Remaining text
    if (lastEnd < text.length) {
      parts.push(
        <span key={`t-${paragraphIndex}-${lastEnd}`}>
          {text.slice(lastEnd)}
        </span>
      );
    }

    return parts;
  };

  if (!content || paragraphs.length === 0) return null;

  return (
    <article
      className="py-8 page-enter"
      style={{
        fontSize: `${settings.fontSize}px`,
        lineHeight: settings.lineHeight,
        fontFamily: FONT_STACKS[settings.fontFamily],
      }}
    >
      {paragraphs.map((paragraph, index) => (
        <p
          key={index}
          className="mb-[1em] last:mb-0 transition-colors duration-200"
          style={{
            whiteSpace: "pre-wrap",
            color: "var(--text)",
          }}
        >
          {renderParagraph(paragraph, index)}
        </p>
      ))}
    </article>
  );
}
