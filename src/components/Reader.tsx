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

// ── Chapter heading detection ──────────────────────────────────────────────

const HEADING_PATTERNS = [
  /^chapter\s+[\divxlcdmIVXLCDM\w]+/i,
  /^vol(ume|\.)\s+[\divxlcdmIVXLCDM\w]+/i,
  /^part\s+[\divxlcdmIVXLCDM\w]+/i,
  /^(prologue|epilogue|interlude|afterword|foreword|preface|introduction|conclusion)(\s|$|:)/i,
  /^arc\s+[\divxlcdmIVXLCDM\w]+/i,
];

const SENTENCE_ENDINGS = /[!?,;…]$/;
const MAX_HEADING_LENGTH = 120;

function isChapterHeading(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length > MAX_HEADING_LENGTH) return false;
  if (SENTENCE_ENDINGS.test(trimmed)) return false;
  if (trimmed.length < 2) return false;
  return HEADING_PATTERNS.some((p) => p.test(trimmed));
}

// ── Search highlight rendering ─────────────────────────────────────────────

type MatchRange = { start: number; end: number };

function renderWithHighlights(
  text: string,
  paragraphIndex: number,
  matchesByParagraph: Map<number, MatchRange[]>,
  currentMatch: { paragraphIndex: number; start: number } | undefined,
): React.ReactNode {
  const paragraphMatches = matchesByParagraph.get(paragraphIndex);
  if (!paragraphMatches || paragraphMatches.length === 0) return text;

  const parts: React.ReactNode[] = [];
  let lastEnd = 0;

  paragraphMatches.forEach((match) => {
    const isCurrent =
      currentMatch &&
      currentMatch.paragraphIndex === paragraphIndex &&
      currentMatch.start === match.start;

    if (match.start > lastEnd) {
      parts.push(
        <span key={`t-${paragraphIndex}-${lastEnd}`}>
          {text.slice(lastEnd, match.start)}
        </span>,
      );
    }

    parts.push(
      <mark
        key={`m-${paragraphIndex}-${match.start}`}
        data-current-match={isCurrent ? "true" : undefined}
        style={{
          backgroundColor: isCurrent ? "var(--accent)" : "var(--accentMuted)",
          color: isCurrent ? "var(--bg)" : "inherit",
          borderRadius: "2px",
          padding: "0px 2px",
        }}
      >
        {text.slice(match.start, match.end)}
      </mark>,
    );

    lastEnd = match.end;
  });

  if (lastEnd < text.length) {
    parts.push(
      <span key={`t-${paragraphIndex}-${lastEnd}`}>{text.slice(lastEnd)}</span>,
    );
  }

  return parts;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function Reader({
  content,
  paragraphs: paragraphsProp,
  settings,
  searchQuery = "",
  currentMatchIndex = 0,
  searchOptions = {},
}: Props) {
  const paragraphs = useMemo(
    () => paragraphsProp ?? processContent(content),
    [content, paragraphsProp],
  );

  const matches = useMemo(
    () => getMatchIndices(paragraphs, searchQuery, searchOptions),
    [paragraphs, searchQuery, searchOptions],
  );

  const currentMatch = matches[currentMatchIndex];

  const matchesByParagraph = useMemo(() => {
    const grouped = new Map<number, MatchRange[]>();
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

  const classified = useMemo(
    () =>
      paragraphs.map((p) => ({
        text: p,
        isHeading: isChapterHeading(p),
      })),
    [paragraphs],
  );

  if (!content || paragraphs.length === 0) return null;

  const hasSearch = searchQuery.length >= 1;

  return (
    <article
      className="page-enter"
      style={{
        paddingTop: "24px",
        paddingBottom: "48px",
        fontFamily: FONT_STACKS[settings.fontFamily],
        fontSize: `${settings.fontSize}px`,
        lineHeight: settings.lineHeight,
      }}
    >
      {classified.map(({ text, isHeading }, index) => {
        const renderedContent = hasSearch
          ? renderWithHighlights(text, index, matchesByParagraph, currentMatch)
          : text;

        if (isHeading) {
          return (
            <Heading
              key={index}
              index={index}
              settings={settings}
              isFirst={index === 0}
            >
              {renderedContent}
            </Heading>
          );
        }

        return (
          <Paragraph key={index} settings={settings}>
            {renderedContent}
          </Paragraph>
        );
      })}
    </article>
  );
}

// ── Heading ────────────────────────────────────────────────────────────────

function Heading({
  children,
  settings,
  isFirst,
}: {
  children: React.ReactNode;
  index: number;
  settings: ReaderSettings;
  isFirst: boolean;
}) {
  return (
    <div
      style={{
        marginTop: isFirst ? "0" : "3.5em",
        marginBottom: "1.5em",
      }}
    >
      {/* Accent bar - always show, acts as visual anchor */}
      <div
        aria-hidden="true"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "12px",
        }}
      >
        <div
          style={{
            width: "28px",
            height: "2px",
            borderRadius: "2px",
            background: "var(--accent)",
            opacity: 0.7,
            flexShrink: 0,
          }}
        />
        <div
          style={{
            flex: 1,
            height: "1px",
            background: "var(--border)",
            borderRadius: "1px",
          }}
        />
      </div>

      {/* Heading text */}
      <h2
        className="reader-paragraph"
        style={{
          fontSize: `${Math.round(settings.fontSize * 1.2)}px`,
          fontWeight: 700,
          letterSpacing: "-0.015em",
          color: "var(--text)",
          lineHeight: 1.35,
          fontFamily: FONT_STACKS[settings.fontFamily],
          textAlign: "left",
          margin: 0,
        }}
      >
        {children}
      </h2>
    </div>
  );
}

// ── Paragraph ─────────────────────────────────────────────────────────────

function Paragraph({
  children,
  settings,
}: {
  children: React.ReactNode;
  settings: ReaderSettings;
}) {
  return (
    <p
      className="reader-paragraph"
      style={{
        color: "var(--text)",
        opacity: 0.9,
        marginBottom: `${settings.paragraphSpacing}em`,
        whiteSpace: settings.reflowMode === "original" ? "pre-wrap" : "normal",
        textAlign: settings.justifiedText ? "justify" : "left",
        textAlignLast: settings.justifiedText ? "left" : "auto",
        margin: 0,
        paddingBottom: `${settings.paragraphSpacing}em`,
      }}
    >
      {children}
    </p>
  );
}
