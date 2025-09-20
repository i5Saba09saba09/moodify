import { useState } from "react";
import { useCart } from "../state/CartContext";

export default function ProductCard({ product }) {
  const { add } = useCart();
  const [pop, setPop] = useState(false);

  function onAdd() {
    add(product);
    setPop(true);
    setTimeout(() => setPop(false), 500);

    // toast (optional listener elsewhere)
    window.dispatchEvent(
      new CustomEvent("toast", { detail: { message: `Added “${product.name}”` } })
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

  const { image, name, price, rating, reviews, tagline, tags = [] } = product;

  return (
    <div className="product-card" role="article" aria-label={name}>
      <div className="product-image">
        <img src={image} alt={name} loading="lazy" />
        {rating && (
          <span className="badge rating">
            ⭐ {Number(rating).toFixed(1)}{" "}
            {typeof reviews === "number" && <span className="muted">({reviews})</span>}
          </span>
        )}
      </div>

      <div className="product-info">
        <h3>{name}</h3>
        <span>${Number(price).toFixed(2)}</span>
      </div>

      {tagline && <p className="product-tagline">{tagline}</p>}

      {tags.length > 0 && (
        <div className="pill-row">
          {tags.slice(0, 3).map((t) => (
            <span key={t} className="pill">{t}</span>
          ))}
        </div>
      )}

      <button className="btn" onClick={onAdd}>
        Add to cart
        <span className={`popper ${pop ? "show" : ""}`}>+1</span>
      </button>
    </div>
  );
}
