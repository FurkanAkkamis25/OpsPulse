import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuthStore } from '../store/auth.store';

export default function LoginPage() {
  const navigate = useNavigate();
  const setToken = useAuthStore((s) => s.setToken);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await client.post<{ token: string }>('/auth/login', { email, password });
      setToken(data.token);
      navigate('/');
    } catch {
      setError('Geçersiz e-posta veya şifre.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left — branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-sky-500 to-violet-600 p-14 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10" />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-white/10" />
        <div className="absolute top-1/2 right-0 w-48 h-48 rounded-full bg-white/5" />

        <div className="relative flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-white">OpsPulse</span>
        </div>

        <div className="relative space-y-8">
          <div>
            <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
              Her şeyi izle.<br />Hiçbir şeyi kaçırma.
            </h1>
            <p className="text-sky-100 text-lg leading-relaxed">
              Arızaları olmadan önce tahmin eden yapay zeka destekli altyapı izleme platformu.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Çalışma süresi', value: '99.9%' },
              { label: 'Ort. yanıt', value: '42ms' },
              { label: 'Gönderilen uyarı', value: '12K+' },
            ].map((s) => (
              <div key={s.label} className="bg-white/15 backdrop-blur rounded-2xl p-4">
                <p className="text-2xl font-extrabold text-white">{s.value}</p>
                <p className="text-xs text-sky-100 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {['Gerçek zamanlı çalışma süresi izleme', 'Yapay Zeka Sağlık Skoru tahmini', 'İç ağ ajanları', 'Firebase anlık uyarılar'].map((f) => (
              <div key={f} className="flex items-center gap-3 text-sky-100 text-sm">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-sky-200 text-xs">© 2026 OpsPulse</p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm slide-up">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-violet-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-slate-900">OpsPulse</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-1">Tekrar hoş geldin</h2>
          <p className="text-slate-500 text-sm mb-8">Paneline giriş yap</p>

          <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-200">
            {error && (
              <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">E-posta</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="siz@sirket.com" required className="input-base" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Şifre</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="input-base" />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-1 btn-primary py-3 rounded-xl text-sm flex items-center justify-center gap-2"
              >
                {loading
                  ? <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                  : <>Giriş yap <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg></>
                }
              </button>
            </form>
          </div>

          <p className="mt-5 text-center text-sm text-slate-500">
            Hesabın yok mu?{' '}
            <Link to="/register" className="text-sky-600 hover:text-sky-500 font-semibold transition-colors">Ücretsiz kaydol →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
