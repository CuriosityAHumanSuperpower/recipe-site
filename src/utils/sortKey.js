// Returns the word/phrase a recipe alphabetizes under on the homepage.
// This is intentionally NOT auto-derived from the title (guessing "last
// word of the title" breaks for titles that don't follow an
// "<adjective> <Dish>" pattern). Every recipe must set its own "sortKey" —
// see _template.json and scripts/check-recipes.mjs, which enforces this.
export function getSortKey(recipe) {
  return recipe.sortKey || recipe.title;
}

export function compareBySortKey(a, b) {
  return getSortKey(a).localeCompare(getSortKey(b));
}
