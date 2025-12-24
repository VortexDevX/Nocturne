"use client";

import { useTheme } from "@/lib/useTheme";
import { useAccentColor } from "@/lib/useAccentColor";

export default function ThemeInitializer() {
  useTheme();
  useAccentColor();
  return null;
}
