# Petits Plats — Livre de recettes

Un livre de recettes statique et léger en React. Pas de serveur ni de base de
données : chaque recette est un simple fichier JSON dans
`src/data/recipes/`, intégré au build et servi en HTML/JS/CSS statique sur
GitHub Pages. Construit avec Vite + React + react-router (HashRouter).

## Fonctionnalités

- Recherche floue (Fuse.js) sur le titre, la description, les ingrédients, les
  tags et la catégorie, insensible aux accents (« pates » trouve « Pâtes »),
  synchronisée avec l'URL (`?q=...`) et disponible depuis toutes les pages.
- Filtres groupés (Catégorie, Saison, Régime, Autre), cumulables : « été » +
  « végétalien » ne montre que les recettes qui ont les deux. Synchronisés avec
  l'URL (`?tags=été,végétalien&cat=main`). Repliés par défaut sur téléphone.
- Cartes de l'accueil : durées (préparation, cuisson, repos, total) et saisons
  en icônes. Vue cartes ou liste (mémorisée).
- Tag `rapide` ajouté automatiquement quand le temps total est ≤ 30 min.
- Page recette : titre collant sous l'en-tête, sélecteur de portions (1 à 100,
  pas de 10 pour les grosses recettes) qui recalcule toutes les quantités
  (g → kg, ml → l, fractions pour les cuillères, virgule décimale), option
  « Garder l'écran allumé » pendant qu'on cuisine.
- Ingrédients et étapes à cocher au fil de la recette. Le nombre de portions
  choisi est mémorisé par recette ; les cases cochées aussi, pendant 12 h
  (`localStorage`, propre à chaque navigateur — `utils/useRecipeProgress.js`).
- Mode clair/sombre mémorisé, mise en page adaptée au téléphone, impression
  propre des recettes.

## Structure

```
src/
  data/
    recipes/             # un fichier .json par recette (+ _template.json, ignoré)
    categories.json      # sections de l'accueil (id + libellé)
    tags.json            # vocabulaire des tags, par groupe (Saison, Régime, Autre)
    recipesIndex.js      # charge les recettes, ajoute les tags calculés
  components/            # RecipeList, RecipeCard, RecipePage, TagFilterRow…
  utils/
    scale.js             # mise à l'échelle + affichage des quantités et durées
    useRecipeSearch.js   # recherche Fuse.js
scripts/
  check-recipes.mjs      # validation des recettes (lancée avant chaque build)
```

## Ajouter une recette

Copier `src/data/recipes/_template.json` vers
`src/data/recipes/mon-id.json` (sans le `_`) et le remplir : il est détecté
automatiquement. Le modèle documente chaque champ. Les points importants :

- **Unités** : `g`, `kg`, `ml`, `cl`, `l`, `"cuillère à soupe"`,
  `"cuillère à café"`, `"pincée"`, `"poignée"`, `"cm"`, ou `""` pour ce qui se
  compte (œufs, oignons). Pour une quantité non chiffrée : `"amount": null`
  avec un texte dans `unit` (`"au goût"`, `"un filet"`).
- **Pas de quantité dans les étapes** (« 200 g de sucre ») : elle ne suivrait
  pas le nombre de portions. Écrire « le sucre », « la moitié de l'huile ».
  `{portions}` dans une étape est remplacé par le nombre choisi.
- **Saisons** : `printemps`, `été`, `automne`, `hiver` selon les fruits et
  légumes de saison ; les 4 si la recette se fait toute l'année (affiché
  « Toute l'année »).
- **Champs optionnels** : `restTime` (repos, en minutes, compté dans le
  total), `servingsLabel` (« Parts », « Galettes »…), `servingsNote` (taille
  du moule…), `footnote`.
- `sortKey` est obligatoire : c'est le mot de classement A-Z
  (« Ratatouille classique » → `"Ratatouille"`).

Lancer `npm run check-recipes` : il signale les champs manquants, unités ou
tags inconnus, catégories invalides, id en double, et les quantités écrites
en dur dans les étapes. Il tourne aussi automatiquement avant chaque
`npm run build` — une erreur bloque donc le déploiement au lieu de casser le
site en ligne.

## Développement

```bash
npm install
npm run dev
```

## Déploiement sur GitHub Pages

Le workflow `.github/workflows/deploy.yml` construit et publie le site à
chaque push sur `main` (Settings → Pages → source : **GitHub Actions**).
`vite.config.js` utilise une base relative (`base: './'`) et le site utilise
`HashRouter` (`/#/recipe/mon-id`), ce qui évite toute configuration de
redirection sur GitHub Pages.
