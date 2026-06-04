import { useEffect, useState } from 'react';
import { Server, Alert, PingLog, calcUptime, fetchPingLogs, fetchAlerts } from '../hooks/useServers';
import HealthBadge from './HealthBadge';
import LatencyChart from './LatencyChart';
import AlertPanel from './AlertPanel';

interface Props {
  server: Server;
  onDelete: (id: string) => void;
  onUpdateThreshold: (id: string, threshold: number) => void;
}

export default function ServerCard({ server, onDelete, onUpdateThreshold }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [editThreshold, setEditThreshold] = useState(false);
  const [thresholdInput, setThresholdInput] = useState(String(server.threshold ?? ''));
  const [uptime, setUptime] = useState<number | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [logs, setLogs] = useState<PingLog[]>([]);

  useEffect(() => {
    fetchPingLogs(server.id, 100).then((l: PingLog[]) => { setUptime(calcUptime(l)); setLogs(l); });
    fetchAlerts(server.id).then(setAlerts);
  }, [server.id]);

  const recentAlerts = alerts.filter((a) => Date.now() - new Date(a.sentAt).getTime() < 86400000).length;
  const lastLatency = logs.find((l) => l.isUp && l.latency !== null)?.latency ?? null;

  const saveThreshold = () => {
    const val = parseInt(thresholdInput, 10);
    if (!isNaN(val) && val > 0) onUpdateThreshold(server.id, val);
    setEditThreshold(false);
  };

  const isUp = server.isActive;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden fade-in card-hover">
      {/* Status stripe */}
      <div className={`h-1 w-full ${isUp ? 'bg-emerald-400' : 'bg-red-400'}`} />

      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`w-2 h-2 rounded-full shrink-0 ${isUp ? 'bg-emerald-400 pulse-dot' : 'bg-red-400'}`} />
              <p className="font-bold text-slate-800 truncate text-sm">{server.name}</p>
              {server.type === 'INTERNAL' && (
                <span className="text-xs bg-violet-50 text-violet-600 border border-violet-200 px-2 py-0.5 rounded-full font-medium shrink-0">
                  via Agent
                </span>
              )}
            </div>
            <p className="text-slate-400 text-xs truncate pl-4">{server.url}</p>
          </div>
          <HealthBadge score={server.healthScore} />
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-2">
          <Metric label="Çalışma Süresi"
            value={uptime !== null ? `${uptime}%` : '—'}
            color={uptime === null ? 'slate' : uptime >= 99 ? 'emerald' : uptime >= 95 ? 'amber' : 'red'} />
          <Metric label="Gecikme"
            value={lastLatency !== null ? `${lastLatency}ms` : '—'}
            color="sky" />
          <Metric label="Uyarı 24s"
            value={String(recentAlerts)}
            color={recentAlerts > 0 ? 'red' : 'slate'} />
        </div>

        {/* Threshold edit */}
        {editThreshold && (
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
            <svg className="w-3.5 h-3.5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <input type="number" value={thresholdInput} onChange={(e) => setThresholdInput(e.target.value)}
              className="flex-1 bg-transparent text-slate-700 text-xs focus:outline-none" placeholder="ms" />
            <button onClick={saveThreshold} className="text-xs text-sky-600 font-bold hover:text-sky-500">Kaydet</button>
            <button onClick={() => setEditThreshold(false)} className="text-xs text-slate-400 hover:text-slate-600">✕</button>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 pt-1 border-t border-slate-100">
          <Btn active={expanded} onClick={() => { setExpanded(p => !p); setShowAlerts(false); }}
            icon={<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5h18M3 7.5h18" /></svg>}>
            Grafik
          </Btn>
          <Btn active={showAlerts} onClick={() => { setShowAlerts(p => !p); setExpanded(false); }}
            icon={<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>}>
            Uyarılar {recentAlerts > 0 && <span className="bg-red-100 text-red-600 text-xs px-1.5 rounded-full font-bold">{recentAlerts}</span>}
          </Btn>
          <Btn active={editThreshold} onClick={() => setEditThreshold(p => !p)}
            icon={<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>}>
            Eşik Değeri
          </Btn>
          <button onClick={() => onDelete(server.id)}
            className="ml-auto p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>

        {expanded && <LatencyChart serverId={server.id} threshold={server.threshold} />}
        {showAlerts && <AlertPanel alerts={alerts} />}
      </div>
    </div>
  );
}

type MetricColor = 'emerald' | 'amber' | 'red' | 'sky' | 'slate';
const metricColors: Record<MetricColor, string> = {
  emerald: 'text-emerald-600',
  amber:   'text-amber-500',
  red:     'text-red-500',
  sky:     'text-sky-600',
  slate:   'text-slate-400',
};

function Metric({ label, value, color }: { label: string; value: string; color: MetricColor }) {
  return (
    <div className="bg-slate-50 rounded-xl px-3 py-2.5 text-center border border-slate-100">
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      <p className={`text-sm font-bold ${metricColors[color]}`}>{value}</p>
    </div>
  );
}

function Btn({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${
        active
          ? 'bg-sky-50 text-sky-600 border-sky-200'
          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 border-transparent'
      }`}>
      {icon}{children}
    </button>
  );
}
