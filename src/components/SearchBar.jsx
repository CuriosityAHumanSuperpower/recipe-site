export default function SearchBar({ value, onChange, onSubmit, placeholder }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(value);
  };

  return (
    <form className="search-wrap" role="search" onSubmit={handleSubmit}>
      <button type="submit" className="search-icon-btn" aria-label="Search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>

      <input
        className="search-input"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Search recipes, ingredients, tags…'}
        aria-label="Search recipes"
      />

      {value && (
        <button
          type="button"
          className="search-clear-btn"
          aria-label="Clear search"
          onClick={() => onChange('')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </form>
  );
}
