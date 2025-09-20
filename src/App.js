// src/App.js
import React, { Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, NavLink, Navigate, useParams, useLocation } from "react-router-dom";
import { MOODS } from "./moods";
import CartDrawer from "./components/CartDrawer";
import { CartProvider, useCart } from "./state/CartContext";
import ToastPortal from "./components/ToastPortal"; // ✅ toasts
import "./App.css";

/* Floating cart button */
function CartFab() {
  const { count, toggleCart } = useCart();
  return (
    <button className="cart-fab" onClick={toggleCart} aria-label="Open cart">
      🛒 <span className="badge">{count}</span>
    </button>
  );
}

/* Universal cart adapter for teammates not using the hook */
function CartAdapter() {
  const { add } = useCart();
  useEffect(() => {
    function handleClick(e) {
      const btn = e.target.closest("[data-add-to-cart]");
      if (!btn) return;
      try {
        const data = JSON.parse(btn.getAttribute("data-add-to-cart"));
        if (data && typeof data === "object") {
          add(data);
          window.dispatchEvent(new CustomEvent("toast", { detail: { message: `Added “${data.name ?? "Item"}”` } }));
        }
      } catch {}
    }
    function handleCustom(ev) {
      if (ev?.detail && typeof ev.detail === "object") {
        add(ev.detail);
        window.dispatchEvent(new CustomEvent("toast", { detail: { message: `Added “${ev.detail.name ?? "Item"}”` } }));
      }
    }
    document.addEventListener("click", handleClick);
    window.addEventListener("add-to-cart", handleCustom);
    return () => {
      document.removeEventListener("click", handleClick);
      window.removeEventListener("add-to-cart", handleCustom);
    };
  }, [add]);
  return null;
}

/* Route fade wrapper */
function RouteFade({ children }) {
  const location = useLocation();
  return (
    <main key={location.pathname} className="route-fade">
      {children}
    </main>
  );
}

/* Mood page by slug (keeps team plug-in flow) */
function MoodRoute() {
  const { slug } = useParams();
  const entry = MOODS.find(m => m.slug === slug);
  if (!entry) return <Navigate to={`/${MOODS[0].slug}`} replace />;
  const { Component } = entry;
  return (
    <div className={`page mood-shell mood-${slug}-page`}>
      <Component />
    </div>
  );
}

export default function App() {
  const first = MOODS[0]?.slug || "inspired";

  return (
    <CartProvider>
      <BrowserRouter>
        <header className="site-top">
          <NavLink to={`/${first}`} className="logo">Moodify</NavLink>
          <nav className="nav-links">
            {MOODS.map(m => (
              <NavLink key={m.slug} to={`/${m.slug}`}>
                {m.emoji ? `${m.emoji} ` : ""}{m.label}
              </NavLink>
            ))}
          </nav>
        </header>

        <RouteFade>
          <Suspense fallback={<div className="page"><p>Loading mood…</p></div>}>
            <Routes>
              <Route path="/" element={<Navigate to={`/${first}`} replace />} />
              <Route path="/:slug" element={<MoodRoute />} />
            </Routes>
          </Suspense>
        </RouteFade>

        <CartDrawer />
        <CartFab />
        <CartAdapter />
        <ToastPortal />
      </BrowserRouter>
    </CartProvider>
  );
}
<ToastPortal />
