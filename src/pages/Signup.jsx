// src/pages/Signup.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Particles from "../components/Particles";
import { useAuth } from "../state/AuthContext";

function validateEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export default function Signup() {
  const navigate = useNavigate();
  const { signUp, loading } = useAuth();

  const [form, setForm] = useState({ first: "", last: "", email: "", password: "", confirm: "", agree: false });
  const [showPw, setShowPw] = useState(false);
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const errors = useMemo(() => {
    const e = {};
    if (!form.first.trim()) e.first = "First name is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!validateEmail(form.email.trim())) e.email = "Enter a valid email.";
    if (!form.password) e.password = "Password is required.";
    else if (form.password.length < 6) e.password = "At least 6 characters.";
    if (form.confirm !== form.password) e.confirm = "Passwords do not match.";
    if (!form.agree) e.agree = "Please accept the Terms.";
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
    setTouched({ first: true, last: true, email: true, password: true, confirm: true, agree: true });
    if (hasErrors) return;
    setSubmitting(true);
    try {
      await signUp({ first: form.first, last: form.last, email: form.email, password: form.password });
      navigate("/");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page pretty">
      <header className="mood-hero happy">
        <Particles variant="happy" count={24} />
        <div className="inner">
          <h1>🧁 Create your account</h1>
          <p>Save your cart, track exercises, and get personalized picks.</p>
        </div>
      </header>

      <section className="section-wide">
        <div className="auth-grid">
          <form className="panel form-panel" onSubmit={onSubmit} noValidate>
            <h2 className="panel-title">Sign up</h2>

            <div className="fields">
              <label className="field">
                <span>First name</span>
                <input
                  type="text"
                  autoComplete="given-name"
                  value={form.first}
                  onChange={(e) => set("first", e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, first: true }))}
                  aria-invalid={!!(touched.first && errors.first)}
                  aria-describedby="err-first"
                  placeholder="Taylor"
                />
                {touched.first && errors.first && <small className="field-error" id="err-first">{errors.first}</small>}
              </label>

              <label className="field">
                <span>Last name (optional)</span>
                <input
                  type="text"
                  autoComplete="family-name"
                  value={form.last}
                  onChange={(e) => set("last", e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, last: true }))}
                  placeholder="Swift"
                />
              </label>
            </div>

            <label className="field" style={{ display: "block", marginTop: 8 }}>
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
              {touched.email && errors.email && <small className="field-error" id="err-email">{errors.email}</small>}
            </label>

            <div className="fields" style={{ marginTop: 8 }}>
              <label className="field">
                <span>Password</span>
                <div className="pw-wrap">
                  <input
                    type={showPw ? "text" : "password"}
                    autoComplete="new-password"
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

              <label className="field">
                <span>Confirm password</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={form.confirm}
                  onChange={(e) => set("confirm", e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
                  aria-invalid={!!(touched.confirm && errors.confirm)}
                  aria-describedby="err-confirm"
                  placeholder="••••••••"
                />
                {touched.confirm && errors.confirm && (
                  <small className="field-error" id="err-confirm">{errors.confirm}</small>
                )}
              </label>
            </div>

            <label className="agree-row">
              <input
                type="checkbox"
                checked={form.agree}
                onChange={(e) => set("agree", e.target.checked)}
                onBlur={() => setTouched((t) => ({ ...t, agree: true }))}
                aria-invalid={!!(touched.agree && errors.agree)}
                aria-describedby="err-agree"
              />
              <span>
                I agree to the <a href="#" onClick={(e) => e.preventDefault()}>Terms</a> and{" "}
                <a href="#" onClick={(e) => e.preventDefault()}>Privacy</a>.
              </span>
            </label>
            {touched.agree && errors.agree && (
              <small className="field-error" id="err-agree" style={{ marginTop: 6 }}>{errors.agree}</small>
            )}

            <button className="btn primary" disabled={submitting || loading} style={{ marginTop: 12 }}>
              {submitting || loading ? "Creating…" : "Create account"}
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

            {/* a11y live region */}
            <span
              ref={liveRef}
              aria-live="polite"
              style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}
            />
          </form>

          <aside className="panel perks">
            <h2 className="panel-title">Why join?</h2>
            <ul className="perk-list">
              <li>🛒 Save and sync your cart</li>
              <li>⏱️ Track exercise streaks</li>
              <li>✨ Personalized mood picks</li>
              <li>🔔 Early access to drops</li>
            </ul>
            <div className="note">Already have an account? <a href="/signin">Log in</a></div>
          </aside>
        </div>
      </section>
    </div>
  );
}
