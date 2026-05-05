import { useState } from 'react';
import { Server } from '../hooks/useServers';
import HealthBadge from './HealthBadge';
import LatencyChart from './LatencyChart';

interface Props {
  server: Server;
  onDelete: (id: string) => void;
  onUpdateThreshold: (id: string, threshold: number) => void;
}

export default function ServerCard({ server, onDelete, onUpdateThreshold }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [editThreshold, setEditThreshold] = useState(false);
  const [thresholdInput, setThresholdInput] = useState(String(server.threshold ?? ''));

  const saveThreshold = () => {
    const val = parseInt(thresholdInput, 10);
    if (!isNaN(val) && val > 0) onUpdateThreshold(server.id, val);
    setEditThreshold(false);
  };

  return (
    <div className="bg-gray-900 rounded-2xl p-5 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-semibold text-white truncate">{server.name}</p>
          <p className="text-gray-500 text-xs truncate">{server.url}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <HealthBadge score={server.healthScore} />
          <span className={`w-2.5 h-2.5 rounded-full ${server.isActive ? 'bg-green-400' : 'bg-gray-600'}`} />
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs text-gray-400">
        <span>
          Threshold:{' '}
          {editThreshold ? (
            <span className="inline-flex items-center gap-1">
              <input
                type="number"
                value={thresholdInput}
                onChange={(e) => setThresholdInput(e.target.value)}
                className="w-20 bg-gray-800 text-white rounded px-2 py-0.5 text-xs focus:outline-none"
              />
              ms
              <button onClick={saveThreshold} className="text-brand-500 hover:underline ml-1">Save</button>
            </span>
          ) : (
            <span>
              {server.threshold ? `${server.threshold} ms` : 'AI default'}
              <button onClick={() => setEditThreshold(true)} className="ml-2 text-brand-500 hover:underline">Edit</button>
            </span>
          )}
        </span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setExpanded((p) => !p)}
          className="text-xs text-gray-400 hover:text-white transition-colors"
        >
          {expanded ? 'Hide chart' : 'Show chart'}
        </button>
        <button
          onClick={() => onDelete(server.id)}
          className="text-xs text-red-500 hover:text-red-400 transition-colors ml-auto"
        >
          Remove
        </button>
      </div>

      {expanded && (
        <LatencyChart serverId={server.id} threshold={server.threshold} />
      )}
    </div>
  );
}
