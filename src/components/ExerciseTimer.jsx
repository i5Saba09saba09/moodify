// src/components/ExerciseTimer.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

export default function ExerciseTimer({
  id,
  emoji,
  title,
  desc,
  mins = 5,
  accent = "inspired",
  onComplete, // optional callback when timer hits 0
}) {
  const total = Math.max(1, Math.round(Number(mins) * 60)); // seconds
  const [left, setLeft] = useState(total);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  // internal refs
  const timerRef = useRef(null);      // current timeout id
  const endAtRef = useRef(null);      // epoch ms when timer should end
  const startedOnceRef = useRef(false);

  // time parts
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  const pct = useMemo(() => (total - left) / total, [left, total]);
  const deg = Math.round(Math.min(1, Math.max(0, pct)) * 360);

  // reset when mins changes (e.g., prop updates)
  useEffect(() => {
    clearTimeout(timerRef.current);
    endAtRef.current = null;
    setRunning(false);
    setDone(false);
    setLeft(total);
    // cleanup on unmount
    return () => clearTimeout(timerRef.current);
  }, [total]);

  // drift-free tick using end timestamp
  function scheduleTick() {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const now = Date.now();
      const endAt = endAtRef.current ?? now;
      const secondsLeft = Math.max(0, Math.ceil((endAt - now) / 1000));
      setLeft(secondsLeft);

      if (secondsLeft <= 0) {
        setRunning(false);
        setDone(true);
        endAtRef.current = null;

        // small “ding” (after some user interaction likely happened)
        try {
          const Ctx = window.AudioContext || window.webkitAudioContext;
          const ctx = new Ctx();
          if (ctx.state === "suspended") ctx.resume?.();
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = "sine";
          o.frequency.value = 880;
          o.connect(g);
          g.connect(ctx.destination);
          g.gain.setValueAtTime(0.22, ctx.currentTime);
          g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1);
          o.start();
          o.stop(ctx.currentTime + 1);
          setTimeout(() => ctx.close?.(), 1200);
        } catch { /* ignore audio errors */ }

        // haptic tap (supported devices only)
        try { navigator.vibrate?.(150); } catch {}

        onComplete?.();
        return;
      }

      // schedule next check; 250ms keeps UI snappy without heavy work
      scheduleTick();
    }, 250);
  }

  function start() {
    startedOnceRef.current = true;
    setDone(false);
    // if finished, reset remaining to full total before starting
    setLeft((s) => (s === 0 ? total : s));
    setRunning(true);

    // establish or re-establish end time based on *current* left
    endAtRef.current = Date.now() + (left === 0 ? total : left) * 1000;
    scheduleTick();
  }

  function pause() {
    setRunning(false);
    clearTimeout(timerRef.current);
    // keep current left; recompute endAt when starting again
    endAtRef.current = null;
  }

  function reset() {
    setRunning(false);
    setDone(false);
    clearTimeout(timerRef.current);
    endAtRef.current = null;
    setLeft(total);
  }

  return (
    <div
      className={`exercise-card timer ${accent === "angry" ? "angryX" : "inspiredX"} ${done ? "celebrate" : ""}`}
      id={id}
    >
      <div className="ex-top">
        <span className="ex-emoji" aria-hidden="true">{emoji}</span>
        <span className="ex-mins">{Math.ceil(left / 60)}m</span>
      </div>

      <div
        className={`timer-ring ${accent}`}
        style={{ background: `conic-gradient(var(--ring-accent) ${deg}deg, var(--ring-track) 0)` }}
        role="progressbar"
        aria-label={`${title} progress`}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={total - left}
      >
        <div className="timer-core">
          {/* role="timer" is often noisy for SRs; we keep it readable without constant announcements */}
          <div className="timer-time" aria-live="polite">
            {mm}:{ss}
          </div>
          <div className="timer-label">{title}</div>
        </div>
      </div>

      <p className="timer-desc">{desc}</p>

      <div className="timer-controls">
        {!running ? (
          <button className="ex-btn" onClick={start}>
            {left === total || left === 0 ? "Start" : "Resume"}
          </button>
        ) : (
          <button className="ex-btn ghost" onClick={pause}>Pause</button>
        )}
        <button className="ex-btn subtle" onClick={reset} disabled={!startedOnceRef.current && left === total}>
          Reset
        </button>
      </div>
    </div>
  );
}
