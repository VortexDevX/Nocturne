"use client";

import { useEffect } from "react";
import { themes, ThemeName } from "@/lib/themes";
import { loadAccentColor, applyAccentColor } from "@/lib/accentColors";

function applyThemeToDOM(themeName: ThemeName) {
  const t = themes[themeName];
  if (!t) return;

  const root = document.documentElement;

  const varMap: Record<string, string> = {
    bg:           "--bg",
    surface:      "--surface",
    elevated:     "--elevated",
    text:         "--text",
    textSecondary:"--text-secondary",
    muted:        "--muted",
    border:       "--border",
    borderSubtle: "--border-subtle",
    accentMuted:  "--accentMuted",
    accentGlow:   "--accent-glow",
  };

  Object.entries(varMap).forEach(([key, cssVar]) => {
    const val = (t as Record<string, string>)[key];
    if (val) root.style.setProperty(cssVar, val);
  });

  root.style.setProperty(
    "color-scheme",
    themeName === "sepia" ? "light" : "dark"
  );

  root.setAttribute("data-theme", themeName);
}

export default function ThemeInitializer() {
  useEffect(() => {
    const saved = localStorage.getItem("nocturne_theme") as ThemeName | null;
    const themeName: ThemeName =
      saved && themes[saved] ? saved : "dark";

    applyThemeToDOM(themeName);

    const accent = loadAccentColor();
    applyAccentColor(accent);
  }, []);

  return null;
}
