"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

type Props = {
  onBack?: () => void;
};

export default function SwipeBack({ onBack }: Props) {
  const router = useRouter();
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const isHorizontalSwipe = useRef<boolean | null>(null);

  const EDGE_THRESHOLD = 30; // Must start within 30px of left edge
  const SWIPE_THRESHOLD = 100; // Must swipe at least 100px to trigger
  const MAX_SWIPE = 150; // Visual max

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];

    // Only start if touch begins near left edge
    if (touch.clientX <= EDGE_THRESHOLD) {
      startX.current = touch.clientX;
      startY.current = touch.clientY;
      isHorizontalSwipe.current = null;
      setIsSwiping(true);
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isSwiping) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - startX.current;
      const deltaY = touch.clientY - startY.current;

      // Determine if horizontal or vertical swipe (only once)
      if (
        isHorizontalSwipe.current === null &&
        (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)
      ) {
        isHorizontalSwipe.current = Math.abs(deltaX) > Math.abs(deltaY);
      }

      // Only handle horizontal swipes going right
      if (isHorizontalSwipe.current && deltaX > 0) {
        e.preventDefault();
        const progress = Math.min(deltaX / MAX_SWIPE, 1);
        setSwipeProgress(progress);
      }
    },
    [isSwiping]
  );

  const handleTouchEnd = useCallback(() => {
    if (!isSwiping) return;

    if (swipeProgress >= SWIPE_THRESHOLD / MAX_SWIPE) {
      // Trigger navigation
      if (onBack) {
        onBack();
      } else {
        router.push("/");
      }
    }

    setIsSwiping(false);
    setSwipeProgress(0);
    isHorizontalSwipe.current = null;
  }, [isSwiping, swipeProgress, onBack, router]);

  useEffect(() => {
    document.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  if (!isSwiping && swipeProgress === 0) return null;

  return (
    <>
      {/* Edge indicator */}
      <div
        className="fixed top-0 left-0 bottom-0 z-50 pointer-events-none"
        style={{
          width: `${swipeProgress * MAX_SWIPE}px`,
          background: `linear-gradient(to right, var(--accent), transparent)`,
          opacity: swipeProgress * 0.3,
        }}
      />

      {/* Arrow indicator */}
      <div
        className="fixed top-1/2 -translate-y-1/2 z-50 pointer-events-none transition-opacity"
        style={{
          left: `${swipeProgress * MAX_SWIPE - 40}px`,
          opacity: swipeProgress > 0.3 ? swipeProgress : 0,
        }}
      >
        <div
          className="w-10 h-10 rounded-full bg-(--accent) flex items-center justify-center text-white shadow-lg"
          style={{
            transform: `scale(${0.5 + swipeProgress * 0.5})`,
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </div>
      </div>
    </>
  );
}
