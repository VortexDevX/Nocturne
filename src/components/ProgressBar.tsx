"use client";

import { useEffect, useRef } from "react";

export default function ProgressBar() {
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const calculate = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      const progress =
        docHeight <= 0
          ? 0
          : Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));

      if (fillRef.current) {
        fillRef.current.style.width = `${progress}%`;
        fillRef.current.setAttribute(
          "aria-valuenow",
          String(Math.round(progress)),
        );
      }
    };

    calculate();
    window.addEventListener("scroll", calculate, { passive: true });
    window.addEventListener("resize", calculate, { passive: true });

    return () => {
      window.removeEventListener("scroll", calculate);
      window.removeEventListener("resize", calculate);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: "2px",
        background: "var(--border-subtle)",
        pointerEvents: "none",
      }}
    >
      <div
        ref={fillRef}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Reading progress"
        style={{
          height: "100%",
          width: "0%",
          background: "var(--accent)",
          boxShadow: "0 0 6px var(--accent-glow)",
        }}
      />
    </div>
  );
}
