'use client';
import { useState } from 'react';
import Link from 'next/link';

interface Conversation {
  id: string;
  phone: string;
  status: string;
  updated_at: string;
}

const STATUS_LABEL: Record<string, string> = { bot: 'Bot', human: 'Humano', closed: 'Encerrada' };
const STATUS_CLASS: Record<string, string> = {
  bot: 'bg-green-500/15 text-green-400 border border-green-500/20',
  human: 'bg-orange-500/15 text-orange-400 border border-orange-500/20',
  closed: 'bg-white/[0.06] text-white/40 border border-white/10',
};

const TABS = [
  { key: 'all', label: 'Todas' },
  { key: 'bot', label: '🤖 Bot' },
  { key: 'human', label: '👤 Humano' },
  { key: 'closed', label: 'Encerradas' },
];

function exportCSV(rows: Conversation[]) {
  const header = 'Telefone,Status,Última Actividade';
  const body = rows.map((r) =>
    `"${r.phone}","${STATUS_LABEL[r.status] ?? r.status}","${new Date(r.updated_at).toLocaleString('pt-BR')}"`
  );
  const csv = [header, ...body].join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `conversas-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function printTable(rows: Conversation[], tab: string) {
  const html = `
    <html><head><title>Conversas — Atende Bem</title>
    <style>
      body { font-family: sans-serif; padding: 24px; color: #111; }
      h2 { margin-bottom: 16px; }
      table { width: 100%; border-collapse: collapse; font-size: 13px; }
      th { background: #f1f5f9; text-align: left; padding: 8px 12px; border-bottom: 2px solid #e2e8f0; }
      td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; }
      @media print { body { padding: 0; } }
    </style></head>
    <body>
      <h2>Conversas — ${tab === 'all' ? 'Todas' : (TABS.find(t => t.key === tab)?.label ?? tab)}</h2>
      <p style="color:#666;font-size:12px;margin-bottom:16px;">Exportado em ${new Date().toLocaleString('pt-BR')}</p>
      <table>
        <thead><tr><th>Telefone</th><th>Status</th><th>Última Actividade</th></tr></thead>
        <tbody>
          ${rows.map(r => `<tr><td>${r.phone}</td><td>${STATUS_LABEL[r.status] ?? r.status}</td><td>${new Date(r.updated_at).toLocaleString('pt-BR')}</td></tr>`).join('')}
        </tbody>
      </table>
    </body></html>`;
  const w = window.open('', '_blank');
  if (w) { w.document.write(html); w.document.close(); w.print(); }
}

export default function ConversasClient({ conversations }: { conversations: Conversation[] }) {
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = conversations
    .filter((c) => tab === 'all' || c.status === tab)
    .filter((c) => !search || c.phone.includes(search));

  const counts = TABS.reduce((acc, t) => {
    acc[t.key] = t.key === 'all' ? conversations.length : conversations.filter((c) => c.status === t.key).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Conversas</h1>
          <p className="text-white/50 text-sm mt-1">{conversations.length} atendimento{conversations.length !== 1 ? 's' : ''} no total</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => exportCSV(filtered)}
            className="btn-ghost text-xs flex items-center gap-1.5 border border-white/10"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Exportar CSV
          </button>
          <button
            onClick={() => printTable(filtered, tab)}
            className="btn-ghost text-xs flex items-center gap-1.5 border border-white/10"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
            Imprimir PDF
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        {/* Tabs + Search */}
        <div className="p-4 border-b border-white/[0.08] flex flex-col sm:flex-row gap-3">
          <div className="flex gap-1 flex-wrap">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  tab === t.key
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'text-white/50 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {t.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-md ${tab === t.key ? 'bg-green-500/20 text-green-300' : 'bg-white/[0.08] text-white/30'}`}>
                  {counts[t.key]}
                </span>
              </button>
            ))}
          </div>
          <div className="sm:ml-auto">
            <input
              type="text"
              placeholder="Pesquisar por telefone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glass-input text-xs py-1.5 w-full sm:w-48"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left px-4 py-3 text-xs font-medium text-white/40 uppercase tracking-wider">Telefone</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-white/40 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-white/40 uppercase tracking-wider hidden md:table-cell">Última actividade</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors">
                  <td className="px-4 py-3 font-mono text-white/80 text-sm">{c.phone}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${STATUS_CLASS[c.status] ?? 'bg-white/10 text-white/50'}`}>
                      {STATUS_LABEL[c.status] ?? c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/40 text-xs hidden md:table-cell">
                    {new Date(c.updated_at).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/conversas/${c.id}`}
                      className="text-green-400/70 hover:text-green-400 text-xs hover:underline transition-colors"
                    >
                      Ver →
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-white/30 text-sm">
                    {conversations.length === 0 ? 'Nenhuma conversa ainda. Conecte o WhatsApp para começar.' : 'Nenhuma conversa encontrada.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-white/[0.06] text-xs text-white/30">
            A mostrar {filtered.length} de {conversations.length} conversa{conversations.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}
