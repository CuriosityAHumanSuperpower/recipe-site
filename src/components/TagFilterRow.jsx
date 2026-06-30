export default function TagFilterRow({ tags, activeTag, onSelect }) {
  return (
    <div className="tag-row" role="group" aria-label="Filter by tag">
      <button
        type="button"
        className="tag-pill"
        data-active={activeTag === null}
        onClick={() => onSelect(null)}
      >
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          type="button"
          className="tag-pill"
          data-active={activeTag === tag}
          onClick={() => onSelect(activeTag === tag ? null : tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
