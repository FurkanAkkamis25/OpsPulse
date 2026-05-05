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
      setError('Failed to add server. Check the URL.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <form onSubmit={submit} className="bg-gray-900 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
        <h2 className="text-lg font-semibold text-white">Add Server</h2>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <input
          type="text"
          placeholder="Name (e.g. Production API)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded-lg bg-gray-800 text-white placeholder-gray-500 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <input
          type="url"
          placeholder="URL (e.g. https://api.example.com/health)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          className="w-full rounded-lg bg-gray-800 text-white placeholder-gray-500 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Adding…' : 'Add'}
          </button>
        </div>
      </form>
    </div>
  );
}
