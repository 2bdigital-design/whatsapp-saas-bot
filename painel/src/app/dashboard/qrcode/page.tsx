'use client';
import { useState, useEffect } from 'react';

export default function WhatsAppSetupPage() {
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [accessToken, setAccessToken]     = useState('');
  const [loading, setLoading]             = useState(false);
  const [checking, setChecking]           = useState(true);
  const [connected, setConnected]         = useState(false);
  const [error, setError]                 = useState('');
  const [success, setSuccess]             = useState(false);

  useEffect(() => {
    fetch('/api/status')
      .then(r => r.json())
      .then(d => { if (d.connected) setConnected(true); })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  const handleSave = async () => {
    setError('');
    setSuccess(false);
    if (!phoneNumberId.trim() || !accessToken.trim()) {
      setError('Preencha todos os campos.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/whatsapp-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumberId: phoneNumberId.trim(), accessToken: accessToken.trim() }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? 'Erro ao salvar');
      }
      setSuccess(true);
      setConnected(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro desconhecido');
    }
    setLoading(false);
  };

  if (checking) {
    return (
      <div className="max-w-lg mx-auto flex items-center justify-center py-20">
        <div className="text-white/40 text-sm">A verificar ligação...</div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Conectar WhatsApp</h1>
        <p className="text-white/50 text-sm mt-1">
          WhatsApp Business Cloud API — API oficial da Meta
        </p>
      </div>

      {connected && !success ? (
        /* ── JÁ CONFIGURADO ── */
        <div className="glass-card p-8 flex flex-col items-center gap-6">
          <div className="w-20 h-20 bg-green-500/15 border border-green-500/30 rounded-full flex items-center justify-center">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div className="text-center">
            <p className="text-green-400 font-bold text-xl">WhatsApp Configurado!</p>
            <p className="text-white/40 text-sm mt-2">O assistente está pronto para receber mensagens.</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-green-400/70">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            API activa
          </div>
          <button
            className="btn-ghost text-sm"
            onClick={() => { setConnected(false); setSuccess(false); }}
          >
            ✏️ Atualizar credenciais
          </button>
        </div>
      ) : success ? (
        /* ── SUCESSO APÓS SALVAR ── */
        <div className="glass-card p-8 flex flex-col items-center gap-6">
          <div className="w-20 h-20 bg-green-500/15 border border-green-500/30 rounded-full flex items-center justify-center">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div className="text-center">
            <p className="text-green-400 font-bold text-xl">Credenciais salvas!</p>
            <p className="text-white/40 text-sm mt-2">
              Lembre-se de configurar o webhook na Meta:<br/>
              <code className="text-white/60 text-xs mt-1 block">
                https://api.atende-bem.online/webhook/meta
              </code>
            </p>
          </div>
        </div>
      ) : (
        /* ── FORMULÁRIO ── */
        <div className="glass-card p-8 flex flex-col gap-5">
          {/* Instruções */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-xs text-blue-200 leading-relaxed">
            <p className="font-semibold text-blue-300 mb-2">📋 Como obter as credenciais:</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-200/80">
              <li>Aceda a <strong>developers.facebook.com</strong></li>
              <li>Crie uma App → WhatsApp → WhatsApp Business API</li>
              <li>Em <strong>API Setup</strong>, copie o <em>Phone Number ID</em></li>
              <li>Copie o <em>Temporary access token</em> (ou gere um permanente)</li>
              <li>Configure o webhook para:<br/>
                <code className="text-blue-300">https://api.atende-bem.online/webhook/meta</code>
              </li>
              <li>Token de verificação: use o valor de <code>WEBHOOK_SECRET</code> no backend</li>
            </ol>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-white/60 text-xs font-medium">Phone Number ID</label>
            <input
              type="text"
              value={phoneNumberId}
              onChange={e => setPhoneNumberId(e.target.value)}
              placeholder="Ex: 123456789012345"
              className="w-full bg-white/[0.07] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/30 font-mono"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-white/60 text-xs font-medium">Access Token</label>
            <textarea
              value={accessToken}
              onChange={e => setAccessToken(e.target.value)}
              placeholder="EAAxxxxx..."
              rows={3}
              className="w-full bg-white/[0.07] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/30 font-mono resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-300 text-xs px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                A guardar...
              </span>
            ) : 'Guardar e Activar'}
          </button>
        </div>
      )}

      <div className="mt-4 glass-card p-4">
        <p className="text-white/40 text-xs leading-relaxed">
          <strong className="text-white/60">Porquê a Cloud API?</strong>{' '}
          É a API oficial do WhatsApp/Meta, funciona em qualquer servidor, sem bloqueios de IP,
          e é gratuita para os primeiros 1.000 conversas por mês.
        </p>
      </div>
    </div>
  );
}
