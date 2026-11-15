import tagGroups from './tags.json';
import categories from './categories.json';
import { compareBySortKey } from '../utils/sortKey';
import { getTimes } from '../utils/scale';

// Découvre automatiquement chaque fichier .json de ./recipes au build, sauf
// ceux préfixés par "_" (ex. _template.json), ignorés volontairement.
const modules = import.meta.glob('./recipes/*.json', { eager: true });

export const SEASONS = ['printemps', 'été', 'automne', 'hiver'];
export const SEASON_ICONS = { printemps: '🌱', été: '☀️', automne: '🍂', hiver: '❄️' };

// Tags calculés automatiquement :
//   "rapide"             : temps total (repos compris) ≤ 30 min
//   "riche en protéines" : ≥ 20 g de protéines assimilables par portion
//                          (champ nutrition.proteinAdjusted, voir README)
const QUICK_MAX_MINUTES = 30;
const HIGH_PROTEIN_MIN_G = 20;

const categoryLabel = Object.fromEntries(categories.map((c) => [c.id, c.label]));

const recipes = Object.entries(modules)
  .filter(([path]) => !path.split('/').pop().startsWith('_'))
  .map(([, m]) => m.default ?? m)
  .map((r) => {
    const tags = [...(r.tags ?? [])];
    if (getTimes(r).total && getTimes(r).total <= QUICK_MAX_MINUTES && !tags.includes('rapide')) {
      tags.push('rapide');
    }
    if (r.nutrition?.proteinAdjusted >= HIGH_PROTEIN_MIN_G && !tags.includes('riche en protéines')) {
      tags.push('riche en protéines');
    }
    return { ...r, tags, categoryLabel: categoryLabel[r.category] ?? '' };
  });

// Ordre de la page d'accueil : par mot-clé (A-Z, voir utils/sortKey.js).
recipes.sort(compareBySortKey);

export default recipes;

export { categories };

export function getRecipeById(id) {
  return recipes.find((r) => r.id === id);
}

export function getSeasons(recipe) {
  return SEASONS.filter((s) => recipe.tags?.includes(s));
}

export function getNonSeasonTags(recipe) {
  return (recipe.tags ?? []).filter((t) => !SEASONS.includes(t));
}

// Groupes de tags pour les filtres de l'accueil, limités aux tags réellement
// utilisés. Un tag absent de tags.json atterrit dans le groupe "Autre".
export function getTagGroups() {
  const used = new Set();
  recipes.forEach((r) => r.tags?.forEach((t) => used.add(t)));

  const known = new Set(tagGroups.flatMap((g) => g.tags));
  const groups = tagGroups.map((g) => ({ ...g, tags: g.tags.filter((t) => used.has(t)) }));
  const extra = [...used].filter((t) => !known.has(t)).sort((a, b) => a.localeCompare(b, 'fr'));
  const other = groups.find((g) => g.id === 'autre');
  if (other) other.tags.push(...extra);

  return groups.filter((g) => g.tags.length);
}
