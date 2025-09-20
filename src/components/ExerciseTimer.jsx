import React, { useEffect, useMemo, useRef, useState } from "react";

export default function ExerciseTimer({ id, emoji, title, desc, mins = 5, accent = "inspired" }) {
  const total = Math.max(1, Math.round(mins * 60));
  const [left, setLeft] = useState(total);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const tickRef = useRef(null);

  const mm = Math.floor(left / 60).toString().padStart(2, "0");
  const ss = (left % 60).toString().padStart(2, "0");
  const pct = useMemo(() => (total - left) / total, [left, total]);
  const deg = Math.round(pct * 360);

  useEffect(() => {
    if (!running) return;
    tickRef.current = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          clearInterval(tickRef.current);
          setRunning(false);
          setDone(true);
          // little “ding” with Web Audio — no assets needed
          try {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            const ctx = new Ctx();
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = "sine"; o.frequency.value = 880;
            o.connect(g); g.connect(ctx.destination);
            g.gain.setValueAtTime(0.2, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1);
            o.start(); o.stop(ctx.currentTime + 1);
          } catch {}
          if (navigator.vibrate) navigator.vibrate(150);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(tickRef.current);
  }, [running]);

  function start() { setDone(false); if (left === 0) setLeft(total); setRunning(true); }
  function pause() { setRunning(false); }
  function reset() { setRunning(false); setDone(false); setLeft(total); }

  return (
    <div className={`exercise-card timer ${accent === "angry" ? "angryX" : "inspiredX"} ${done ? "celebrate" : ""}`} id={id}>
      <div className="ex-top">
        <span className="ex-emoji" aria-hidden="true">{emoji}</span>
        <span className="ex-mins">{Math.ceil(left / 60)}m</span>
      </div>

      <div
        className={`timer-ring ${accent}`}
        style={{ background: `conic-gradient(var(--ring-accent) ${deg}deg, var(--ring-track) 0)` }}
        aria-label={`${title} progress`}
      >
        <div className="timer-core">
          <div className="timer-time">{mm}:{ss}</div>
          <div className="timer-label">{title}</div>
        </div>
      </div>

      <p className="timer-desc">{desc}</p>

      <div className="timer-controls">
        {!running ? <button className="ex-btn" onClick={start}>{left === total || left === 0 ? "Start" : "Resume"}</button>
                  : <button className="ex-btn ghost" onClick={pause}>Pause</button>}
        <button className="ex-btn subtle" onClick={reset}>Reset</button>
      </div>
    </div>
  );
}
