import { useState } from 'react';
import { Link, useParams, useNavigate, Navigate } from 'react-router-dom';
import ServingsControl from './ServingsControl';
import { formatQuantity } from '../utils/scale';
import { getRecipeById } from '../data/recipesIndex';

function formatDate(iso) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return iso;
  }
}

export default function RecipePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const recipe = getRecipeById(id);
  const [servings, setServings] = useState(recipe?.baseServings ?? 4);

  if (!recipe) return <Navigate to="/" replace />;

  // Effective numeric servings used for scaling (input can briefly be '' while editing).
  const effectiveServings = Number(servings) || recipe.baseServings;

  const goToTag = (tag) => navigate(`/?tag=${encodeURIComponent(tag)}`);

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  return (
    <div className="recipe-page-header">
      <Link to="/" className="back-link">← All recipes</Link>

      <div className="recipe-layout">
        {/* Column 1: created date, tags, time estimates, ingredients */}
        <aside className="panel">
          {recipe.createdAt && (
            <p className="meta-block">Created {formatDate(recipe.createdAt)}</p>
          )}

          <div className="tag-list" style={{ marginBottom: 18 }}>
            {recipe.tags?.map((t) => (
              <button
                key={t}
                type="button"
                className="tag-chip"
                data-clickable="true"
                onClick={() => goToTag(t)}
                aria-label={`Search recipes tagged ${t}`}
              >
                {t}
              </button>
            ))}
          </div>

          {(recipe.prepTime || recipe.cookTime) && (
            <div className="time-stats">
              <div className="time-stat">
                <span className="value">{recipe.prepTime ?? '–'}</span>
                <span className="label">Prep min</span>
              </div>
              <div className="time-stat">
                <span className="value">{recipe.cookTime ?? '–'}</span>
                <span className="label">Cook min</span>
              </div>
              <div className="time-stat">
                <span className="value">{totalTime || '–'}</span>
                <span className="label">Total min</span>
              </div>
            </div>
          )}

          <ServingsControl servings={servings} onChange={setServings} />

          <h4>Ingredients</h4>
          <ul className="ingredient-list">
            {recipe.ingredients.map((ing, i) => (
              <li key={i}>
                <span>{ing.name}</span>
                <span className="ingredient-qty">
                  {formatQuantity(ing.amount, ing.unit, recipe.baseServings, effectiveServings)}
                </span>
              </li>
            ))}
          </ul>
        </aside>

        {/* Column 2: title, description, steps */}
        <section>
          <h1 className="recipe-title">{recipe.title}</h1>
          <p className="recipe-description">{recipe.description}</p>

          <h4 className="section-label">Steps</h4>
          <div className="steps-block">
            {recipe.steps.map((step, i) => (
              <p key={i}><strong>{i + 1}.</strong> {step}</p>
            ))}
          </div>

          {recipe.footnote && <div className="footnote">{recipe.footnote}</div>}
        </section>
      </div>
    </div>
  );
}
