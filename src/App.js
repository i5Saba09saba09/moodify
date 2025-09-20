// src/App.js
import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Navigate,
  useParams,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { MOODS } from "./moods";
import CartDrawer from "./components/CartDrawer";
import { CartProvider, useCart } from "./state/CartContext";
import ToastPortal from "./components/ToastPortal";
import Home from "./pages/Home";
import "./App.css";

/* ---------------------------
   Small helpers
--------------------------- */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}
function isTypingInto(el) {
  if (!el) return false;
  const tag = el.tagName?.toLowerCase();
  return (
    tag === "input" ||
    tag === "textarea" ||
    el.isContentEditable ||
    tag === "select"
  );
}

/* ---------------------------
   Route progress (NProgress-lite)
--------------------------- */
function RouteProgress() {
  const location = useLocation();
  const reduced = usePrefersReducedMotion();
  const [p, setP] = useState(0);
  const [show, setShow] = useState(false);
  const timers = useRef([]);

  // clear timers
  function clearTimers() {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
  }

  useEffect(() => {
    clearTimers();
    if (reduced) return; // respect motion prefs

    setShow(true);
    setP(0.08);
    // ramp up a bit while route/suspense resolves
    timers.current.push(setTimeout(() => setP(0.35), 80));
    timers.current.push(setTimeout(() => setP(0.6), 180));
    timers.current.push(setTimeout(() => setP(0.85), 320));
    // finish shortly after
    timers.current.push(
      setTimeout(() => {
        setP(1);
        timers.current.push(
          setTimeout(() => {
            setShow(false);
            setP(0);
          }, 250)
        );
      }, 650)
    );

    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key, reduced]);

  // style lives here so you don't have to touch CSS file
  return (
    <>
      <style>{`
        .route-progress{
          position:fixed; left:0; top:0; right:0; height:2px;
          background: linear-gradient(90deg,#8a2be2,#ff8a5b);
          transform: scaleX(var(--p,0));
          transform-origin:left;
          opacity: var(--o,0);
          transition: transform .2s ease, opacity .3s ease;
          z-index: 200;
        }
      `}</style>
      <div
        className="route-progress"
        style={{
          "--p": p,
          "--o": show ? 1 : 0,
        }}
      />
    </>
  );
}

/* ---------------------------
   Active nav underline slider
--------------------------- */
function NavUnderline({ navRef }) {
  const location = useLocation();

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    function update() {
      const active = nav.querySelector(".nav-link.active");
      const root = nav;
      if (!active) {
        root.style.setProperty("--ux-x", "0px");
        root.style.setProperty("--ux-w", "0px");
        root.style.setProperty("--ux-o", "0");
        return;
      }
      const nr = nav.getBoundingClientRect();
      const r = active.getBoundingClientRect();
      const x = r.left - nr.left;
      const w = r.width;
      root.style.setProperty("--ux-x", `${x}px`);
      root.style.setProperty("--ux-w", `${w}px`);
      root.style.setProperty("--ux-o", "1");
    }

    update();
    const ro = new ResizeObserver(() => update());
    ro.observe(nav);
    window.addEventListener("resize", update);
    const id = setInterval(update, 250); // catch async font/layout shifts

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
      clearInterval(id);
    };
  }, [location.pathname, navRef]);

  return (
    <>
      <style>{`
        .nav-links{ position: relative; }
        .nav-underline{
          position:absolute; left:0; bottom:4px; height:3px;
          border-radius: 999px;
          background: linear-gradient(90deg,#8a2be2,#ff8a5b);
          width: var(--ux-w,0px);
          transform: translateX(var(--ux-x,0px));
          opacity: var(--ux-o,0);
          transition: transform .25s ease, width .25s ease, opacity .25s ease;
          pointer-events:none;
        }
      `}</style>
      <i className="nav-underline" aria-hidden="true" />
    </>
  );
}

/* ---------------------------
   Keyboard shortcuts & net status
--------------------------- */
function GlobalEnhancements() {
  const { toggleCart, closeCart } = useCart();
  const navigate = useNavigate();

  // Online/offline toasts
  useEffect(() => {
    function onOnline() {
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: { message: "Back online ✅", kind: "success" },
        })
      );
    }
    function onOffline() {
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: { message: "You’re offline", kind: "warning" },
        })
      );
    }
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    let gMode = false;
    function help() {
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: {
            message:
              "Shortcuts: c=open cart, g h=home, g i=inspired, g a=angry, g h=happy, g s=sad, Esc=close cart, ?=help",
            kind: "info",
            duration: 3500,
          },
        })
      );
    }
    function onKey(e) {
      const el = document.activeElement;
      if (isTypingInto(el)) return;

      // help
      if (e.key === "?" || (e.key === "/" && e.shiftKey)) {
        e.preventDefault();
        help();
        return;
      }

      // cart
      if (e.key.toLowerCase() === "c") {
        e.preventDefault();
        toggleCart();
        return;
      }
      if (e.key === "Escape") {
        closeCart();
        return;
      }

      // go-to (press 'g' then a letter)
      if (!gMode && e.key.toLowerCase() === "g") {
        gMode = true;
        window.setTimeout(() => (gMode = false), 1200);
        return;
      }
      if (gMode) {
        gMode = false;
        const k = e.key.toLowerCase();
        if (k === "h") {
          navigate("/");
          return;
        }
        const map = {
          i: "inspired",
          a: "angry",
          s: "sad",
          y: "happy", // y = happY :)
          // also allow h to mean happy when g h isn't taken by home
        };
        const slug = map[k] || (k === "h" ? "happy" : null);
        if (slug) navigate(`/${slug}`);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleCart, closeCart, navigate]);

  return null;
}

/* ---------------------------
   Scroll to top & dynamic title
--------------------------- */
function ScrollAndTitle() {
  const location = useLocation();
  const reduced = usePrefersReducedMotion();

  const pageTitle = useMemo(() => {
    if (location.pathname === "/") return "Moodify — Home";
    const slug = location.pathname.slice(1);
    const entry = MOODS.find((m) => m.slug === slug);
    return `Moodify — ${entry?.label ?? "Explore"}`;
  }, [location.pathname]);

  useEffect(() => {
    document.title = pageTitle;
    const behavior = reduced ? "auto" : "smooth";
    // small delay to wait for route layout to paint
    const id = setTimeout(() => {
      try {
        window.scrollTo({ top: 0, left: 0, behavior });
      } catch {
        window.scrollTo(0, 0);
      }
    }, 10);
    return () => clearTimeout(id);
  }, [pageTitle, reduced]);

  return null;
}

/* ---------------------------
   Floating cart button
--------------------------- */
function CartFab() {
  const { count, toggleCart } = useCart();
  return (
    <button className="cart-fab" onClick={toggleCart} aria-label="Open cart">
      🛒 <span className="badge">{count}</span>
    </button>
  );
}

/* ---------------------------
   Universal cart adapter
--------------------------- */
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
          window.dispatchEvent(
            new CustomEvent("toast", {
              detail: { message: `Added “${data.name ?? "Item"}”` },
            })
          );
        }
      } catch {}
    }
    function handleCustom(ev) {
      if (ev?.detail && typeof ev.detail === "object") {
        add(ev.detail);
        window.dispatchEvent(
          new CustomEvent("toast", {
            detail: { message: `Added “${ev.detail.name ?? "Item"}”` },
          })
        );
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

/* ---------------------------
   Route fade wrapper
--------------------------- */
function RouteFade({ children }) {
  const location = useLocation();
  return (
    <main id="main" key={location.pathname} className="route-fade">
      {children}
    </main>
  );
}

/* ---------------------------
   Mood page by slug
--------------------------- */
function MoodRoute() {
  const { slug } = useParams();
  const entry = MOODS.find((m) => m.slug === slug);
  if (!entry) return <Navigate to="/" />;
  const { Component } = entry;
  return (
    <div className={`page mood-shell mood-${slug}-page`}>
      <Component />
    </div>
  );
}

/* ---------------------------
   App (root)
--------------------------- */
export default function App() {
  const first = MOODS[0]?.slug || "inspired";
  const navRef = useRef(null);

  return (
    <CartProvider>
      <BrowserRouter>
        {/* a11y: skip to content */}
        <style>{`
          .skip-nav{
            position:fixed; left:8px; top:-40px; padding:8px 10px;
            background:#111; color:#fff; border:1px solid #333; border-radius:8px;
            z-index:999; transition: top .2s ease;
          }
          .skip-nav:focus{ top:8px; }
        `}</style>
        <a className="skip-nav" href="#main">Skip to content</a>

        {/* Top progress bar */}
        <RouteProgress />

        {/* Header */}
        <header className="site-top">
          <div className="top-inner">
            <NavLink to="/" className="logo">
              <span className="logo-mark">✨</span>
              <span className="logo-text">Moodify</span>
            </NavLink>

            <nav ref={navRef} className="nav-links" aria-label="Primary">
              <NavLink to="/" end className="nav-link">
                Home
              </NavLink>
              {MOODS.map((m) => (
                <NavLink key={m.slug} to={`/${m.slug}`} className="nav-link">
                  <span className="nav-emoji" aria-hidden="true">
                    {m.emoji}
                  </span>
                  <span className="nav-label">{m.label}</span>
                </NavLink>
              ))}
              {/* sliding underline */}
              <NavUnderline navRef={navRef} />
            </nav>
          </div>
        </header>

        {/* Page chrome */}
        <RouteFade>
          <Suspense fallback={<div className="page"><p style={{padding:16}}>Loading…</p></div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/:slug" element={<MoodRoute />} />
              {/* fallback to first mood for unknown */}
              <Route path="*" element={<Navigate to={`/${first}`} />} />
            </Routes>
          </Suspense>
        </RouteFade>

        {/* global enhancers */}
        <ScrollAndTitle />
        <GlobalEnhancements />
        <CartDrawer />
        <CartFab />
        <CartAdapter />
        <ToastPortal />
      </BrowserRouter>
    </CartProvider>
  );
}
