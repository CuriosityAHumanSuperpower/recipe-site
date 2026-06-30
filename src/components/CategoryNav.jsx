export default function CategoryNav({ categories, activeCategoryIds }) {
  const scrollToCategory = (id) => {
    const el = document.getElementById(`section-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav className="category-nav" aria-label="Jump to section">
      {categories.map((c) => {
        const enabled = activeCategoryIds.has(c.id);
        return (
          <button
            key={c.id}
            type="button"
            data-enabled={enabled}
            disabled={!enabled}
            onClick={() => scrollToCategory(c.id)}
          >
            {c.label}
          </button>
        );
      })}
    </nav>
  );
}
