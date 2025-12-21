"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { parseEpub } from "@/lib/epubParser";
import { UploadIcon, FileTextIcon, LoaderIcon } from "./Icons";

type UploadState = "idle" | "dragging" | "loading" | "error";

type Props = {
  compact?: boolean;
};

export default function FileUpload({ compact = false }: Props) {
  const router = useRouter();
  const [state, setState] = useState<UploadState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    const isText = file.name.toLowerCase().endsWith(".txt");
    const isEpub = file.name.toLowerCase().endsWith(".epub");

    if (!isText && !isEpub) {
      setState("error");
      setErrorMessage("Please upload a TXT or EPUB file");
      setTimeout(() => setState("idle"), 3000);
      return;
    }

    setState("loading");

    try {
      let text = "";

      if (isText) {
        text = await file.text();
      } else if (isEpub) {
        text = await parseEpub(file);
      }

      if (!text.trim()) {
        throw new Error("File appears to be empty");
      }

      sessionStorage.setItem("nocturne_content", text);
      sessionStorage.setItem("nocturne_filename", file.name);

      router.push("/reader");
    } catch (error) {
      setState("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to read file"
      );
      setTimeout(() => setState("idle"), 3000);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setState("dragging");
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setState("idle");
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setState("idle");

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    e.target.value = "";
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative
        flex flex-col items-center justify-center
        w-full
        ${compact ? "py-10 px-4" : "min-h-50 p-8"}
        border-2 border-dashed
        rounded-2xl
        cursor-pointer
        transition-all duration-200 ease-out
        outline-none
        ${
          state === "idle"
            ? "border-(--border) hover:border-(--muted) hover:bg-(--surface)"
            : ""
        }
        ${
          state === "dragging"
            ? "border-(--accent) bg-(--accentMuted) scale-[1.02]"
            : ""
        }
        ${
          state === "loading"
            ? "border-(--muted) bg-(--surface) pointer-events-none"
            : ""
        }
        ${
          state === "error" ? "border-red-400 bg-red-50 dark:bg-red-950/20" : ""
        }
        focus-visible:ring-2 focus-visible:ring-(--accent) focus-visible:ring-offset-2
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".txt,.epub"
        onChange={handleFileInput}
        className="hidden"
        aria-label="Upload file"
      />

      {/* Icon */}
      <div
        className={`
          ${compact ? "mb-2 p-2" : "mb-4 p-4"} rounded-xl
          transition-all duration-200
          ${state === "idle" ? "bg-(--surface) text-(--muted)" : ""}
          ${state === "dragging" ? "bg-(--accent) text-white scale-110" : ""}
          ${state === "loading" ? "bg-(--surface) text-(--muted)" : ""}
          ${
            state === "error"
              ? "bg-red-100 dark:bg-red-900/30 text-red-500"
              : ""
          }
        `}
      >
        {state === "loading" ? (
          <LoaderIcon size={compact ? 20 : 32} />
        ) : state === "dragging" ? (
          <FileTextIcon size={compact ? 20 : 32} />
        ) : (
          <UploadIcon size={compact ? 20 : 32} />
        )}
      </div>

      {/* Text */}
      <div className="text-center">
        {state === "idle" && (
          <>
            <p className={`${compact ? "text-m" : "text-base"} font-medium`}>
              {compact ? "Drop file or tap to browse" : "Drop your file here"}
            </p>
            {!compact && (
              <p className="text-m text-(--muted) mt-1">or tap to browse</p>
            )}
          </>
        )}

        {state === "dragging" && (
          <p
            className={`${
              compact ? "text-m" : "text-base"
            } font-medium text-(--accent)`}
          >
            Drop to start reading
          </p>
        )}

        {state === "loading" && (
          <p
            className={`${
              compact ? "text-m" : "text-base"
            } font-medium text-(--muted)`}
          >
            Processing...
          </p>
        )}

        {state === "error" && (
          <p
            className={`${
              compact ? "text-m" : "text-base"
            } font-medium text-red-500`}
          >
            {errorMessage}
          </p>
        )}
      </div>

      {/* Supported formats */}
      {state === "idle" && (
        <div className={`flex items-center gap-2 ${compact ? "mt-2" : "mt-4"}`}>
          <span className="px-2 py-0.5 text-sm font-medium rounded-md bg-(--surface) text-(--muted)">
            .txt
          </span>
          <span className="px-2 py-0.5 text-sm font-medium rounded-md bg-(--surface) text-(--muted)">
            .epub
          </span>
        </div>
      )}
    </div>
  );
}
