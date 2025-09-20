// src/components/Particles.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Floating particles backdrop.
 *
 * Props:
 * - variant: "inspired" | "angry" | "happy" | "sad" | string  (CSS hook)
 * - count: number (default 28)
 * - seed: number | string (optional, makes layout deterministic)
 * - speed: number (default 1; 2 = faster, 0.7 = slower)
 * - parallax: boolean (default false; moves the whole field slightly on mouse)
 * - parallaxStrength: number (default 8; pixels)
 * - className: string (optional)
 */
export default function Particles({
  variant = "inspired",
  count = 28,
  seed,
  speed = 1,
  parallax = false,
  parallaxStrength = 8,
  className = "",
}) {
  // Respect prefers-reduced-motion
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(!!mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  // Deterministic PRNG (mulberry32)
  function mulberry32(a) {
    let t = a >>> 0;
    return function () {
      t += 0x6D2B79F5;
      let r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }
  // Hash any string seed into an int
  function hashSeed(x) {
    if (x == null) return 0;
    if (typeof x === "number") return x | 0;
    let h = 2166136261 >>> 0;
    for (let i = 0; i < String(x).length; i++) {
      h ^= String(x).charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  const rng = useMemo(() => {
    const base = 1337 ^ hashSeed(seed ?? `${variant}:${count}`);
    return mulberry32(base);
  }, [seed, variant, count]);

  const finalCount = reduced ? Math.min(8, Math.max(0, Math.round(count * 0.3))) : count;

  // Precompute particle specs so they don't jump each render
  const dots = useMemo(() => {
    const arr = [];
    for (let i = 0; i < finalCount; i++) {
      const left = rng() * 100;
      const top = rng() * 100;
      const size = 6 + rng() * 12;
      const dur = 8 + rng() * 10; // seconds
      const delay = -rng() * 8; // desync
      const blur = 2 + rng() * 6;
      arr.push({ id: i, left, top, size, dur, delay, blur });
    }
    return arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalCount, rng]);

  // optional parallax (cheap: move container only)
  const wrapRef = useRef(null);
  useEffect(() => {
    if (!parallax || reduced) return;
    const el = wrapRef.current;
    if (!el) return;

    function onMove(e) {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5; // -0.5..0.5
      const y = (e.clientY - r.top) / r.height - 0.5;
      const px = (x * parallaxStrength).toFixed(2);
      const py = (y * parallaxStrength).toFixed(2);
      el.style.setProperty("--pX", `${px}px`);
      el.style.setProperty("--pY", `${py}px`);
    }
    function onLeave() {
      el.style.setProperty("--pX", `0px`);
      el.style.setProperty("--pY", `0px`);
    }
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [parallax, parallaxStrength, reduced]);

  // duration adjuster: speed > 1 == faster
  const speedMultiplier = Math.max(0.01, Number(speed) || 1);
  const variantSpeed = variant === "angry" ? 0.9 : 1; // keep your spice

  return (
    <div
      ref={wrapRef}
      className={`particles ${variant} ${className}`.trim()}
      data-variant={variant}
      aria-hidden="true"
      style={{
        transform:
          parallax && !reduced
            ? "translate3d(var(--pX, 0px), var(--pY, 0px), 0)"
            : undefined,
      }}
    >
      {dots.map((d) => {
        const dur = (d.dur * variantSpeed) / speedMultiplier;
        const common = {
          left: `${d.left}%`,
          top: `${d.top}%`,
          width: d.size,
          height: d.size,
          filter: `blur(${d.blur}px)`,
        };
        return (
          <span
            key={d.id}
            className="particle"
            style={
              reduced
                ? {
                    ...common,
                    animation: "none",
                    opacity: 0.65,
                  }
                : {
                    ...common,
                    animationDuration: `${dur}s`,
                    animationDelay: `${d.delay}s`,
                  }
            }
          />
        );
      })}
    </div>
  );
}
