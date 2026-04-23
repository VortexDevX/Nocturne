"use client";

import { useEffect, useCallback, useRef } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
};

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
}: Props) {
  const sheetRef = useRef<HTMLDivElement>(null);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleEscape);
      setTimeout(() => sheetRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, handleEscape]);

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 40,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 280ms ease",
        }}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="bottom-sheet"
        style={{
          transform: isOpen ? "translateY(0)" : "translateY(100%)",
          transition: "transform 340ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Handle */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "12px 0 8px",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "4px",
              borderRadius: "2px",
              background: "var(--border)",
            }}
          />
        </div>

        {/* Title */}
        {title && (
          <div
            style={{
              padding: "4px 20px 14px",
              borderBottom: "1px solid var(--border-subtle)",
              textAlign: "center",
            }}
          >
            <h2
              style={{
                fontSize: "15px",
                fontWeight: 600,
                color: "var(--text)",
              }}
            >
              {title}
            </h2>
          </div>
        )}

        {/* Content */}
        <div
          style={{
            overflowY: "auto",
            overflowX: "hidden",
            maxHeight: "calc(88vh - 68px)",
          }}
        >
          <div
            style={{
              padding: "20px",
              // overflow visible so sliders aren't clipped
              overflow: "visible",
              width: "100%",
              maxWidth: "480px",
              margin: "0 auto",
            }}
          >
            {children}
          </div>
        </div>

        <div style={{ height: "env(safe-area-inset-bottom)" }} />
      </div>
    </>
  );
}
