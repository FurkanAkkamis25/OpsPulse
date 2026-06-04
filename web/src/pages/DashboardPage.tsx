import { useState } from 'react';
import { useAuthStore } from '../store/auth.store';
import { useServers } from '../hooks/useServers';
import { useAgents, Agent } from '../hooks/useAgents';
import ServerCard from '../components/ServerCard';
import AddServerModal from '../components/AddServerModal';

export default function DashboardPage() {
  const logout = useAuthStore((s) => s.logout);
  const { servers, loading, lastUpdated, addServer, deleteServer, updateThreshold, refresh } = useServers();
  const { agents, createAgent, deleteAgent } = useAgents();
  const [showModal, setShowModal] = useState(false);

  const up = servers.filter((s) => s.isActive).length;
  const down = servers.length - up;
  const avgHealth = servers.length
    ? Math.round(servers.reduce((acc, s) => acc + (s.healthScore ?? 0), 0) / servers.length)
    : null;

  const overallOk = servers.length > 0 && down === 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-15 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-violet-500 flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <span className="font-extrabold text-slate-800 text-lg tracking-tight">OpsPulse</span>
            {servers.length > 0 && (
              <span className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                overallOk
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-red-50 text-red-600 border-red-200'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full pulse-dot ${overallOk ? 'bg-emerald-500' : 'bg-red-500'}`} />
                {overallOk ? 'Tüm sistemler çalışıyor' : `${down} çevrimdışı`}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {lastUpdated && <span className="text-xs text-slate-400 hidden md:block">Güncellendi: {lastUpdated.toLocaleTimeString()}</span>}
            <button onClick={refresh} className="p-2 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-all" title="Refresh">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button onClick={logout} className="text-xs text-slate-500 hover:text-slate-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100 border border-transparent hover:border-slate-200">
              Çıkış yap
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 fade-in">
          <StatCard label="Toplam İzleyici" value={servers.length} icon={<ServerIcon />} accent="sky" />
          <StatCard label="Çevrimiçi" value={up} icon={<UpIcon />} accent="emerald" sub={up > 0 ? 'Canlı' : undefined} />
          <StatCard label="Çevrimdışı" value={down} icon={<DownIcon />} accent={down > 0 ? 'red' : 'slate'} alert={down > 0} />
          <StatCard label="Ort. Sağlık" value={avgHealth ?? '—'} suffix={avgHealth !== null ? '/100' : undefined} icon={<HeartIcon />}
            accent={avgHealth === null ? 'slate' : avgHealth >= 70 ? 'emerald' : avgHealth >= 40 ? 'amber' : 'red'} />
        </div>

        {/* Agents */}
        <AgentPanel agents={agents} onCreate={createAgent} onDelete={deleteAgent} />

        {/* Monitors */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-800">İzleyiciler</h2>
              <p className="text-xs text-slate-400 mt-0.5">{servers.length} sunucu takip ediliyor</p>
            </div>
            <button onClick={() => setShowModal(true)}
              className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              İzleyici ekle
            </button>
          </div>

          {loading && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl h-48 animate-pulse border border-slate-200" />)}
            </div>
          )}

          {!loading && servers.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-16 text-center fade-in">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-50 to-violet-50 border border-slate-200 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
                </svg>
              </div>
              <h3 className="text-slate-700 font-bold text-base mb-2">Henüz izleyici yok</h3>
              <p className="text-slate-400 text-sm mb-6">Çalışma süresi, gecikme ve yapay zeka sağlık skorlarını takip etmek için ilk sunucuyu ekle.</p>
              <button onClick={() => setShowModal(true)}
                className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                İlk izleyicini ekle
              </button>
            </div>
          )}

          {!loading && servers.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {servers.map((server, i) => (
                <div key={server.id} style={{ animationDelay: `${i * 50}ms` }}>
                  <ServerCard server={server} onDelete={deleteServer} onUpdateThreshold={updateThreshold} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {showModal && <AddServerModal agents={agents} onAdd={addServer} onClose={() => setShowModal(false)} />}
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────────────

type Accent = 'sky' | 'emerald' | 'red' | 'amber' | 'slate';
const accentMap: Record<Accent, { value: string; icon: string; sub: string; dot: string }> = {
  sky:     { value: 'text-sky-600',     icon: 'bg-sky-50 text-sky-500',     sub: 'text-sky-500',     dot: 'bg-sky-400' },
  emerald: { value: 'text-emerald-600', icon: 'bg-emerald-50 text-emerald-500', sub: 'text-emerald-500', dot: 'bg-emerald-400' },
  red:     { value: 'text-red-600',     icon: 'bg-red-50 text-red-500',     sub: 'text-red-500',     dot: 'bg-red-400' },
  amber:   { value: 'text-amber-600',   icon: 'bg-amber-50 text-amber-500', sub: 'text-amber-500',   dot: 'bg-amber-400' },
  slate:   { value: 'text-slate-700',   icon: 'bg-slate-100 text-slate-400', sub: 'text-slate-400',  dot: 'bg-slate-300' },
};

function StatCard({ label, value, icon, accent = 'slate', suffix, sub, alert }: {
  label: string; value: string | number; icon: React.ReactNode;
  accent?: Accent; suffix?: string; sub?: string; alert?: boolean;
}) {
  const a = accentMap[accent];
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5 fade-in card-hover">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <div className={`w-8 h-8 rounded-xl ${a.icon} flex items-center justify-center`}>{icon}</div>
      </div>
      <div className="flex items-end gap-1">
        <span className={`text-3xl font-extrabold ${a.value} ${alert ? 'animate-pulse' : ''}`}>{value}</span>
        {suffix && <span className="text-sm text-slate-400 mb-1">{suffix}</span>}
      </div>
      {sub && (
        <div className={`mt-1.5 flex items-center gap-1.5 text-xs font-medium ${a.sub}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${a.dot} pulse-dot`} />{sub}
        </div>
      )}
    </div>
  );
}

// ── Agent Panel ────────────────────────────────────────────────────────────────

function AgentPanel({ agents, onCreate, onDelete }: {
  agents: Agent[];
  onCreate: (name: string) => Promise<Agent>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [latestAgent, setLatestAgent] = useState<Agent | null>(null);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const a = await onCreate(newName.trim());
      setNewName('');
      setLatestAgent(a);
    } finally { setCreating(false); }
  };

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const dockerCmd = (a: Agent) =>
    `docker run -d --name opspulse-agent \\\n  -e OPSPULSE_URL=https://your-opspulse-domain \\\n  -e AGENT_KEY=${a.apiKey} \\\n  ghcr.io/your-org/opspulse-agent:latest`;

  const onlineCount = agents.filter((a) => a.lastSeen && Date.now() - new Date(a.lastSeen).getTime() < 90_000).length;

  return (
    <div className={`bg-white rounded-2xl border shadow-card transition-colors ${expanded ? 'border-violet-200' : 'border-slate-200'}`}>
      <button onClick={() => setExpanded(v => !v)} className="w-full flex items-center justify-between px-6 py-4 text-left">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-violet-50 border border-violet-200 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" />
            </svg>
          </div>
          <span className="text-sm font-bold text-slate-700">Dahili Ajanlar</span>
          <span className="text-xs text-slate-400 hidden sm:block">— özel ağınızdaki toplayıcılar</span>
          <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">{agents.length}</span>
          {onlineCount > 0 && (
            <span className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-emerald-500 pulse-dot" />{onlineCount} çevrimiçi
            </span>
          )}
        </div>
        <svg className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="px-6 pb-6 border-t border-slate-100 pt-5 space-y-4">
          {/* Create */}
          <div className="flex gap-2">
            <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              placeholder="Ajan adı (ör. Ofis Ağı, AWS VPC)"
              className="flex-1 input-base" />
            <button onClick={handleCreate} disabled={creating || !newName.trim()}
              className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors">
              {creating ? '…' : 'Oluştur'}
            </button>
          </div>

          {/* New key */}
          {latestAgent && (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5 space-y-4 slide-up">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                </svg>
                <p className="text-sm font-bold text-emerald-700">Ajan oluşturuldu — API anahtarını şimdi kaydet</p>
              </div>
              <p className="text-xs text-emerald-600">Bu anahtar yalnızca bir kez gösterilir. Kapatmadan önce kopyala.</p>
              <div>
                <p className="text-xs text-slate-500 mb-1.5 font-semibold uppercase tracking-wider">API Anahtarı</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs text-emerald-700 bg-white rounded-xl px-3 py-2.5 break-all font-mono border border-emerald-200">
                    {latestAgent.apiKey}
                  </code>
                  <button onClick={() => copy(latestAgent.apiKey, 'key')}
                    className={`shrink-0 text-xs font-bold px-3 py-2.5 rounded-xl border transition-all ${copiedId === 'key' ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
                    {copiedId === 'key' ? '✓ Kopyalandı' : 'Kopyala'}
                  </button>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1.5 font-semibold uppercase tracking-wider">Docker komutu</p>
                <div className="flex items-start gap-2">
                  <pre className="flex-1 text-xs text-slate-700 bg-white rounded-xl px-3 py-2.5 overflow-x-auto font-mono border border-slate-200 whitespace-pre">
                    {dockerCmd(latestAgent)}
                  </pre>
                  <button onClick={() => copy(dockerCmd(latestAgent), 'docker')}
                    className={`shrink-0 text-xs font-bold px-3 py-2.5 rounded-xl border transition-all ${copiedId === 'docker' ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
                    {copiedId === 'docker' ? '✓' : 'Kopyala'}
                  </button>
                </div>
              </div>
              <button onClick={() => setLatestAgent(null)} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Kapat</button>
            </div>
          )}

          {/* List */}
          {agents.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">Henüz ajan yok.</p>
          ) : (
            <div className="space-y-2">
              {agents.map((agent) => {
                const lastSeen = agent.lastSeen ? new Date(agent.lastSeen) : null;
                const online = lastSeen && Date.now() - lastSeen.getTime() < 90_000;
                return (
                  <div key={agent.id} className={`flex items-center justify-between rounded-xl px-4 py-3 border transition-colors ${online ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${online ? 'bg-emerald-500 pulse-dot' : 'bg-slate-300'}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-700 truncate">{agent.name}</p>
                        <p className="text-xs text-slate-400">
                          {agent._count.servers} sunucu •{' '}
                          {online ? <span className="text-emerald-600 font-medium">Çevrimiçi</span>
                            : lastSeen ? `son görülme: ${lastSeen.toLocaleTimeString()}`
                            : 'hiç bağlanmadı'}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => onDelete(agent.id)}
                      className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all ml-3 shrink-0">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Icons ──────────────────────────────────────────────────────────────────────
const ServerIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 17.25v.75a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25v-.75m19.5 0A2.25 2.25 0 0021.75 15H2.25a2.25 2.25 0 00-2.25 2.25m19.5 0V15M2.25 15H21.75M2.25 15V6.75A2.25 2.25 0 014.5 4.5h15A2.25 2.25 0 0121.75 6.75V15" /></svg>;
const UpIcon   = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" /></svg>;
const DownIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" /></svg>;
const HeartIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>;
