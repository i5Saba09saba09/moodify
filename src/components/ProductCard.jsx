// src/components/ProductCard.jsx
import React, { useMemo, useState, useId } from "react";
import { useCart } from "../state/CartContext";

export default function ProductCard({ product }) {
  const { add } = useCart();
  const [pop, setPop] = useState(false);
  const [lock, setLock] = useState(false);
  const [imgOk, setImgOk] = useState(true);
  const titleId = useId();
  const tagId = useId();

  const {
    image,
    name = "Product",
    price = 0,
    rating,
    reviews,
    tagline,
    tags = [],
  } = product ?? {};

  const priceText = useMemo(() => {
    try {
      return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(price) || 0);
    } catch {
      return `$${Number(price).toFixed(2)}`;
    }
  }, [price]);

  function onAdd() {
    if (lock) return;
    setLock(true);
    add(product);

    // small +1 pop and unlock
    setPop(true);
    setTimeout(() => setPop(false), 420);
    setTimeout(() => setLock(false), 480);

    // toast for global listener
    window.dispatchEvent(
      new CustomEvent("toast", { detail: { message: `Added “${name}”` } })
    );

    // bump the FAB animation
    const fab = document.querySelector(".cart-fab");
    if (fab) {
      fab.classList.remove("bump");
      // force reflow to restart animation
      // eslint-disable-next-line no-unused-expressions
      fab.offsetWidth;
      fab.classList.add("bump");
    }
  }

  function onImgError(e) {
    if (!imgOk) return;
    setImgOk(false);
    // lightweight inline placeholder (keeps layout)
    const svg = encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 180'>
         <defs>
           <linearGradient id='g' x1='0' x2='1'>
             <stop offset='0%' stop-color='#222'/>
             <stop offset='100%' stop-color='#333'/>
           </linearGradient>
         </defs>
         <rect width='100%' height='100%' fill='url(#g)'/>
         <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
               fill='#bbb' font-family='Arial' font-size='16'>No image</text>
       </svg>`
    );
    e.currentTarget.src = `data:image/svg+xml;charset=utf-8,${svg}`;
  }

  const showRating = typeof rating === "number" && !Number.isNaN(rating);

  return (
    <article
      className="product-card"
      role="article"
      aria-labelledby={titleId}
      aria-describedby={tagline ? tagId : undefined}
    >
      <div className="product-image">
        <img
          src={image}
          alt={name}
          loading="lazy"
          onError={onImgError}
          width="320"
          height="180"
        />
        {showRating && (
          <span className="badge rating" aria-label={`Rated ${Number(rating).toFixed(1)} out of 5`}>
            ⭐ {Number(rating).toFixed(1)}{" "}
            {typeof reviews === "number" && <span className="muted">({reviews})</span>}
          </span>
        )}
      </div>

      <div className="product-info">
        <h3 id={titleId}>{name}</h3>
        <span aria-label={`Price ${priceText}`}>{priceText}</span>
      </div>

      {tagline && (
        <p className="product-tagline" id={tagId}>
          {tagline}
        </p>
      )}

      {tags.length > 0 && (
        <div className="pill-row">
          {tags.slice(0, 3).map((t) => (
            <span key={t} className="pill">
              {t}
            </span>
          ))}
        </div>
      )}

      <button
        type="button"
        className="btn"
        onClick={onAdd}
        aria-label={`Add ${name} to cart`}
        aria-busy={lock || undefined}
        disabled={lock}
      >
        Add to cart
        <span className={`popper ${pop ? "show" : ""}`} aria-hidden="true">
          +1
        </span>
      </button>
    </article>
  );
}
