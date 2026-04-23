"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { SearchOptions } from "@/lib/textProcessor";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (
    query: string,
    currentIndex: number,
    options: SearchOptions,
  ) => void;
  options: SearchOptions;
  totalMatches: number;
};

export default function SearchBar({
  isOpen,
  onClose,
  onSearch,
  options,
  totalMatches,
}: Props) {
  const [query, setQuery] = useState("");
  const [currentMatch, setCurrentMatch] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const queryRef = useRef(query);
  const optionsRef = useRef(options);
  const totalMatchesRef = useRef(totalMatches);
  const currentMatchRef = useRef(currentMatch);
  const onSearchRef = useRef(onSearch);

  useEffect(() => {
    queryRef.current = query;
  }, [query]);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);
  useEffect(() => {
    totalMatchesRef.current = totalMatches;
  }, [totalMatches]);
  useEffect(() => {
    currentMatchRef.current = currentMatch;
  }, [currentMatch]);
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    } else {
      setQuery("");
      setCurrentMatch(0);
    }
  }, [isOpen]);

  const scrollToMatch = useCallback(() => {
    setTimeout(() => {
      const el = document.querySelector('[data-current-match="true"]');
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 60);
  }, []);

  const handleChange = useCallback((value: string) => {
    setQuery(value);
    setCurrentMatch(0);
    onSearchRef.current(value, 0, optionsRef.current);
  }, []);

  const handleClose = useCallback(() => {
    setQuery("");
    setCurrentMatch(0);
    onSearchRef.current("", 0, optionsRef.current);
    onClose();
  }, [onClose]);

  const toggleCaseSensitive = useCallback(() => {
    const next: SearchOptions = {
      ...optionsRef.current,
      caseSensitive: !optionsRef.current.caseSensitive,
    };
    setCurrentMatch(0);
    onSearchRef.current(queryRef.current, 0, next);
  }, []);

  const toggleWholeWord = useCallback(() => {
    const next: SearchOptions = {
      ...optionsRef.current,
      wholeWord: !optionsRef.current.wholeWord,
    };
    setCurrentMatch(0);
    onSearchRef.current(queryRef.current, 0, next);
  }, []);

  const goToNext = useCallback(() => {
    const total = totalMatchesRef.current;
    if (total === 0) return;
    const next = (currentMatchRef.current + 1) % total;
    setCurrentMatch(next);
    onSearchRef.current(queryRef.current, next, optionsRef.current);
    scrollToMatch();
  }, [scrollToMatch]);

  const goToPrev = useCallback(() => {
    const total = totalMatchesRef.current;
    if (total === 0) return;
    const next = (currentMatchRef.current - 1 + total) % total;
    setCurrentMatch(next);
    onSearchRef.current(queryRef.current, next, optionsRef.current);
    scrollToMatch();
  }, [scrollToMatch]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (e.shiftKey) goToPrev();
        else goToNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose, goToNext, goToPrev]);

  if (!isOpen) return null;

  const hasQuery = query.length >= 1;
  const hasResults = totalMatches > 0;

  return (
    <div
      style={{
        position: "fixed",
        top: "64px",
        // Center using left+right+margin instead of transform
        // This avoids scrollbar width offset issues
        left: 0,
        right: 0,
        margin: "0 auto",
        width: "calc(100% - 32px)",
        maxWidth: "480px",
        zIndex: 200,
        background: "var(--elevated, #1e1e1e)",
        border: "1px solid var(--border, #272727)",
        borderRadius: "18px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)",
        overflow: "hidden",
        animation: "scaleIn 180ms ease forwards",
      }}
    >
      {/* Main input row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "10px 12px",
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--muted, #606060)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flexShrink: 0 }}
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Search…"
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "var(--text, #ebebeb)",
            fontSize: "14px",
            minWidth: 0,
          }}
        />

        {hasQuery && (
          <span
            style={{
              fontSize: "11px",
              color: hasResults
                ? "var(--text-secondary, #a0a0a0)"
                : "var(--muted, #606060)",
              flexShrink: 0,
              fontVariantNumeric: "tabular-nums",
              background: "var(--surface, #161616)",
              padding: "2px 7px",
              borderRadius: "6px",
              border: "1px solid var(--border, #272727)",
              whiteSpace: "nowrap",
            }}
          >
            {hasResults
              ? `${currentMatch + 1} / ${totalMatches}`
              : "No results"}
          </span>
        )}

        {hasResults && (
          <>
            <button
              onClick={goToPrev}
              aria-label="Previous match"
              style={{
                flexShrink: 0,
                width: "28px",
                height: "28px",
                borderRadius: "8px",
                background: "transparent",
                border: "none",
                color: "var(--text-secondary, #a0a0a0)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="18 15 12 9 6 15" />
              </svg>
            </button>
            <button
              onClick={goToNext}
              aria-label="Next match"
              style={{
                flexShrink: 0,
                width: "28px",
                height: "28px",
                borderRadius: "8px",
                background: "transparent",
                border: "none",
                color: "var(--text-secondary, #a0a0a0)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </>
        )}

        <button
          onClick={handleClose}
          aria-label="Close search"
          style={{
            flexShrink: 0,
            width: "28px",
            height: "28px",
            borderRadius: "8px",
            background: "transparent",
            border: "none",
            color: "var(--muted, #606060)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Options row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "8px 12px 10px",
          borderTop: "1px solid var(--border-subtle, #1f1f1f)",
        }}
      >
        <button
          onClick={toggleCaseSensitive}
          aria-label="Case sensitive"
          aria-pressed={options.caseSensitive}
          style={{
            padding: "3px 9px",
            borderRadius: "6px",
            fontSize: "11px",
            fontWeight: 600,
            border: `1px solid ${
              options.caseSensitive
                ? "var(--accent, #60a5fa)"
                : "var(--border, #272727)"
            }`,
            background: options.caseSensitive
              ? "var(--accentMuted, #1a3a5c)"
              : "transparent",
            color: options.caseSensitive
              ? "var(--accent, #60a5fa)"
              : "var(--muted, #606060)",
            cursor: "pointer",
            outline: "none",
          }}
        >
          Aa
        </button>

        <button
          onClick={toggleWholeWord}
          aria-label="Whole word"
          aria-pressed={options.wholeWord}
          style={{
            padding: "3px 9px",
            borderRadius: "6px",
            fontSize: "11px",
            fontWeight: 600,
            border: `1px solid ${
              options.wholeWord
                ? "var(--accent, #60a5fa)"
                : "var(--border, #272727)"
            }`,
            background: options.wholeWord
              ? "var(--accentMuted, #1a3a5c)"
              : "transparent",
            color: options.wholeWord
              ? "var(--accent, #60a5fa)"
              : "var(--muted, #606060)",
            cursor: "pointer",
            outline: "none",
          }}
        >
          W_
        </button>

        {/* Desktop keyboard hints */}
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            gap: "8px",
            alignItems: "center",
          }}
          className="hidden sm:flex"
        >
          {[
            { key: "Enter", label: "Next" },
            { key: "⇧ Enter", label: "Prev" },
            { key: "Esc", label: "Close" },
          ].map(({ key, label }) => (
            <span
              key={key}
              style={{
                fontSize: "10px",
                color: "var(--muted, #606060)",
                display: "flex",
                alignItems: "center",
                gap: "3px",
              }}
            >
              <kbd
                style={{
                  padding: "1px 5px",
                  borderRadius: "4px",
                  background: "var(--surface, #161616)",
                  border: "1px solid var(--border, #272727)",
                  fontSize: "10px",
                  fontFamily: "inherit",
                }}
              >
                {key}
              </kbd>
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
