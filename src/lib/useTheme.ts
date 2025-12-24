"use client";

import { useEffect, useState, useCallback } from "react";
import { themes, ThemeName } from "./themes";

const STORAGE_KEY = "nocturne_theme";
const EVENT_KEY = "nocturne_theme_change";

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeName>("light");
  const [mounted, setMounted] = useState(false);

  const applyTheme = useCallback((themeName: ThemeName) => {
    const t = themes[themeName];
    if (!t) return;

    const root = document.documentElement;
    Object.entries(t).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });

    root.style.setProperty(
      "color-scheme",
      themeName === "light" || themeName === "sepia" ? "light" : "dark"
    );
  }, []);

  const setTheme = useCallback(
    (newTheme: ThemeName) => {
      setThemeState(newTheme);
      applyTheme(newTheme);
      localStorage.setItem(STORAGE_KEY, newTheme);
      // Notify other components
      window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: newTheme }));
    },
    [applyTheme]
  );

  useEffect(() => {
    // Initial load
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeName | null;
    const initial = saved && themes[saved] ? saved : "light";
    setThemeState(initial);
    applyTheme(initial);
    setMounted(true);

    // Listen for sync events
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<ThemeName>;
      if (customEvent.detail) {
        setThemeState(customEvent.detail);
        applyTheme(customEvent.detail);
      }
    };

    window.addEventListener(EVENT_KEY, handleSync);
    return () => window.removeEventListener(EVENT_KEY, handleSync);
  }, [applyTheme]);

  return { theme, setTheme, mounted };
}
