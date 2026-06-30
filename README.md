# Petits Plats — Recipe Book

A lightweight, static React recipe book. No backend, no database — every
recipe is a plain JSON file in `src/data/recipes/`, bundled at build time and
served as static HTML/JS/CSS. Built with Vite + React + react-router
(HashRouter) so it deploys cleanly to GitHub Pages.

## Features

- Lazy (debounced) fuzzy search across title, description, ingredients and tags (Fuse.js), synced to the URL (`?q=...`) — works from any page (typing while viewing a recipe takes you back to the homepage with results), with a search icon button and a clear (×) button
- Tag filter pills, also synced to the URL (`?tag=...`) — clicking a tag on a recipe page jumps home already filtered
- Homepage is grouped into sections by `category` (Breakfast, Starter, Main, Side, Dessert, Snack, Drink — edit `src/data/categories.json` to rename/reorder/translate/prune), with a fixed left-hand page-summary nav that jumps straight to a section
- Recipes are ordered A–Z by an explicit `sortKey` field you set per recipe (e.g. "Classic Ratatouille" → `sortKey: "Ratatouille"` sorts under **R**) — see `utils/sortKey.js`
- Adjustable servings with **+ / −** stepper that rescales every ingredient quantity live, with clean EU-style rounding (g → kg, ml → l, nice fractions for spoons/eggs)
- Light and dark mode, remembered across visits (`localStorage`), defaults to the OS preference
- Card view and list view on the home page
- One JSON file per recipe — easy to read, diff, and review in pull requests — plus a `_template.json` to copy from (ignored by the app on purpose) and a `check-recipes` script to validate them
- Print-friendly recipe pages (`@media print`), tested for Safari/Firefox print quirks (color-adjust, `@page`, block layout instead of grid while printing)
- Responsive layout: single column on phones, two-column layout on tablet/desktop
- Gold accent palette, Roboto (light/regular) for body text, Roboto Slab for headings

## Project structure

```
src/
  data/
    recipes/                 # one .json file per recipe
      fluffy-pancakes.json
      classic-ratatouille.json
      _template.json         # copy me — ignored by the app (leading underscore)
    categories.json           # the 4 homepage sections (id + English label)
    tags.json                 # canonical tag order/spelling, single source of truth
    recipesIndex.js          # auto-discovers every non-underscore file in recipes/
  components/                # SearchBar, RecipeCard, RecipePage, ServingsControl, CategoryNav, ...
  utils/
    scale.js                 # quantity scaling + EU formatting
    useRecipeSearch.js        # debounced Fuse.js search hook
    theme.js                  # dark/light mode persistence
    sortKey.js                 # A-Z key-word ordering
scripts/
  check-recipes.mjs          # validates required fields, category, duplicate ids; prints sortKey
```

## Adding a new recipe

Copy `src/data/recipes/_template.json` to `src/data/recipes/your-recipe-id.json`
(drop the leading underscore) — it is picked up automatically (via
`import.meta.glob`), no other code changes needed. Files starting with `_`
are skipped on purpose, so the template itself never appears on the site.

```json
{
  "id": "your-recipe-id",
  "title": "Recipe Title",
  "description": "Short description shown on the card and recipe page.",
  "tags": ["vegetarian", "dinner"],
  "category": "main",
  "baseServings": 4,
  "prepTime": 15,
  "cookTime": 30,
  "createdAt": "2026-06-30",
  "ingredients": [
    { "name": "Flour", "amount": 250, "unit": "g" },
    { "name": "Eggs", "amount": 2, "unit": "" }
  ],
  "steps": ["Step one...", "Step two..."],
  "footnote": "Optional tip or variation."
}
```

`category` must be one of `breakfast`, `starter`, `main`, `side`, `dessert`,
`snack`, `drink` (see `src/data/categories.json` — edit that file to
rename/reorder/translate the sections, or remove ones you don't need).
`prepTime`/`cookTime` are in minutes and optional; the page shows prep,
cook, and a computed total. If you introduce a new tag, add it to
`src/data/tags.json` to control where it sorts in the filter row; unlisted
tags still work, they just sort alphabetically after the canonical ones.

`sortKey` is **required** and is exactly what the recipe alphabetizes under
on the homepage — it is not guessed from the title, since "use the last
word" breaks for titles that aren't "<adjective> <Dish>". Set it explicitly:
"Classic Ratatouille" → `"sortKey": "Ratatouille"`, "Fluffy Pancakes" →
`"sortKey": "Pancakes"`.

Run `npm run check-recipes` after adding or editing a recipe — it validates
required fields (including `category` and `sortKey`), checks `category` is
one of the allowed values, and flags duplicate ids.

Supported `unit` values for scaling: `g`, `kg`, `ml`, `l`, `tsp`, `tbsp`,
`pinch`, or `""` for unit-less countable items (eggs, onions...).

## Local development

```bash
npm install
npm run dev
```

## Build & deploy to GitHub Pages

This repo ships with a GitHub Actions workflow
(`.github/workflows/deploy.yml`) that builds and publishes automatically on
every push to `main`. To enable it:

1. Push this repo to GitHub.
2. In **Settings → Pages**, set "Build and deployment" source to **GitHub Actions**.
3. Push to `main` — the site will be live at `https://<user>.github.io/<repo>/`.

`vite.config.js` uses a relative base (`base: './'`) so the build works at
any sub-path without hardcoding the repository name, and `HashRouter` is used
so client-side routes (`/#/recipe/your-id`) work on GitHub Pages without a
custom 404 redirect.

Alternative: manual deploy with the `gh-pages` package (`npm run deploy`),
which pushes the `dist/` folder to a `gh-pages` branch.

---

## Recommendations

**Does a separate tags file make the page load faster?**
Not meaningfully, and it's worth being precise about why. Every recipe file
already gets bundled into the JS the browser downloads for the home page
(that's how the search and cards work), so `tags.json` doesn't let the app
skip loading any recipe data — it's only used here as a single source of
truth for tag *spelling and display order*, which is a maintainability win,
not a performance one. The real lever for a faster initial load, if the
recipe count grows into the hundreds, is **code-splitting**: lazy-load the
`RecipePage` route (`React.lazy(() => import('./components/RecipePage'))`)
so its code isn't in the home page's bundle, and/or split `recipesIndex.js`
so the home page only ships title/description/tags/id (enough for cards and
search) while full ingredients/steps load on demand when a recipe page
opens. At 2-50 recipes this is not worth the added complexity; it becomes
worth it once the bundle is visibly large (check with `npm run build` —
watch the `dist/assets/*.js` size) or once you're past a few hundred
recipes.

**Hosting & data**
- GitHub Pages is a great fit here precisely because there's no real
  database: recipes are static JSON bundled into the build. This is correct
  for a personal/small project. If recipes grow beyond a few hundred or you
  want multi-user editing, look at a headless CMS (e.g. a `content/` repo +
  Netlify CMS / Decap CMS) or a small serverless DB (Supabase, Firebase) —
  but for a recipe book maintained by one or a few people, flat files in git
  are simpler, free, fully versioned, and reviewable via pull requests.
- GitHub Pages limits to be aware of: ~1 GB repo size is comfortable for
  recipes (the constraint really only bites if you add many large photos —
  compress/resize images, e.g. WebP under 200 KB, and consider Git LFS or an
  external image host for anything larger), 100 GB/month soft bandwidth
  cap, and ~10 builds/hour via Actions. None of this is a concern at
  recipe-book scale.
- Add recipe photos later as `public/images/<recipe-id>.webp` and reference
  them in the JSON (`"image": "images/fluffy-pancakes.webp"`) rather than
  inlining base64 — keeps JSON diffs clean and images cacheable.

**Security**
- Static sites have a small attack surface, but still: never `dangerouslySetInnerHTML`
  recipe text (this app already renders everything as plain React text, which
  auto-escapes — keep it that way if you accept community recipe
  submissions via PRs).
- If you ever accept public submissions through a form (not just PRs),
  validate/sanitize JSON server-side or via a GitHub Action that runs a
  schema check before merge — don't trust client-submitted JSON blindly.
- Keep dependencies updated (`npm audit`, Dependabot) — low effort, since
  the dependency list here is intentionally small (react, react-router,
  fuse.js).
- Pin the GitHub Actions versions you trust (already done via `@v4`/`@v3`
  tags) and consider Dependabot for Actions too.

**Ergonomics / UX**
- Consider a JSON Schema (e.g. with `ajv`) plus a tiny `npm run validate`
  script + a CI check, so a malformed recipe file fails the build instead of
  silently breaking the site.
- Add a "print" stylesheet (`@media print`) for the recipe page — handy for
  kitchen use, and cheap to add given the layout is already clean.
- Consider `localStorage`-backed "favorites" or "last viewed servings" per
  recipe for a nicer return-visit experience — still no backend needed.
- Add `prefers-color-scheme: dark` support later if desired; the current
  design uses CSS variables, so a dark palette is a small additive change.
- For accessibility: the build already includes visible focus states and
  semantic landmarks; also double-check color contrast if you customize the
  palette, and add `alt` text once you introduce images.

**Best practices**
- One JSON file per recipe (as requested) makes it trivial to use
  GitHub's PR review and history per-recipe, and avoids any single huge file
  that's painful to diff.
- `import.meta.glob` auto-discovery means adding a recipe is a pure
  data change — no risk of forgetting to register a new file somewhere else.
- Keep the search index (Fuse.js) built from the same JSON at runtime, so
  there's no separate index to keep in sync.
- Consider lazy-loading recipe images (`loading="lazy"`) once added, and
  code-splitting the recipe page route if the dataset grows large
  (`React.lazy` + `Suspense`) — not necessary yet at this scale, but easy to
  retrofit.
