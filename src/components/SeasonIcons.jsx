import { SEASONS, SEASON_ICONS, getSeasons } from '../data/recipesIndex';

// Saisons d'une recette sous forme d'icônes compactes (toutes les saisons
// -> une seule mention "Toute l'année").
export default function SeasonIcons({ recipe }) {
  const seasons = getSeasons(recipe);
  if (!seasons.length) return null;

  if (seasons.length === SEASONS.length) {
    return <span className="season-icons" title="Toute l'année">Toute l'année</span>;
  }

  const label = seasons.join(', ');
  return (
    <span className="season-icons" title={label} aria-label={`Saison : ${label}`}>
      {seasons.map((s) => <span key={s} aria-hidden="true">{SEASON_ICONS[s]}</span>)}
    </span>
  );
}
