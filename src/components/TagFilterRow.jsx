import { useState } from 'react';
import { SEASON_ICONS } from '../data/recipesIndex';

function isWideScreen() {
  try {
    return window.matchMedia('(min-width: 761px)').matches;
  } catch {
    return true;
  }
}

// Filtres de l'accueil, regroupés par famille. Les tags se cumulent (ET) :
// "été" + "végétalien" ne montre que les recettes qui ont les deux.
// La catégorie est un choix unique. Sur téléphone, le panneau est replié
// par défaut derrière un bouton "Filtres" pour laisser la place aux recettes.
export default function TagFilterRow({
  tagGroups,
  categories,
  activeTags,
  onTagsChange,
  activeCategory,
  onCategoryChange,
  onReset,
}) {
  const [open, setOpen] = useState(isWideScreen);
  const activeCount = activeTags.length + (activeCategory ? 1 : 0);

  const toggleTag = (tag) => {
    onTagsChange(activeTags.includes(tag) ? activeTags.filter((t) => t !== tag) : [...activeTags, tag]);
  };

  return (
    <div className="filters">
      <div className="filters-bar">
        <button
          type="button"
          className="filters-toggle"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          Filtres{activeCount ? ` (${activeCount})` : ''}
          <span aria-hidden="true" className="chevron" data-open={open}>▾</span>
        </button>
        {activeCount > 0 && (
          <button type="button" className="filters-reset" onClick={onReset}>
            Tout effacer
          </button>
        )}
      </div>

      {open && (
        <div className="filter-groups">
          <div className="filter-group" role="group" aria-label="Catégorie">
            <span className="filter-group-label">Catégorie</span>
            <div className="tag-row">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="tag-pill"
                  data-active={activeCategory === c.id}
                  aria-pressed={activeCategory === c.id}
                  onClick={() => onCategoryChange(activeCategory === c.id ? null : c.id)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {tagGroups.map((g) => (
            <div className="filter-group" role="group" aria-label={g.label} key={g.id}>
              <span className="filter-group-label">{g.label}</span>
              <div className="tag-row">
                {g.tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="tag-pill"
                    data-active={activeTags.includes(tag)}
                    aria-pressed={activeTags.includes(tag)}
                    onClick={() => toggleTag(tag)}
                  >
                    {SEASON_ICONS[tag] && <span aria-hidden="true">{SEASON_ICONS[tag]} </span>}
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
