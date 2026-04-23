"use client";

import {
  ReaderSettings,
  FONT_OPTIONS,
  FONT_STACKS,
  FONT_SIZE_MIN,
  FONT_SIZE_MAX,
  LINE_HEIGHT_MIN,
  LINE_HEIGHT_MAX,
  CONTENT_WIDTH_MIN,
  CONTENT_WIDTH_MAX,
  PARAGRAPH_SPACING_MIN,
  PARAGRAPH_SPACING_MAX,
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

const THEMES: { key: ThemeName; label: string; bg: string; text: string }[] = [
  { key: "dark", label: "Dark", bg: "#161616", text: "#ebebeb" },
  { key: "sepia", label: "Sepia", bg: "#f0e8d4", text: "#2c2218" },
  { key: "amoled", label: "AMOLED", bg: "#000000", text: "#e8e8e8" },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: "10px",
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "var(--muted)",
        marginBottom: "16px",
        paddingBottom: "8px",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      {children}
    </p>
  );
}

function Row({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <span
          style={{
            fontSize: "13px",
            color: "var(--text-secondary, #a0a0a0)",
          }}
        >
          {label}
        </span>
        {value && (
          <span
            style={{
              fontSize: "12px",
              color: "var(--text, #ebebeb)",
              fontVariantNumeric: "tabular-nums",
              background: "var(--elevated, #1e1e1e)",
              padding: "2px 8px",
              borderRadius: "6px",
              border: "1px solid var(--border, #272727)",
            }}
          >
            {value}
          </span>
        )}
      </div>
      {/* overflow visible so thumb box-shadow isn't clipped */}
      <div style={{ padding: "6px 2px", margin: "0 -2px" }}>{children}</div>
    </div>
  );
}

export default function Settings({ settings, onChange }: Props) {
  const { theme, setTheme } = useTheme();
  const { accent, setAccent } = useAccentColor();

  const update = <K extends keyof ReaderSettings>(
    key: K,
    value: ReaderSettings[K],
  ) => onChange({ ...settings, [key]: value });

  return (
    <div style={{ width: "100%" }}>
      {/* ── APPEARANCE ── */}
      <section style={{ marginBottom: "28px" }}>
        <SectionLabel>Appearance</SectionLabel>

        {/* Theme - actual colored tiles */}
        <div style={{ marginBottom: "20px" }}>
          <p
            style={{
              fontSize: "13px",
              color: "var(--text-secondary)",
              marginBottom: "10px",
            }}
          >
            Theme
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "8px",
            }}
          >
            {THEMES.map((t) => {
              const isActive = theme === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTheme(t.key)}
                  aria-label={t.label}
                  aria-pressed={isActive}
                  style={{
                    padding: "12px 8px",
                    borderRadius: "var(--radius-md)",
                    background: t.bg,
                    border: `2px solid ${isActive ? "var(--accent)" : "transparent"}`,
                    color: t.text,
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 180ms ease",
                    boxShadow: isActive
                      ? "0 0 0 1px var(--accent)"
                      : "0 1px 3px rgba(0,0,0,0.3)",
                    position: "relative",
                    outline: "none",
                  }}
                >
                  {t.label}
                  {isActive && (
                    <span
                      style={{
                        position: "absolute",
                        top: "4px",
                        right: "4px",
                        color: t.text,
                        opacity: 0.7,
                      }}
                    >
                      <CheckIcon size={10} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Accent */}
        <div style={{ marginBottom: "4px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "10px",
            }}
          >
            <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
              Accent
            </p>
            <p style={{ fontSize: "11px", color: "var(--muted)" }}>
              {accent.name}
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {ACCENT_COLORS.map((color) => {
              const isActive = accent.value === color.value;
              return (
                <button
                  key={color.value}
                  onClick={() => setAccent(color)}
                  aria-label={color.name}
                  aria-pressed={isActive}
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    backgroundColor: color.value,
                    border: "none",
                    cursor: "pointer",
                    transition: "all 180ms ease",
                    transform: isActive ? "scale(1.18)" : "scale(1)",
                    boxShadow: isActive
                      ? `0 0 0 2px var(--bg), 0 0 0 4px ${color.value}`
                      : "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    outline: "none",
                    flexShrink: 0,
                  }}
                >
                  {isActive && (
                    <span style={{ color: "#fff" }}>
                      <CheckIcon size={12} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── TYPOGRAPHY ── */}
      <section style={{ marginBottom: "28px" }}>
        <SectionLabel>Typography</SectionLabel>

        {/* Font - uniform grid */}
        <div style={{ marginBottom: "20px" }}>
          <p
            style={{
              fontSize: "13px",
              color: "var(--text-secondary)",
              marginBottom: "10px",
            }}
          >
            Font
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "6px",
            }}
          >
            {FONT_OPTIONS.map((font) => {
              const isActive = settings.fontFamily === font.value;
              return (
                <button
                  key={font.value}
                  onClick={() => update("fontFamily", font.value)}
                  style={{
                    padding: "9px 6px",
                    borderRadius: "var(--radius-sm)",
                    background: isActive ? "var(--accent)" : "var(--elevated)",
                    border: `1px solid ${isActive ? "var(--accent)" : "var(--border)"}`,
                    color: isActive ? "var(--bg)" : "var(--text-secondary)",
                    fontSize: "12px",
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 150ms ease",
                    fontFamily: FONT_STACKS[font.value],
                    outline: "none",
                    textAlign: "center",
                  }}
                >
                  {font.label}
                </button>
              );
            })}
          </div>
        </div>

        <Row label="Size" value={`${settings.fontSize}px`}>
          <input
            type="range"
            min={FONT_SIZE_MIN}
            max={FONT_SIZE_MAX}
            step={1}
            value={settings.fontSize}
            onChange={(e) => update("fontSize", Number(e.target.value))}
            aria-label="Font size"
            style={{
              background: `linear-gradient(to right, var(--accent) ${
                ((settings.fontSize - FONT_SIZE_MIN) /
                  (FONT_SIZE_MAX - FONT_SIZE_MIN)) *
                100
              }%, var(--border) 0%)`,
            }}
          />
        </Row>

        <Row label="Line spacing" value={settings.lineHeight.toFixed(1)}>
          <input
            type="range"
            min={LINE_HEIGHT_MIN}
            max={LINE_HEIGHT_MAX}
            step={0.1}
            value={settings.lineHeight}
            onChange={(e) => update("lineHeight", Number(e.target.value))}
            aria-label="Line spacing"
            style={{
              background: `linear-gradient(to right, var(--accent) ${
                ((settings.lineHeight - LINE_HEIGHT_MIN) /
                  (LINE_HEIGHT_MAX - LINE_HEIGHT_MIN)) *
                100
              }%, var(--border) 0%)`,
            }}
          />
        </Row>

        <Row
          label="Paragraph gap"
          value={`${settings.paragraphSpacing.toFixed(1)}em`}
        >
          <input
            type="range"
            min={PARAGRAPH_SPACING_MIN}
            max={PARAGRAPH_SPACING_MAX}
            step={0.1}
            value={settings.paragraphSpacing}
            onChange={(e) => update("paragraphSpacing", Number(e.target.value))}
            aria-label="Paragraph spacing"
            style={{
              background: `linear-gradient(to right, var(--accent) ${
                ((settings.paragraphSpacing - PARAGRAPH_SPACING_MIN) /
                  (PARAGRAPH_SPACING_MAX - PARAGRAPH_SPACING_MIN)) *
                100
              }%, var(--border) 0%)`,
            }}
          />
        </Row>

        {/* Justified toggle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            Justified text
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={settings.justifiedText}
            onClick={() => update("justifiedText", !settings.justifiedText)}
            style={{
              position: "relative",
              width: "44px",
              height: "24px",
              borderRadius: "12px",
              background: settings.justifiedText
                ? "var(--accent)"
                : "var(--elevated)",
              border: `1px solid ${
                settings.justifiedText ? "var(--accent)" : "var(--border)"
              }`,
              cursor: "pointer",
              transition: "all 200ms ease",
              outline: "none",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                position: "absolute",
                top: "2px",
                left: settings.justifiedText ? "22px" : "2px",
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                background: "#fff",
                transition: "left 200ms var(--t-spring)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
              }}
            />
          </button>
        </div>
      </section>

      {/* ── LAYOUT ── */}
      <section>
        <SectionLabel>Layout</SectionLabel>

        {/* Text flow */}
        <div style={{ marginBottom: "20px" }}>
          <p
            style={{
              fontSize: "13px",
              color: "var(--text-secondary)",
              marginBottom: "10px",
            }}
          >
            Text flow
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "6px",
            }}
          >
            {(["book", "original"] as const).map((mode) => {
              const isActive = settings.reflowMode === mode;
              return (
                <button
                  key={mode}
                  onClick={() => update("reflowMode", mode)}
                  style={{
                    padding: "10px",
                    borderRadius: "var(--radius-sm)",
                    background: isActive ? "var(--accent)" : "var(--elevated)",
                    border: `1px solid ${isActive ? "var(--accent)" : "var(--border)"}`,
                    color: isActive ? "var(--bg)" : "var(--text-secondary)",
                    fontSize: "13px",
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 150ms ease",
                    outline: "none",
                  }}
                >
                  {mode === "book" ? "Book reflow" : "Original"}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content width - desktop only */}
        <div className="hidden sm:block">
          <Row label="Content width" value={`${settings.contentWidth}px`}>
            <input
              type="range"
              min={CONTENT_WIDTH_MIN}
              max={CONTENT_WIDTH_MAX}
              step={10}
              value={settings.contentWidth}
              onChange={(e) => update("contentWidth", Number(e.target.value))}
              aria-label="Content width"
              style={{
                background: `linear-gradient(to right, var(--accent) ${
                  ((settings.contentWidth - CONTENT_WIDTH_MIN) /
                    (CONTENT_WIDTH_MAX - CONTENT_WIDTH_MIN)) *
                  100
                }%, var(--border) 0%)`,
              }}
            />
          </Row>
        </div>
      </section>
    </div>
  );
}
