export const MIN_SERVINGS = 1;
export const MAX_SERVINGS = 100;

// "step" : pas des boutons +/− (10 pour les recettes en grande quantité,
// comme les biscuits, 1 sinon). La saisie au clavier reste libre.
export default function ServingsControl({ servings, onChange, label = 'Personnes', step = 1 }) {
  const value = Number(servings) || MIN_SERVINGS;
  const decrease = () => onChange(Math.max(MIN_SERVINGS, value - step));
  const increase = () => onChange(Math.min(MAX_SERVINGS, value + step));

  // type="text" (et non "number") pour éviter les flèches natives du
  // navigateur à côté de nos boutons +/− ; seuls les chiffres sont acceptés.
  const handleInput = (e) => {
    const raw = e.target.value;
    if (raw === '') { onChange(''); return; }
    if (!/^\d+$/.test(raw)) return;
    onChange(Math.min(MAX_SERVINGS, parseInt(raw, 10)));
  };

  const handleBlur = () => {
    if (servings === '' || servings < MIN_SERVINGS) onChange(MIN_SERVINGS);
  };

  return (
    <div className="servings-control">
      <span className="servings-label">{label}</span>
      <div className="stepper">
        <button type="button" onClick={decrease} disabled={value <= MIN_SERVINGS} aria-label="Diminuer">−</button>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={servings}
          onChange={handleInput}
          onBlur={handleBlur}
          aria-label={`Nombre : ${label.toLowerCase()}`}
        />
        <button type="button" onClick={increase} disabled={value >= MAX_SERVINGS} aria-label="Augmenter">+</button>
      </div>
    </div>
  );
}
