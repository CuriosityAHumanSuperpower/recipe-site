import { Link } from 'react-router-dom';

export default function RecipeCard({ recipe }) {
  return (
    <Link to={`/recipe/${recipe.id}`} className="recipe-card">
      <h3>{recipe.title}</h3>
      <p>{recipe.description}</p>
      <div className="tag-list">
        {recipe.tags?.slice(0, 4).map((t) => (
          <span className="tag-chip" key={t}>{t}</span>
        ))}
      </div>
      <div className="card-meta">
        <span>{recipe.ingredients?.length ?? 0} ingredients</span>
      </div>
    </Link>
  );
}
