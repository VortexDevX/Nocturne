export const themes = {
  dark: {
    bg: "#0d0d0d",
    surface: "#161616",
    elevated: "#1e1e1e",
    text: "#ebebeb",
    textSecondary: "#a0a0a0",
    muted: "#606060",
    border: "#272727",
    borderSubtle: "#1f1f1f",
    accent: "#60a5fa",
    accentMuted: "#1a3a5c",
    accentGlow: "rgba(96, 165, 250, 0.12)",
  },
  sepia: {
    bg: "#e8dfc8",
    surface: "#f0e8d4",
    elevated: "#f7f1e3",
    text: "#2c2218",
    textSecondary: "#6b5a48",
    muted: "#9c8878",
    border: "#d4c9b0",
    borderSubtle: "#ddd4be",
    accent: "#a05c20",
    accentMuted: "#f5e6d0",
    accentGlow: "rgba(160, 92, 32, 0.10)",
  },
  amoled: {
    bg: "#000000",
    surface: "#0a0a0a",
    elevated: "#111111",
    text: "#e8e8e8",
    textSecondary: "#888888",
    muted: "#444444",
    border: "#1a1a1a",
    borderSubtle: "#111111",
    accent: "#60a5fa",
    accentMuted: "#0f2540",
    accentGlow: "rgba(96, 165, 250, 0.08)",
  },
} as const;

export type ThemeName = keyof typeof themes;
export type ThemeColors = typeof themes.dark;
