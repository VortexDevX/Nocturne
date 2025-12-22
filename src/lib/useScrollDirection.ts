"use client";

import { useEffect, useState, useRef } from "react";

type ScrollDirection = "up" | "down" | null;

export function useScrollDirection(threshold: number = 10) {
  const [direction, setDirection] = useState<ScrollDirection>(null);
  const [isAtTop, setIsAtTop] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    let ticking = false;

    const updateScrollDirection = () => {
      const scrollY = window.scrollY;

      // Check if at top
      const atTop = scrollY < 50;
      setIsAtTop(atTop);

      // Determine direction
      const diff = scrollY - lastScrollY.current;

      if (Math.abs(diff) > threshold) {
        const newDirection = diff > 0 ? "down" : "up";
        setDirection(newDirection);
        lastScrollY.current = scrollY;
      }

      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking = true;
      }
    };

    // Set initial values
    lastScrollY.current = window.scrollY;

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [threshold]);

  return { direction, isAtTop };
}
