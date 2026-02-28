"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { SearchOptions } from "@/lib/textProcessor";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string, currentIndex: number, options: SearchOptions) => void;
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

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const scrollToCurrentMatch = useCallback(() => {
    window.setTimeout(() => {
      const element = document.querySelector('[data-current-match="true"]');
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 50);
  }, []);

  const handleChange = useCallback(
    (value: string) => {
      setQuery(value);
      setCurrentMatch(0);
      onSearch(value, 0, options);
    },
    [onSearch, options]
  );

  const handleClose = useCallback(() => {
    setQuery("");
    setCurrentMatch(0);
    onSearch("", 0, options);
    onClose();
  }, [onClose, onSearch, options]);

  const toggleCaseSensitive = useCallback(() => {
    const nextOptions = { ...options, caseSensitive: !options.caseSensitive };
    setCurrentMatch(0);
    onSearch(query, 0, nextOptions);
  }, [onSearch, options, query]);

  const toggleWholeWord = useCallback(() => {
    const nextOptions = { ...options, wholeWord: !options.wholeWord };
    setCurrentMatch(0);
    onSearch(query, 0, nextOptions);
  }, [onSearch, options, query]);

  const goToNext = useCallback(() => {
    if (totalMatches === 0) return;
    setCurrentMatch((prev) => {
      const nextIndex = (prev + 1) % totalMatches;
      onSearch(query, nextIndex, options);
      scrollToCurrentMatch();
      return nextIndex;
    });
  }, [onSearch, options, query, scrollToCurrentMatch, totalMatches]);

  const goToPrev = useCallback(() => {
    if (totalMatches === 0) return;
    setCurrentMatch((prev) => {
      const nextIndex = (prev - 1 + totalMatches) % totalMatches;
      onSearch(query, nextIndex, options);
      scrollToCurrentMatch();
      return nextIndex;
    });
  }, [onSearch, options, query, scrollToCurrentMatch, totalMatches]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (e.shiftKey) {
          goToPrev();
        } else {
          goToNext();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, goToNext, goToPrev, handleClose]);

  if (!isOpen) return null;

  return (
    <div
      className="
        fixed top-16 left-1/2 -translate-x-1/2 z-40
        w-[calc(100%-32px)] max-w-md
        bg-(--surface)
        border border-(--border)
        rounded-2xl
        shadow-xl
        overflow-hidden
      "
      style={{
        animation: "scaleIn 0.2s ease forwards",
      }}
    >
      <div className="flex items-center gap-2 p-3">
        {/* Search Icon */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--muted)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Search in document..."
          className="
            flex-1
            bg-transparent
            text-(--text)
            text-sm
            placeholder:text-(--muted)
            focus:outline-none
          "
        />
        <button
          onClick={toggleCaseSensitive}
          className={`px-2 py-1 rounded-md text-xs border transition-colors ${
            options.caseSensitive
              ? "border-(--accent) text-(--accent)"
              : "border-(--border) text-(--muted) hover:border-(--muted)"
          }`}
          aria-label="Toggle case sensitive"
        >
          Aa
        </button>
        <button
          onClick={toggleWholeWord}
          className={`px-2 py-1 rounded-md text-xs border transition-colors ${
            options.wholeWord
              ? "border-(--accent) text-(--accent)"
              : "border-(--border) text-(--muted) hover:border-(--muted)"
          }`}
          aria-label="Toggle whole word"
        >
          W
        </button>

        {/* Results count */}
        {query.length >= 2 && (
          <span className="text-xs text-(--muted) shrink-0 tabular-nums">
            {totalMatches > 0
              ? `${currentMatch + 1}/${totalMatches}`
              : "No results"}
          </span>
        )}

        {/* Navigation buttons */}
        {totalMatches > 0 && (
          <div className="flex items-center gap-1">
            <button
              onClick={goToPrev}
              className="p-1.5 rounded-lg hover:bg-(--border) transition-colors"
              aria-label="Previous match"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="18 15 12 9 6 15" />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="p-1.5 rounded-lg hover:bg-(--border) transition-colors"
              aria-label="Next match"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>
        )}

        {/* Close button */}
        <button
          onClick={handleClose}
          className="p-1.5 rounded-lg hover:bg-(--border) transition-colors"
          aria-label="Close search"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Keyboard hints - hide on mobile */}
      <div className="hidden sm:flex px-3 pb-2 items-center gap-3 text-xs text-(--muted)">
        <span>
          <kbd className="px-1.5 py-0.5 rounded bg-(--border) text-[10px]">
            Enter
          </kbd>{" "}
          Next
        </span>
        <span>
          <kbd className="px-1.5 py-0.5 rounded bg-(--border) text-[10px]">
            Shift+Enter
          </kbd>{" "}
          Prev
        </span>
        <span>
          <kbd className="px-1.5 py-0.5 rounded bg-(--border) text-[10px]">
            Esc
          </kbd>{" "}
          Close
        </span>
      </div>
    </div>
  );
}
