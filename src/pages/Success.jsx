// src/pages/Success.jsx
import React from "react";
import { useLocation, NavLink } from "react-router-dom";

export default function Success() {
  const { state } = useLocation() || {};
  const orderId = state?.orderId || "MOOD-XXXX";
  const amt = typeof state?.total === "number" ? state.total.toFixed(2) : null;

  return (
    <div className="page pretty">
      <header className="mood-hero happy">
        <div className="inner">
          <h1>🎉 Thank you!</h1>
          <p>Your order is confirmed.</p>
        </div>
      </header>

      <section className="section-wide">
        <div className="panel" style={{ maxWidth: 760 }}>
          <h2 className="panel-title">Receipt</h2>
          <p><strong>Order:</strong> {orderId}</p>
          {amt && <p><strong>Total paid:</strong> ${amt}</p>}
          <div style={{ marginTop: 16 }}>
            <NavLink to="/" className="btn">Back to Home</NavLink>
          </div>
        </div>
      </section>
    </div>
  );
}
