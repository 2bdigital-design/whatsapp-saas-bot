'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';

interface TenantConfig { bot_name: string; bot_greeting: string; }

export default function ConfiguracoesPage() {
  const [config, setConfig] = useState<TenantConfig>({ bot_name: '', bot_greeting: '' });
  const [tenantId, setTenantId] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: tu } = await supabase
        .from('tenant_users')
        .select('tenant_id, tenants(bot_name, bot_greeting)')
        .eq('user_id', user.id)
        .single();
      if (tu) {
        const t = tu.tenants as unknown as TenantConfig;
        setTenantId(tu.tenant_id as string);
        setConfig({ bot_name: t?.bot_name ?? '', bot_greeting: t?.bot_greeting ?? '' });
      }
    };
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    await supabase.from('tenants').update({ bot_name: config.bot_name, bot_greeting: config.bot_greeting }).eq('id', tenantId);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Configurações</h1>
        <p className="text-white/50 text-sm mt-1">Personalize como o assistente se apresenta.</p>
      </div>

      <form onSubmit={handleSave} className="glass-card p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">Nome do assistente</label>
          <input
            type="text"
            value={config.bot_name}
            onChange={(e) => setConfig((c) => ({ ...c, bot_name: e.target.value }))}
            className="glass-input"
            placeholder="Ex: Sofia, Max, Assistente Virtual..."
          />
          <p className="text-xs text-white/30 mt-1.5">Nome com que o assistente se apresenta aos clientes.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">Mensagem de boas-vindas</label>
          <textarea
            value={config.bot_greeting}
            onChange={(e) => setConfig((c) => ({ ...c, bot_greeting: e.target.value }))}
            rows={5}
            className="glass-input resize-none"
            placeholder="Olá! Sou o assistente virtual da [Empresa]. Como posso ajudar?"
          />
          <p className="text-xs text-white/30 mt-1.5">Enviada automaticamente na primeira mensagem de cada cliente.</p>
        </div>

        <div className="flex items-center justify-between pt-2">
          {saved && (
            <span className="text-green-400 text-sm flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Guardado!
            </span>
          )}
          <div className="ml-auto">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'A guardar...' : 'Guardar alterações'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
