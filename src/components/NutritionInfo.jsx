// Apports estimés par portion (champ "nutrition" de la recette, optionnel).
// Les valeurs sont par portion : elles ne changent pas avec le nombre de
// personnes choisi.
// Virgule décimale (ex. 0,5 g pour un biscuit).
const fr = (n) => (typeof n === 'number' ? n.toLocaleString('fr-FR') : n);

export default function NutritionInfo({ nutrition }) {
  if (!nutrition) return null;
  const kcal = fr(nutrition.kcal);
  const protein = fr(nutrition.protein);
  const proteinAdjusted = fr(nutrition.proteinAdjusted);

  return (
    <div className="nutrition">
      <p className="nutrition-title">Par portion (estimation)</p>
      <dl className="nutrition-values">
        {kcal && (
          <div><dt>Énergie</dt><dd>≈ {kcal} kcal</dd></div>
        )}
        {protein && (
          <div><dt>Protéines</dt><dd>{protein} g</dd></div>
        )}
        {proteinAdjusted && (
          <div data-strong><dt>Assimilables</dt><dd>≈ {proteinAdjusted} g</dd></div>
        )}
      </dl>
      {proteinAdjusted && (
        <details className="nutrition-help">
          <summary>Comment c'est calculé ?</summary>
          <p>
            Les protéines végétales sont un peu moins bien digérées et moins
            complètes en acides aminés que les protéines animales. Chaque source
            est donc pondérée : œufs et laitages × 1, soja × 0,9, légumineuses
            × 0,8, céréales, oléagineux et légumes × 0,7.
          </p>
          <p>
            Repère : environ 1 g de protéines par kg de poids et par jour pour
            un adulte végétarien, soit 25 à 30 g assimilables par plat principal.
            Valeurs approximatives (± 15 %), calculées à partir de tables de
            composition moyennes.
          </p>
        </details>
      )}
    </div>
  );
}
