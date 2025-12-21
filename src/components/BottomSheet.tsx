"use client";

import { useEffect, useCallback } from "react";

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
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleEscape);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 z-40
          bg-black/40
          transition-opacity duration-300
          ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`
          fixed z-50
          bottom-0 left-0 right-0
          w-full max-w-full
          bg-(--surface)
          border-t border-(--border)
          rounded-t-3xl
          max-h-[85vh]
          overflow-hidden
          transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${isOpen ? "translate-y-0" : "translate-y-full"}
        `}
        style={{
          /* Prevent any width changes */
          width: "100vw",
          maxWidth: "100vw",
          overflowX: "hidden",
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-(--border)" />
        </div>

        {/* Header */}
        {title && (
          <div className="px-6 pb-4 border-b border-(--border)">
            <h2 className="text-lg font-semibold text-center">{title}</h2>
          </div>
        )}

        {/* Content - constrained */}
        <div
          className="overflow-y-auto overflow-x-hidden"
          style={{
            maxHeight: "calc(85vh - 80px)",
            overflowX: "hidden",
          }}
        >
          <div className="px-6 py-6 w-full max-w-md mx-auto">{children}</div>
        </div>

        {/* Safe area padding for iOS */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </>
  );
}
