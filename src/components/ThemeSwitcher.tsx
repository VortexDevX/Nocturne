"use client";

import { ThemeName } from "@/lib/themes";
import { useTheme } from "@/lib/useTheme";

const THEMES: {
  key: ThemeName;
  label: string;
  bg: string;
}[] = [
  { key: "dark", label: "Dark", bg: "#161616" },
  { key: "sepia", label: "Sepia", bg: "#f0e8d4" },
  { key: "amoled", label: "AMOLED", bg: "#000000" },
];

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Choose theme"
      style={{ display: "flex", alignItems: "center", gap: "10px" }}
    >
      {THEMES.map((t) => {
        const isActive = theme === t.key;
        return (
          <button
            key={t.key}
            onClick={() => setTheme(t.key)}
            role="radio"
            aria-checked={isActive}
            aria-label={t.label}
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              backgroundColor: t.bg,
              outline: isActive
                ? "2px solid var(--accent)"
                : "1.5px solid rgba(255,255,255,0.15)",
              outlineOffset: isActive ? "2px" : "0px",
              border: "none",
              cursor: "pointer",
              transition: "all 180ms ease",
              transform: isActive ? "scale(1.2)" : "scale(1)",
              flexShrink: 0,
            }}
          />
        );
      })}
    </div>
  );
}
