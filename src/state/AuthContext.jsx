// src/state/AuthContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getCurrentUser, signInLocal, signUpLocal, signOutLocal } from "./authLocal";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // initialize from localStorage via authLocal helper
  const [user, setUser] = useState(() => getCurrentUser());
  const [loading, setLoading] = useState(false);

  // keep in sync across tabs (storage event)
  useEffect(() => {
    function onStorage() {
      setUser(getCurrentUser());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // allow same-tab listeners to update when auth changes
  useEffect(() => {
    function onAuthTick() {
      setUser(getCurrentUser());
    }
    window.addEventListener("moodify:auth", onAuthTick);
    return () => window.removeEventListener("moodify:auth", onAuthTick);
  }, []);

  const signIn = async ({ email, password }) => {
    setLoading(true);
    try {
      const u = await signInLocal({ email, password });
      setUser(u);
      window.dispatchEvent(new CustomEvent("toast", { detail: { message: `Welcome back, ${u.first || "friend"}!` } }));
      window.dispatchEvent(new Event("moodify:auth"));
      return u;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async ({ first, last, email, password }) => {
    setLoading(true);
    try {
      const u = await signUpLocal({ first, last, email, password });
      setUser(u);
      window.dispatchEvent(new CustomEvent("toast", { detail: { message: `Welcome, ${u.first || "friend"}!` } }));
      window.dispatchEvent(new Event("moodify:auth"));
      return u;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await signOutLocal();
    setUser(null);
    window.dispatchEvent(new CustomEvent("toast", { detail: { message: "Signed out" } }));
    window.dispatchEvent(new Event("moodify:auth"));
  };

  const value = useMemo(() => ({ user, loading, signIn, signUp, signOut }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
