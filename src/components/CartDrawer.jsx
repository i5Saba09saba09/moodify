// src/components/CartDrawer.jsx
import React, { useEffect, useRef } from "react";
import { useCart } from "../state/CartContext";

export default function CartDrawer() {
  const { open, items = [], count, add, dec, remove, clear, closeCart } = useCart();
  const total = items.reduce((s, { item, qty }) => s + (Number(item.price) || 0) * qty, 0);

  const drawerRef = useRef(null);
  const firstFocusRef = useRef(null);
  const lastActiveRef = useRef(null);

  // Manage focus in/out + lock page scroll
  useEffect(() => {
    if (open) {
      lastActiveRef.current = document.activeElement;
      // lock scroll
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      // focus the close button
      setTimeout(() => firstFocusRef.current?.focus(), 0);
      return () => {
        document.body.style.overflow = prev;
      };
    } else {
      // return focus to last active trigger
      lastActiveRef.current?.focus?.();
    }
  }, [open]);

  // ESC to close + focus trap (TAB cycling)
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeCart();
        return;
      }
      if (e.key !== "Tab") return;

      const root = drawerRef.current;
      if (!root) return;

      const focusables = root.querySelectorAll(
        [
          'a[href]',
          'area[href]',
          'button:not([disabled])',
          'input:not([disabled])',
          'select:not([disabled])',
          'textarea:not([disabled])',
          '[tabindex]:not([tabindex="-1"])',
        ].join(',')
      );
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, closeCart]);

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
            <div className="cart-empty">
              Your cart is empty.
              {/* simple hint, click backdrop or button to close */}
            </div>
          ) : (
            items.map(({ item, qty }) => (
              <div key={item.id} className="cart-row" role="listitem" aria-label={item.name}>
                {item.image ? (
                  <img src={item.image} alt={item.name} loading="lazy" />
                ) : (
                  <div
                    aria-hidden="true"
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 10,
                      background: "#eee",
                    }}
                  />
                )}

                <div className="cart-info">
                  <div className="cart-name">{item.name}</div>
                  <div className="cart-meta">
                    <span>${Number(item.price).toFixed(2)}</span>
                  </div>

                  <div className="qty" aria-label={`Quantity controls for ${item.name}`}>
                    <button
                      onClick={() => dec(item.id)}
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      −
                    </button>
                    <span aria-live="polite">{qty}</span>
                    <button
                      onClick={() => add(item)}
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      +
                    </button>
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
            ))
          )}
        </div>

        <div className="cart-foot">
          <div className="cart-total" aria-live="polite">
            <span>Total</span>
            <strong>${total.toFixed(2)}</strong>
          </div>
          <div className="cart-actions">
            <button className="btn ghost" onClick={clear} disabled={items.length === 0}>
              Clear
            </button>
            <button className="btn primary" disabled={items.length === 0}>
              Checkout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
