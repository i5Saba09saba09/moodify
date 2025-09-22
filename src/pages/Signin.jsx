// src/pages/Signin.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Particles from "../components/Particles";
import { useAuth } from "../state/AuthContext";

function validateEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export default function Signin() {
  const navigate = useNavigate();
  const { signIn, loading } = useAuth();

  const [form, setForm] = useState({ email: "", password: "", remember: true });
  const [showPw, setShowPw] = useState(false);
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const errors = useMemo(() => {
    const e = {};
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!validateEmail(form.email.trim())) e.email = "Enter a valid email.";
    if (!form.password) e.password = "Password is required.";
    return e;
  }, [form]);

  const hasErrors = Object.keys(errors).length > 0;

  const liveRef = useRef(null);
  useEffect(() => {
    if (liveRef.current) {
      const count = Object.keys(errors).length;
      liveRef.current.textContent = count === 0 ? "All good" : `${count} issue${count > 1 ? "s" : ""} to fix`;
    }
  }, [errors]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  async function onSubmit(e) {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (hasErrors) return;
    setSubmitting(true);
    try {
      await signIn({ email: form.email, password: form.password });
      // "remember" could persist longer; with the local fake auth we’re already using localStorage.
      navigate("/");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page pretty">
      <header className="mood-hero inspired">
        <Particles variant="inspired" count={22} />
        <div className="inner">
          <h1>🔐 Sign in</h1>
          <p>Welcome back! Pick up where you left off.</p>
        </div>
      </header>

      <section className="section-wide">
        <div className="auth-grid">
          <form className="panel form-panel" onSubmit={onSubmit} noValidate>
            <h2 className="panel-title">Sign in</h2>

            <label className="field">
              <span>Email</span>
              <input
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                aria-invalid={!!(touched.email && errors.email)}
                aria-describedby="err-email"
                placeholder="you@example.com"
              />
              {touched.email && errors.email && (
                <small className="field-error" id="err-email">{errors.email}</small>
              )}
            </label>

            <label className="field" style={{ marginTop: 8 }}>
              <span>Password</span>
              <div className="pw-wrap">
                <input
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                  aria-invalid={!!(touched.password && errors.password)}
                  aria-describedby="err-password"
                  placeholder="••••••••"
                />
                <button
                  className="pw-toggle"
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? "🙈" : "👁️"}
                </button>
              </div>
              {touched.password && errors.password && (
                <small className="field-error" id="err-password">{errors.password}</small>
              )}
            </label>

            <div className="signin-row">
              <label className="agree-row" style={{ margin: 0 }}>
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={(e) => set("remember", e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <a href="#" onClick={(e) => e.preventDefault()} className="link-subtle">Forgot password?</a>
            </div>

            <button className="btn primary" disabled={submitting || loading} style={{ marginTop: 12 }}>
              {submitting || loading ? "Signing in…" : "Sign in"}
            </button>

            <button
              type="button"
              className="btn ghost"
              style={{ marginTop: 8 }}
              onClick={() =>
                window.dispatchEvent(new CustomEvent("toast", { detail: { message: "Google OAuth coming soon" } }))
              }
            >
              Continue with Google
            </button>

            <p className="small-note" style={{ marginTop: 10 }}>
              New here? <Link to="/signup">Create an account</Link>
            </p>

            {/* a11y live region */}
            <span
              ref={liveRef}
              aria-live="polite"
              style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}
            />
          </form>

          <aside className="panel perks">
            <h2 className="panel-title">Pro tips</h2>
            <ul className="perk-list">
              <li>⚡ Cart & prefs sync across tabs</li>
              <li>📬 Get notified on new drops</li>
              <li>🎯 Better picks from your history</li>
            </ul>
            <div className="note">Don’t have an account? <Link to="/signup">Sign up</Link></div>
          </aside>
        </div>
      </section>
    </div>
  );
}
