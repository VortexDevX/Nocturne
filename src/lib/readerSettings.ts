export type FontFamily = "serif" | "sans" | "mono";

export type ReaderSettings = {
  fontSize: number;
  lineHeight: number;
  fontFamily: FontFamily;
};

export const DEFAULT_SETTINGS: ReaderSettings = {
  fontSize: 18,
  lineHeight: 1.75,
  fontFamily: "serif",
};

export const FONT_SIZE_MIN = 14;
export const FONT_SIZE_MAX = 28;
export const LINE_HEIGHT_MIN = 1.4;
export const LINE_HEIGHT_MAX = 2.2;

export const FONT_OPTIONS: { value: FontFamily; label: string }[] = [
  { value: "serif", label: "Serif" },
  { value: "sans", label: "Sans" },
  { value: "mono", label: "Mono" },
];

// Full font stacks for each option
export const FONT_STACKS: Record<FontFamily, string> = {
  serif: "var(--font-source-serif), Georgia, Cambria, 'Times New Roman', serif",
  sans: "var(--font-inter), ui-sans-serif, system-ui, -apple-system, sans-serif",
  mono: "var(--font-fira), ui-monospace, SFMono-Regular, Consolas, 'Liberation Mono', monospace",
};

const KEY = "nocturne_reader_settings";

export function loadSettings(): ReaderSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;

  const saved = localStorage.getItem(KEY);
  if (!saved) return DEFAULT_SETTINGS;

  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: ReaderSettings) {
  localStorage.setItem(KEY, JSON.stringify(settings));
}
