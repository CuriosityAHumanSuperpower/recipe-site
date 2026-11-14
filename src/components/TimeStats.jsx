import { formatDuration, getTimes } from '../utils/scale';

// Durées de préparation / cuisson / (repos) / total. "compact" pour les cartes.
export default function TimeStats({ recipe, compact = false }) {
  const { prep, cook, rest, total } = getTimes(recipe);
  if (!total) return null;

  const items = [
    { label: 'Prép.', value: formatDuration(prep) },
    { label: 'Cuisson', value: cook ? formatDuration(cook) : 'aucune' },
  ];
  if (rest) items.push({ label: 'Repos', value: formatDuration(rest) });
  items.push({ label: 'Total', value: formatDuration(total), strong: true });

  return (
    <dl className={compact ? 'time-stats time-stats-compact' : 'time-stats'} data-count={items.length}>
      {items.map((it) => (
        <div className="time-stat" key={it.label} data-strong={it.strong || undefined}>
          <dt className="label">{it.label}</dt>
          <dd className="value">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}
