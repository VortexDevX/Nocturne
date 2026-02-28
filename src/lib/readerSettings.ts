export type FontFamily = "sans" | "mono" | "lexend" | "atkinson" | "opensans";
export type ReflowMode = "book" | "original";

export type ReaderSettings = {
  fontSize: number;
  lineHeight: number;
  fontFamily: FontFamily;
  reflowMode: ReflowMode;
  contentWidth: number;
  paragraphSpacing: number;
  justifiedText: boolean;
};

export const DEFAULT_SETTINGS: ReaderSettings = {
  fontSize: 18,
  lineHeight: 1.75,
  fontFamily: "sans",
  reflowMode: "book",
  contentWidth: 680,
  paragraphSpacing: 1,
  justifiedText: false,
};

export const FONT_SIZE_MIN = 14;
export const FONT_SIZE_MAX = 28;
export const LINE_HEIGHT_MIN = 1.4;
export const LINE_HEIGHT_MAX = 2.2;
export const CONTENT_WIDTH_MIN = 520;
export const CONTENT_WIDTH_MAX = 980;
export const PARAGRAPH_SPACING_MIN = 0.6;
export const PARAGRAPH_SPACING_MAX = 2;

export const FONT_OPTIONS: {
  value: FontFamily;
  label: string;
  category: string;
}[] = [
  // Sans fonts
  { value: "sans", label: "Inter", category: "Sans" },
  { value: "opensans", label: "Open Sans", category: "Sans" },
  { value: "lexend", label: "Lexend", category: "Sans" },
  { value: "atkinson", label: "Atkinson", category: "Accessibility" },
  // Mono fonts
  { value: "mono", label: "Fira Code", category: "Mono" },
];

export const FONT_STACKS: Record<FontFamily, string> = {
  sans: "var(--font-inter), ui-sans-serif, system-ui, -apple-system, sans-serif",
  mono: "var(--font-fira), ui-monospace, SFMono-Regular, Consolas, monospace",
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
