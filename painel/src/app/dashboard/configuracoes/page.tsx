'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';

interface TenantConfig {
  bot_name: string;
  bot_greeting: string;
}

export default function ConfiguracoesPage() {
  const [config, setConfig] = useState<TenantConfig>({ bot_name: '', bot_greeting: '' });
  const [tenantId, setTenantId] = useState<string>('');
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
        setConfig({ bot_name: t.bot_name ?? '', bot_greeting: t.bot_greeting ?? '' });
      }
    };
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from('tenants')
      .update({ bot_name: config.bot_name, bot_greeting: config.bot_greeting })
      .eq('id', tenantId);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Configurações</h1>
      <p className="text-gray-500 text-sm mb-6">Personalize como o seu assistente se apresenta aos clientes.</p>
      <form onSubmit={handleSave} className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome do assistente</label>
          <input
            type="text"
            value={config.bot_name}
            onChange={(e) => setConfig((c) => ({ ...c, bot_name: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            placeholder="Ex: Sofia, Max, Assistente..."
          />
          <p className="text-xs text-gray-400 mt-1">Este é o nome com que o assistente se vai apresentar.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem de boas-vindas</label>
          <textarea
            value={config.bot_greeting}
            onChange={(e) => setConfig((c) => ({ ...c, bot_greeting: e.target.value }))}
            rows={4}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition resize-none"
            placeholder="Olá! Sou o assistente virtual da [Empresa]. Como posso ajudar?"
          />
          <p className="text-xs text-gray-400 mt-1">Enviada automaticamente na primeira mensagem do cliente.</p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="bg-green-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition"
        >
          {saving ? 'A guardar...' : saved ? '✓ Guardado com sucesso!' : 'Guardar configurações'}
        </button>
      </form>
    </div>
  );
}
