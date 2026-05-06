import { FormEvent, useState } from 'react';

interface Props {
  onAdd: (name: string, url: string) => Promise<void>;
  onClose: () => void;
}

export default function AddServerModal({ onAdd, onClose }: Props) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onAdd(name, url);
      onClose();
    } catch {
      setError('Failed to add server. Check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30 transition-all";

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="glass rounded-2xl p-6 w-full max-w-md shadow-2xl fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold text-white">Add Server</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Name</label>
            <input type="text" placeholder="Production API" value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">URL</label>
            <input type="url" placeholder="https://api.example.com/health" value={url} onChange={(e) => setUrl(e.target.value)} required className={inputClass} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl text-sm text-gray-400 hover:text-white bg-white/5 hover:bg-white/8 transition-all font-medium">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center"
            >
              {loading ? (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
              ) : 'Add server'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
