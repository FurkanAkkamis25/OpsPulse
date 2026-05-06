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

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">OpsPulse</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">{up}/{servers.length} up</span>
          {lastUpdated && (
            <span className="text-xs text-gray-600">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button onClick={logout} className="text-sm text-gray-400 hover:text-white transition-colors">
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Servers</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={refresh}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Refresh
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              + Add server
            </button>
          </div>
        </div>

        {loading && <p className="text-gray-500 text-sm">Loading…</p>}

        {!loading && servers.length === 0 && (
          <p className="text-gray-600 text-sm">No servers yet. Add one to start monitoring.</p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {servers.map((server) => (
            <ServerCard
              key={server.id}
              server={server}
              onDelete={deleteServer}
              onUpdateThreshold={updateThreshold}
            />
          ))}
        </div>
      </main>

      {showModal && (
        <AddServerModal onAdd={addServer} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
