import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuthStore } from '../store/auth.store';

export default function RegisterPage() {
  const navigate = useNavigate();
  const setToken = useAuthStore((s) => s.setToken);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await client.post<{ token: string }>('/auth/register', { name, email, password });
      setToken(data.token);
      navigate('/');
    } catch {
      setError('Kayıt başarısız. E-posta zaten kullanımda olabilir.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-sm slide-up">
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-violet-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-slate-900">OpsPulse</span>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 text-center mb-1">Hesap oluştur</h2>
        <p className="text-slate-500 text-sm text-center mb-8">2 dakikadan kısa sürede izlemeye başla</p>

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
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ad Soyad</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ahmet Yılmaz" required className="input-base" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">E-posta</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="siz@sirket.com" required className="input-base" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Şifre</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="En az 8 karakter" minLength={8} required className="input-base" />
            </div>
            <button type="submit" disabled={loading} className="w-full mt-1 btn-primary py-3 rounded-xl text-sm flex items-center justify-center">
              {loading
                ? <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                : 'Başla — ücretsiz'
              }
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-slate-500">
          Zaten hesabın var mı?{' '}
          <Link to="/login" className="text-sky-600 hover:text-sky-500 font-semibold transition-colors">Giriş yap →</Link>
        </p>
      </div>
    </div>
  );
}
