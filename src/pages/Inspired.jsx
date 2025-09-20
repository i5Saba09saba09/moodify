// src/pages/Inspired.jsx
import React, { useMemo, useState } from "react";
import ProductCard from "../components/ProductCard";
import ExerciseTimer from "../components/ExerciseTimer";
import Particles from "../components/Particles";            // ⬅️ add this
import defaultProducts, { PRODUCTS as NAMED } from "../data/products";

const INSPIRED_EXERCISES = [
  { id: "sketch-10", emoji: "✏️", title: "10-min Sketch", desc: "Pick an object nearby and sketch fast.", mins: 10 },
  { id: "ideas-7",  emoji: "💡", title: "5 Ideas Sprint", desc: "Write 5 wild ideas — no judging.", mins: 7 },
  { id: "mood-12",  emoji: "🎛️", title: "Moodboard Mix", desc: "Save 6 images for a theme.", mins: 12 },
  { id: "walk-8",   emoji: "🚶", title: "Think Walk", desc: "Walk & voice-note three insights.", mins: 8 },
];

export default function Inspired() {
  const all = Array.isArray(NAMED) ? NAMED : Array.isArray(defaultProducts) ? defaultProducts : [];
  const base = all.filter((p) => p.mood === "inspired");

  const [q, setQ] = useState("");
  const [sort, setSort] = useState("popular");
  const [chip, setChip] = useState("all");

  const categories = ["all", ...Array.from(new Set(base.map(b => b.category)))];

  const items = useMemo(() => {
    let list = [...base];

    if (chip !== "all") list = list.filter(p => p.category === chip);

    if (q.trim()) {
      const t = q.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(t) ||
        p.tagline?.toLowerCase().includes(t) ||
        p.tags?.some(x => x.toLowerCase().includes(t))
      );
    }

    switch (sort) {
      case "price-asc":  list.sort((a,b)=>a.price-b.price); break;
      case "price-desc": list.sort((a,b)=>b.price-a.price); break;
      case "rating":     list.sort((a,b)=> (b.rating??0) - (a.rating??0)); break;
      default:           list.sort((a,b)=> (b.reviews??0) - (a.reviews??0));
    }
    return list;
  }, [base, q, sort, chip]);

  return (
    <div className="page inspired-page pretty">
      <header className="mood-hero inspired">
        <Particles variant="inspired" />            {/* ⬅️ particles behind header text */}
        <div className="inner">
          <h1>✨ Inspired</h1>
          <p>Fuel your creativity and momentum with our curated picks.</p>
        </div>
      </header>

      {/* Sticky filters */}
      <div className="section-wide sticky-filters">
        <div className="filters">
          <input
            className="filter-input"
            placeholder="Search creative gear..."
            value={q}
            onChange={(e)=>setQ(e.target.value)}
          />
          <select className="filter-select" value={sort} onChange={(e)=>setSort(e.target.value)}>
            <option value="popular">Most popular</option>
            <option value="rating">Top rated</option>
            <option value="price-asc">Price: low → high</option>
            <option value="price-desc">Price: high → low</option>
          </select>

          <div className="chips">
            {categories.map(c=>(
              <button
                key={c}
                className={`chip ${chip===c?"active":""}`}
                onClick={()=>setChip(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="section-wide">
        <div className="product-grid">
          {items.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      <section className="section-wide exercises">
        <div className="inner">
          <h2 className="ex-title">Quick Creative Exercises</h2>
          <div className="exercise-grid">
            {INSPIRED_EXERCISES.map(x => (
              <ExerciseTimer key={x.id} {...x} accent="inspired" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
