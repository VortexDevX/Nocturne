"use client";

import { useEffect, useState, useCallback, useRef } from "react";

type Props = {
  onRefresh: () => void | Promise<void>;
  children: React.ReactNode;
};

export default function PullToRefresh({ onRefresh, children }: Props) {
  const [pullProgress, setPullProgress] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const PULL_THRESHOLD = 80;
  const MAX_PULL = 120;

  const handleTouchStart = useCallback((e: TouchEvent) => {
    // Only start if at top of page
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isPulling || isRefreshing) return;

      const deltaY = e.touches[0].clientY - startY.current;

      // Only handle downward pulls
      if (deltaY > 0 && window.scrollY === 0) {
        e.preventDefault();
        const progress = Math.min(deltaY / MAX_PULL, 1);
        setPullProgress(progress);
      }
    },
    [isPulling, isRefreshing]
  );

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return;

    if (pullProgress >= PULL_THRESHOLD / MAX_PULL && !isRefreshing) {
      setIsRefreshing(true);
      setPullProgress(1);

      try {
        await onRefresh();
      } finally {
        // Small delay for visual feedback
        setTimeout(() => {
          setIsRefreshing(false);
          setPullProgress(0);
        }, 300);
      }
    } else {
      setPullProgress(0);
    }

    setIsPulling(false);
  }, [isPulling, pullProgress, isRefreshing, onRefresh]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    container.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <div ref={containerRef} className="relative">
      {/* Pull indicator */}
      <div
        className="absolute left-0 right-0 flex items-center justify-center z-40 pointer-events-none transition-opacity duration-200"
        style={{
          top: -60,
          transform: `translateY(${pullProgress * 80}px)`,
          opacity: pullProgress > 0.1 ? 1 : 0,
        }}
      >
        <div
          className={`
            w-10 h-10 rounded-full 
            bg-(--surface) border border-(--border)
            flex items-center justify-center
            shadow-lg
            ${isRefreshing ? "animate-spin" : ""}
          `}
          style={{
            transform: `rotate(${pullProgress * 180}deg)`,
          }}
        >
          {isRefreshing ? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          transform: `translateY(${isRefreshing ? 60 : pullProgress * 60}px)`,
          transition: isPulling ? "none" : "transform 0.3s ease",
        }}
      >
        {children}
      </div>
    </div>
  );
}
