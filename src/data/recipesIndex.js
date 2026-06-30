import tagOrder from './tags.json';
import categories from './categories.json';
import { compareBySortKey } from '../utils/sortKey';

// Auto-discovers every .json file in ./recipes at build time, except files
// prefixed with "_" (e.g. _template.json) which are ignored on purpose so
// the template never shows up on the site.
const modules = import.meta.glob('./recipes/*.json', { eager: true });

const recipes = Object.entries(modules)
  .filter(([path]) => !path.split('/').pop().startsWith('_'))
  .map(([, m]) => m.default ?? m);

// Homepage ordering: by key word (A-Z, ignoring leading adjectives — see
// utils/sortKey.js), independent of category. Category grouping happens at
// render time in RecipeList.
recipes.sort(compareBySortKey);

export default recipes;

export { categories };

export function getRecipeById(id) {
  return recipes.find((r) => r.id === id);
}

// Tags actually used by recipes, ordered first by the canonical order in
// tags.json (kept as a single small source of truth for tag naming/order),
// then alphabetically for any tag not yet listed there.
export function getAllTags() {
  const used = new Set();
  recipes.forEach((r) => r.tags?.forEach((t) => used.add(t)));

  const ordered = tagOrder.filter((t) => used.has(t));
  const extra = Array.from(used)
    .filter((t) => !tagOrder.includes(t))
    .sort();

  return [...ordered, ...extra];
}
