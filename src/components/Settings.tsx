"use client";

import {
  ReaderSettings,
  FONT_OPTIONS,
  FONT_STACKS,
  FONT_SIZE_MIN,
  FONT_SIZE_MAX,
  LINE_HEIGHT_MIN,
  LINE_HEIGHT_MAX,
  FontFamily,
} from "@/lib/readerSettings";
import { ThemeName } from "@/lib/themes";
import { useTheme } from "@/lib/useTheme";
import { useAccentColor } from "@/lib/useAccentColor";
import { ACCENT_COLORS } from "@/lib/accentColors";
import { CheckIcon } from "./Icons";

type Props = {
  settings: ReaderSettings;
  onChange: (settings: ReaderSettings) => void;
};

const THEMES: { key: ThemeName; label: string; bg: string }[] = [
  { key: "light", label: "Light", bg: "#fafafa" },
  { key: "dark", label: "Dark", bg: "#0a0a0a" },
  { key: "sepia", label: "Sepia", bg: "#f5f0e6" },
  { key: "amoled", label: "AMOLED", bg: "#000000" },
];

// Group fonts by category
const FONT_CATEGORIES = FONT_OPTIONS.reduce((acc, font) => {
  if (!acc[font.category]) {
    acc[font.category] = [];
  }
  acc[font.category].push(font);
  return acc;
}, {} as Record<string, typeof FONT_OPTIONS>);

export default function Settings({ settings, onChange }: Props) {
  const { theme, setTheme } = useTheme();
  const { accent, setAccent } = useAccentColor();

  const updateSetting = <K extends keyof ReaderSettings>(
    key: K,
    value: ReaderSettings[K]
  ) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-8 w-full overflow-hidden">
      {/* Theme Selection */}
      <section>
        <label className="block text-sm font-medium text-(--muted) mb-4">
          Theme
        </label>
        <div className="flex items-center justify-center gap-4">
          {THEMES.map((t) => (
            <button
              key={t.key}
              onClick={() => setTheme(t.key)}
              aria-label={t.label}
              aria-pressed={theme === t.key}
              className={`
                relative w-11 h-11 rounded-full shrink-0
                transition-transform duration-200
                focus:outline-none focus-visible:ring-2 focus-visible:ring-(--accent) focus-visible:ring-offset-2
                ${
                  theme === t.key
                    ? "scale-110"
                    : "hover:scale-105 active:scale-95"
                }
              `}
              style={{ backgroundColor: t.bg }}
            >
              <span
                className="absolute inset-0 rounded-full ring-1 ring-inset ring-black/20"
                aria-hidden="true"
              />
              <span
                className="absolute inset-0 rounded-full ring-1 ring-white/20"
                aria-hidden="true"
              />

              {theme === t.key && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <CheckIcon
                    size={18}
                    className={
                      t.key === "light" || t.key === "sepia"
                        ? "text-black/70"
                        : "text-white/90"
                    }
                  />
                </span>
              )}

              {theme === t.key && (
                <span
                  className="absolute -inset-1 rounded-full ring-2 ring-(--accent)"
                  aria-hidden="true"
                />
              )}
            </button>
          ))}
        </div>
        <p className="text-xs text-(--muted) text-center mt-3">
          {THEMES.find((t) => t.key === theme)?.label}
        </p>
      </section>

      {/* Accent Color */}
      <section>
        <label className="block text-sm font-medium text-(--muted) mb-4">
          Accent Color
        </label>
        <div className="flex items-center justify-center flex-wrap gap-3">
          {ACCENT_COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => setAccent(color)}
              aria-label={color.name}
              aria-pressed={accent.value === color.value}
              className={`
                relative w-9 h-9 rounded-full shrink-0
                transition-transform duration-200
                focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
                ${
                  accent.value === color.value
                    ? "scale-110"
                    : "hover:scale-105 active:scale-95"
                }
              `}
              style={{
                backgroundColor: color.value,
                boxShadow:
                  accent.value === color.value
                    ? `0 0 0 2px var(--bg), 0 0 0 4px ${color.value}`
                    : undefined,
              }}
            >
              {accent.value === color.value && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <CheckIcon size={16} className="text-white drop-shadow-sm" />
                </span>
              )}
            </button>
          ))}
        </div>
        <p className="text-xs text-(--muted) text-center mt-3">{accent.name}</p>
      </section>

      {/* Font Family - Grouped */}
      <section>
        <label className="block text-sm font-medium text-(--muted) mb-3">
          Font
        </label>
        <div className="space-y-4">
          {Object.entries(FONT_CATEGORIES).map(([category, fonts]) => (
            <div key={category}>
              <p className="text-xs text-(--muted) mb-2 uppercase tracking-wide">
                {category}
              </p>
              <div className="flex flex-wrap gap-2">
                {fonts.map((font) => (
                  <button
                    key={font.value}
                    onClick={() => updateSetting("fontFamily", font.value)}
                    className={`
                      py-2 px-3 rounded-xl
                      text-sm
                      border transition-all duration-200
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-(--accent)
                      ${
                        settings.fontFamily === font.value
                          ? "bg-(--accent) text-white border-(--accent)"
                          : "bg-(--bg) text-(--text) border-(--border) hover:border-(--muted)"
                      }
                    `}
                    style={{ fontFamily: FONT_STACKS[font.value] }}
                  >
                    {font.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Font Size */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-(--muted)">Size</label>
          <span
            className="text-sm text-(--text) text-right"
            style={{
              fontFamily: "ui-monospace, monospace",
              minWidth: "48px",
            }}
          >
            {settings.fontSize}px
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-(--muted) shrink-0 w-4 text-center">
            A
          </span>
          <input
            type="range"
            min={FONT_SIZE_MIN}
            max={FONT_SIZE_MAX}
            step={1}
            value={settings.fontSize}
            onChange={(e) => updateSetting("fontSize", Number(e.target.value))}
            className="flex-1 min-w-0"
            aria-label="Font size"
          />
          <span className="text-base text-(--muted) shrink-0 w-4 text-center">
            A
          </span>
        </div>
      </section>

      {/* Line Height */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-(--muted)">Spacing</label>
          <span
            className="text-sm text-(--text) text-right"
            style={{
              fontFamily: "ui-monospace, monospace",
              minWidth: "48px",
            }}
          >
            {settings.lineHeight.toFixed(1)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-(--muted) shrink-0"
          >
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
          <input
            type="range"
            min={LINE_HEIGHT_MIN}
            max={LINE_HEIGHT_MAX}
            step={0.1}
            value={settings.lineHeight}
            onChange={(e) =>
              updateSetting("lineHeight", Number(e.target.value))
            }
            className="flex-1 min-w-0"
            aria-label="Line spacing"
          />
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-(--muted) shrink-0"
          >
            <line x1="4" y1="3" x2="20" y2="3" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="21" x2="20" y2="21" />
          </svg>
        </div>
      </section>
    </div>
  );
}
