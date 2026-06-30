import { useEffect, useMemo, useState } from 'react';
import { HashRouter, Routes, Route, Link, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import SearchBar from './components/SearchBar';
import ThemeToggle from './components/ThemeToggle';
import RecipeList from './components/RecipeList';
import RecipePage from './components/RecipePage';
import recipes, { getAllTags } from './data/recipesIndex';
import { getInitialTheme, applyTheme } from './utils/theme';

function Header({ query, onQueryChange, onSubmitSearch, theme, onToggleTheme }) {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link to="/" className="brand">
          Petits Plats
          <small>Recipe Book</small>
        </Link>
        <SearchBar value={query} onChange={onQueryChange} onSubmit={onSubmitSearch} />
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
    </header>
  );
}

export default function App() {
  const [theme, setTheme] = useState(getInitialTheme);
  const allTags = useMemo(() => getAllTags(), []);

  useEffect(() => { applyTheme(theme); }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <HashRouter>
      <AppBody theme={theme} onToggleTheme={toggleTheme} allTags={allTags} />
    </HashRouter>
  );
}

// Search query (?q=) and active tag (?tag=) both live in the URL so they're
// shareable/bookmarkable. The search box lives in the header (rendered on
// every page), so it works from anywhere: typing while on a recipe page
// jumps you to the homepage with results, the same way clicking the search
// icon or pressing Enter does.
function AppBody({ theme, onToggleTheme, allTags }) {
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const query = location.pathname === '/' ? params.get('q') || '' : params.get('q') || '';
  const activeTag = location.pathname === '/' ? params.get('tag') || null : null;

  const buildParams = (next) => {
    const p = location.pathname === '/' ? new URLSearchParams(params) : new URLSearchParams();
    if (next) p.set('q', next); else p.delete('q');
    return p;
  };

  const setQuery = (next) => {
    const p = buildParams(next);
    if (location.pathname === '/') {
      setParams(p, { replace: true });
    } else {
      navigate(`/?${p.toString()}`);
    }
  };

  // Explicit submit (Enter key or search icon click): always land on the
  // homepage with the current query, even if already there.
  const submitSearch = (value) => {
    const p = new URLSearchParams();
    if (value) p.set('q', value);
    navigate(`/?${p.toString()}`);
  };

  const setActiveTag = (tag) => {
    const p = new URLSearchParams(params);
    if (tag) p.set('tag', tag); else p.delete('tag');
    setParams(p, { replace: true });
  };

  return (
    <>
      <Header
        query={query}
        onQueryChange={setQuery}
        onSubmitSearch={submitSearch}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />
      <main className="app-shell">
        <Routes>
          <Route
            path="/"
            element={
              <RecipeList
                recipes={recipes}
                allTags={allTags}
                query={query}
                activeTag={activeTag}
                onActiveTagChange={setActiveTag}
              />
            }
          />
          <Route path="/recipe/:id" element={<RecipePage />} />
          <Route
            path="*"
            element={
              <RecipeList
                recipes={recipes}
                allTags={allTags}
                query={query}
                activeTag={activeTag}
                onActiveTagChange={setActiveTag}
              />
            }
          />
        </Routes>
      </main>
    </>
  );
}
