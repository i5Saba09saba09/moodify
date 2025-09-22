// src/pages/Inspired.jsx
import React, { useMemo, useState, useEffect, useRef } from "react";
import ProductCard from "../components/ProductCard";
import ExerciseTimer from "../components/ExerciseTimer";
import Particles from "../components/Particles";
import defaultProducts, { PRODUCTS as NAMED } from "../data/products";

const INSPIRED_EXERCISES = [
  { id: "sketch-10", emoji: "✏️", title: "10-min Sketch", desc: "Pick an object nearby and sketch fast.", mins: 10 },
  { id: "ideas-7",  emoji: "💡", title: "5 Ideas Sprint", desc: "Write 5 wild ideas — no judging.", mins: 7 },
  { id: "mood-12",  emoji: "🎛️", title: "Moodboard Mix", desc: "Save 6 images for a theme.", mins: 12 },
  { id: "walk-8",   emoji: "🚶", title: "Think Walk",     desc: "Walk & voice-note three insights.", mins: 8 },
];

export default function Inspired() {
  const all = Array.isArray(NAMED) ? NAMED : Array.isArray(defaultProducts) ? defaultProducts : [];
  const base = all.filter((p) => p.mood === "inspired");

  const [q, setQ] = useState("");
  const [qDeb, setQDeb] = useState("");
  const [sort, setSort] = useState("popular");
  const [chip, setChip] = useState("all");
  const [showSearch, setShowSearch] = useState(false);


  // debounce search
  useEffect(() => {
    const id = setTimeout(() => setQDeb(q.trim().toLowerCase()), 140);
    return () => clearTimeout(id);
  }, [q]);

  // categories with counts, ordered by frequency
  const { categories, counts } = useMemo(() => {
    const cnt = base.reduce((m, p) => {
      const k = p.category || "Other";
      m[k] = (m[k] || 0) + 1;
      return m;
    }, {});
    const cats = Object.keys(cnt).sort((a, b) => (cnt[b] || 0) - (cnt[a] || 0));
    return { categories: ["all", ...cats], counts: cnt };
  }, [base]);

  const items = useMemo(() => {
    let list = [...base];

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
  }, [base, qDeb, sort, chip]);

  const results = items.length;

  // SR-only live region
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
    <div className="page inspired-page pretty">
      <header className="mood-hero inspired">
        <Particles variant="inspired" count={26} speed={1.0} parallax />
        <div className="inner">
          <h1>✨ Inspired</h1>
          <p>Fuel your creativity and momentum with our curated picks.</p>
        </div>
      </header>

      {/* Sticky filters */}
      <div className="section-wide sticky-filters">
        <div className="filters" role="region" aria-label="Filters">
          <input
            className="filter-input"
            placeholder="Search creative gear..."
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
              const count = isAll ? base.length : counts[c] || 0;
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
            No matches. Try different keywords, or reset filters.
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
          <h2 className="ex-title">Quick Creative Exercises</h2>
          <div className="exercise-grid">
            {INSPIRED_EXERCISES.map((x) => (
              <ExerciseTimer key={x.id} {...x} accent="inspired" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
