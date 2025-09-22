// src/pages/Checkout.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../state/CartContext";

const TAX_RATE = 0.07;        // tweak if you want
const FREE_SHIP_MIN = 50;     // free shipping threshold
const SHIP_FLAT = 5;

export default function Checkout() {
  const navigate = useNavigate();
  const { items, clear } = useCart();

  // ---- Order math
  const lines = useMemo(
    () =>
      items.map(({ item, qty }) => ({
        id: item.id,
        name: item.name,
        price: Number(item.price || 0),
        image: item.image,
        qty,
        line: Number(item.price || 0) * qty,
      })),
    [items]
  );
  const [promo, setPromo] = useState("");
  const subtotal = lines.reduce((s, l) => s + l.line, 0);
  const discount = promo.trim().toUpperCase() === "MOOD10" ? subtotal * 0.1 : 0;
  const shipBase = subtotal - discount >= FREE_SHIP_MIN || subtotal === 0 ? 0 : SHIP_FLAT;
  const tax = (subtotal - discount + shipBase) * TAX_RATE;
  const total = Math.max(0, subtotal - discount + shipBase + tax);

  // ---- Form state (super lightweight)
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    region: "",
    zip: "",
    card: "",
    exp: "",
    cvc: "",
  });
  const [submitting, setSubmitting] = useState(false);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function valid() {
    if (!form.name || !form.email || !form.address || !form.city || !form.zip) return false;
    if (!form.card || form.card.replace(/\s+/g, "").length < 12) return false;
    if (!form.exp || !form.cvc) return false;
    return total > 0; // nothing to pay when cart is empty
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!valid()) {
      window.dispatchEvent(
        new CustomEvent("toast", { detail: { message: "Please complete required fields", kind: "warning" } })
      );
      return;
    }
    setSubmitting(true);

    // fake “processing”
    await new Promise((r) => setTimeout(r, 900));

    const orderId = `MOOD-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Date.now()
      .toString()
      .slice(-4)}`;

    // navigate with payload, then clear cart
    navigate("/success", {
      state: {
        orderId,
        total: Number(total.toFixed(2)),
        promo: promo.trim().toUpperCase() || null,
        lines,
      },
      replace: true,
    });

    clear();
    window.dispatchEvent(new CustomEvent("toast", { detail: { message: "Order placed! 🎉", kind: "success" } }));
  }

  return (
    <div className="page pretty checkout-page">
      <header className="mood-hero inspired">
        <div className="inner">
          <h1>🧾 Checkout</h1>
          <p>Secure your goodies & keep your vibe rolling.</p>
        </div>
      </header>

      <section className="section-wide">
        <div className="checkout-grid">
          {/* --- Left: form --- */}
          <form className="panel form-panel" onSubmit={onSubmit} noValidate>
            <h2 className="panel-title">Contact & Shipping</h2>

            <div className="fields">
              <label className="field">
                <span>Name</span>
                <input name="name" value={form.name} onChange={onChange} required />
              </label>
              <label className="field">
                <span>Email</span>
                <input name="email" type="email" value={form.email} onChange={onChange} required />
              </label>
            </div>

            <label className="field">
              <span>Address</span>
              <input name="address" value={form.address} onChange={onChange} required />
            </label>

            <div className="fields three">
              <label className="field">
                <span>City</span>
                <input name="city" value={form.city} onChange={onChange} required />
              </label>
              <label className="field">
                <span>State/Region</span>
                <input name="region" value={form.region} onChange={onChange} />
              </label>
              <label className="field">
                <span>ZIP</span>
                <input name="zip" value={form.zip} onChange={onChange} required />
              </label>
            </div>

            <h2 className="panel-title" style={{ marginTop: 18 }}>Payment</h2>
            <div className="fields">
              <label className="field">
                <span>Card number</span>
                <input
                  name="card"
                  inputMode="numeric"
                  placeholder="4242 4242 4242 4242"
                  value={form.card}
                  onChange={onChange}
                  required
                />
              </label>
            </div>
            <div className="fields">
              <label className="field">
                <span>Expiry</span>
                <input name="exp" placeholder="MM/YY" value={form.exp} onChange={onChange} required />
              </label>
              <label className="field">
                <span>CVC</span>
                <input name="cvc" inputMode="numeric" placeholder="123" value={form.cvc} onChange={onChange} required />
              </label>
            </div>

            <button className="btn primary pay-btn" type="submit" disabled={submitting || total <= 0}>
              {submitting ? "Processing…" : `Pay $${total.toFixed(2)}`}
            </button>
          </form>

          {/* --- Right: order summary --- */}
          <aside className="panel summary-panel">
            <h2 className="panel-title">Order summary</h2>

            {lines.length === 0 ? (
              <div className="cart-empty" style={{ padding: 16 }}>Your cart is empty.</div>
            ) : (
              <ul className="summary-list">
                {lines.map((l) => (
                  <li key={l.id} className="summary-row">
                    <img src={l.image} alt="" />
                    <div className="sr-line">${l.line.toFixed(2)}</div>
                  </li>
                ))}
              </ul>
            )}

            <div className="promo">
              <input
                className="promo-input"
                placeholder='Promo code (try: MOOD10)'
                value={promo}
                onChange={(e) => setPromo(e.target.value)}
              />
              <button
                type="button"
                className="promo-apply"
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent("toast", {
                      detail: { message: promo.trim().toUpperCase() === "MOOD10" ? "10% applied" : "No discount", kind: "info" },
                    })
                  )
                }
              >
                Apply
              </button>
            </div>

            <div className="totals">
              <div className="row"><span>Subtotal</span><strong>${subtotal.toFixed(2)}</strong></div>
              <div className="row"><span>Discount</span><strong>−${discount.toFixed(2)}</strong></div>
              <div className="row"><span>Shipping</span><strong>${shipBase.toFixed(2)}</strong></div>
              <div className="row"><span>Tax</span><strong>${tax.toFixed(2)}</strong></div>
              <div className="row grand"><span>Total</span><strong>${total.toFixed(2)}</strong></div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
