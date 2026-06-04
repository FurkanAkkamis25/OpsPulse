import { Alert } from '../hooks/useServers';

const TYPE_CONFIG: Record<string, { label: string; text: string; bg: string; border: string; dot: string }> = {
  DOWN:              { label: 'Çevrimdışı',   text: 'text-red-600',     bg: 'bg-red-50',     border: 'border-red-200',     dot: 'bg-red-500' },
  RECOVERED:         { label: 'Kurtarıldı',  text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  THRESHOLD_BREACH:  { label: 'Yavaş',       text: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-200',   dot: 'bg-amber-500' },
  PREDICTED_FAILURE: { label: 'YZ Uyarısı',  text: 'text-violet-600',  bg: 'bg-violet-50',  border: 'border-violet-200',  dot: 'bg-violet-500' },
};
const fallback = { label: 'Bilgi', text: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', dot: 'bg-slate-400' };

export default function AlertPanel({ alerts }: { alerts: Alert[] }) {
  if (alerts.length === 0) {
    return (
      <div className="flex items-center gap-2 py-2 text-slate-400 text-xs">
        <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Uyarı yok — her şey yolunda
      </div>
    );
  }

  return (
    <ul className="space-y-1.5 max-h-44 overflow-y-auto scrollbar-hide">
      {alerts.map((alert) => {
        const c = TYPE_CONFIG[alert.type] ?? fallback;
        return (
          <li key={alert.id} className={`flex items-start gap-2.5 p-2.5 rounded-xl ${c.bg} border ${c.border}`}>
            <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
            <div className="min-w-0">
              <span className={`text-xs font-bold ${c.text}`}>{c.label}</span>
              <p className="text-xs text-slate-600 mt-0.5">{alert.message}</p>
              <p className="text-xs text-slate-400 mt-0.5">{new Date(alert.sentAt).toLocaleString()}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
