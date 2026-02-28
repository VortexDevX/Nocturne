"use client";

import { ThemeName } from "@/lib/themes";
import { useTheme } from "@/lib/useTheme";
import { CheckIcon } from "./Icons";

const THEMES: { key: ThemeName; label: string; bg: string }[] = [
  { key: "light", label: "Light", bg: "#fafafa" },
  { key: "dark", label: "Dark", bg: "#0a0a0a" },
  { key: "sepia", label: "Sepia", bg: "#f5f0e6" },
  { key: "amoled", label: "AMOLED", bg: "#000000" },
];

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className="flex items-center gap-2"
      role="radiogroup"
      aria-label="Choose theme"
    >
      {THEMES.map((t) => (
        <button
          key={t.key}
          onClick={() => setTheme(t.key)}
          role="radio"
          aria-checked={theme === t.key}
          aria-label={t.label}
          className={`
            relative
            w-7 h-7
            rounded-full
            transition-transform duration-200
            focus:outline-none
            focus-visible:ring-2 focus-visible:ring-(--accent) focus-visible:ring-offset-2
            ${theme === t.key ? "scale-110" : "hover:scale-105 active:scale-95"}
          `}
          style={{ backgroundColor: t.bg }}
        >
          {/* Outer ring - always visible */}
          <span
            className="absolute inset-0 rounded-full ring-1 ring-inset ring-black/50"
            aria-hidden="true"
          />

          {/* Additional outer ring for light colors */}
          <span
            className="absolute inset-0 rounded-full ring-1 ring-white/50"
            aria-hidden="true"
          />

          {/* Selected state - checkmark */}
          {theme === t.key && (
            <span className="absolute inset-0 flex items-center justify-center">
              <CheckIcon
                size={14}
                className={
                  t.key === "light" || t.key === "sepia"
                    ? "text-black/70"
                    : "text-white/90"
                }
              />
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
