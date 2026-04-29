import { createClient } from '@/lib/supabase-server';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: tenantUser } = await supabase
    .from('tenant_users')
    .select('tenant_id, tenants(name, slug, plan)')
    .eq('user_id', user!.id)
    .single();

  const tenant = tenantUser?.tenants as unknown as { name: string; slug: string; plan: string } | null;

  const { data: stats } = await supabase
    .from('conversations')
    .select('status', { count: 'exact' })
    .eq('tenant_id', tenantUser?.tenant_id ?? '');

  const total = stats?.length ?? 0;
  const botActive = stats?.filter((c) => c.status === 'bot').length ?? 0;
  const humanActive = stats?.filter((c) => c.status === 'human').length ?? 0;

  const cards = [
    { label: 'Total de atendimentos', value: total, color: 'text-blue-600 bg-blue-50', sub: 'conversas iniciadas' },
    { label: 'Assistente activo', value: botActive, color: 'text-green-600 bg-green-50', sub: 'respondendo automaticamente' },
    { label: 'Aguardando equipa', value: humanActive, color: 'text-orange-600 bg-orange-50', sub: 'transferidos para humano' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {tenant ? `Olá, ${tenant.name} 👋` : 'Dashboard'}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Aqui está um resumo do seu atendimento hoje.
          {tenant && (
            <span className="ml-2 text-gray-400">
              Plano <span className="font-medium text-gray-600 capitalize">{tenant.plan}</span>
            </span>
          )}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className={`rounded-2xl p-5 ${c.color}`}>
            <p className="text-sm font-medium opacity-70">{c.label}</p>
            <p className="text-4xl font-bold mt-1 mb-1">{c.value}</p>
            <p className="text-xs opacity-60">{c.sub}</p>
          </div>
        ))}
      </div>
      {total === 0 && (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-3">💬</div>
          <h3 className="font-semibold text-gray-700 mb-1">Ainda sem atendimentos</h3>
          <p className="text-gray-400 text-sm">
            Conecte o seu WhatsApp e comece a receber mensagens automaticamente.
          </p>
          <a
            href="/dashboard/qrcode"
            className="inline-block mt-4 bg-green-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition"
          >
            Conectar WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}
