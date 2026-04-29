import { createClient } from '@/lib/supabase-server';

export default async function MasterClientesPage() {
  const supabase = await createClient();
  const { data: tenants } = await supabase
    .from('tenants')
    .select('id, name, slug, email, plan, active, created_at')
    .order('created_at', { ascending: false });

  const total = tenants?.length ?? 0;
  const activos = tenants?.filter((t) => t.active).length ?? 0;

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 bg-purple-500/20 border border-purple-500/30 rounded-xl flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Painel Master</h1>
            <p className="text-white/40 text-xs">Gestão de todos os clientes do Atende Bem</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total de Clientes', value: total, color: 'text-white' },
          { label: 'Clientes Activos', value: activos, color: 'text-green-400' },
          { label: 'Inactivos', value: total - activos, color: 'text-white/40' },
        ].map((s) => (
          <div key={s.label} className="glass-card p-4">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-white/40 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.08]">
          <p className="text-sm font-medium text-white/70">Todos os clientes</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Empresa', 'E-mail', 'Slug', 'Plano', 'Estado', 'Registado em'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-white/30 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tenants?.map((t) => (
                <tr key={t.id} className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{t.name}</td>
                  <td className="px-4 py-3 text-white/50 text-xs">{t.email}</td>
                  <td className="px-4 py-3">
                    <code className="text-xs text-green-400/70 bg-green-500/10 px-2 py-0.5 rounded-md">{t.slug}</code>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-white/60 bg-white/[0.08] border border-white/[0.1] px-2 py-0.5 rounded-md capitalize">{t.plan ?? 'free'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${t.active ? 'bg-green-500/15 text-green-400 border border-green-500/20' : 'bg-white/[0.06] text-white/30 border border-white/10'}`}>
                      {t.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/30 text-xs whitespace-nowrap">
                    {new Date(t.created_at).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
              {!tenants?.length && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-white/30 text-sm">Nenhum cliente registado ainda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
