"use client";

import { useEffect, useState, useCallback } from "react";
import { themes, ThemeName } from "./themes";

const STORAGE_KEY = "nocturne_theme";

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeName>("light");
  const [mounted, setMounted] = useState(false);

  // Apply theme to document
  const applyTheme = useCallback((themeName: ThemeName) => {
    const t = themes[themeName];
    const root = document.documentElement;

    Object.entries(t).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });

    // Set color-scheme for native elements
    root.style.setProperty(
      "color-scheme",
      themeName === "light" || themeName === "sepia" ? "light" : "dark"
    );
  }, []);

  // Initial load
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeName | null;
    const initial = saved && themes[saved] ? saved : "light";
    setThemeState(initial);
    applyTheme(initial);
    setMounted(true);
  }, [applyTheme]);

  // Theme setter
  const setTheme = useCallback(
    (newTheme: ThemeName) => {
      setThemeState(newTheme);
      applyTheme(newTheme);
      localStorage.setItem(STORAGE_KEY, newTheme);
    },
    [applyTheme]
  );

  return { theme, setTheme, mounted };
}
