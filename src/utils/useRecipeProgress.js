import { useEffect, useState } from 'react';

// État personnel d'une recette, mémorisé dans le navigateur (localStorage) :
//   - servings    : dernier nombre de portions choisi (gardé sans limite de durée)
//   - ingredients : index des ingrédients cochés
//   - steps       : index des étapes terminées
// Les cases cochées expirent après CHECKS_TTL_MS, pour ne pas retrouver une
// recette à moitié cochée lors d'une prochaine cuisson.
// Le stockage peut être indisponible (navigation privée…) : tout est protégé
// par try/catch et la page fonctionne alors normalement, sans mémoire.

const CHECKS_TTL_MS = 12 * 60 * 60 * 1000;
const keyFor = (id) => `recipe-site:recipe:${id}`;

function load(recipe) {
  const fallback = { servings: recipe.baseServings, ingredients: [], steps: [] };
  try {
    const saved = JSON.parse(localStorage.getItem(keyFor(recipe.id)) || 'null');
    if (!saved) return fallback;
    const fresh = saved.checkedAt && Date.now() - saved.checkedAt < CHECKS_TTL_MS;
    const valid = (list, max) => (Array.isArray(list) ? list.filter((i) => Number.isInteger(i) && i < max) : []);
    return {
      servings: Number.isInteger(saved.servings) && saved.servings >= 1 ? saved.servings : recipe.baseServings,
      ingredients: fresh ? valid(saved.ingredients, recipe.ingredients.length) : [],
      steps: fresh ? valid(saved.steps, recipe.steps.length) : [],
    };
  } catch {
    return fallback;
  }
}

export function useRecipeProgress(recipe) {
  const [state, setState] = useState(() => load(recipe));

  useEffect(() => {
    const { servings, ingredients, steps } = state;
    const hasChecks = ingredients.length > 0 || steps.length > 0;
    const customServings = Number.isInteger(servings) && servings !== recipe.baseServings;
    try {
      if (!hasChecks && !customServings) {
        localStorage.removeItem(keyFor(recipe.id));
        return;
      }
      localStorage.setItem(keyFor(recipe.id), JSON.stringify({
        servings: customServings ? servings : undefined,
        ingredients,
        steps,
        checkedAt: hasChecks ? Date.now() : undefined,
      }));
    } catch { /* stockage indisponible : on continue sans mémoriser */ }
  }, [state, recipe.id, recipe.baseServings]);

  const toggle = (list) => (index) => setState((s) => ({
    ...s,
    [list]: s[list].includes(index) ? s[list].filter((i) => i !== index) : [...s[list], index],
  }));

  return {
    servings: state.servings,
    setServings: (servings) => setState((s) => ({ ...s, servings })),
    resetServings: () => setState((s) => ({ ...s, servings: recipe.baseServings })),
    checkedIngredients: new Set(state.ingredients),
    checkedSteps: new Set(state.steps),
    toggleIngredient: toggle('ingredients'),
    toggleStep: toggle('steps'),
    hasChecks: state.ingredients.length > 0 || state.steps.length > 0,
    clearChecks: () => setState((s) => ({ ...s, ingredients: [], steps: [] })),
  };
}
