import { useRef } from 'react';
import { Link, useParams, useNavigate, Navigate } from 'react-router-dom';
import ServingsControl from './ServingsControl';
import TimeStats from './TimeStats';
import NutritionInfo from './NutritionInfo';
import { formatQuantity } from '../utils/scale';
import { getRecipeById, getSeasons, getNonSeasonTags, SEASONS, SEASON_ICONS } from '../data/recipesIndex';
import { useHeightVar } from '../utils/useHeightVar';
import { useWakeLock } from '../utils/useWakeLock';
import { useRecipeProgress } from '../utils/useRecipeProgress';

function formatDate(iso) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return iso;
  }
}

// Les étapes peuvent contenir "{portions}", remplacé par le nombre de
// portions choisi (ex. "Diviser la pâte en {portions} boules").
function renderStep(step, servings) {
  return step.replaceAll('{portions}', String(servings));
}

export default function RecipePage() {
  const { id } = useParams();
  const recipe = getRecipeById(id);
  if (!recipe) return <Navigate to="/" replace />;
  return <RecipeView recipe={recipe} />;
}

function RecipeView({ recipe }) {
  const navigate = useNavigate();
  const titleRef = useRef(null);
  useHeightVar(titleRef, '--title-h');
  const wakeLock = useWakeLock();
  const progress = useRecipeProgress(recipe);
  const { servings, setServings } = progress;

  // Valeur numérique utilisée pour les calculs (le champ peut être vide
  // un instant pendant la saisie).
  const effectiveServings = Number(servings) || recipe.baseServings;
  const scaled = effectiveServings !== recipe.baseServings;
  // Recette de toute l'année : une seule pastille au lieu des 4 saisons.
  const allYear = getSeasons(recipe).length === SEASONS.length;

  const goToTag = (tag) => navigate(`/?tags=${encodeURIComponent(tag)}`);
  const goToCategory = () => navigate(`/?cat=${encodeURIComponent(recipe.category)}`);

  return (
    <article className="recipe-page">
      <div className="recipe-title-bar" ref={titleRef}>
        <Link to="/" className="back-link" aria-label="Retour à toutes les recettes">←</Link>
        <h1 className="recipe-title">{recipe.title}</h1>
      </div>

      <p className="recipe-description">{recipe.description}</p>

      <div className="recipe-layout">
        {/* Colonne 1 : tags, durées, portions, ingrédients */}
        <aside className="panel">
          <div className="tag-list" style={{ marginBottom: 18 }}>
            {recipe.categoryLabel && (
              <button type="button" className="tag-chip tag-chip-category" data-clickable="true" onClick={goToCategory}>
                {recipe.categoryLabel}
              </button>
            )}
            {allYear && <span className="tag-chip">Toute l'année</span>}
            {(allYear ? getNonSeasonTags(recipe) : recipe.tags ?? []).map((t) => (
              <button
                key={t}
                type="button"
                className="tag-chip"
                data-clickable="true"
                onClick={() => goToTag(t)}
                aria-label={`Voir les recettes « ${t} »`}
              >
                {SEASON_ICONS[t] && <span aria-hidden="true">{SEASON_ICONS[t]} </span>}
                {t}
              </button>
            ))}
          </div>

          <TimeStats recipe={recipe} />
          <NutritionInfo nutrition={recipe.nutrition} />

          <ServingsControl
            servings={servings}
            onChange={setServings}
            label={recipe.servingsLabel || 'Personnes'}
            step={recipe.baseServings >= 40 ? 10 : 1}
          />
          {scaled && (
            <button type="button" className="link-button servings-reset" onClick={progress.resetServings}>
              Revenir à {recipe.baseServings} (recette d'origine)
            </button>
          )}
          {recipe.servingsNote && (
            /* Mise en évidence dès que les quantités ne sont plus celles d'origine. */
            <p className="servings-note" data-warn={scaled || undefined}>{recipe.servingsNote}</p>
          )}

          <div className="heading-row">
            <h2 className="panel-heading">Ingrédients</h2>
            {progress.hasChecks && (
              <button type="button" className="link-button" onClick={progress.clearChecks}>
                Tout décocher
              </button>
            )}
          </div>
          <ul className="ingredient-list">
            {recipe.ingredients.map((ing, i) => (
              <li key={i} data-checked={progress.checkedIngredients.has(i) || undefined}>
                <label>
                  <input
                    type="checkbox"
                    checked={progress.checkedIngredients.has(i)}
                    onChange={() => progress.toggleIngredient(i)}
                  />
                  <span className="ingredient-name">{ing.name}</span>
                  <span className="ingredient-qty">
                    {formatQuantity(ing.amount, ing.unit, recipe.baseServings, effectiveServings)}
                  </span>
                </label>
              </li>
            ))}
          </ul>

          {wakeLock.supported && (
            <label className="wake-lock">
              <input
                type="checkbox"
                checked={wakeLock.enabled}
                onChange={(e) => wakeLock.setEnabled(e.target.checked)}
              />
              Garder l'écran allumé
            </label>
          )}
        </aside>

        {/* Colonne 2 : étapes */}
        <section>
          <div className="heading-row">
            <h2 className="section-label">Étapes</h2>
            {progress.checkedSteps.size > 0 && (
              <span className="steps-progress">
                {progress.checkedSteps.size} / {recipe.steps.length} faites
              </span>
            )}
          </div>
          <ol className="steps-block">
            {recipe.steps.map((step, i) => (
              <li key={i} data-checked={progress.checkedSteps.has(i) || undefined}>
                <label>
                  <input
                    type="checkbox"
                    checked={progress.checkedSteps.has(i)}
                    onChange={() => progress.toggleStep(i)}
                    aria-label={`Étape ${i + 1} terminée`}
                  />
                  <span>{renderStep(step, effectiveServings)}</span>
                </label>
              </li>
            ))}
          </ol>

          {recipe.footnote && <div className="footnote">{recipe.footnote}</div>}

          {recipe.createdAt && (
            <p className="meta-block">Ajoutée le {formatDate(recipe.createdAt)}</p>
          )}
        </section>
      </div>
    </article>
  );
}
