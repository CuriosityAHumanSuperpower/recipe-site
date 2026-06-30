#!/usr/bin/env node
// Validates every recipe JSON file (skips files starting with "_", e.g. the
// template) and reports problems before they reach the live site:
//   - missing required fields
//   - "category" not one of the allowed values in src/data/categories.json
//   - duplicate "id"
//   - shows the auto-derived A-Z sortKey for each recipe so you can sanity
//     check it (and override with an explicit "sortKey" field if it's wrong)
//
// Usage: node scripts/check-recipes.mjs

import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const recipesDir = join(__dirname, '../src/data/recipes');
const categories = JSON.parse(readFileSync(join(__dirname, '../src/data/categories.json'), 'utf8'));
const allowedCategories = categories.map((c) => c.id);

const REQUIRED_FIELDS = ['id', 'title', 'description', 'tags', 'category', 'sortKey', 'baseServings', 'ingredients', 'steps'];

const files = readdirSync(recipesDir).filter((f) => f.endsWith('.json') && !f.startsWith('_'));

let errors = 0;
const seenIds = new Set();

console.log(`Checking ${files.length} recipe file(s)...\n`);

for (const file of files) {
  const full = join(recipesDir, file);
  const recipe = JSON.parse(readFileSync(full, 'utf8'));
  const problems = [];

  for (const field of REQUIRED_FIELDS) {
    if (recipe[field] === undefined || recipe[field] === null || recipe[field] === '') {
      problems.push(`missing required field "${field}"`);
    }
  }

  if (recipe.category && !allowedCategories.includes(recipe.category)) {
    problems.push(`category "${recipe.category}" is not one of: ${allowedCategories.join(', ')}`);
  }

  if (recipe.id) {
    if (seenIds.has(recipe.id)) problems.push(`duplicate id "${recipe.id}"`);
    seenIds.add(recipe.id);
  }

  if (problems.length) {
    errors += problems.length;
    console.log(`✗ ${file}`);
    problems.forEach((p) => console.log(`    - ${p}`));
  } else {
    console.log(`✓ ${file}  (category: ${recipe.category}, sortKey: "${recipe.sortKey}")`);
  }
}

console.log('');
if (errors) {
  console.error(`${errors} problem(s) found.`);
  process.exit(1);
} else {
  console.log('All recipes look good.');
}
