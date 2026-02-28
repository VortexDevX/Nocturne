"use client";

import {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
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

export default function ReaderPage() {
  const router = useRouter();
  const [activeDocument, setActiveDocument] = useState<ActiveDocument | null>(
    null
  );
  const [isLoadingDocument, setIsLoadingDocument] = useState(true);
  const [settings, setSettings] = useState<ReaderSettings>(loadSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const hasSavedSettings = useRef(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    caseSensitive: false,
    wholeWord: false,
  });

  // Auto-hide header
  const { direction, isAtTop } = useScrollDirection(10);
  const headerVisible =
    showSettings || showSearch || isAtTop || direction !== "down";

  const content = activeDocument?.content ?? "";
  const filename = activeDocument?.filename ?? "Untitled";
  const shouldReflow =
    settings.reflowMode === "book" && activeDocument?.format !== "epub";

  // Process content once (same as Reader uses)
  const paragraphs = useMemo(
    () =>
      processContent(content, {
        reflowHardWrappedLines: shouldReflow,
      }),
    [content, shouldReflow]
  );

  // Calculate total matches using same processed text
  const totalMatches = useMemo(
    () => countMatches(paragraphs, searchQuery, searchOptions),
    [paragraphs, searchQuery, searchOptions]
  );

  useEffect(() => {
    let isMounted = true;

    void getActiveDocument()
      .then((document) => {
        if (isMounted) {
          setActiveDocument(document);
          setIsLoadingDocument(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsLoadingDocument(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hasSavedSettings.current) {
      hasSavedSettings.current = true;
      return;
    }
    saveSettings(settings);
  }, [settings]);

  // Keyboard shortcut for search
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
    void clearActiveDocument().finally(() => {
      router.push("/");
    });
  }, [router]);

  const handleRefresh = useCallback(async () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    await new Promise((resolve) => setTimeout(resolve, 300));
  }, []);

  const openSettings = useCallback(() => setShowSettings(true), []);
  const closeSettings = useCallback(() => setShowSettings(false), []);
  const openSearch = useCallback(() => setShowSearch(true), []);

  const closeSearch = useCallback(() => {
    setShowSearch(false);
    setSearchQuery("");
    setCurrentMatchIndex(0);
    setSearchOptions({
      caseSensitive: false,
      wholeWord: false,
    });
  }, []);

  const handleSearch = useCallback(
    (query: string, currentIndex: number, options: SearchOptions) => {
      setSearchOptions(options);
      setSearchQuery(query);
      setCurrentMatchIndex(currentIndex);
    },
    []
  );

  // Loading state
  if (isLoadingDocument) {
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
      <ProgressBar />

      {/* Header */}
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

            <div className="flex items-center gap-1">
              <button
                onClick={openSearch}
                className="icon-button shrink-0"
                aria-label="Search"
              >
                <SearchIcon size={20} />
              </button>

              <button
                onClick={openSettings}
                className="icon-button -mr-2 shrink-0"
                aria-label="Open settings"
              >
                <SettingsIcon size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <SearchBar
        isOpen={showSearch}
        onClose={closeSearch}
        onSearch={handleSearch}
        options={searchOptions}
        totalMatches={totalMatches}
      />

      <SwipeBack onBack={handleBack} />

      <div className="overflow-x-hidden max-w-full">
        <PullToRefresh onRefresh={handleRefresh}>
          <main className="min-h-screen overflow-x-hidden">
            <div style={{ height: "56px" }} aria-hidden="true" />

            <div
              className="mx-auto px-5 pb-20 overflow-x-hidden"
              style={{ maxWidth: `${settings.contentWidth}px` }}
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

            <div className="h-32" />
          </main>
        </PullToRefresh>
      </div>

      <ScrollToTop />

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
