'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', email: '', password: '', companyName: '', businessType: '',
  });
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

    if (authError) {
      setError(authError.message ?? 'Erro ao criar conta.');
      setLoading(false);
      return;
    }

    // user pode ser retornado mesmo sem confirmar email
    const userId = data.user?.id ?? data.session?.user?.id;
    if (!userId) {
      setError('Conta criada! Verifique o seu e-mail para confirmar e depois faça login.');
      setLoading(false);
      return;
    }

    const res = await fetch(`/api/tenants/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        companyName: form.companyName,
        businessType: form.businessType,
        userId,
      }),
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-green-600">Criar Conta</h1>
          <p className="text-gray-500 text-sm mt-1">Configure seu bot em minutos</p>
        </div>
        <form onSubmit={handleRegister} className="space-y-4">
          {[
            { name: 'name', label: 'Seu nome', placeholder: 'João Silva' },
            { name: 'email', label: 'E-mail', placeholder: 'joao@empresa.com', type: 'email' },
            { name: 'password', label: 'Senha', placeholder: '••••••••', type: 'password' },
            { name: 'companyName', label: 'Nome da empresa', placeholder: 'Empresa ABC' },
          ].map((f) => (
            <div key={f.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              <input
                type={f.type ?? 'text'}
                name={f.name}
                value={form[f.name as keyof typeof form]}
                onChange={handleChange}
                required
                placeholder={f.placeholder}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Segmento</label>
            <select
              name="businessType"
              value={form.businessType}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Selecione...</option>
              <option value="Varejo / E-commerce">Varejo / E-commerce</option>
              <option value="Saúde / Clínica">Saúde / Clínica</option>
              <option value="Educação / Cursos">Educação / Cursos</option>
              <option value="Advocacia / Jurídico">Advocacia / Jurídico</option>
              <option value="Imobiliária">Imobiliária</option>
              <option value="Restaurante / Delivery">Restaurante / Delivery</option>
              <option value="Outro">Outro</option>
            </select>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition"
          >
            {loading ? 'Criando conta...' : 'Criar conta e configurar bot'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Já tem conta?{' '}
          <a href="/login" className="text-green-600 hover:underline">Entrar</a>
        </p>
      </div>
    </div>
  );
}
