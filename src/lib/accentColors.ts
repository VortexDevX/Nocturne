export const ACCENT_COLORS = [
  { name: "Blue",   value: "#60a5fa", muted: "#1e3a5f" },
  { name: "Purple", value: "#a78bfa", muted: "#2e1f5e" },
  { name: "Pink",   value: "#f472b6", muted: "#4a1535" },
  { name: "Amber",  value: "#fbbf24", muted: "#451a03" },
  { name: "Green",  value: "#4ade80", muted: "#14532d" },
  { name: "Teal",   value: "#2dd4bf", muted: "#134e4a" },
] as const;

export type AccentColor = (typeof ACCENT_COLORS)[number];

const STORAGE_KEY = "nocturne_accent";

export function loadAccentColor(): AccentColor {
  if (typeof window === "undefined") return ACCENT_COLORS[0];

  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return ACCENT_COLORS[0];

  try {
    const parsed = JSON.parse(saved);
    const found = ACCENT_COLORS.find((c) => c.value === parsed.value);
    return found ?? ACCENT_COLORS[0];
  } catch {
    return ACCENT_COLORS[0];
  }
}

export function saveAccentColor(color: AccentColor): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(color));
}

export function applyAccentColor(color: AccentColor): void {
  const root = document.documentElement;
  root.style.setProperty("--accent", color.value);
  root.style.setProperty("--accentMuted", color.muted);
}
