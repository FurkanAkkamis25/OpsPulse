import { FormEvent, useState } from 'react';
import { Agent } from '../hooks/useAgents';

interface Props {
  agents: Agent[];
  onAdd: (name: string, url: string, type: 'EXTERNAL' | 'INTERNAL', agentId?: string) => Promise<void>;
  onClose: () => void;
}

export default function AddServerModal({ agents, onAdd, onClose }: Props) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<'EXTERNAL' | 'INTERNAL'>('EXTERNAL');
  const [agentId, setAgentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (type === 'INTERNAL' && !agentId) { setError('Lütfen bir ajan seçin.'); return; }
    setLoading(true); setError('');
    try {
      await onAdd(name, url, type, type === 'INTERNAL' ? agentId : undefined);
      onClose();
    } catch {
      setError('Sunucu eklenemedi. URL\'yi kontrol edip tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 w-full max-w-md slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold text-slate-800">İzleyici Ekle</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          {/* Type toggle */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tür</label>
            <div className="grid grid-cols-2 gap-2">
              {(['EXTERNAL', 'INTERNAL'] as const).map((t) => (
                <button key={t} type="button" onClick={() => { setType(t); setAgentId(''); }}
                  className={`py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                    type === t
                      ? t === 'EXTERNAL'
                        ? 'bg-sky-50 border-sky-300 text-sky-700'
                        : 'bg-violet-50 border-violet-300 text-violet-700'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                  }`}>
                  {t === 'EXTERNAL' ? '🌐 Harici' : '🔒 Dahili'}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400">
              {type === 'EXTERNAL'
                ? 'Herkese açık — OpsPulse doğrudan ping atar.'
                : 'Güvenlik duvarı arkasında — ağınızdaki bir ajan ping atar.'}
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">İsim</label>
            <input type="text" placeholder="Canlı API" value={name} onChange={e => setName(e.target.value)} required className="input-base" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">URL</label>
            <input type="url"
              placeholder={type === 'INTERNAL' ? 'http://internal-api:8080/health' : 'https://api.example.com/health'}
              value={url} onChange={e => setUrl(e.target.value)} required className="input-base" />
          </div>

          {type === 'INTERNAL' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ajan</label>
              {agents.length === 0 ? (
                <div className="px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm">
                  Henüz ajan yok. Önce Ajanlar panelinden bir tane oluşturun.
                </div>
              ) : (
                <select value={agentId} onChange={e => setAgentId(e.target.value)} required className="input-base cursor-pointer">
                  <option value="" disabled>Ajan seçin…</option>
                  {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 transition-all font-semibold border border-slate-200">
              İptal
            </button>
            <button type="submit" disabled={loading || (type === 'INTERNAL' && agents.length === 0)}
              className="flex-1 py-3 btn-primary rounded-xl text-sm flex items-center justify-center">
              {loading
                ? <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                : 'İzleyici ekle'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
