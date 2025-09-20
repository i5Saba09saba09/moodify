import React from "react";
import { useCart } from "../state/CartContext";

export default function CartDrawer() {
  const { open, items, count, add, dec, remove, clear, closeCart } = useCart();
  const total = items.reduce((s, { item, qty }) => s + item.price * qty, 0);

  return (
    <>
      <div className={`cart-backdrop ${open ? "show" : ""}`} onClick={closeCart} />
      <aside className={`cart-drawer ${open ? "open" : ""}`} aria-hidden={!open}>
        <div className="cart-head">
          <h3>Cart ({count})</h3>
          <button className="icon-btn" onClick={closeCart}>✕</button>
        </div>
        <div className="cart-list">
          {items.length === 0 ? (
            <div className="cart-empty">Your cart is empty.</div>
          ) : items.map(({ item, qty }) => (
            <div key={item.id} className="cart-row">
              <img src={item.image} alt={item.name} />
              <div className="cart-info">
                <div className="cart-name">{item.name}</div>
                <div className="cart-meta">
                  <span>${item.price.toFixed(2)}</span>
                </div>
                <div className="qty">
                  <button onClick={() => dec(item.id)}>-</button>
                  <span>{qty}</span>
                  <button onClick={() => add(item)}>+</button>
                </div>
              </div>
              <button className="remove" onClick={() => remove(item.id)}>Remove</button>
            </div>
          ))}
        </div>
        <div className="cart-foot">
          <div className="cart-total"><span>Total</span><strong>${total.toFixed(2)}</strong></div>
          <div className="cart-actions">
            <button className="btn ghost" onClick={clear}>Clear</button>
            <button className="btn primary">Checkout</button>
          </div>
        </div>
      </aside>
    </>
  );
}
