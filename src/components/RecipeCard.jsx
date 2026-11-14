import { Link } from 'react-router-dom';
import TimeStats from './TimeStats';
import SeasonIcons from './SeasonIcons';
import { getNonSeasonTags } from '../data/recipesIndex';

export default function RecipeCard({ recipe }) {
  return (
    <Link to={`/recipe/${recipe.id}`} className="recipe-card">
      <div className="card-head">
        <h3>{recipe.title}</h3>
        <SeasonIcons recipe={recipe} />
      </div>
      <TimeStats recipe={recipe} compact />
      <div className="tag-list">
        {getNonSeasonTags(recipe).map((t) => (
          <span className="tag-chip" key={t}>{t}</span>
        ))}
      </div>
    </Link>
  );
}
