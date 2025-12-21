"use client";

import { useMemo } from "react";
import { ReaderSettings, FONT_STACKS } from "@/lib/readerSettings";

type Props = {
  content: string;
  settings: ReaderSettings;
};

export default function Reader({ content, settings }: Props) {
  const paragraphs = useMemo(() => {
    if (!content) return [];

    return content
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  }, [content]);

  if (!content) return null;

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
          className="mb-[1em] last:mb-0 text-(--text) transition-colors duration-200"
          style={{ whiteSpace: "pre-wrap" }}
        >
          {paragraph}
        </p>
      ))}
    </article>
  );
}
