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
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Conectar WhatsApp</h1>
      <p className="text-gray-500 text-sm mb-6">
        Abra o WhatsApp no celular → Menu → Aparelhos conectados → Conectar aparelho
      </p>
      <div className="bg-white border rounded-xl p-6 flex flex-col items-center gap-4">
        {connected ? (
          <div className="text-center">
            <div className="text-5xl mb-3">✅</div>
            <p className="text-green-600 font-semibold text-lg">WhatsApp conectado!</p>
            <p className="text-gray-400 text-sm mt-1">Seu bot está pronto para receber mensagens.</p>
          </div>
        ) : qrCode ? (
          <>
            <Image
              src={`data:image/png;base64,${qrCode}`}
              width={280} height={280} alt="QR Code WhatsApp"
              className="rounded-lg"
            />
            <p className="text-gray-400 text-xs">Verificando conexão automaticamente...</p>
            <button onClick={fetchQRCode} className="text-sm text-green-600 hover:underline">
              Gerar novo QR Code
            </button>
          </>
        ) : (
          <button
            onClick={fetchQRCode}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition"
          >
            {loading ? 'Gerando QR Code...' : 'Gerar QR Code'}
          </button>
        )}
      </div>
    </div>
  );
}
