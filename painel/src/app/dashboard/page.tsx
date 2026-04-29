import { createClient } from '@/lib/supabase-server';
import Link from 'next/link';

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
    .select('status')
    .eq('tenant_id', tenantUser?.tenant_id ?? '');

  const total = stats?.length ?? 0;
  const botActive = stats?.filter((c) => c.status === 'bot').length ?? 0;
  const humanActive = stats?.filter((c) => c.status === 'human').length ?? 0;

  const cards = [
    {
      label: 'Total de Atendimentos',
      value: total,
      icon: '💬',
      gradient: 'from-blue-500/20 to-cyan-500/10',
      border: 'border-blue-500/20',
      text: 'text-blue-300',
    },
    {
      label: 'Assistente Activo',
      value: botActive,
      icon: '🤖',
      gradient: 'from-green-500/20 to-emerald-500/10',
      border: 'border-green-500/20',
      text: 'text-green-300',
    },
    {
      label: 'Aguardando Equipa',
      value: humanActive,
      icon: '👤',
      gradient: 'from-orange-500/20 to-amber-500/10',
      border: 'border-orange-500/20',
      text: 'text-orange-300',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          {tenant ? `Olá, ${tenant.name} 👋` : 'Dashboard'}
        </h1>
        <p className="text-white/50 text-sm mt-1">
          Resumo do atendimento em tempo real
          {tenant && (
            <span className="ml-2 text-white/30">
              · Plano <span className="text-green-400 font-medium capitalize">{tenant.plan}</span>
            </span>
          )}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {cards.map((c) => (
          <div
            key={c.label}
            className={`glass-card p-6 bg-gradient-to-br ${c.gradient} border ${c.border}`}
          >
            <div className="flex items-start justify-between mb-4">
              <span className="text-2xl">{c.icon}</span>
              <span className={`text-4xl font-bold ${c.text}`}>{c.value}</span>
            </div>
            <p className="text-white/70 text-sm font-medium">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/dashboard/qrcode" className="glass-card p-6 hover:bg-white/[0.1] transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/15 border border-green-500/20 rounded-xl flex items-center justify-center group-hover:bg-green-500/25 transition-colors">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Conectar WhatsApp</p>
              <p className="text-white/40 text-xs mt-0.5">Gerar QR Code para ligar o assistente</p>
            </div>
            <svg className="ml-auto text-white/20 group-hover:text-white/50 transition-colors" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>
        </Link>

        <Link href="/dashboard/instrucoes" className="glass-card p-6 hover:bg-white/[0.1] transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-500/15 border border-purple-500/20 rounded-xl flex items-center justify-center group-hover:bg-purple-500/25 transition-colors">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 1 1 0 20A10 10 0 0 1 12 2z"/><path d="M12 8v4l3 3"/>
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Instruções do Assistente</p>
              <p className="text-white/40 text-xs mt-0.5">Definir como o assistente deve responder</p>
            </div>
            <svg className="ml-auto text-white/20 group-hover:text-white/50 transition-colors" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>
        </Link>

        <Link href="/dashboard/conversas" className="glass-card p-6 hover:bg-white/[0.1] transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/15 border border-blue-500/20 rounded-xl flex items-center justify-center group-hover:bg-blue-500/25 transition-colors">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Ver Conversas</p>
              <p className="text-white/40 text-xs mt-0.5">{total} atendimento{total !== 1 ? 's' : ''} registado{total !== 1 ? 's' : ''}</p>
            </div>
            <svg className="ml-auto text-white/20 group-hover:text-white/50 transition-colors" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>
        </Link>

        <Link href="/dashboard/treinamento" className="glass-card p-6 hover:bg-white/[0.1] transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500/15 border border-amber-500/20 rounded-xl flex items-center justify-center group-hover:bg-amber-500/25 transition-colors">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Treinar Assistente</p>
              <p className="text-white/40 text-xs mt-0.5">Enviar documentos e ficheiros</p>
            </div>
            <svg className="ml-auto text-white/20 group-hover:text-white/50 transition-colors" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>
        </Link>
      </div>
    </div>
  );
}
