// src/moods.js
import React from "react";

// Everyone adds an entry: slug, label, emoji, and a lazy import to THEIR component path.
export const MOODS = [
  // Yours (already done)
  { slug: "inspired", label: "Inspired", emoji: "✨", Component: React.lazy(() => import("./pages/Inspired")) },
  { slug: "angry",    label: "Angry",    emoji: "🔥", Component: React.lazy(() => import("./pages/Angry")) },

  // Teammates (examples — change paths to actual files in your repo):
  // { slug: "happy",     label: "Happy",     emoji: "😊", Component: React.lazy(() => import("./teamA/Happy.jsx")) },
  // { slug: "sad",       label: "Sad",       emoji: "😔", Component: React.lazy(() => import("../someone/SadPage")) },
  // { slug: "calm",      label: "Calm",      emoji: "😌", Component: React.lazy(() => import("./moods/calm/Calm")) },
  // { slug: "energetic", label: "Energetic", emoji: "⚡", Component: React.lazy(() => import("./pages/Energetic")) },
];
