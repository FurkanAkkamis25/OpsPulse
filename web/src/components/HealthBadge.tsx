interface Props { score: number | null }

export default function HealthBadge({ score }: Props) {
  if (score === null) return <span className="text-gray-500 text-xs">No data</span>;

  const color =
    score >= 70 ? 'text-green-400' :
    score >= 40 ? 'text-yellow-400' :
    'text-red-400';

  return <span className={`font-bold text-lg ${color}`}>{score.toFixed(0)}</span>;
}
