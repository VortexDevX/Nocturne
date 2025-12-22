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
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Listen for install prompt (Android/Desktop Chrome)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (!installPrompt) return;

    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setInstallPrompt(null);
  };

  // Don't show if already installed
  if (isInstalled) return null;

  // Don't show on desktop if no prompt available (likely not supported or already installed)
  if (!installPrompt && !isIOS) return null;

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="
          w-full
          flex items-center justify-center gap-2
          py-3 px-4
          bg-(--accent) text-white
          rounded-xl
          text-sm font-medium
          transition-all duration-200
          hover:opacity-90 active:scale-[0.98]
          focus:outline-none focus-visible:ring-2 focus-visible:ring-(--accent) focus-visible:ring-offset-2
        "
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Install App
      </button>

      {/* iOS Install Guide Modal */}
      {showIOSGuide && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
          onClick={() => setShowIOSGuide(false)}
        >
          <div
            className="
              w-full max-w-md
              bg-(--surface)
              rounded-t-3xl
              p-6 pb-10
              animate-slide-up
            "
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-4">
              <div className="w-10 h-1 rounded-full bg-(--border)" />
            </div>

            <h3 className="text-lg font-semibold text-center mb-4">
              Install Nocturne
            </h3>

            <div className="space-y-4 text-sm text-(--muted)">
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-(--accent) text-white text-xs font-medium shrink-0">
                  1
                </span>
                <p>
                  Tap the{" "}
                  <span className="inline-flex items-center gap-1">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-(--accent)"
                    >
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                      <polyline points="16 6 12 2 8 6" />
                      <line x1="12" y1="2" x2="12" y2="15" />
                    </svg>
                    <span className="font-medium text-(--text)">Share</span>
                  </span>{" "}
                  button in Safari
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-(--accent) text-white text-xs font-medium shrink-0">
                  2
                </span>
                <p>
                  Scroll down and tap{" "}
                  <span className="font-medium text-(--text)">
                    "Add to Home Screen"
                  </span>
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-(--accent) text-white text-xs font-medium shrink-0">
                  3
                </span>
                <p>
                  Tap <span className="font-medium text-(--text)">"Add"</span>{" "}
                  to install
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="
                w-full mt-6
                py-3 px-4
                bg-(--bg)
                border border-(--border)
                rounded-xl
                text-sm font-medium
                transition-colors duration-200
                hover:bg-(--surface)
              "
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
