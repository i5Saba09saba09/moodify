import React, { createContext, useContext, useMemo, useReducer } from "react";

const CartCtx = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case "add": {
      const next = new Map(state.items);
      const id = action.item.id;
      next.set(id, { item: action.item, qty: (next.get(id)?.qty || 0) + 1 });
      return { ...state, items: next };
    }
    case "dec": {
      const next = new Map(state.items);
      const it = next.get(action.id);
      if (!it) return state;
      if (it.qty <= 1) next.delete(action.id);
      else next.set(action.id, { ...it, qty: it.qty - 1 });
      return { ...state, items: next };
    }
    case "remove": {
      const next = new Map(state.items);
      next.delete(action.id);
      return { ...state, items: next };
    }
    case "clear": return { ...state, items: new Map() };
    case "open":  return { ...state, open: true };
    case "close": return { ...state, open: false };
    case "toggle": return { ...state, open: !state.open };
    default: return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, { items: new Map(), open: false });

  const api = useMemo(() => ({
    open: state.open,
    count: Array.from(state.items.values()).reduce((s, v) => s + v.qty, 0),
    items: Array.from(state.items.values()),
    add: (item) => dispatch({ type: "add", item }),
    dec: (id) => dispatch({ type: "dec", id }),
    remove: (id) => dispatch({ type: "remove", id }),
    clear: () => dispatch({ type: "clear" }),
    openCart: () => dispatch({ type: "open" }),
    closeCart: () => dispatch({ type: "close" }),
    toggleCart: () => dispatch({ type: "toggle" }),
  }), [state]);

  return <CartCtx.Provider value={api}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
