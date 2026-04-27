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
    { label: 'Total de conversas', value: total, color: 'text-blue-600 bg-blue-50' },
    { label: 'Com bot ativo', value: botActive, color: 'text-green-600 bg-green-50' },
    { label: 'Aguardando humano', value: humanActive, color: 'text-orange-600 bg-orange-50' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-1">
        {tenant ? `Olá, ${tenant.name}` : 'Dashboard'}
      </h1>
      <p className="text-gray-500 text-sm mb-8">
        Plano: <span className="font-medium capitalize">{tenant?.plan ?? '—'}</span>
        {tenant && <span className="ml-3 text-gray-400">Instância: {tenant.slug}</span>}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className={`rounded-xl p-5 ${c.color}`}>
            <p className="text-sm font-medium opacity-80">{c.label}</p>
            <p className="text-3xl font-bold mt-1">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
