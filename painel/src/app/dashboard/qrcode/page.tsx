'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function QRCodePage() {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    checkStatus().finally(() => setChecking(false));
  }, []);

  const checkStatus = async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        if (data.connected) setConnected(true);
      }
    } catch {
      // ignore
    }
  };

  const fetchQRCode = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/qrcode');
      if (!res.ok) throw new Error('Falha ao obter QR Code');
      const data = await res.json();
      // Evolution API returns base64 with or without data URI prefix
      const raw = data.qrcode ?? data.base64 ?? data.code ?? null;
      if (!raw) throw new Error('QR Code não disponível. Tente novamente em alguns segundos.');
      setQrCode(raw);

      // Poll for connection
      const interval = setInterval(async () => {
        const status = await fetch('/api/status').then((r) => r.json()).catch(() => ({}));
        if (status.connected) {
          setConnected(true);
          clearInterval(interval);
        }
      }, 4000);

      // Clear after 3 min
      setTimeout(() => clearInterval(interval), 180000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao gerar QR Code');
    }
    setLoading(false);
  };

  const qrSrc = qrCode
    ? (qrCode.startsWith('data:') ? qrCode : `data:image/png;base64,${qrCode}`)
    : null;

  if (checking) {
    return (
      <div className="max-w-md mx-auto flex items-center justify-center py-20">
        <div className="text-white/40 text-sm">A verificar ligação...</div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Conectar WhatsApp</h1>
        <p className="text-white/50 text-sm mt-1">
          Abra o WhatsApp → Menu (⋮) → Aparelhos conectados → Conectar aparelho
        </p>
      </div>

      <div className="glass-card p-8 flex flex-col items-center gap-6">
        {connected ? (
          <div className="text-center py-6 w-full">
            <div className="w-20 h-20 bg-green-500/15 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <p className="text-green-400 font-bold text-xl">WhatsApp Conectado!</p>
            <p className="text-white/40 text-sm mt-2">O seu assistente já está a receber mensagens.</p>
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-green-400/70">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Online e activo
            </div>
          </div>
        ) : qrSrc ? (
          <>
            <p className="text-white/60 text-sm text-center">Aponte a câmara do telemóvel para o código abaixo:</p>
            <div className="p-3 bg-white rounded-2xl shadow-2xl">
              <Image src={qrSrc} width={240} height={240} alt="QR Code WhatsApp" className="rounded-xl" />
            </div>
            <div className="flex items-center gap-2 text-white/40 text-xs">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              A aguardar leitura do código...
            </div>
            <button
              onClick={fetchQRCode}
              disabled={loading}
              className="btn-ghost text-sm"
            >
              🔄 Gerar novo QR Code
            </button>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-white/[0.06] border border-white/10 rounded-2xl flex items-center justify-center">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
            </div>
            <div className="text-center">
              <p className="text-white font-semibold">Pronto para conectar</p>
              <p className="text-white/40 text-sm mt-1">Clique abaixo para gerar o QR Code</p>
            </div>
            {error && (
              <div className="w-full bg-red-500/10 border border-red-500/20 text-red-300 text-xs px-4 py-3 rounded-xl text-center">
                {error}
              </div>
            )}
            <button onClick={fetchQRCode} disabled={loading} className="btn-primary px-10">
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                  A gerar...
                </span>
              ) : 'Gerar QR Code'}
            </button>
          </>
        )}
      </div>

      <div className="mt-4 glass-card p-4">
        <p className="text-white/40 text-xs leading-relaxed">
          <strong className="text-white/60">Como funciona:</strong> Após ler o QR Code, o seu número de WhatsApp fica associado ao assistente. Todas as mensagens recebidas serão respondidas automaticamente pela IA.
        </p>
      </div>
    </div>
  );
}
