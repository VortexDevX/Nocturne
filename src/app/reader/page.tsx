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

  // Auto-hide header
  const { direction, isAtTop } = useScrollDirection(10);
  const [headerVisible, setHeaderVisible] = useState(true);

  // Update header visibility based on scroll
  useEffect(() => {
    if (showSettings) {
      setHeaderVisible(true);
    } else if (isAtTop) {
      setHeaderVisible(true);
    } else if (direction === "down") {
      setHeaderVisible(false);
    } else if (direction === "up") {
      setHeaderVisible(true);
    }
  }, [direction, isAtTop, showSettings]);

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
    <>
      {/* Progress Bar - Always visible at very top */}
      <ProgressBar />

      {/* Auto-hide Header - OUTSIDE of PullToRefresh */}
      <header
        id="reader-header"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          height: "56px",
          backgroundColor: "var(--bg)",
          borderBottom: "1px solid var(--border)",
          transform: headerVisible ? "translateY(0)" : "translateY(-100%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          willChange: "transform",
        }}
      >
        {/* Blur overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "var(--bg)",
            opacity: 0.85,
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        />

        {/* Header content */}
        <div className="max-w-reader mx-auto px-4 h-full relative z-10">
          <div className="flex items-center justify-between h-full">
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

      {/* Swipe back handler */}
      <SwipeBack onBack={handleBack} />

      {/* Main content area */}
      <div className="overflow-x-hidden max-w-full">
        <PullToRefresh onRefresh={handleRefresh}>
          <main className="min-h-screen overflow-x-hidden">
            {/* Spacer for fixed header */}
            <div style={{ height: "56px" }} aria-hidden="true" />

            {/* Reader Content */}
            <div className="max-w-reader mx-auto px-5 pb-20 overflow-x-hidden">
              <Reader content={content} settings={settings} />
            </div>

            {/* Bottom spacer */}
            <div className="h-32" />
          </main>
        </PullToRefresh>
      </div>

      {/* Scroll to top button */}
      <ScrollToTop />

      {/* Settings bottom sheet */}
      <BottomSheet
        isOpen={showSettings}
        onClose={closeSettings}
        title="Settings"
      >
        <Settings settings={settings} onChange={setSettings} />
      </BottomSheet>
    </>
  );
}
