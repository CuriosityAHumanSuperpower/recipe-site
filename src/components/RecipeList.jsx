import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import TagFilterRow from './TagFilterRow';
import RecipeCard from './RecipeCard';
import CategoryNav from './CategoryNav';
import SeasonIcons from './SeasonIcons';
import { categories, getTagGroups } from '../data/recipesIndex';
import { useRecipeSearch } from '../utils/useRecipeSearch';
import { formatDuration, getTimes } from '../utils/scale';

const VIEW_KEY = 'recipe-site-view';

function readView() {
  try {
    return localStorage.getItem(VIEW_KEY) === 'list' ? 'list' : 'cards';
  } catch {
    return 'cards';
  }
}

function groupByCategory(items) {
  const groups = {};
  categories.forEach((c) => { groups[c.id] = []; });
  items.forEach((r) => {
    const key = groups[r.category] ? r.category : categories[categories.length - 1].id;
    groups[key].push(r);
  });
  return groups;
}

function RecipeRow({ recipe }) {
  const { total } = getTimes(recipe);
  return (
    <Link to={`/recipe/${recipe.id}`} className="recipe-row">
      <h3>{recipe.title}</h3>
      <SeasonIcons recipe={recipe} />
      {total > 0 && <span className="row-time">{formatDuration(total)}</span>}
    </Link>
  );
}

const tagGroups = getTagGroups();

export default function RecipeList({
  recipes,
  query,
  activeTags,
  onActiveTagsChange,
  activeCategory,
  onActiveCategoryChange,
  onResetFilters,
}) {
  const [view, setView] = useState(readView);

  useEffect(() => {
    try { localStorage.setItem(VIEW_KEY, view); } catch { /* stockage indisponible */ }
  }, [view]);

  const { results } = useRecipeSearch(recipes, query);
  const filtered = useMemo(
    () => results.filter((r) =>
      (!activeCategory || r.category === activeCategory)
      && activeTags.every((t) => r.tags?.includes(t))),
    [results, activeCategory, activeTags.join(',')] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const groups = useMemo(() => groupByCategory(filtered), [filtered]);
  const activeCategoryIds = useMemo(
    () => new Set(categories.filter((c) => groups[c.id]?.length).map((c) => c.id)),
    [groups]
  );
  const usedCategories = useMemo(
    () => categories.filter((c) => recipes.some((r) => r.category === c.id)),
    [recipes]
  );

  return (
    <div>
      <TagFilterRow
        tagGroups={tagGroups}
        categories={usedCategories}
        activeTags={activeTags}
        onTagsChange={onActiveTagsChange}
        activeCategory={activeCategory}
        onCategoryChange={onActiveCategoryChange}
        onReset={onResetFilters}
      />

      <div className="list-controls">
        <p className="results-count">
          {filtered.length} recette{filtered.length !== 1 ? 's' : ''}
        </p>
        <div className="view-toggle" role="group" aria-label="Affichage">
          <button type="button" data-active={view === 'cards'} aria-pressed={view === 'cards'} onClick={() => setView('cards')}>Cartes</button>
          <button type="button" data-active={view === 'list'} aria-pressed={view === 'list'} onClick={() => setView('list')}>Liste</button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <h3>Aucune recette trouvée</h3>
          <p>Essayez un autre mot-clé ou retirez un filtre.</p>
        </div>
      ) : (
        categories.map((c) => {
          const items = groups[c.id];
          if (!items?.length) return null;
          return (
            <section key={c.id} id={`section-${c.id}`}>
              <h2 className="section-heading">{c.label}</h2>
              {view === 'cards' ? (
                <div className="recipe-grid">
                  {items.map((r) => <RecipeCard key={r.id} recipe={r} />)}
                </div>
              ) : (
                <div className="recipe-rows">
                  {items.map((r) => <RecipeRow key={r.id} recipe={r} />)}
                </div>
              )}
            </section>
          );
        })
      )}

      <CategoryNav categories={categories} activeCategoryIds={activeCategoryIds} />
    </div>
  );
}
