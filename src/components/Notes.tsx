"use client";

import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "nocturne_notes";

type Props = {
  compact?: boolean;
};

export default function Notes({ compact = false }: Props) {
  const [note, setNote] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(STORAGE_KEY) || "";
  });
  const [saved, setSaved] = useState(true);

  useEffect(() => {
    if (saved) return;
    const timeout = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, note);
      setSaved(true);
    }, 500);

    return () => clearTimeout(timeout);
  }, [note, saved]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setNote(e.target.value);
      setSaved(false);
    },
    []
  );

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <div className="flex items-center justify-between">
        <label
          htmlFor="notes-input"
          className={`${
            compact ? "text-lg" : "text-m"
          } font-medium text-(--muted)`}
        >
          Notes
        </label>
        <span
          className={`
            text-sm transition-opacity duration-200
            ${saved ? "text-(--muted) opacity-60" : "text-(--accent)"}
          `}
        >
          {saved ? "Saved" : "Saving..."}
        </span>
      </div>

      <textarea
        id="notes-input"
        value={note}
        onChange={handleChange}
        rows={compact ? 2 : 5}
        placeholder="Jot down your thoughts..."
        className={`
          w-full resize-none
          ${compact ? "p-3 text-sm" : "p-4 text-m"}
          bg-(--bg)
          border border-(--border)
          rounded-xl
          placeholder:text-(--muted) placeholder:opacity-50
          focus:outline-none focus:border-(--accent)
          transition-colors duration-200
        `}
      />
    </div>
  );
}
