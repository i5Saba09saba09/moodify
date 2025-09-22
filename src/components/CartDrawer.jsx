// src/components/CartDrawer.jsx
import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../state/CartContext";

export default function CartDrawer() {
  const navigate = useNavigate();
  const { open, items = [], count, add, dec, remove, clear, closeCart } = useCart();

  // grand total (no calc text shown in UI)
  const total = items.reduce((s, { item, qty }) => s + (Number(item.price) || 0) * qty, 0);

  const drawerRef = useRef(null);
  const firstFocusRef = useRef(null);
  const lastActiveRef = useRef(null);

  // focus + lock scroll
  useEffect(() => {
    if (open) {
      lastActiveRef.current = document.activeElement;
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      setTimeout(() => firstFocusRef.current?.focus(), 0);
      return () => { document.body.style.overflow = prev; };
    } else {
      lastActiveRef.current?.focus?.();
    }
  }, [open]);

  // ESC + basic focus trap
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") { e.preventDefault(); closeCart(); return; }
      if (e.key !== "Tab") return;
      const root = drawerRef.current;
      if (!root) return;
      const focusables = root.querySelectorAll([
        'a[href]','area[href]','button:not([disabled])','input:not([disabled])',
        'select:not([disabled])','textarea:not([disabled])','[tabindex]:not([tabindex="-1"])'
      ].join(","));
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, closeCart]);

  function goCheckout() {
    if (items.length === 0) return;
    closeCart();
    setTimeout(() => navigate("/checkout"), 120);
  }

  return (
    <>
      <div
        className={`cart-backdrop ${open ? "show" : ""}`}
        onClick={closeCart}
        aria-hidden="true"
      />
      <aside
        ref={drawerRef}
        className={`cart-drawer ${open ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        aria-hidden={!open}
      >
        <div className="cart-head">
          <h3 id="cart-title">Cart ({count})</h3>
          <button
            ref={firstFocusRef}
            className="icon-btn"
            onClick={closeCart}
            aria-label="Close cart"
          >
            ✕
          </button>
        </div>

        <div className="cart-list" role="list">
          {items.length === 0 ? (
            <div className="cart-empty">Your cart is empty.</div>
          ) : (
            items.map(({ item, qty }) => {
              const unit = Number(item.price) || 0;
              const lineTotal = unit * qty; // compute silently, only show the result
              return (
                <div key={item.id} className="cart-row" role="listitem" aria-label={item.name}>
                  {item.image ? (
                    <img src={item.image} alt={item.name} loading="lazy" />
                  ) : (
                    <div aria-hidden="true" style={{ width: 72, height: 72, borderRadius: 10, background: "#eee" }} />
                  )}

                  <div className="cart-info">
                    <div className="cart-name">{item.name}</div>

                    {/* Show only the line total for this item (no unit price or “× qty”) */}
                    <div className="cart-meta" aria-label="Line total">
                      <strong>${lineTotal.toFixed(2)}</strong>
                    </div>

                    <div className="qty" aria-label={`Quantity controls for ${item.name}`}>
                      <button onClick={() => dec(item.id)} aria-label={`Decrease quantity of ${item.name}`}>−</button>
                      <span aria-live="polite">{qty}</span>
                      <button onClick={() => add(item)} aria-label={`Increase quantity of ${item.name}`}>+</button>
                    </div>
                  </div>

                  <button
                    className="remove"
                    onClick={() => remove(item.id)}
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    Remove
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="cart-foot">
          <div className="cart-total" aria-live="polite">
            <span>Total</span>
            <strong>${total.toFixed(2)}</strong>
          </div>
          <div className="cart-actions">
            <button className="btn ghost" onClick={clear} disabled={items.length === 0}>Clear</button>
            <button className="btn primary" onClick={goCheckout} disabled={items.length === 0}>Checkout</button>
          </div>
        </div>
      </aside>
    </>
  );
}
