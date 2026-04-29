'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', companyName: '', businessType: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const supabase = createClient();

    const { data, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });

    if (authError) { setError(authError.message); setLoading(false); return; }

    const userId = data.user?.id ?? data.session?.user?.id;
    if (!userId) {
      setError('Conta criada! Verifique o e-mail para confirmar e depois faça login.');
      setLoading(false);
      return;
    }

    const res = await fetch('/api/tenants/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, userId }),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.error ?? 'Erro ao configurar empresa.');
      setLoading(false);
      return;
    }

    router.push('/dashboard/qrcode');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-2xl mb-4 shadow-lg shadow-green-500/30 glow-green">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">Crie a sua conta</h1>
          <p className="text-white/50 text-sm mt-1">Configure o seu assistente em minutos</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleRegister} className="space-y-4">
            {[
              { name: 'name', label: 'O seu nome', placeholder: 'João Silva' },
              { name: 'email', label: 'E-mail', placeholder: 'joao@empresa.com', type: 'email' },
              { name: 'password', label: 'Senha', placeholder: '••••••••', type: 'password' },
              { name: 'companyName', label: 'Nome da empresa', placeholder: 'Empresa ABC' },
            ].map((f) => (
              <div key={f.name}>
                <label className="block text-sm font-medium text-white/80 mb-2">{f.label}</label>
                <input
                  type={f.type ?? 'text'}
                  name={f.name}
                  value={form[f.name as keyof typeof form]}
                  onChange={handleChange}
                  required
                  placeholder={f.placeholder}
                  className="glass-input"
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Segmento</label>
              <select
                name="businessType"
                value={form.businessType}
                onChange={handleChange}
                required
                className="glass-input bg-slate-900/50 [&>option]:bg-slate-900 [&>option]:text-white"
              >
                <option value="">Selecione o segmento...</option>
                {['Varejo / E-commerce','Saúde / Clínica','Educação / Cursos','Advocacia / Jurídico','Imobiliária','Restaurante / Delivery','Beleza / Estética','Outro'].map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            {error && (
              <div className="bg-red-500/15 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Criando conta...' : 'Começar agora — é grátis'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-white/40 mt-6">
          Já tem conta?{' '}
          <Link href="/login" className="text-green-400 hover:text-green-300 font-medium transition-colors">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
