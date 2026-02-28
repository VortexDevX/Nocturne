"use client";

import { useEffect, useState, useCallback } from "react";
import {
  AccentColor,
  ACCENT_COLORS,
  loadAccentColor,
  saveAccentColor,
  applyAccentColor,
} from "./accentColors";

const EVENT_KEY = "nocturne_accent_change";

function getInitialAccent(): AccentColor {
  if (typeof window === "undefined") return ACCENT_COLORS[0];
  return loadAccentColor();
}

export function useAccentColor() {
  const [accent, setAccentState] = useState<AccentColor>(getInitialAccent);

  const setAccent = useCallback((color: AccentColor) => {
    setAccentState(color);
    saveAccentColor(color);
    applyAccentColor(color);
    // Notify other components
    window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: color }));
  }, []);

  useEffect(() => {
    applyAccentColor(accent);

    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<AccentColor>;
      if (customEvent.detail) {
        setAccentState(customEvent.detail);
        applyAccentColor(customEvent.detail);
      }
    };

    window.addEventListener(EVENT_KEY, handleSync);
    return () => window.removeEventListener(EVENT_KEY, handleSync);
  }, [accent]);

  return { accent, setAccent };
}
