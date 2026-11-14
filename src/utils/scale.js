// Mise à l'échelle et affichage des quantités d'ingrédients.
//
// Unités acceptées dans les fichiers JSON (voir README) :
//   masse   : g, kg
//   volume  : ml, cl, l
//   cuillère: "cuillère à soupe", "cuillère à café"
//   autres  : "pincée", "poignée", "cm", "" (élément dénombrable : œufs, oignons…)
// Quantité non chiffrée : "amount": null avec "unit": "au goût", "un filet"…
// (affichée telle quelle, jamais mise à l'échelle).

// Anciennes notations encore acceptées, converties vers l'unité canonique.
const UNIT_ALIASES = {
  tbsp: 'cuillère à soupe',
  'c. à s.': 'cuillère à soupe',
  'càs': 'cuillère à soupe',
  tsp: 'cuillère à café',
  'c. à c.': 'cuillère à café',
  'càc': 'cuillère à café',
  pinch: 'pincée',
};

// Unités dont le pluriel se forme sur le premier mot ("cuillères à soupe").
const PLURALIZABLE = {
  'cuillère à soupe': 'cuillères à soupe',
  'cuillère à café': 'cuillères à café',
  'pincée': 'pincées',
  'poignée': 'poignées',
};

export const KNOWN_UNITS = ['g', 'kg', 'ml', 'cl', 'l', 'cm', '', ...Object.keys(PLURALIZABLE)];

export function normalizeUnit(unit) {
  const u = (unit ?? '').trim();
  return UNIT_ALIASES[u] ?? u;
}

const FRACTIONS = [
  [0.125, '⅛'],
  [0.25, '¼'],
  [1 / 3, '⅓'],
  [0.5, '½'],
  [2 / 3, '⅔'],
  [0.75, '¾'],
];

// Nombre au format français : virgule décimale, pas de zéros inutiles.
function frNumber(value, decimals = 1) {
  const factor = 10 ** decimals;
  const rounded = Math.round(value * factor) / factor;
  return String(rounded).replace('.', ',');
}

function toNiceFraction(value) {
  const whole = Math.floor(value);
  const frac = value - whole;
  if (frac < 0.06) return String(whole || frNumber(value, 2));
  if (frac > 0.94) return String(whole + 1);
  let best = null;
  let bestDiff = Infinity;
  for (const [f, label] of FRACTIONS) {
    const diff = Math.abs(frac - f);
    if (diff < bestDiff) { bestDiff = diff; best = label; }
  }
  if (bestDiff > 0.07) return frNumber(value, 1);
  return whole > 0 ? `${whole}${best}` : best;
}

export function scaleAmount(amount, baseServings, targetServings) {
  if (typeof amount !== 'number') return amount;
  return amount * (targetServings / baseServings);
}

function formatMass(grams) {
  if (grams >= 1000) return `${frNumber(grams / 1000, 2)} kg`;
  if (grams >= 10) return `${Math.round(grams)} g`;
  return `${frNumber(grams, 1)} g`;
}

function formatVolume(ml) {
  if (ml >= 1000) return `${frNumber(ml / 1000, 2)} l`;
  if (ml >= 10) return `${Math.round(ml)} ml`;
  return `${frNumber(ml, 1)} ml`;
}

export function formatQuantity(amount, rawUnit, baseServings, targetServings) {
  const unit = normalizeUnit(rawUnit);

  // Quantité libre ("au goût", "un filet"…) : affichée telle quelle.
  if (amount === null || amount === undefined || amount === 0) return unit;

  const scaled = scaleAmount(amount, baseServings, targetServings);

  switch (unit) {
    case 'g': return formatMass(scaled);
    case 'kg': return formatMass(scaled * 1000);
    case 'ml': return formatVolume(scaled);
    case 'cl': return formatVolume(scaled * 10);
    case 'l': return formatVolume(scaled * 1000);
    case '': {
      // Éléments dénombrables (œufs, oignons…) : précision au quart.
      const rounded = scaled < 1 ? scaled : Math.round(scaled * 4) / 4;
      return toNiceFraction(rounded);
    }
    case 'cuillère à soupe':
      // 1 cuillère à soupe = 3 cuillères à café : plus lisible que "⅓ c. à soupe".
      if (scaled < 0.5) return formatQuantity(scaled * 3, 'cuillère à café', 1, 1);
      return withUnit(scaled, unit);
    case 'cuillère à café':
      if (scaled < 0.1) return '1 pincée';
      return withUnit(scaled, unit);
    default:
      return withUnit(scaled, unit);
  }
}

function withUnit(scaled, unit) {
  const plural = PLURALIZABLE[unit];
  // En français, le pluriel commence à 2.
  const label = plural && scaled >= 2 ? plural : unit;
  return `${toNiceFraction(scaled)} ${label}`;
}

// "150" -> "2 h 30", "45" -> "45 min".
export function formatDuration(minutes) {
  if (!minutes) return '–';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m} min`;
  return m ? `${h} h ${String(m).padStart(2, '0')}` : `${h} h`;
}

export function getTimes(recipe) {
  const prep = recipe.prepTime || 0;
  const cook = recipe.cookTime || 0;
  const rest = recipe.restTime || 0;
  return { prep, cook, rest, total: prep + cook + rest };
}
