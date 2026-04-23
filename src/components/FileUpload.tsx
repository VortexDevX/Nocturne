"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { parseEpub } from "@/lib/epubParser";
import { cleanText } from "@/lib/textParser";
import { parseTxt } from "@/lib/txtParser";
import { saveActiveDocument } from "@/lib/sessionDocumentStore";
import { UploadIcon, FileTextIcon, LoaderIcon } from "./Icons";

type UploadState = "idle" | "dragging" | "loading" | "error";

export default function FileUpload() {
  const router = useRouter();
  const [state, setState] = useState<UploadState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const resetTimerRef = useRef<number | null>(null);

  const scheduleReset = useCallback(() => {
    if (resetTimerRef.current) window.clearTimeout(resetTimerRef.current);
    resetTimerRef.current = window.setTimeout(() => setState("idle"), 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) window.clearTimeout(resetTimerRef.current);
    };
  }, []);

  const processFile = useCallback(
    async (file: File) => {
      const isText = file.name.toLowerCase().endsWith(".txt");
      const isEpub = file.name.toLowerCase().endsWith(".epub");

      if (!isText && !isEpub) {
        setState("error");
        setErrorMessage("Only .txt and .epub files are supported");
        scheduleReset();
        return;
      }

      setState("loading");

      try {
        let text = "";
        let encoding: string | undefined;

        if (isText) {
          const parsed = await parseTxt(file);
          encoding = parsed.encoding;
          text = cleanText(parsed.text, { reflowHardWrappedLines: true });
        } else {
          text = cleanText(await parseEpub(file), {
            reflowHardWrappedLines: false,
          });
        }

        if (!text.trim()) throw new Error("File appears to be empty");

        await saveActiveDocument({
          content: text,
          filename: file.name,
          format: isText ? "txt" : "epub",
          encoding,
        });

        router.push("/reader");
      } catch (error) {
        setState("error");
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to read file",
        );
        scheduleReset();
      }
    },
    [router, scheduleReset],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setState("idle");
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const isLoading = state === "loading";
  const isError = state === "error";
  const isDragging = state === "dragging";
  const isIdle = state === "idle";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => !isLoading && inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setState("dragging");
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        if (
          e.clientX < rect.left ||
          e.clientX > rect.right ||
          e.clientY < rect.top ||
          e.clientY > rect.bottom
        )
          setState("idle");
      }}
      onDrop={handleDrop}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        padding: "32px 20px",
        borderRadius: "18px",
        cursor: isLoading ? "default" : "pointer",
        outline: "none",
        transition: "all 200ms ease",
        userSelect: "none",
        // Explicit colors - not relying on CSS variables for visibility
        backgroundColor: isDragging
          ? "var(--accentMuted, #1a3a5c)"
          : isError
            ? "rgba(248,113,113,0.08)"
            : "var(--elevated, #1e1e1e)",
        border: `1.5px dashed ${
          isDragging
            ? "var(--accent, #60a5fa)"
            : isError
              ? "rgba(248,113,113,0.6)"
              : "var(--border, #333333)"
        }`,
        boxShadow: isDragging
          ? "0 0 0 4px rgba(96,165,250,0.12)"
          : "inset 0 1px 0 rgba(255,255,255,0.04)",
        transform: isDragging ? "scale(1.01)" : "scale(1)",
        opacity: isLoading ? 0.6 : 1,
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".txt,.epub"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) processFile(file);
          e.target.value = "";
        }}
        style={{ display: "none" }}
        aria-label="Upload file"
      />

      {/* Icon */}
      <div
        style={{
          marginBottom: "12px",
          padding: "12px",
          borderRadius: "12px",
          backgroundColor: isDragging
            ? "var(--accent, #60a5fa)"
            : "rgba(255,255,255,0.06)",
          border: "1px solid var(--border, #333)",
          color: isDragging
            ? "#fff"
            : isError
              ? "#f87171"
              : "var(--text-secondary, #a0a0a0)",
          transition: "all 200ms ease",
          transform: isDragging ? "scale(1.08)" : "scale(1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isLoading && <LoaderIcon size={20} />}
        {isDragging && <FileTextIcon size={20} />}
        {(isIdle || isError) && <UploadIcon size={20} />}
      </div>

      {/* Label */}
      <p
        style={{
          fontSize: "14px",
          fontWeight: 500,
          marginBottom: "4px",
          color: isError
            ? "#f87171"
            : isDragging
              ? "var(--accent, #60a5fa)"
              : "var(--text, #ebebeb)",
        }}
      >
        {isLoading && "Processing…"}
        {isDragging && "Drop to open"}
        {isError && errorMessage}
        {isIdle && "Drop file or tap to browse"}
      </p>

      {isIdle && (
        <p
          style={{
            fontSize: "12px",
            color: "var(--muted, #606060)",
          }}
        >
          TXT · EPUB
        </p>
      )}
    </div>
  );
}
