// src/state/CartContext.jsx
////This CartContext.jsx file implements 
// a comprehensive shopping cart state 
// management system 
// using React's Context API and useReducer hook.
import React, { createContext, useContext, useMemo, useReducer, useEffect } from "react";

const CartCtx = createContext(null);

// ---------- Reducer ----------
function reducer(state, action) {
  switch (action.type) {
    case "add": {
      const next = new Map(state.items);
      const id = action.item?.id;
      if (id == null) return state; // guard
      const existing = next.get(id);
      const qty = existing ? existing.qty + 1 : 1;
      next.set(id, { item: action.item, qty });
      return { ...state, items: next };
    }
    case "dec": {
      const next = new Map(state.items);
      const it = next.get(action.id);
      if (!it) return state;
      if (it.qty <= 1) next.delete(action.id);
      else next.set(action.id, { item: it.item, qty: it.qty - 1 });
      return { ...state, items: next };
    }
    case "remove": {
      const next = new Map(state.items);
      next.delete(action.id);
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

// ---------- Lazy init (hydrate from localStorage) ----------
function initCartState() {
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem("moodify_cart_v1") : null;
    if (raw) {
      const obj = JSON.parse(raw);
      const entries = Array.isArray(obj.items) ? obj.items : [];
      const map = new Map(
        entries.map((pair) => {
          // pair = [id, { item, qty }]
          const idNum = Number(pair[0]); // handle string keys
          return [Number.isNaN(idNum) ? pair[0] : idNum, pair[1]];
        })
      );
      return { items: map, open: false };
    }
  } catch {
    // ignore parse/read errors
  }
  return { items: new Map(), open: false };
}

// ---------- Provider ----------
export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, initCartState);

  // persist to localStorage when items change
  useEffect(() => {
    try {
      const payload = { items: Array.from(state.items.entries()) };
      localStorage.setItem("moodify_cart_v1", JSON.stringify(payload));
    } catch {
      // ignore write errors (private mode / quota)
    }
  }, [state.items]);

  const api = useMemo(() => {
    const count = Array.from(state.items.values()).reduce((s, v) => s + (v?.qty || 0), 0);
    return {
      open: state.open,
      count,
      items: Array.from(state.items.values()),
      add: (item) => dispatch({ type: "add", item }),
      dec: (id) => dispatch({ type: "dec", id }),
      remove: (id) => dispatch({ type: "remove", id }),
      clear: () => dispatch({ type: "clear" }),
      openCart: () => dispatch({ type: "open" }),
      closeCart: () => dispatch({ type: "close" }),
      toggleCart: () => dispatch({ type: "toggle" }),
    };
  }, [state]);

  return <CartCtx.Provider value={api}>{children}</CartCtx.Provider>;
}

// ---------- Hook ----------
export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
