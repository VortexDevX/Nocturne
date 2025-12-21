export const themes = {
  light: {
    bg: "#fafafa",
    surface: "#ffffff",
    text: "#1a1a1a",
    muted: "#737373",
    border: "#e5e5e5",
    accent: "#3b82f6",
    accentMuted: "#dbeafe",
  },
  dark: {
    bg: "#0a0a0a",
    surface: "#141414",
    text: "#fafafa",
    muted: "#a3a3a3",
    border: "#262626",
    accent: "#60a5fa",
    accentMuted: "#1e3a5f",
  },
  sepia: {
    bg: "#f5f0e6",
    surface: "#fdfbf7",
    text: "#3d3229",
    muted: "#78695a",
    border: "#e0d5c7",
    accent: "#b45309",
    accentMuted: "#fef3c7",
  },
  amoled: {
    bg: "#000000",
    surface: "#000000",
    text: "#e5e5e5",
    muted: "#737373",
    border: "#1a1a1a",
    accent: "#a3a3a3",
    accentMuted: "#171717",
  },
} as const;

export type ThemeName = keyof typeof themes;
export type ThemeColors = typeof themes.light;
