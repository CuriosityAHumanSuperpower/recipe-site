const MIN_SERVINGS = 1;
const MAX_SERVINGS = 24;

export default function ServingsControl({ servings, onChange }) {
  const decrease = () => onChange(Math.max(MIN_SERVINGS, servings - 1));
  const increase = () => onChange(Math.min(MAX_SERVINGS, servings + 1));

  // type="text" (not "number") so the browser doesn't render its own
  // up/down spinner next to our custom +/- buttons. We validate manually
  // and only accept digits.
  const handleInput = (e) => {
    const raw = e.target.value;
    if (raw === '') { onChange(''); return; }
    if (!/^\d+$/.test(raw)) return; // ignore non-numeric input
    const next = parseInt(raw, 10);
    onChange(Math.min(MAX_SERVINGS, next));
  };

  const handleBlur = () => {
    if (servings === '' || servings < MIN_SERVINGS) onChange(MIN_SERVINGS);
  };

  return (
    <div className="servings-control">
      <span className="servings-label">Servings</span>
      <div className="stepper">
        <button type="button" onClick={decrease} disabled={servings <= MIN_SERVINGS} aria-label="Decrease servings">−</button>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={servings}
          onChange={handleInput}
          onBlur={handleBlur}
          aria-label="Number of servings"
        />
        <button type="button" onClick={increase} disabled={servings >= MAX_SERVINGS} aria-label="Increase servings">+</button>
      </div>
    </div>
  );
}
