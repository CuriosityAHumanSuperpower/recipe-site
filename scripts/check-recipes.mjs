#!/usr/bin/env node
// Vérifie chaque fichier recette (sauf ceux qui commencent par "_", comme le
// modèle) avant qu'une erreur n'arrive sur le site :
//   - champs obligatoires, catégorie connue, id unique et égal au nom du fichier
//   - unités connues, quantités numériques (ou null pour "au goût"…)
//   - tags : orthographe connue (src/data/tags.json), au moins une saison
//   - quantités écrites en dur dans les étapes (elles ne suivraient pas le
//     nombre de portions) -> avertissement
//
// Usage : npm run check-recipes   (lancé aussi automatiquement avant le build)

import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { KNOWN_UNITS } from '../src/utils/scale.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '../src/data');
const recipesDir = join(dataDir, 'recipes');
const categories = JSON.parse(readFileSync(join(dataDir, 'categories.json'), 'utf8'));
const tagGroups = JSON.parse(readFileSync(join(dataDir, 'tags.json'), 'utf8'));
const allowedCategories = categories.map((c) => c.id);
const knownTags = new Set(tagGroups.flatMap((g) => g.tags));
const SEASONS = ['printemps', 'été', 'automne', 'hiver'];

const REQUIRED_FIELDS = ['id', 'title', 'description', 'tags', 'category', 'sortKey', 'baseServings', 'ingredients', 'steps'];

// "200 g", "2 cuillères", "400 ml", "les 3 jaunes"… dans le texte d'une étape.
// Ignoré : une taille unitaire ("boules d'environ 8 g") et les durées
// ("les 5 dernières minutes").
const HARDCODED_QTY = /(?<!environ )\b\d+(?:[.,]\d+)?\s?(?:g|kg|ml|cl|l|cuill[eè]res?|c\.\s?à)\b|\bles \d+ (?!(?:dernières|premières|minutes))/i;

const files = readdirSync(recipesDir).filter((f) => f.endsWith('.json') && !f.startsWith('_'));

let errors = 0;
let warnings = 0;
const seenIds = new Set();

console.log(`Vérification de ${files.length} recette(s)…\n`);

for (const file of files) {
  let recipe;
  try {
    recipe = JSON.parse(readFileSync(join(recipesDir, file), 'utf8'));
  } catch (e) {
    console.log(`✗ ${file}\n    - JSON invalide : ${e.message}`);
    errors += 1;
    continue;
  }
  const problems = [];
  const warns = [];

  for (const field of REQUIRED_FIELDS) {
    if (recipe[field] === undefined || recipe[field] === null || recipe[field] === '') {
      problems.push(`champ obligatoire manquant : "${field}"`);
    }
  }

  if (recipe.category && !allowedCategories.includes(recipe.category)) {
    problems.push(`catégorie "${recipe.category}" inconnue (attendu : ${allowedCategories.join(', ')})`);
  }

  if (recipe.id) {
    if (seenIds.has(recipe.id)) problems.push(`id en double : "${recipe.id}"`);
    if (`${recipe.id}.json` !== file) warns.push(`l'id "${recipe.id}" ne correspond pas au nom du fichier`);
    seenIds.add(recipe.id);
  }

  if (!Number.isInteger(recipe.baseServings) || recipe.baseServings < 1 || recipe.baseServings > 100) {
    problems.push('"baseServings" doit être un entier entre 1 et 100');
  }

  for (const t of ['prepTime', 'cookTime', 'restTime']) {
    if (recipe[t] !== undefined && (typeof recipe[t] !== 'number' || recipe[t] < 0)) {
      problems.push(`"${t}" doit être un nombre de minutes`);
    }
  }

  (recipe.ingredients ?? []).forEach((ing, i) => {
    const where = `ingrédient ${i + 1} (${ing.name ?? '?'})`;
    if (!ing.name) problems.push(`${where} : nom manquant`);
    if (ing.amount === null) {
      if (!ing.unit) problems.push(`${where} : quantité null sans texte dans "unit" (ex. "au goût")`);
      return;
    }
    if (typeof ing.amount !== 'number' || ing.amount <= 0) {
      problems.push(`${where} : "amount" doit être un nombre > 0 (ou null avec "unit": "au goût")`);
    }
    if (!KNOWN_UNITS.includes(ing.unit ?? '')) {
      problems.push(`${where} : unité "${ing.unit}" inconnue (attendu : ${KNOWN_UNITS.map((u) => `"${u}"`).join(', ')})`);
    }
  });

  (recipe.tags ?? []).forEach((t) => {
    if (!knownTags.has(t)) warns.push(`tag "${t}" absent de src/data/tags.json (faute de frappe ?)`);
  });
  if (!SEASONS.some((s) => recipe.tags?.includes(s))) {
    warns.push('aucun tag de saison (mettre les 4 saisons si la recette se fait toute l\'année)');
  }

  (recipe.steps ?? []).forEach((s, i) => {
    const m = s.match(HARDCODED_QTY);
    if (m) warns.push(`étape ${i + 1} : quantité écrite en dur « ${m[0].trim()} » — elle ne suivra pas le nombre de portions`);
  });

  errors += problems.length;
  warnings += warns.length;
  if (problems.length || warns.length) {
    console.log(`${problems.length ? '✗' : '!'} ${file}`);
    problems.forEach((p) => console.log(`    ✗ ${p}`));
    warns.forEach((w) => console.log(`    ! ${w}`));
  } else {
    console.log(`✓ ${file}  (catégorie : ${recipe.category}, sortKey : "${recipe.sortKey}")`);
  }
}

console.log('');
if (warnings) console.log(`${warnings} avertissement(s).`);
if (errors) {
  console.error(`${errors} erreur(s) trouvée(s).`);
  process.exit(1);
} else {
  console.log('Aucune erreur.');
}
