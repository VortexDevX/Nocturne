"use client";

import { useEffect, useState, useCallback } from "react";
import {
  AccentColor,
  ACCENT_COLORS,
  loadAccentColor,
  saveAccentColor,
  applyAccentColor,
} from "./accentColors";

export function useAccentColor() {
  const [accent, setAccentState] = useState<AccentColor>(ACCENT_COLORS[0]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = loadAccentColor();
    setAccentState(saved);
    applyAccentColor(saved);
    setMounted(true);
  }, []);

  const setAccent = useCallback((color: AccentColor) => {
    setAccentState(color);
    saveAccentColor(color);
    applyAccentColor(color);
  }, []);

  return { accent, setAccent, mounted };
}
