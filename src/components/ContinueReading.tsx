"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getActiveDocument } from "@/lib/sessionDocumentStore";
import { getLastRead, ReadingProgress } from "@/lib/readingProgress";
import { BookOpenIcon } from "./Icons";

export default function ContinueReading() {
  const router = useRouter();
  const [progress, setProgress] = useState<ReadingProgress | null>(null);
  const [hasDocument, setHasDocument] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function check() {
      try {
        const [doc, lastRead] = await Promise.all([
          getActiveDocument(),
          Promise.resolve(getLastRead()),
        ]);

        if (doc) {
          setHasDocument(true);
          if (lastRead && doc.filename === lastRead.filename) {
            setProgress(lastRead);
          }
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    void check();
  }, []);

  if (loading) {
    return <div className="w-full h-20 skeleton rounded-2xl" />;
  }

  if (!hasDocument) return null;

  const percent     = progress ? Math.round(progress.scrollPercent) : 0;
  const displayName = progress?.filename.replace(/\.(txt|epub)$/i, "") ?? "Untitled";

  return (
    <button
      onClick={() => router.push("/reader")}
      className="w-full text-left"
      aria-label={`Continue reading ${displayName}`}
    >
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: "var(--radius-xl)",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          padding: "16px",
          transition: "all 200ms ease",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
        onPointerDown={(e) =>
          (e.currentTarget.style.transform = "scale(0.985)")
        }
        onPointerUp={(e) =>
          (e.currentTarget.style.transform = "scale(1)")
        }
        onPointerLeave={(e) =>
          (e.currentTarget.style.transform = "scale(1)")
        }
      >
        {/* Accent glow behind progress */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(90deg, var(--accent-glow) 0%, transparent 60%)`,
            opacity: percent > 0 ? 1 : 0,
            transition: "opacity 400ms ease",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          {/* Icon */}
          <div
            style={{
              flexShrink: 0,
              width: "42px",
              height: "42px",
              borderRadius: "var(--radius-md)",
              background: "var(--elevated)",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--accent)",
            }}
          >
            <BookOpenIcon size={19} />
          </div>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--muted)",
                marginBottom: "3px",
              }}
            >
              Continue Reading
            </p>
            <p
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--text)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {displayName}
            </p>

            {/* Progress */}
            <div
              style={{
                marginTop: "8px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: "3px",
                  background: "var(--border)",
                  borderRadius: "2px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${percent}%`,
                    background: "var(--accent)",
                    borderRadius: "2px",
                    transition: "width 600ms var(--t-spring)",
                    boxShadow: "0 0 6px var(--accent-glow)",
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: "11px",
                  color: "var(--muted)",
                  flexShrink: 0,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {percent}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
