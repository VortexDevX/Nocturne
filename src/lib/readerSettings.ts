export type FontFamily =
  | "serif"
  | "sans"
  | "mono"
  | "literata"
  | "lora"
  | "merriweather"
  | "lexend"
  | "atkinson"
  | "opensans";

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

export const FONT_OPTIONS: {
  value: FontFamily;
  label: string;
  category: string;
}[] = [
  // Serif fonts
  { value: "serif", label: "System Serif", category: "Serif" },
  { value: "literata", label: "Literata", category: "Serif" },
  { value: "lora", label: "Lora", category: "Serif" },
  { value: "merriweather", label: "Merriweather", category: "Serif" },
  // Sans fonts
  { value: "sans", label: "Inter", category: "Sans" },
  { value: "opensans", label: "Open Sans", category: "Sans" },
  { value: "lexend", label: "Lexend", category: "Sans" },
  { value: "atkinson", label: "Atkinson", category: "Accessibility" },
  // Mono fonts
  { value: "mono", label: "Fira Code", category: "Mono" },
];

export const FONT_STACKS: Record<FontFamily, string> = {
  serif: "var(--font-source-serif), Georgia, Cambria, 'Times New Roman', serif",
  sans: "var(--font-inter), ui-sans-serif, system-ui, -apple-system, sans-serif",
  mono: "var(--font-fira), ui-monospace, SFMono-Regular, Consolas, monospace",
  literata: "var(--font-literata), Georgia, serif",
  lora: "var(--font-lora), Georgia, serif",
  merriweather: "var(--font-merriweather), Georgia, serif",
  lexend: "var(--font-lexend), sans-serif",
  atkinson: "var(--font-atkinson), sans-serif",
  opensans: "var(--font-opensans), sans-serif",
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
