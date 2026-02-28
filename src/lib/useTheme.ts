"use client";

import { useEffect, useCallback, useSyncExternalStore } from "react";
import { themes, ThemeName } from "./themes";

const STORAGE_KEY = "nocturne_theme";
const EVENT_KEY = "nocturne_theme_change";

function getStoredTheme(): ThemeName {
  if (typeof window === "undefined") return "light";
  const saved = localStorage.getItem(STORAGE_KEY) as ThemeName | null;
  return saved && themes[saved] ? saved : "light";
}

function subscribeToTheme(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handleThemeEvent = () => onStoreChange();
  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      onStoreChange();
    }
  };

  window.addEventListener(EVENT_KEY, handleThemeEvent);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(EVENT_KEY, handleThemeEvent);
    window.removeEventListener("storage", handleStorage);
  };
}

export function useTheme() {
  const theme = useSyncExternalStore<ThemeName>(
    subscribeToTheme,
    getStoredTheme,
    (): ThemeName => "light"
  );

  const applyTheme = useCallback((themeName: ThemeName) => {
    const t = themes[themeName];
    if (!t) return;

    const root = document.documentElement;
    Object.entries(t)
      .filter(([key]) => key !== "accent" && key !== "accentMuted")
      .forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, value);
      });

    root.style.setProperty(
      "color-scheme",
      themeName === "light" || themeName === "sepia" ? "light" : "dark"
    );
  }, []);

  const setTheme = useCallback(
    (newTheme: ThemeName) => {
      if (!themes[newTheme]) return;

      applyTheme(newTheme);
      localStorage.setItem(STORAGE_KEY, newTheme);
      window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: newTheme }));
    },
    [applyTheme]
  );

  useEffect(() => {
    applyTheme(theme);
  }, [applyTheme, theme]);

  return { theme, setTheme };
}
