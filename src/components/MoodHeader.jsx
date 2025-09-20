export function MoodHeader({ title, subtitle, emoji, variant = "inspired" }) {
  return (
    <header className={`mood-header ${variant}`}>
      <div className="mood-header-content">
        <span className="mood-emoji" aria-hidden="true">{emoji}</span>
        <h1>{title}</h1>
      </div>
      <p>{subtitle}</p>
    </header>
  );
}
