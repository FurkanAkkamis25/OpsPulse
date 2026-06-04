interface Props { score: number | null }

export default function HealthBadge({ score }: Props) {
  if (score === null) {
    return (
      <div className="w-12 h-12 rounded-full border-2 border-slate-200 bg-slate-50 flex items-center justify-center">
        <span className="text-xs text-slate-400 font-medium">—</span>
      </div>
    );
  }

  const isGood   = score >= 70;
  const isMed    = score >= 40;
  const color    = isGood ? '#10b981' : isMed ? '#f59e0b' : '#ef4444';
  const bgClass  = isGood ? 'text-emerald-600' : isMed ? 'text-amber-500' : 'text-red-500';

  const r = 16;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div className="relative w-12 h-12 flex items-center justify-center" title={`Health: ${Math.round(score)}`}>
      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r={r} fill="none" stroke="#e2e8f0" strokeWidth="2.5" />
        <circle
          cx="20" cy="20" r={r} fill="none" strokeWidth="2.5"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          stroke={color}
          style={{ transition: 'stroke-dasharray 0.7s ease' }}
        />
      </svg>
      <span className={`absolute text-xs font-bold ${bgClass}`}>{Math.round(score)}</span>
    </div>
  );
}
