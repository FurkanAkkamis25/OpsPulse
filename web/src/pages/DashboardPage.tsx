import { useState } from 'react';
import { useAuthStore } from '../store/auth.store';
import { useServers } from '../hooks/useServers';
import ServerCard from '../components/ServerCard';
import AddServerModal from '../components/AddServerModal';

export default function DashboardPage() {
  const logout = useAuthStore((s) => s.logout);
  const { servers, loading, lastUpdated, addServer, deleteServer, updateThreshold, refresh } = useServers();
  const [showModal, setShowModal] = useState(false);

  const up = servers.filter((s) => s.isActive).length;
  const down = servers.length - up;
  const avgHealth = servers.length
    ? Math.round(servers.reduce((acc, s) => acc + (s.healthScore ?? 0), 0) / servers.length)
    : null;

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Top glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative border-b border-white/5 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
              <svg className="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <span className="font-bold text-white tracking-tight">OpsPulse</span>
          </div>

          <div className="flex items-center gap-4">
            {lastUpdated && (
              <span className="text-xs text-gray-600 hidden sm:block">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={refresh}
              className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all"
              title="Refresh"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              onClick={logout}
              className="text-xs text-gray-500 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 fade-in">
          <StatCard label="Total Servers" value={servers.length} icon="server" />
          <StatCard label="Online" value={up} icon="up" color="green" />
          <StatCard label="Offline" value={down} icon="down" color={down > 0 ? 'red' : 'gray'} />
          <StatCard label="Avg Health" value={avgHealth !== null ? `${avgHealth}` : '—'} icon="health"
            color={avgHealth === null ? 'gray' : avgHealth >= 70 ? 'green' : avgHealth >= 40 ? 'yellow' : 'red'} />
        </div>

        {/* Server section */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-white">Servers</h2>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add server
            </button>
          </div>

          {loading && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass rounded-2xl h-36 animate-pulse" />
              ))}
            </div>
          )}

          {!loading && servers.length === 0 && (
            <div className="glass rounded-2xl p-12 text-center fade-in">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">No servers yet. Add one to start monitoring.</p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {servers.map((server) => (
              <ServerCard
                key={server.id}
                server={server}
                onDelete={deleteServer}
                onUpdateThreshold={updateThreshold}
              />
            ))}
          </div>
        </div>
      </main>

      {showModal && (
        <AddServerModal onAdd={addServer} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}

type StatColor = 'green' | 'red' | 'yellow' | 'gray';

function StatCard({ label, value, icon, color = 'gray' }: { label: string; value: string | number; icon: string; color?: StatColor }) {
  const colorMap: Record<StatColor, string> = {
    green:  'text-green-400',
    red:    'text-red-400',
    yellow: 'text-yellow-400',
    gray:   'text-white',
  };

  const iconMap: Record<string, JSX.Element> = {
    server: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 17.25v.75a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25v-.75m19.5 0A2.25 2.25 0 0021.75 15H2.25a2.25 2.25 0 00-2.25 2.25m19.5 0V15M2.25 15H21.75M2.25 15V6.75A2.25 2.25 0 014.5 4.5h15A2.25 2.25 0 0121.75 6.75V15" />
      </svg>
    ),
    up: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
      </svg>
    ),
    down: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
      </svg>
    ),
    health: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
  };

  return (
    <div className="glass rounded-2xl p-5 fade-in">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</span>
        <span className="text-gray-600">{iconMap[icon]}</span>
      </div>
      <span className={`text-2xl font-bold ${colorMap[color]}`}>{value}</span>
    </div>
  );
}
