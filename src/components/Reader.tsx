"use client";

import { useMemo } from "react";
import { ReaderSettings, FONT_STACKS } from "@/lib/readerSettings";
import {
  processContent,
  getMatchIndices,
  SearchOptions,
} from "@/lib/textProcessor";

type Props = {
  content: string;
  paragraphs?: string[];
  settings: ReaderSettings;
  searchQuery?: string;
  currentMatchIndex?: number;
  searchOptions?: SearchOptions;
};

export default function Reader({
  content,
  paragraphs: paragraphsProp,
  settings,
  searchQuery = "",
  currentMatchIndex = 0,
  searchOptions = {},
}: Props) {
  // Process content into paragraphs
  const paragraphs = useMemo(
    () => paragraphsProp ?? processContent(content),
    [content, paragraphsProp]
  );

  // Get all match positions
  const matches = useMemo(
    () => getMatchIndices(paragraphs, searchQuery, searchOptions),
    [paragraphs, searchQuery, searchOptions]
  );

  // Get current match info
  const currentMatch = matches[currentMatchIndex];
  const matchesByParagraph = useMemo(() => {
    const grouped = new Map<number, { start: number; end: number }[]>();
    matches.forEach(({ paragraphIndex, start, end }) => {
      const existing = grouped.get(paragraphIndex);
      if (existing) {
        existing.push({ start, end });
      } else {
        grouped.set(paragraphIndex, [{ start, end }]);
      }
    });
    return grouped;
  }, [matches]);

  // Render paragraph with highlights
  const renderParagraph = (text: string, paragraphIndex: number) => {
    if (!searchQuery || searchQuery.length < 2) {
      return text;
    }

    // Get matches for this paragraph
    const paragraphMatches = matchesByParagraph.get(paragraphIndex) || [];

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
        display: "flex",
        flexDirection: "column",
        gap: `${settings.paragraphSpacing}em`,
      }}
    >
      {paragraphs.map((paragraph, index) => (
        <p
          key={index}
          className="transition-colors duration-200 reader-paragraph"
          style={{
            whiteSpace: settings.reflowMode === "original" ? "pre-wrap" : "normal",
            color: "var(--text)",
            textAlign: settings.justifiedText ? "justify" : "left",
            textAlignLast: settings.justifiedText ? "left" : "auto",
          }}
        >
          {renderParagraph(paragraph, index)}
        </p>
      ))}
    </article>
  );
}
