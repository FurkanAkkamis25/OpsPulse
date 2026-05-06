interface Props { score: number | null }

export default function HealthBadge({ score }: Props) {
  if (score === null) return <span className="text-xs text-gray-600 font-medium">—</span>;

  const color =
    score >= 70 ? 'text-green-400' :
    score >= 40 ? 'text-yellow-400' :
                  'text-red-400';

  const ring =
    score >= 70 ? 'stroke-green-400' :
    score >= 40 ? 'stroke-yellow-400' :
                  'stroke-red-400';

  const circumference = 2 * Math.PI * 14;
  const dash = (score / 100) * circumference;

  return (
    <div className="relative w-10 h-10 flex items-center justify-center" title={`Health score: ${score}`}>
      <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white/5" />
        <circle
          cx="18" cy="18" r="14" fill="none" strokeWidth="2.5"
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
          className={`${ring} transition-all duration-700`}
        />
      </svg>
      <span className={`absolute text-xs font-bold ${color}`}>{Math.round(score)}</span>
    </div>
  );
}
