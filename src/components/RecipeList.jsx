import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import TagFilterRow from './TagFilterRow';
import RecipeCard from './RecipeCard';
import CategoryNav from './CategoryNav';
import { categories } from '../data/recipesIndex';
import { useRecipeSearch } from '../utils/useRecipeSearch';

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
  return (
    <Link to={`/recipe/${recipe.id}`} className="recipe-row">
      <h3>{recipe.title}</h3>
      <div className="tag-list">
        {recipe.tags?.slice(0, 3).map((t) => <span className="tag-chip" key={t}>{t}</span>)}
      </div>
    </Link>
  );
}

export default function RecipeList({ recipes, allTags, query, activeTag, onActiveTagChange }) {
  const [view, setView] = useState('cards'); // 'cards' | 'list'

  const { results } = useRecipeSearch(recipes, query);
  const filtered = activeTag ? results.filter((r) => r.tags?.includes(activeTag)) : results;

  const groups = useMemo(() => groupByCategory(filtered), [filtered]);
  const activeCategoryIds = useMemo(
    () => new Set(categories.filter((c) => groups[c.id]?.length).map((c) => c.id)),
    [groups]
  );

  const handleTagSelect = (tag) => onActiveTagChange(tag);

  return (
    <div>
      <div className="list-controls">
        <TagFilterRow tags={allTags} activeTag={activeTag} onSelect={handleTagSelect} />
        <div className="view-toggle">
          <button type="button" data-active={view === 'cards'} onClick={() => setView('cards')}>Cards</button>
          <button type="button" data-active={view === 'list'} onClick={() => setView('list')}>List</button>
        </div>
      </div>

      <p className="results-count">
        {filtered.length} recipe{filtered.length !== 1 ? 's' : ''}
      </p>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <h3>No recipes found</h3>
          <p>Try a different search term or clear the tag filter.</p>
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
