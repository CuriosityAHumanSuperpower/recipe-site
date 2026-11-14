import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { HashRouter, Routes, Route, Link, useSearchParams, useNavigate, useLocation, useParams } from 'react-router-dom';
import SearchBar from './components/SearchBar';
import ThemeToggle from './components/ThemeToggle';
import RecipeList from './components/RecipeList';
import RecipePage from './components/RecipePage';
import recipes from './data/recipesIndex';
import { getInitialTheme, applyTheme } from './utils/theme';
import { useHeightVar } from './utils/useHeightVar';

function Header({ query, onQueryChange, onSubmitSearch, theme, onToggleTheme }) {
  const ref = useRef(null);
  // Expose la hauteur réelle de l'en-tête (--header-h) pour que le titre
  // collant de la page recette se place juste en dessous.
  useHeightVar(ref, '--header-h');

  return (
    <header className="site-header" ref={ref}>
      <div className="site-header-inner">
        <Link to="/" className="brand">
          Petits Plats
          <small>Livre de recettes</small>
        </Link>
        <SearchBar value={query} onChange={onQueryChange} onSubmit={onSubmitSearch} />
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
    </header>
  );
}

// HashRouter ne remet pas le défilement à zéro : on le fait à chaque
// changement de page (pas lors d'un simple changement de filtre).
function ScrollToTop() {
  const { pathname } = useLocation();
  useLayoutEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// "key" force une nouvelle instance quand on passe d'une recette à une autre,
// pour que le nombre de portions reparte de la valeur de base.
function RecipeRoute() {
  const { id } = useParams();
  return <RecipePage key={id} />;
}

export default function App() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => { applyTheme(theme); }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <HashRouter>
      <ScrollToTop />
      <AppBody theme={theme} onToggleTheme={toggleTheme} />
    </HashRouter>
  );
}

// Recherche (?q=), tags actifs (?tags=a,b) et catégorie (?cat=) vivent dans
// l'URL : partageables et conservés au retour arrière. La recherche est dans
// l'en-tête : taper depuis une recette ramène à l'accueil avec les résultats.
function AppBody({ theme, onToggleTheme }) {
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const onHome = location.pathname === '/';

  const query = params.get('q') || '';
  const activeTags = onHome ? (params.get('tags') || '').split(',').filter(Boolean) : [];
  const activeCategory = onHome ? params.get('cat') || null : null;

  const updateParams = (mutate) => {
    const p = new URLSearchParams(params);
    mutate(p);
    setParams(p, { replace: true });
  };

  const setQuery = (next) => {
    if (onHome) {
      updateParams((p) => (next ? p.set('q', next) : p.delete('q')));
    } else {
      const p = new URLSearchParams();
      if (next) p.set('q', next);
      navigate(`/?${p.toString()}`);
    }
  };

  // Validation explicite (Entrée ou loupe) : toujours retour à l'accueil.
  const submitSearch = (value) => {
    const p = onHome ? new URLSearchParams(params) : new URLSearchParams();
    if (value) p.set('q', value); else p.delete('q');
    navigate(`/?${p.toString()}`);
  };

  const setActiveTags = (tags) =>
    updateParams((p) => (tags.length ? p.set('tags', tags.join(',')) : p.delete('tags')));

  const setActiveCategory = (cat) =>
    updateParams((p) => (cat ? p.set('cat', cat) : p.delete('cat')));

  const resetFilters = () => updateParams((p) => { p.delete('tags'); p.delete('cat'); });

  const home = (
    <RecipeList
      recipes={recipes}
      query={query}
      activeTags={activeTags}
      onActiveTagsChange={setActiveTags}
      activeCategory={activeCategory}
      onActiveCategoryChange={setActiveCategory}
      onResetFilters={resetFilters}
    />
  );

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
          <Route path="/" element={home} />
          <Route path="/recipe/:id" element={<RecipeRoute />} />
          <Route path="*" element={home} />
        </Routes>
      </main>
    </>
  );
}
