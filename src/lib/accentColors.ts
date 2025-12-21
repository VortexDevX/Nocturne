export const ACCENT_COLORS = [
  { name: "Blue", value: "#3b82f6", muted: "#dbeafe" },
  { name: "Purple", value: "#8b5cf6", muted: "#ede9fe" },
  { name: "Pink", value: "#ec4899", muted: "#fce7f3" },
  { name: "Red", value: "#ef4444", muted: "#fee2e2" },
  { name: "Orange", value: "#f97316", muted: "#ffedd5" },
  { name: "Green", value: "#22c55e", muted: "#dcfce7" },
  { name: "Teal", value: "#14b8a6", muted: "#ccfbf1" },
  { name: "Cyan", value: "#06b6d4", muted: "#cffafe" },
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
    return found || ACCENT_COLORS[0];
  } catch {
    return ACCENT_COLORS[0];
  }
}

export function saveAccentColor(color: AccentColor) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(color));
}

export function applyAccentColor(color: AccentColor) {
  document.documentElement.style.setProperty("--accent", color.value);
  document.documentElement.style.setProperty("--accentMuted", color.muted);
}
