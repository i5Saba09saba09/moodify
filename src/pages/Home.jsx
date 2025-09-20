// src/pages/Home.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import Particles from "../components/Particles";
import ProductCard from "../components/ProductCard";
import { MOODS } from "../moods";
import products, { PRODUCTS as NAMED } from "../data/products";

export default function Home() {
  const all = Array.isArray(NAMED) ? NAMED : Array.isArray(products) ? products : [];

  // Trending: most reviewed
  const trending = useMemo(() => {
    const list = [...all].sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
    return list.slice(0, 10);
  }, [all]);

  // Metrics
  const stats = useMemo(
    () => ({
      products: all.length,
      moods: MOODS.length,
      exercises: 8, // tweak if you add more
    }),
    [all.length]
  );

  // ===== Hero tilt & gentle magnetic CTA (reduced-motion & touch aware) =====
  const heroRef = useRef(null);
  const ctaRef = useRef(null);
  const rafRef = useRef(null);
  const prefersReduced = useRef(
    typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ).current;

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;

    const isTouch =
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0);

    function onMove(e) {
      if (prefersReduced) return;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5; // -0.5..0.5
        const y = (e.clientY - r.top) / r.height - 0.5;
        const tilt = parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue("--home-tilt") || "8"
        );
        el.style.setProperty("--rx", `${(-y * tilt).toFixed(2)}deg`);
        el.style.setProperty("--ry", `${(x * tilt).toFixed(2)}deg`);

        // magnet-lite (subtle) — desktop only
        if (!isTouch && ctaRef.current) {
          const btn = ctaRef.current;
          const br = btn.getBoundingClientRect();
          const bx = e.clientX - (br.left + br.width / 2);
          const by = e.clientY - (br.top + br.height / 2);
          const dist = Math.hypot(bx, by);
          const R = 140; // engage radius
          const MAX = 10; // max px translate
          if (dist < R) {
            const k = (dist / R) * MAX;
            const tx = (bx / (dist || 1)) * k;
            const ty = (by / (dist || 1)) * k;
            btn.style.transform = `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px)`;
          } else {
            btn.style.transform = `translate(0,0)`;
          }
        }
      });
    }

    function onLeave() {
      el.style.setProperty("--rx", `0deg`);
      el.style.setProperty("--ry", `0deg`);
      if (ctaRef.current) ctaRef.current.style.transform = `translate(0,0)`;
    }

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [prefersReduced]);

  // ===== Scroll reveals =====
  useEffect(() => {
    const els = Array.from(document.querySelectorAll(".reveal"));
    if (!("IntersectionObserver" in window) || els.length === 0) {
      els.forEach((n) => n.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => en.isIntersecting && en.target.classList.add("in")),
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
    );
    els.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  // ===== Counters roll-up when visible =====
  const countersRef = useRef(null);
  useEffect(() => {
    const box = countersRef.current;
    if (!box) return;
    const nums = Array.from(box.querySelectorAll("[data-count]"));
    const startVals = nums.map(() => 0);
    const targets = nums.map((n) => parseInt(n.getAttribute("data-count") || "0", 10));
    let raf;
    function animate(tsStart) {
      const dur = 900; // ms
      function frame(t) {
        const p = Math.min(1, (t - tsStart) / dur);
        nums.forEach((n, i) => {
          const val = Math.floor(startVals[i] + p * (targets[i] - startVals[i]));
          n.textContent = val.toString();
        });
        if (p < 1) raf = requestAnimationFrame(frame);
      }
      raf = requestAnimationFrame(frame);
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          animate(performance.now());
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(box);
    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [stats.products, stats.moods, stats.exercises]);

  // ===== Spotlight auto-slider (visibility & focus aware) =====
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const slideCount = trending.length;
  const spotRef = useRef(null);

  useEffect(() => {
    if (paused || slideCount <= 1 || prefersReduced) return;
    let id = setInterval(() => setIdx((i) => (i + 1) % slideCount), 2600);

    // Pause when tab hidden
    function onVis() {
      if (document.hidden) {
        clearInterval(id);
      } else if (!paused) {
        id = setInterval(() => setIdx((i) => (i + 1) % slideCount), 2600);
      }
    }
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [paused, slideCount, prefersReduced]);

  function prev() {
    setIdx((i) => (i - 1 + slideCount) % slideCount);
  }
  function next() {
    setIdx((i) => (i + 1) % slideCount);
  }

  // keyboard support on spotlight
  useEffect(() => {
    const el = spotRef.current;
    if (!el) return;
    function onKey(e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
      if (e.key === "ArrowRight") { e.preventDefault(); next(); }
    }
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [slideCount]);

  // ===== Motion dial (CSS variables) =====
  const [intensity, setIntensity] = useState(1); // 0.6..1.4 looks good
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--home-intensity", intensity.toString());
  }, [intensity]);

  return (
    <div
      className="page home-page pretty"
      style={{ "--home-tilt": 8, "--home-intensity": intensity }}
    >
      <header ref={heroRef} className="mood-hero home home-hero">
        <Particles variant="inspired" count={36} />
        <div className="hero-tilt">
          <div className="hero-glow" />
          <div className="inner">
            <h1 className="home-title">
              Moodify <span className="home-title-accent">Lab</span>
            </h1>
            <p className="home-kicker">
              Pick a mood → get tools, micro-exercises, and a pocket cart that matches your vibe.
            </p>

            <div className="home-cta-row">
              <NavLink
                ref={ctaRef}
                className="btn home-cta"
                to={`/${MOODS[0]?.slug || "inspired"}`}
              >
                Start exploring
                <span className="cta-shine" aria-hidden="true" />
              </NavLink>

              <div className="dial">
                <label htmlFor="motion">Motion</label>
                <input
                  id="motion"
                  type="range"
                  min="0.6"
                  max="1.4"
                  step="0.1"
                  value={intensity}
                  onChange={(e) => setIntensity(parseFloat(e.target.value))}
                  aria-label="Adjust motion intensity"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mood orbs */}
      <section className="section-wide reveal">
        <h2 className="home-subtitle">Choose your mood</h2>
        <div className="orb-grid">
          {MOODS.map((m, i) => (
            <NavLink key={m.slug} to={`/${m.slug}`} className={`orb ${m.slug}`} style={{ "--i": i }}>
              <span className="orb-emoji" aria-hidden="true">
                {m.emoji || "🙂"}
              </span>
              <span className="orb-label">{m.label}</span>
            </NavLink>
          ))}
        </div>
      </section>

      {/* Counters */}
      <section className="section-wide reveal">
        <div ref={countersRef} className="counters">
          <div className="count">
            <div className="num" data-count={stats.products}>0</div>
            <div className="lbl">Products</div>
          </div>
          <div className="count">
            <div className="num" data-count={stats.moods}>0</div>
            <div className="lbl">Moods</div>
          </div>
          <div className="count">
            <div className="num" data-count={stats.exercises}>0</div>
            <div className="lbl">Exercises</div>
          </div>
        </div>
      </section>

      {/* Spotlight rail */}
      <section className="section-wide reveal">
        <div
          ref={spotRef}
          className="spotlight"
          tabIndex={0}
          aria-roledescription="carousel"
          aria-label="Trending products"
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="spot-head">
            <h2 className="home-subtitle">Spotlight</h2>
            <div className="spot-controls">
              <button className="spot-btn" onClick={prev} aria-label="Previous">←</button>
              <button className="spot-btn" onClick={next} aria-label="Next">→</button>
            </div>
          </div>

          <div className="spot-viewport">
            <div
              className="spot-track"
              style={{
                "--w": "clamp(260px, 32vw, 360px)",
                transform: `translateX(calc(${idx} * (var(--w) + 16px) * -1))`,
              }}
            >
              {trending.length === 0 ? (
                <div className="spot-empty">
                  No trending items yet. Add reviews to products to populate this rail.
                </div>
              ) : (
                trending.map((p) => (
                  <div key={p.id} className="spot-cell">
                    <ProductCard product={p} />
                  </div>
                ))
              )}
            </div>
            <div className="spot-mask left" aria-hidden="true" />
            <div className="spot-mask right" aria-hidden="true" />
          </div>
        </div>
      </section>
    </div>
  );
}
