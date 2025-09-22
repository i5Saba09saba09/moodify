// src/pages/Sad.jsx
import React, { useMemo, useState, useEffect, useRef } from "react";
import ProductCard from "../components/ProductCard";
import ExerciseTimer from "../components/ExerciseTimer";
import Particles from "../components/Particles";
import defaultProducts, { PRODUCTS as NAMED } from "../data/products";

const SAD_EXERCISES = [
  { id: "breathe-6", emoji: "🌬️", title: "6-Min Breathing",  desc: "Inhale 4 • exhale 6 • soften shoulders.", mins: 6 },
  { id: "note-7",    emoji: "🖊️", title: "Name & Note",      desc: "Name the feeling; write 3 sentences.",   mins: 7 },
  { id: "step-8",    emoji: "🚶",  title: "Gentle Walk",      desc: "Slow walk, eyes open, notice 5 things.", mins: 8 },
  { id: "tea-5",     emoji: "🍵",  title: "Warm Tea Ritual",  desc: "Brew • hold • sip mindfully.",           mins: 5 },
];

export default function Sad() {
  const all = Array.isArray(NAMED) ? NAMED : Array.isArray(defaultProducts) ? defaultProducts : [];
  const moodBase = all.filter((p) => p.mood === "sad");
  const source = moodBase.length > 0 ? moodBase : all; // fallback so page isn't empty

  const [q, setQ] = useState("");
  const [qDeb, setQDeb] = useState("");
  const [sort, setSort] = useState("popular");
  const [chip, setChip] = useState("all");
  

  // debounce search a hair for smoother typing
  useEffect(() => {
    const id = setTimeout(() => setQDeb(q.trim().toLowerCase()), 140);
    return () => clearTimeout(id);
  }, [q]);

  // categories with counts, ordered by frequency
  const { categories, counts } = useMemo(() => {
    const cnt = source.reduce((m, p) => {
      const k = p.category || "Other";
      m[k] = (m[k] || 0) + 1;
      return m;
    }, {});
    const cats = Object.keys(cnt).sort((a, b) => (cnt[b] || 0) - (cnt[a] || 0));
    return { categories: ["all", ...cats], counts: cnt };
  }, [source]);

  const items = useMemo(() => {
    let list = [...source];

    if (chip !== "all") list = list.filter((p) => (p.category || "Other") === chip);

    if (qDeb) {
      const t = qDeb;
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(t) ||
          p.tagline?.toLowerCase().includes(t) ||
          p.tags?.some((x) => x.toLowerCase().includes(t))
      );
    }

    switch (sort) {
      case "price-asc":  list.sort((a, b) => a.price - b.price); break;
      case "price-desc": list.sort((a, b) => b.price - a.price); break;
      case "rating":     list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)); break;
      default:           list.sort((a, b) => (b.reviews ?? 0) - (a.reviews ?? 0)); // popular
    }
    return list;
  }, [source, qDeb, sort, chip]);

  const results = items.length;

  // SR-only live region for result count (plain JS style object)
  const srOnly = {
    position: "absolute",
    width: "1px",
    height: "1px",
    padding: 0,
    margin: "-1px",
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    border: 0,
  };
  const liveRef = useRef(null);
  useEffect(() => {
    if (liveRef.current) {
      liveRef.current.textContent = `${results} result${results === 1 ? "" : "s"}`;
    }
  }, [results]);

  function clearFilters() {
    setQ("");
    setQDeb("");
    setChip("all");
    setSort("popular");
  }

  return (
    <div className="page sad-page pretty">
      <header className="mood-hero sad">
        <Particles variant="sad" count={24} />
        <div className="inner">
          <h1>😔 Sad</h1>
          <p>Gentle, cozy tools and micro-rituals for heavy days.</p>
        </div>
      </header>

      {moodBase.length === 0 && (
        <div className="section-wide">
          <div className="empty-hint">
            Showing general picks — add products with <code>mood: "sad"</code> in <code>data/products.js</code> to curate this page.
          </div>
        </div>
      )}

      {/* Sticky filters */}
      <div className="section-wide sticky-filters">
        <div className="filters" role="region" aria-label="Filters">
          <input
            className="filter-input"
            placeholder="Search cozy helpers…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search products"
          />
          <select
            className="filter-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sort products"
          >
            <option value="popular">Most popular</option>
            <option value="rating">Top rated</option>
            <option value="price-asc">Price: low → high</option>
            <option value="price-desc">Price: high → low</option>
          </select>

          <div className="chips" role="listbox" aria-label="Filter by category">
            {categories.map((c) => {
              const isAll = c === "all";
              const count = isAll ? source.length : counts[c] || 0;
              const active = chip === c;
              return (
                <button
                  key={c}
                  className={`chip ${active ? "active" : ""}`}
                  onClick={() => setChip((prev) => (prev === c ? "all" : c))}
                  aria-pressed={active}
                  title={isAll ? "All categories" : `${c} (${count})`}
                >
                  {c}
                  <span style={{ opacity: 0.8, marginLeft: 6 }}>· {count}</span>
                </button>
              );
            })}
            {(q || chip !== "all" || sort !== "popular") && (
              <button className="chip" onClick={clearFilters} title="Clear filters">
                Reset
              </button>
            )}
          </div>

          {/* live region for result count */}
          <span style={srOnly} aria-live="polite" ref={liveRef} />
        </div>
      </div>

      <section className="section-wide">
        {results === 0 ? (
          <div className="empty-hint">
            No matches. Try a different keyword or reset filters.
            <div style={{ marginTop: 6 }}>
              <button className="chip" onClick={clearFilters}>Reset filters</button>
            </div>
          </div>
        ) : (
          <div className="product-grid">
            {items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      <section className="section-wide exercises">
        <div className="inner">
          <h2 className="ex-title">Gentle Reset</h2>
        <div className="exercise-grid">
            {SAD_EXERCISES.map((x) => (
              <ExerciseTimer key={x.id} {...x} accent="inspired" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
