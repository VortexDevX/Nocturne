"use client";

import { useEffect, useState, useRef } from "react";

type ScrollDirection = "up" | "down" | null;

export function useScrollDirection(threshold: number = 10) {
  const [direction, setDirection] = useState<ScrollDirection>(null);
  const [isAtTop, setIsAtTop] = useState(true);

  const lastScrollY = useRef(0);
  const lastDirection = useRef<ScrollDirection>(null);
  const lastIsAtTop = useRef(true);

  useEffect(() => {
    let rafId: number | null = null;

    const update = () => {
      const scrollY = window.scrollY;
      const atTop = scrollY < 50;
      const diff = scrollY - lastScrollY.current;

      if (atTop !== lastIsAtTop.current) {
        lastIsAtTop.current = atTop;
        setIsAtTop(atTop);
      }

      if (Math.abs(diff) > threshold) {
        const newDir: ScrollDirection = diff > 0 ? "down" : "up";
        if (newDir !== lastDirection.current) {
          lastDirection.current = newDir;
          setDirection(newDir);
        }
        lastScrollY.current = scrollY;
      }

      rafId = null;
    };

    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(update);
    };

    lastScrollY.current = window.scrollY;
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [threshold]);

  return { direction, isAtTop };
}
