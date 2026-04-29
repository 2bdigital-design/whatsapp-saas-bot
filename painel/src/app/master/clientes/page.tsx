import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

export default async function MasterClientesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const MASTER_EMAIL = process.env.NEXT_PUBLIC_MASTER_EMAIL ?? '';
  if (user.email !== MASTER_EMAIL) redirect('/dashboard');

  const { data: tenants } = await supabase
    .from('tenants')
    .select('id, name, slug, email, plan, active, created_at')
    .order('created_at', { ascending: false });

  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500 text-sm mt-1">
            {tenants?.length ?? 0} clientes cadastrados ·{' '}
            {tenants?.filter((t) => t.active).length ?? 0} activos
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b">
              <tr>
                <th className="text-left px-5 py-3.5 font-medium">Empresa</th>
                <th className="text-left px-5 py-3.5 font-medium">E-mail</th>
                <th className="text-left px-5 py-3.5 font-medium">Instância</th>
                <th className="text-left px-5 py-3.5 font-medium">Plano</th>
                <th className="text-left px-5 py-3.5 font-medium">Estado</th>
                <th className="text-left px-5 py-3.5 font-medium">Criado em</th>
              </tr>
            </thead>
            <tbody>
              {tenants?.map((t) => (
                <tr key={t.id} className="border-t hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-gray-900">{t.name}</td>
                  <td className="px-5 py-3.5 text-gray-500">{t.email}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-gray-400">{t.slug}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-1 rounded-full text-xs bg-blue-100 text-blue-700 font-medium capitalize">
                      {t.plan}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${t.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {t.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">
                    {new Date(t.created_at).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
              {!tenants?.length && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-gray-400">
                    Nenhum cliente cadastrado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
