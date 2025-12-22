"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Reader from "@/components/Reader";
import Settings from "@/components/Settings";
import BottomSheet from "@/components/BottomSheet";
import ProgressBar from "@/components/ProgressBar";
import ScrollToTop from "@/components/ScrollToTop";
import SwipeBack from "@/components/SwipeBack";
import PullToRefresh from "@/components/PullToRefresh";
import { ArrowLeftIcon, SettingsIcon, BookOpenIcon } from "@/components/Icons";
import { useScrollDirection } from "@/lib/useScrollDirection";
import {
  loadSettings,
  saveSettings,
  ReaderSettings,
} from "@/lib/readerSettings";

export default function ReaderPage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [filename, setFilename] = useState("");
  const [settings, setSettings] = useState<ReaderSettings>(loadSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Auto-hide header hook
  const { direction, isAtTop } = useScrollDirection(10);

  // Show header when: at top, scrolling up, or settings open
  const showHeader = isAtTop || direction === "up" || showSettings;

  useEffect(() => {
    const savedContent = sessionStorage.getItem("nocturne_content");
    const savedFilename = sessionStorage.getItem("nocturne_filename");

    if (savedContent) {
      setContent(savedContent);
      setFilename(savedFilename || "Untitled");
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      saveSettings(settings);
    }
  }, [settings, mounted]);

  const handleBack = useCallback(() => {
    sessionStorage.removeItem("nocturne_content");
    sessionStorage.removeItem("nocturne_filename");
    router.push("/");
  }, [router]);

  const handleRefresh = useCallback(async () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    await new Promise((resolve) => setTimeout(resolve, 300));
  }, []);

  const openSettings = useCallback(() => setShowSettings(true), []);
  const closeSettings = useCallback(() => setShowSettings(false), []);

  // Loading state
  if (!mounted) {
    return (
      <main className="min-h-screen page-fade overflow-x-hidden">
        <header className="border-b border-(--border)">
          <div className="max-w-reader mx-auto px-4">
            <div className="flex items-center justify-between h-14">
              <div className="w-10 h-10 skeleton rounded-xl" />
              <div className="w-32 h-4 skeleton" />
              <div className="w-10 h-10 skeleton rounded-xl" />
            </div>
          </div>
        </header>
        <div className="max-w-reader mx-auto px-5 py-8 space-y-4">
          <div className="h-4 skeleton w-full" />
          <div className="h-4 skeleton w-11/12" />
          <div className="h-4 skeleton w-full" />
          <div className="h-4 skeleton w-9/12" />
        </div>
      </main>
    );
  }

  // No content state
  if (!content) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 page-enter overflow-x-hidden">
        <div className="empty-state">
          <BookOpenIcon size={64} className="empty-state-icon" />
          <h2 className="empty-state-title">No content loaded</h2>
          <p className="empty-state-description">
            Upload a TXT or EPUB file from the home page to start reading
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 text-button bg-(--surface) border border-(--border)"
          >
            <ArrowLeftIcon size={16} />
            Go to Home
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className="overflow-x-hidden max-w-full">
      <ProgressBar />
      <SwipeBack onBack={handleBack} />

      <PullToRefresh onRefresh={handleRefresh}>
        <main className="min-h-screen page-fade overflow-x-hidden">
          {/* Auto-hide Header */}
          <header
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 30,
              backgroundColor: "var(--bg)",
              borderBottom: "1px solid var(--border)",
              transform: showHeader ? "translateY(0)" : "translateY(-100%)",
              transition: "transform 0.3s ease-out",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: "var(--bg)",
                opacity: 0.8,
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
              }}
            />
            <div className="max-w-reader mx-auto px-4 relative">
              <div className="flex items-center justify-between h-14">
                <button
                  onClick={handleBack}
                  className="icon-button -ml-2 shrink-0"
                  aria-label="Go back"
                >
                  <ArrowLeftIcon size={20} />
                </button>

                <div className="flex-1 mx-4 min-w-0 overflow-hidden">
                  <h1 className="text-sm font-medium truncate text-center text-(--muted)">
                    {filename.replace(/\.(txt|epub)$/i, "")}
                  </h1>
                </div>

                <button
                  onClick={openSettings}
                  className="icon-button -mr-2 shrink-0"
                  aria-label="Open settings"
                >
                  <SettingsIcon size={20} />
                </button>
              </div>
            </div>
          </header>

          {/* Spacer for fixed header */}
          <div style={{ height: "56px" }} />

          {/* Reader Content */}
          <div className="max-w-reader mx-auto px-5 pb-20 overflow-x-hidden">
            <Reader content={content} settings={settings} />
          </div>

          <div className="h-32" />
        </main>
      </PullToRefresh>

      <ScrollToTop />

      <BottomSheet
        isOpen={showSettings}
        onClose={closeSettings}
        title="Settings"
      >
        <Settings settings={settings} onChange={setSettings} />
      </BottomSheet>
    </div>
  );
}
