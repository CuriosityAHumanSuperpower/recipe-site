// Scales an ingredient amount from baseServings to targetServings and
// formats it in a clean, EU-friendly way (handles g/kg, ml/l rollover,
// fractions for spoons, and unit-less countable items).

const FRACTIONS = [
  [0.25, '¼'],
  [0.33, '⅓'],
  [0.5, '½'],
  [0.66, '⅔'],
  [0.75, '¾'],
];

function toNiceFraction(value) {
  const whole = Math.floor(value);
  const frac = value - whole;
  if (frac < 0.05) return whole === 0 ? '0' : String(whole);
  let best = null;
  let bestDiff = Infinity;
  for (const [f, label] of FRACTIONS) {
    const diff = Math.abs(frac - f);
    if (diff < bestDiff) { bestDiff = diff; best = label; }
  }
  if (bestDiff > 0.08) {
    // not close to a clean fraction, fall back to 1 decimal
    return String(Math.round(value * 10) / 10);
  }
  return whole > 0 ? `${whole}${best}` : best;
}

export function scaleAmount(amount, baseServings, targetServings) {
  if (typeof amount !== 'number') return amount;
  const ratio = targetServings / baseServings;
  return amount * ratio;
}

export function formatQuantity(amount, unit, baseServings, targetServings) {
  const scaled = scaleAmount(amount, baseServings, targetServings);

  // Whole, unit-less countable items (eggs, onions...) -> round to nearest,
  // but show a fraction if it lands near .5 so users can halve an egg etc.
  if (!unit) {
    if (scaled < 1 && scaled > 0) return toNiceFraction(scaled);
    const rounded = Math.round(scaled * 4) / 4; // quarter precision
    return toNiceFraction(rounded) + (Number.isInteger(rounded) ? '' : '');
  }

  if (unit === 'g' && scaled >= 1000) {
    return `${(scaled / 1000).toFixed(scaled % 1000 === 0 ? 0 : 2)} kg`;
  }
  if (unit === 'ml' && scaled >= 1000) {
    return `${(scaled / 1000).toFixed(scaled % 1000 === 0 ? 0 : 2)} l`;
  }
  if (unit === 'tsp' || unit === 'tbsp' || unit === 'pinch') {
    return `${toNiceFraction(scaled)} ${unit}`;
  }

  // Default: g, kg, ml, l, oz... round sensibly
  const rounded = scaled >= 10 ? Math.round(scaled) : Math.round(scaled * 10) / 10;
  return `${rounded} ${unit}`;
}
