"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Reader from "@/components/Reader";
import Settings from "@/components/Settings";
import BottomSheet from "@/components/BottomSheet";
import ProgressBar from "@/components/ProgressBar";
import ScrollToTop from "@/components/ScrollToTop";
import SwipeBack from "@/components/SwipeBack";
import PullToRefresh from "@/components/PullToRefresh";
import SearchBar from "@/components/SearchBar";
import {
  ArrowLeftIcon,
  SettingsIcon,
  BookOpenIcon,
  SearchIcon,
} from "@/components/Icons";
import { useScrollDirection } from "@/lib/useScrollDirection";
import {
  processContent,
  countMatches,
  SearchOptions,
} from "@/lib/textProcessor";
import {
  loadSettings,
  saveSettings,
  ReaderSettings,
} from "@/lib/readerSettings";
import {
  clearActiveDocument,
  getActiveDocument,
  ActiveDocument,
} from "@/lib/sessionDocumentStore";
import { saveProgress, loadProgress } from "@/lib/readingProgress";

const HEADER_HEIGHT = 52;

export default function ReaderPage() {
  const router = useRouter();
  const [activeDocument, setActiveDocument] = useState<ActiveDocument | null>(
    null,
  );
  const [isLoadingDocument, setIsLoadingDocument] = useState(true);
  const [settings, setSettings] = useState<ReaderSettings>(loadSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    caseSensitive: false,
    wholeWord: false,
  });

  // Refs
  const hasSavedSettings = useRef(false);
  const hasRestoredScroll = useRef(false);
  const saveProgressTimer = useRef<number | null>(null);
  const progressTextRef = useRef<HTMLParagraphElement>(null);

  // Header auto-hide
  const { direction, isAtTop } = useScrollDirection(10);
  const headerVisible =
    showSettings || showSearch || isAtTop || direction !== "down";

  const content = activeDocument?.content ?? "";
  const filename = activeDocument?.filename ?? "Untitled";
  const displayName = filename.replace(/\.(txt|epub)$/i, "");
  const shouldReflow =
    settings.reflowMode === "book" && activeDocument?.format !== "epub";

  const paragraphs = useMemo(
    () =>
      processContent(content, {
        reflowHardWrappedLines: shouldReflow,
      }),
    [content, shouldReflow],
  );

  const totalMatches = useMemo(
    () => countMatches(paragraphs, searchQuery, searchOptions),
    [paragraphs, searchQuery, searchOptions],
  );

  // ── Load document ──
  useEffect(() => {
    let isMounted = true;
    void getActiveDocument()
      .then((doc) => {
        if (isMounted) {
          setActiveDocument(doc);
          setIsLoadingDocument(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoadingDocument(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // ── Restore scroll position ──
  useEffect(() => {
    if (!filename || hasRestoredScroll.current || isLoadingDocument) return;
    if (paragraphs.length === 0) return;

    hasRestoredScroll.current = true;

    const saved = loadProgress(filename);
    if (!saved || saved.scrollPercent <= 0) return;

    const timer = window.setTimeout(() => {
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const targetY = (saved.scrollPercent / 100) * docHeight;
      window.scrollTo({ top: targetY, behavior: "instant" });
    }, 120);

    return () => window.clearTimeout(timer);
  }, [filename, isLoadingDocument, paragraphs.length]);

  // ── Auto-save scroll + update header % via DOM ref ──
  useEffect(() => {
    if (!filename || isLoadingDocument) return;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;

      const percent = (scrollTop / docHeight) * 100;

      // Direct DOM write - zero re-renders
      if (progressTextRef.current) {
        progressTextRef.current.textContent = `${Math.round(percent)}%`;
      }

      // Debounced save
      if (saveProgressTimer.current)
        window.clearTimeout(saveProgressTimer.current);

      saveProgressTimer.current = window.setTimeout(() => {
        saveProgress(filename, percent);
      }, 800);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (saveProgressTimer.current)
        window.clearTimeout(saveProgressTimer.current);
    };
  }, [filename, isLoadingDocument]);

  // ── Save settings ──
  useEffect(() => {
    if (!hasSavedSettings.current) {
      hasSavedSettings.current = true;
      return;
    }
    saveSettings(settings);
  }, [settings]);

  // ── Keyboard shortcut ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleBack = useCallback(() => {
    void clearActiveDocument().finally(() => router.push("/"));
  }, [router]);

  const handleRefresh = useCallback(async () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    await new Promise((r) => setTimeout(r, 300));
  }, []);

  const closeSearch = useCallback(() => {
    setShowSearch(false);
    setSearchQuery("");
    setCurrentMatchIndex(0);
    setSearchOptions({ caseSensitive: false, wholeWord: false });
  }, []);

  const handleSearch = useCallback(
    (query: string, currentIndex: number, options: SearchOptions) => {
      setSearchOptions(options);
      setSearchQuery(query);
      setCurrentMatchIndex(currentIndex);
    },
    [],
  );

  // ── Loading ──
  if (isLoadingDocument) {
    return (
      <main
        style={{ minHeight: "100vh", overflow: "hidden" }}
        className="page-fade"
      >
        <div
          style={{
            height: `${HEADER_HEIGHT}px`,
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            gap: "12px",
          }}
        >
          <div
            className="skeleton"
            style={{
              width: 36,
              height: 36,
              borderRadius: "var(--radius-sm)",
              flexShrink: 0,
            }}
          />
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 6,
              alignItems: "center",
            }}
          >
            <div className="skeleton" style={{ width: 120, height: 12 }} />
            <div className="skeleton" style={{ width: 32, height: 10 }} />
          </div>
          <div
            className="skeleton"
            style={{
              width: 36,
              height: 36,
              borderRadius: "var(--radius-sm)",
              flexShrink: 0,
            }}
          />
        </div>

        <div
          style={{
            maxWidth: "680px",
            margin: "0 auto",
            padding: "32px 20px",
          }}
        >
          {[100, 92, 100, 78, 100, 88, 65].map((w, i) => (
            <div
              key={i}
              className="skeleton"
              style={{
                height: 16,
                width: `${w}%`,
                marginBottom: i % 3 === 2 ? 28 : 12,
              }}
            />
          ))}
        </div>
      </main>
    );
  }

  // ── No content ──
  if (!content) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
        className="page-enter"
      >
        <div className="empty-state">
          <BookOpenIcon size={52} className="empty-state-icon" />
          <h2 className="empty-state-title">No content loaded</h2>
          <p className="empty-state-description">
            Upload a TXT or EPUB file from the home page to start reading
          </p>
          <button
            onClick={() => router.push("/")}
            className="text-button"
            style={{
              marginTop: "20px",
              background: "var(--elevated)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <ArrowLeftIcon size={15} />
            Go home
          </button>
        </div>
      </main>
    );
  }

  return (
    <>
      <ProgressBar />

      {/* ── Header ── */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          height: `${HEADER_HEIGHT}px`,
          transform: headerVisible ? "translateY(0)" : "translateY(-100%)",
          transition: "transform 0.26s cubic-bezier(0.4, 0, 0.2, 1)",
          willChange: "transform",
        }}
      >
        {/* Solid bg layer */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: "var(--bg)",
            opacity: 0.92,
          }}
        />
        {/* Blur layer */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
          }}
        />
        {/* Gradient border */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, var(--border) 20%, var(--border) 80%, transparent)",
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: "680px",
            margin: "0 auto",
            padding: "0 12px",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
          }}
        >
          {/* Back */}
          <button
            onClick={handleBack}
            className="icon-button"
            aria-label="Go back"
            style={{ marginLeft: "-4px" }}
          >
            <ArrowLeftIcon size={19} />
          </button>

          {/* Title + progress % */}
          <div
            style={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "2px",
            }}
          >
            <p
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--text)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "100%",
                lineHeight: 1.2,
              }}
            >
              {displayName}
            </p>
            <p
              ref={progressTextRef}
              style={{
                fontSize: "10px",
                color: "var(--muted)",
                fontVariantNumeric: "tabular-nums",
                lineHeight: 1,
              }}
            >
              0%
            </p>
          </div>

          {/* Actions */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "2px",
              marginRight: "-4px",
            }}
          >
            <button
              onClick={() => setShowSearch(true)}
              className="icon-button"
              aria-label="Search"
            >
              <SearchIcon size={18} />
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="icon-button"
              aria-label="Settings"
            >
              <SettingsIcon size={18} />
            </button>
          </div>
        </div>
      </header>

      <SearchBar
        isOpen={showSearch}
        onClose={closeSearch}
        onSearch={handleSearch}
        options={searchOptions}
        totalMatches={totalMatches}
      />

      <SwipeBack onBack={handleBack} />

      <div style={{ overflowX: "hidden", maxWidth: "100vw" }}>
        <PullToRefresh onRefresh={handleRefresh}>
          <main style={{ minHeight: "100vh", overflowX: "hidden" }}>
            <div style={{ height: `${HEADER_HEIGHT}px` }} aria-hidden="true" />
            <div
              style={{
                maxWidth: `${settings.contentWidth}px`,
                margin: "0 auto",
                padding: "0 20px 120px",
                overflowX: "hidden",
              }}
            >
              <Reader
                content={content}
                paragraphs={paragraphs}
                settings={settings}
                searchQuery={searchQuery}
                currentMatchIndex={currentMatchIndex}
                searchOptions={searchOptions}
              />
            </div>
          </main>
        </PullToRefresh>
      </div>

      <ScrollToTop />

      <BottomSheet
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="Settings"
      >
        <Settings settings={settings} onChange={setSettings} />
      </BottomSheet>
    </>
  );
}
