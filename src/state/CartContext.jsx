// src/state/CartContext.jsx
////This CartContext.jsx file implements 
// a comprehensive shopping cart state 
// management system 
// using React's Context API and useReducer hook.
import React, { createContext, useContext, useMemo, useReducer, useEffect } from "react";

const STORAGE_KEY = "moodify_cart_v2";
const CartCtx = createContext(null);

// ---- helpers ----
const idOf = (itemOrId) => {
  const id = typeof itemOrId === "object" ? itemOrId?.id : itemOrId;
  return id == null ? null : String(id); // keep keys consistent
};
const clampQty = (q) => Math.max(1, Math.min(99, Math.floor(Number(q) || 0)));

function reducer(state, action) {
  switch (action.type) {
    case "add": {
      const id = idOf(action.item);
      if (id == null) return state;
      const next = new Map(state.items);
      const row = next.get(id);
      const qty = clampQty((row?.qty || 0) + (action.n || 1));
      next.set(id, { item: action.item, qty });
      return { ...state, items: next };
    }
    case "setQty": {
      const id = idOf(action.id);
      if (id == null) return state;
      const next = new Map(state.items);
      const row = next.get(id);
      if (!row) return state;
      next.set(id, { item: row.item, qty: clampQty(action.qty) });
      return { ...state, items: next };
    }
    case "dec": {
      const id = idOf(action.id);
      if (id == null) return state;
      const next = new Map(state.items);
      const row = next.get(id);
      if (!row) return state;
      if (row.qty <= 1) next.delete(id);
      else next.set(id, { item: row.item, qty: row.qty - 1 });
      return { ...state, items: next };
    }
    case "remove": {
      const id = idOf(action.id);
      if (id == null) return state;
      const next = new Map(state.items);
      next.delete(id);
      return { ...state, items: next };
    }
    case "clear":
      return { ...state, items: new Map() };
    case "open":
      return { ...state, open: true };
    case "close":
      return { ...state, open: false };
    case "toggle":
      return { ...state, open: !state.open };
    default:
      return state;
  }
}

// ---- hydrate (v2, with v1 fallback) ----
function initCartState() {
  try {
    const raw = typeof localStorage !== "undefined" && localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      const arr = Array.isArray(data.items) ? data.items : [];
      const map = new Map(arr.map(([k, v]) => [String(k), { item: v.item, qty: clampQty(v.qty) }]));
      return { items: map, open: false };
    }
    // migrate old key once
    const v1 = typeof localStorage !== "undefined" && localStorage.getItem("moodify_cart_v1");
    if (v1) {
      const data = JSON.parse(v1);
      const arr = Array.isArray(data.items) ? data.items : [];
      const map = new Map(arr.map(([k, v]) => [String(k), { item: v.item, qty: clampQty(v.qty) }]));
      return { items: map, open: false };
    }
  } catch {}
  return { items: new Map(), open: false };
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, initCartState);

  // persist items only
  useEffect(() => {
    try {
      const payload = { items: Array.from(state.items.entries()) };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {}
  }, [state.items]);

  // derived + API
  const value = useMemo(() => {
    const rows = Array.from(state.items.values());
    const count = rows.reduce((s, r) => s + (r?.qty || 0), 0);
    return {
      open: state.open,
      count,
      items: rows,
      add: (item, n = 1) => dispatch({ type: "add", item, n }),
      setQty: (id, qty) => dispatch({ type: "setQty", id, qty }),
      dec: (id) => dispatch({ type: "dec", id }),
      remove: (id) => dispatch({ type: "remove", id }),
      clear: () => dispatch({ type: "clear" }),
      openCart: () => dispatch({ type: "open" }),
      closeCart: () => dispatch({ type: "close" }),
      toggleCart: () => dispatch({ type: "toggle" }),
    };
  }, [state]);

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
