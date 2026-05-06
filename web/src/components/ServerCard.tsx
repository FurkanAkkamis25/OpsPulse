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

  useEffect(() => {
    fetchPingLogs(server.id, 100).then((logs: PingLog[]) => setUptime(calcUptime(logs)));
    fetchAlerts(server.id).then(setAlerts);
  }, [server.id]);

  const recentAlertCount = alerts.filter(
    (a) => Date.now() - new Date(a.sentAt).getTime() < 24 * 60 * 60 * 1000
  ).length;

  const saveThreshold = () => {
    const val = parseInt(thresholdInput, 10);
    if (!isNaN(val) && val > 0) onUpdateThreshold(server.id, val);
    setEditThreshold(false);
  };

  const uptimeColor =
    uptime === null    ? 'text-gray-600' :
    uptime >= 99       ? 'text-green-400' :
    uptime >= 95       ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="glass rounded-2xl overflow-hidden fade-in group">
      {/* Status stripe */}
      <div className={`h-0.5 w-full ${server.isActive ? 'bg-gradient-to-r from-green-500/0 via-green-400 to-green-500/0' : 'bg-gradient-to-r from-red-500/0 via-red-400/50 to-red-500/0'}`} />

      <div className="p-5 space-y-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${server.isActive ? 'bg-green-400 pulse-dot' : 'bg-red-400/50'}`} />
              <p className="font-semibold text-white truncate text-sm">{server.name}</p>
            </div>
            <p className="text-gray-600 text-xs truncate pl-3.5">{server.url}</p>
          </div>
          <HealthBadge score={server.healthScore} />
        </div>

        {/* Metrics row */}
        <div className="grid grid-cols-3 gap-2">
          <MetricPill label="Uptime" value={uptime !== null ? `${uptime}%` : '—'} className={uptimeColor} />
          <MetricPill
            label="Threshold"
            value={server.threshold ? `${server.threshold}ms` : 'AI'}
            className="text-brand-400"
          />
          <MetricPill
            label="Alerts 24h"
            value={String(recentAlertCount)}
            className={recentAlertCount > 0 ? 'text-red-400' : 'text-gray-500'}
          />
        </div>

        {/* Threshold inline edit */}
        {editThreshold && (
          <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
            <input
              type="number"
              value={thresholdInput}
              onChange={(e) => setThresholdInput(e.target.value)}
              className="flex-1 bg-transparent text-white text-xs focus:outline-none"
              placeholder="ms"
            />
            <button onClick={saveThreshold} className="text-xs text-brand-400 font-semibold hover:text-brand-300">Save</button>
            <button onClick={() => setEditThreshold(false)} className="text-xs text-gray-600 hover:text-gray-400">✕</button>
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center gap-1 pt-1 border-t border-white/5">
          <ActionBtn
            onClick={() => { setExpanded((p) => !p); setShowAlerts(false); }}
            active={expanded}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5h18M3 7.5h18" />
            </svg>
            Chart
          </ActionBtn>

          <ActionBtn
            onClick={() => { setShowAlerts((p) => !p); setExpanded(false); }}
            active={showAlerts}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            Alerts {recentAlertCount > 0 && <span className="bg-red-400/20 text-red-400 text-xs px-1 rounded">{recentAlertCount}</span>}
          </ActionBtn>

          <ActionBtn onClick={() => setEditThreshold((p) => !p)} active={editThreshold}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            </svg>
            Threshold
          </ActionBtn>

          <button
            onClick={() => onDelete(server.id)}
            className="ml-auto p-1.5 text-gray-700 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all text-xs"
            title="Remove server"
          >
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

function MetricPill({ label, value, className }: { label: string; value: string; className: string }) {
  return (
    <div className="bg-white/3 rounded-xl px-3 py-2 text-center">
      <p className="text-gray-600 text-xs mb-0.5">{label}</p>
      <p className={`text-sm font-semibold ${className}`}>{value}</p>
    </div>
  );
}

function ActionBtn({ onClick, active, children }: { onClick: () => void; active: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
        active ? 'bg-brand-500/20 text-brand-400' : 'text-gray-600 hover:text-gray-300 hover:bg-white/5'
      }`}
    >
      {children}
    </button>
  );
}
