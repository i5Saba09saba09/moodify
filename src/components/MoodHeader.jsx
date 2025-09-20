// src/components/MoodHeader.jsx
import React from "react";

/**
 * MoodHeader
 * - `emojiLabel` (optional): if provided, emoji is announced to screen readers.
 * - `children` (optional): right-aligned actions (filters, buttons, etc.)
 * - `className` (optional): extra classes without breaking existing styles.
 */
export function MoodHeader({
  title,
  subtitle,
  emoji,
  emojiLabel,
  variant = "inspired",
  className = "",
  children,
}) {
  const emojiProps = emojiLabel
    ? { role: "img", "aria-label": emojiLabel }
    : { "aria-hidden": true };

  return (
    <header
      className={`mood-header ${variant} ${className}`.trim()}
      data-variant={variant}
    >
      <div className="mood-header-content">
        {emoji != null && (
          <span className="mood-emoji" {...emojiProps}>
            {emoji}
          </span>
        )}
        <h1 className="mood-title">{title}</h1>

        {children ? <div className="mood-actions">{children}</div> : null}
      </div>

      {subtitle ? <p className="mood-subtitle">{subtitle}</p> : null}
    </header>
  );
}

export default MoodHeader;
