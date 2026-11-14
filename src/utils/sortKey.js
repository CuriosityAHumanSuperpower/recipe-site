// Mot (ou expression) sous lequel une recette est classée sur l'accueil.
// Volontairement NON déduit du titre : chaque recette définit son "sortKey"
// (voir _template.json ; scripts/check-recipes.mjs le vérifie).
export function getSortKey(recipe) {
  return recipe.sortKey || recipe.title;
}

export function compareBySortKey(a, b) {
  return getSortKey(a).localeCompare(getSortKey(b), 'fr', { sensitivity: 'base' });
}
