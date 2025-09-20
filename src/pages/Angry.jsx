import React, { useMemo, useState } from "react";
import ProductCard from "../components/ProductCard";
import ExerciseTimer from "../components/ExerciseTimer";
import Particles from "../components/Particles";
import defaultProducts, { PRODUCTS as NAMED } from "../data/products";

const ANGRY_EXERCISES = [
  { id: "box-5",  emoji: "🟩", title: "Box Breathing",    desc: "Inhale 4 • hold 4 • exhale 4 • hold 4 ×5.", mins: 5 },
  { id: "push-7", emoji: "💪", title: "Push-up Ladder",   desc: "3, rest • 4, rest • 5, rest • repeat.",      mins: 7 },
  { id: "name-6", emoji: "📝", title: "Name It",          desc: "Trigger → Thought → Body → Need.",           mins: 6 },
  { id: "walk-10",emoji: "🚶‍♂️", title: "Fast Walk",      desc: "Swing arms, nose-breath cadence 4-4.",       mins: 10 },
];

export default function Angry() {
  const all = Array.isArray(NAMED) ? NAMED : Array.isArray(defaultProducts) ? defaultProducts : [];
  const base = all.filter((p) => p.mood === "angry");

  const [q, setQ] = useState("");
  const [sort, setSort] = useState("popular");
  const [chip, setChip] = useState("all");

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(base.map((b) => b.category)))],
    [base]
  );

  const items = useMemo(() => {
    let list = [...base];

    if (chip !== "all") list = list.filter((p) => p.category === chip);

    if (q.trim()) {
      const t = q.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(t) ||
          p.tagline?.toLowerCase().includes(t) ||
          p.tags?.some((x) => x.toLowerCase().includes(t))
      );
    }

    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      default:
        list.sort((a, b) => (b.reviews ?? 0) - (a.reviews ?? 0)); // popular
    }
    return list;
  }, [base, q, sort, chip]);

  return (
    <div className="page angry-page pretty">
      <header className="mood-hero angry">
  <Particles variant="angry" count={18} />
  <div className="inner">
    <h1>🔥 Angry</h1>
    <p>Channel the energy or cool it down with focused picks.</p>
  </div>
</header>


      {/* Sticky filters */}
      <div className="section-wide sticky-filters">
        <div className="filters">
          <input
            className="filter-input"
            placeholder="Search vent tools…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            className="filter-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="popular">Most popular</option>
            <option value="rating">Top rated</option>
            <option value="price-asc">Price: low → high</option>
            <option value="price-desc">Price: high → low</option>
          </select>

          <div className="chips">
            {categories.map((c) => (
              <button
                key={c}
                className={`chip ${chip === c ? "active" : ""}`}
                onClick={() => setChip(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="section-wide">
        <div className="product-grid">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="section-wide exercises">
        <div className="inner">
          <h2 className="ex-title">Reset & Release</h2>
          <div className="exercise-grid">
            {ANGRY_EXERCISES.map((x) => (
              <ExerciseTimer key={x.id} {...x} accent="angry" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
