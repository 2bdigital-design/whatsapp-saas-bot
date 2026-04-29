'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function QRCodePage() {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    const res = await fetch('/api/status');
    if (res.ok) {
      const data = await res.json();
      if (data.connected) setConnected(true);
    }
  };

  const fetchQRCode = async () => {
    setLoading(true);
    const res = await fetch('/api/qrcode');
    const data = await res.json();
    setQrCode(data.qrcode ?? data.base64 ?? null);
    setLoading(false);

    const interval = setInterval(async () => {
      const status = await fetch('/api/status').then((r) => r.json());
      if (status.connected) {
        setConnected(true);
        clearInterval(interval);
      }
    }, 5000);
  };

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Conectar WhatsApp</h1>
      <p className="text-gray-500 text-sm mb-6">
        Abra o WhatsApp no telemóvel → Menu → Aparelhos conectados → Conectar aparelho
      </p>
      <div className="bg-white border border-gray-100 rounded-2xl p-8 flex flex-col items-center gap-5 shadow-sm">
        {connected ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <p className="text-green-700 font-bold text-lg">WhatsApp conectado!</p>
            <p className="text-gray-400 text-sm mt-1">O seu assistente já está a receber mensagens.</p>
          </div>
        ) : qrCode ? (
          <>
            <div className="p-2 border-2 border-green-100 rounded-xl">
              <Image
                src={`data:image/png;base64,${qrCode}`}
                width={260} height={260} alt="QR Code WhatsApp"
                className="rounded-lg"
              />
            </div>
            <p className="text-gray-400 text-xs text-center">
              A verificar ligação automaticamente...
            </p>
            <button onClick={fetchQRCode} className="text-sm text-green-600 hover:underline font-medium">
              Gerar novo QR Code
            </button>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
              </svg>
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-700 mb-1">Pronto para conectar</p>
              <p className="text-gray-400 text-sm">Clique abaixo para gerar o QR Code</p>
            </div>
            <button
              onClick={fetchQRCode}
              disabled={loading}
              className="bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 transition"
            >
              {loading ? 'A gerar QR Code...' : 'Gerar QR Code'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
