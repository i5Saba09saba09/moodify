import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function ToastPortal() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    function onToast(e) {
      const id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());
      const message = e?.detail?.message || "Done";
      setToasts(t => [...t, { id, message }]);
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2200);
    }
    window.addEventListener("toast", onToast);
    return () => window.removeEventListener("toast", onToast);
  }, []);

  return createPortal(
    <div className="toast-wrap">
      {toasts.map(t => (
        <div key={t.id} className="toast">{t.message}</div>
      ))}
    </div>,
    document.body
  );
}
