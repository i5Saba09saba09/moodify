// src/components/ToastPortal.jsx
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const DEFAULT_DURATION = 2200; // keep in sync with your CSS
const MAX_TOASTS = 4;

export default function ToastPortal() {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map()); // id -> timeout

  function removeToast(id) {
    const t = timersRef.current.get(id);
    if (t) {
      clearTimeout(t);
      timersRef.current.delete(id);
    }
    setToasts((list) => list.filter((x) => x.id !== id));
  }

  function scheduleRemoval(id, ms) {
    if (ms <= 0) return; // sticky toast
    const handle = setTimeout(() => removeToast(id), ms);
    timersRef.current.set(id, handle);
  }

  useEffect(() => {
    function onToast(e) {
      const d = e?.detail || {};
      const id =
        d.id ??
        (typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : String(Date.now() + Math.random()));

      const now = Date.now();
      const duration =
        typeof d.duration === "number" && Number.isFinite(d.duration)
          ? d.duration
          : DEFAULT_DURATION;

      const next = {
        id,
        message: d.message ?? "Done",
        kind: d.kind ?? "info", // "info" | "success" | "error" | "warning"
        action:
          d.action && typeof d.action.label === "string"
            ? { label: d.action.label, onClick: d.action.onClick }
            : null,
        createdAt: now,
        duration,
      };

      setToasts((list) => {
        let arr = [...list, next];
        if (arr.length > MAX_TOASTS) {
          const evict = arr[0];
          if (evict) removeToast(evict.id);
          arr = arr.slice(-MAX_TOASTS);
        }
        return arr;
      });

      if (duration > 0) scheduleRemoval(id, duration);
    }

    window.addEventListener("toast", onToast);
    return () => {
      window.removeEventListener("toast", onToast);
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current.clear();
    };
  }, []);

  // Pause/resume per-toast on hover
  function handleMouseEnter(id) {
    const t = timersRef.current.get(id);
    if (t) {
      clearTimeout(t);
      timersRef.current.delete(id);
    }
  }
  function handleMouseLeave(id) {
    const toast = toasts.find((t) => t.id === id);
    if (!toast || toast.duration <= 0) return; // sticky
    const elapsed = Date.now() - toast.createdAt;
    const remaining = Math.max(600, toast.duration - elapsed); // minimum buffer
    scheduleRemoval(id, remaining);
  }

  function handleClose(id) {
    removeToast(id);
  }

  function handleAction(toast) {
    try {
      toast.action?.onClick?.();
    } finally {
      removeToast(toast.id);
    }
  }

  // Safe portal target (SSR-friendly)
  const portalTarget = typeof document !== "undefined" ? document.body : null;
  if (!portalTarget) return null;

  return createPortal(
    <div className="toast-wrap" role="status" aria-live="polite" aria-atomic="true">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast ${t.kind}`}
          data-kind={t.kind}
          onMouseEnter={() => handleMouseEnter(t.id)}
          onMouseLeave={() => handleMouseLeave(t.id)}
        >
          <div className="toast-row" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="toast-msg">{t.message}</span>

            {t.action ? (
              <button
                className="toast-action"
                onClick={() => handleAction(t)}
                aria-label={t.action.label}
                style={{ background: "transparent", color: "inherit", border: 0, cursor: "pointer" }}
              >
                {t.action.label}
              </button>
            ) : null}

            <button
              className="toast-close"
              onClick={() => handleClose(t.id)}
              aria-label="Dismiss notification"
              title="Dismiss"
              style={{
                marginLeft: "auto",
                background: "transparent",
                border: 0,
                color: "inherit",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>,
    portalTarget
  );
}
