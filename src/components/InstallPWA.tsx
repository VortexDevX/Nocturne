"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPWA() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check installed
    const iOSStandalone = (
      window.navigator as Navigator & { standalone?: boolean }
    ).standalone;
    const installed =
      window.matchMedia("(display-mode: standalone)").matches ||
      !!iOSStandalone;
    setIsInstalled(installed);

    // Check iOS
    const ios =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIsIOS(ios);

    // Check mobile - roughly
    const mobile = window.innerWidth < 768 || ios;
    setIsMobile(mobile);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () =>
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  // Only render on mobile
  if (!isMobile) return null;
  if (isInstalled) return null;
  if (!installPrompt && !isIOS) return null;

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setInstallPrompt(null);
  };

  return (
    <>
      <button
        onClick={handleInstall}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          padding: "13px 16px",
          borderRadius: "var(--radius-lg)",
          background: "var(--elevated)",
          border: "1px solid var(--border)",
          color: "var(--text-secondary)",
          fontSize: "14px",
          fontWeight: 500,
          cursor: "pointer",
          transition: "all 180ms ease",
          outline: "none",
        }}
        onPointerDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
        onPointerUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        onPointerLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        {/* Download icon */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: "var(--accent)", flexShrink: 0 }}
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Add to Home Screen
      </button>

      {/* iOS Guide */}
      {showIOSGuide && (
        <>
          {/* Backdrop */}
          <div
            aria-hidden="true"
            onClick={() => setShowIOSGuide(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 60,
              background: "rgba(0,0,0,0.65)",
              backdropFilter: "blur(3px)",
              WebkitBackdropFilter: "blur(3px)",
            }}
          />

          {/* Sheet */}
          <div
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 70,
              background: "var(--surface)",
              borderTop: "1px solid var(--border)",
              borderTopLeftRadius: "var(--radius-2xl)",
              borderTopRightRadius: "var(--radius-2xl)",
              padding: "0 0 env(safe-area-inset-bottom)",
              boxShadow:
                "0 -4px 6px rgba(0,0,0,0.3), 0 -20px 60px rgba(0,0,0,0.5)",
              animation: "slideUp 320ms cubic-bezier(0.16,1,0.3,1) forwards",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "12px 0 4px",
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

            <div style={{ padding: "12px 24px 28px" }}>
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  textAlign: "center",
                  color: "var(--text)",
                  marginBottom: "24px",
                }}
              >
                Install Nocturne
              </h3>

              {/* Steps */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                {[
                  {
                    step: 1,
                    text: (
                      <>
                        Tap the{" "}
                        <span
                          style={{ color: "var(--accent)", fontWeight: 600 }}
                        >
                          Share
                        </span>{" "}
                        button in Safari&apos;s toolbar
                      </>
                    ),
                  },
                  {
                    step: 2,
                    text: (
                      <>
                        Scroll and tap{" "}
                        <span style={{ color: "var(--text)", fontWeight: 600 }}>
                          &quot;Add to Home Screen&quot;
                        </span>
                      </>
                    ),
                  },
                  {
                    step: 3,
                    text: (
                      <>
                        Tap{" "}
                        <span style={{ color: "var(--text)", fontWeight: 600 }}>
                          &quot;Add&quot;
                        </span>{" "}
                        to confirm
                      </>
                    ),
                  },
                ].map(({ step, text }) => (
                  <div
                    key={step}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                    }}
                  >
                    <span
                      style={{
                        flexShrink: 0,
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        background: "var(--accentMuted)",
                        border: "1px solid var(--accent)",
                        color: "var(--accent)",
                        fontSize: "11px",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {step}
                    </span>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "var(--text-secondary)",
                        lineHeight: 1.55,
                        paddingTop: "2px",
                      }}
                    >
                      {text}
                    </p>
                  </div>
                ))}
              </div>

              {/* Dismiss */}
              <button
                onClick={() => setShowIOSGuide(false)}
                style={{
                  width: "100%",
                  marginTop: "24px",
                  padding: "13px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--elevated)",
                  border: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                  outline: "none",
                  transition: "opacity 150ms ease",
                }}
              >
                Got it
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
