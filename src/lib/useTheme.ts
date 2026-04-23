"use client";

import { useEffect, useCallback, useSyncExternalStore } from "react";
import { themes, ThemeName } from "./themes";

const STORAGE_KEY = "nocturne_theme";
const EVENT_KEY = "nocturne_theme_change";

function getStoredTheme(): ThemeName {
  if (typeof window === "undefined") return "dark";
  const saved = localStorage.getItem(STORAGE_KEY) as ThemeName | null;
  return saved && themes[saved] ? saved : "dark";
}

function subscribeToTheme(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handleEvent = () => onStoreChange();
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) onStoreChange();
  };

  window.addEventListener(EVENT_KEY, handleEvent);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener(EVENT_KEY, handleEvent);
    window.removeEventListener("storage", handleStorage);
  };
}

function applyThemeToDOM(themeName: ThemeName) {
  const t = themes[themeName];
  if (!t) return;

  const root = document.documentElement;

  // Map theme keys to CSS variables
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

  // data-theme for CSS overrides
  root.setAttribute("data-theme", themeName);
}

export function useTheme() {
  const theme = useSyncExternalStore<ThemeName>(
    subscribeToTheme,
    getStoredTheme,
    (): ThemeName => "dark"
  );

  const setTheme = useCallback((newTheme: ThemeName) => {
    if (!themes[newTheme]) return;
    applyThemeToDOM(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
    window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: newTheme }));
  }, []);

  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  return { theme, setTheme };
}
