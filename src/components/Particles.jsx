import React, { useMemo } from "react";

export default function Particles({ variant = "inspired", count = 28 }) {
  // precompute so dots don't jump each render
  const dots = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,     // %
        top: Math.random() * 100,      // %
        size: 6 + Math.random() * 12,  // px
        dur: 8 + Math.random() * 10,   // s
        delay: -Math.random() * 8,     // s (negative to desync)
        blur: 2 + Math.random() * 6,   // px
      })),
    [count]
  );

  return (
    <div className={`particles ${variant}`} aria-hidden="true">
      {dots.map((d) => (
        <span
          key={d.id}
          className="particle"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: d.size,
            height: d.size,
            animationDuration:
              variant === "angry" ? `${d.dur * 0.9}s` : `${d.dur}s`,
            animationDelay: `${d.delay}s`,
            filter: `blur(${d.blur}px)`,
          }}
        />
      ))}
    </div>
  );
}
