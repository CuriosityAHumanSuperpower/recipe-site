import { useEffect, useMemo, useRef, useState } from 'react';
import Fuse from 'fuse.js';

// Debounce a fast-changing value so we don't re-search on every keystroke.
function useDebouncedValue(value, delayMs) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(handle);
  }, [value, delayMs]);
  return debounced;
}

export function useRecipeSearch(recipes, rawQuery, { debounceMs = 220 } = {}) {
  const query = useDebouncedValue(rawQuery, debounceMs);

  const fuse = useMemo(() => {
    return new Fuse(recipes, {
      includeScore: false,
      threshold: 0.32,
      ignoreLocation: true,
      keys: [
        { name: 'title', weight: 0.4 },
        { name: 'tags', weight: 0.25 },
        { name: 'description', weight: 0.2 },
        { name: 'ingredients.name', weight: 0.15 },
      ],
    });
  }, [recipes]);

  const results = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return recipes;
    return fuse.search(trimmed).map((r) => r.item);
  }, [fuse, query, recipes]);

  return { results, isPending: query !== rawQuery };
}
