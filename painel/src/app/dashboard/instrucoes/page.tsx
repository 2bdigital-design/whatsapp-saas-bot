'use client';
import { useState, useEffect } from 'react';

const PLACEHOLDER = `Exemplos do que pode escrever aqui:

• "Responde sempre em português europeu, de forma educada e profissional."
• "Nunca divulgues preços sem antes perguntar a localização do cliente."
• "Se o cliente perguntar sobre horários, informa que estamos abertos de Segunda a Sexta das 9h às 18h."
• "Quando o cliente diz 'falar com humano', transfira imediatamente a conversa."
• "A empresa chama-se [Nome] e vende [produto/serviço]."
• "Tom de voz: simpático, directo e conciso. Máximo 3 frases por resposta."`;

export default function InstrucoesPage() {
  const [instrucoes, setInstrucoes] = useState('');
  const [original, setOriginal] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/instrucoes')
      .then((r) => r.json())
      .then((d) => {
        const text = d.instrucoes ?? '';
        setInstrucoes(text);
        setOriginal(text);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/instrucoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instrucoes }),
      });
      if (!res.ok) throw new Error('Falha ao guardar');
      setOriginal(instrucoes);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Erro ao guardar. Tente novamente.');
    }
    setSaving(false);
  };

  const hasChanges = instrucoes !== original;
  const wordCount = instrucoes.trim() ? instrucoes.trim().split(/\s+/).length : 0;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Instruções do Assistente</h1>
        <p className="text-white/50 text-sm mt-1">
          Escreva como quer que o assistente se comporte. Pode editar e guardar a qualquer momento.
        </p>
      </div>

      {/* Tips */}
      <div className="glass-card p-4 mb-5 bg-green-500/[0.06] border-green-500/20">
        <div className="flex items-start gap-3">
          <div className="text-green-400 mt-0.5 flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/>
            </svg>
          </div>
          <p className="text-white/60 text-sm leading-relaxed">
            Escreva em linguagem natural — descreva o tom de voz, regras de negócio, horários, produtos, preços e qualquer comportamento especial. Quanto mais detalhe, melhor o assistente responderá.
          </p>
        </div>
      </div>

      {/* Editor */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-white/80">Instruções personalizadas</label>
          <span className="text-xs text-white/30">{wordCount} palavra{wordCount !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="text-white/30 text-sm">A carregar...</div>
          </div>
        ) : (
          <textarea
            value={instrucoes}
            onChange={(e) => setInstrucoes(e.target.value)}
            rows={14}
            placeholder={PLACEHOLDER}
            className="w-full bg-white/[0.05] border border-white/[0.1] text-white placeholder:text-white/20 rounded-xl px-4 py-3 text-sm
                       focus:outline-none focus:ring-2 focus:ring-green-400/40 focus:border-green-400/30 transition-all resize-none
                       leading-relaxed font-mono"
          />
        )}

        {error && (
          <div className="mt-3 bg-red-500/10 border border-red-500/20 text-red-300 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            {saved && (
              <span className="text-green-400 text-sm flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Guardado com sucesso!
              </span>
            )}
            {hasChanges && !saved && (
              <span className="text-amber-400/70 text-xs">Alterações não guardadas</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {hasChanges && (
              <button
                onClick={() => setInstrucoes(original)}
                className="btn-ghost text-sm text-white/40"
              >
                Cancelar
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="btn-primary"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                  A guardar...
                </span>
              ) : 'Guardar Instruções'}
            </button>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { icon: '⚡', title: 'Efeito imediato', desc: 'As instruções são aplicadas nas próximas conversas.' },
          { icon: '🔄', title: 'Sempre editável', desc: 'Pode ajustar as instruções a qualquer momento sem limites.' },
        ].map((item) => (
          <div key={item.title} className="glass-card p-4 flex items-start gap-3">
            <span className="text-lg flex-shrink-0">{item.icon}</span>
            <div>
              <p className="text-white/80 text-sm font-medium">{item.title}</p>
              <p className="text-white/40 text-xs mt-0.5">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
