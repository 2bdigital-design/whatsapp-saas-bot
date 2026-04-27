import { createClient } from '@/lib/supabase-server';
import Link from 'next/link';

export default async function ConversasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: tenantUser } = await supabase
    .from('tenant_users')
    .select('tenant_id')
    .eq('user_id', user!.id)
    .single();

  const { data: conversations } = await supabase
    .from('conversations')
    .select('id, phone, status, updated_at')
    .eq('tenant_id', tenantUser?.tenant_id ?? '')
    .order('updated_at', { ascending: false })
    .limit(50);

  const statusColor: Record<string, string> = {
    bot: 'bg-green-100 text-green-700',
    human: 'bg-orange-100 text-orange-700',
    closed: 'bg-gray-100 text-gray-500',
  };
  const statusLabel: Record<string, string> = {
    bot: 'Bot', human: 'Humano', closed: 'Encerrada',
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Conversas</h1>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Telefone</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Última atividade</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {conversations?.map((c) => (
              <tr key={c.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-mono">{c.phone}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[c.status] ?? ''}`}>
                    {statusLabel[c.status] ?? c.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(c.updated_at).toLocaleString('pt-BR')}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/dashboard/conversas/${c.id}`}
                    className="text-green-600 hover:underline text-xs">Ver</Link>
                </td>
              </tr>
            ))}
            {!conversations?.length && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                  Nenhuma conversa ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
