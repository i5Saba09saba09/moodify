// src/moods.js
import React from "react";

// Register only the moods you actually have inside src/pages
export const MOODS = [
  { slug: "inspired", label: "Inspired", emoji: "✨", Component: React.lazy(() => import("./pages/Inspired")) },
  { slug: "angry",    label: "Angry",    emoji: "🔥", Component: React.lazy(() => import("./pages/Angry")) },
  { slug: "happy",    label: "Happy",    emoji: "😊", Component: React.lazy(() => import("./pages/Happy")) },
  { slug: "sad",      label: "Sad",      emoji: "😔", Component: React.lazy(() => import("./pages/Sad")) },
];

// If you later add more moods, make sure their files live under src/pages
// and import them like: React.lazy(() => import("./pages/NewMood"))
