'use client';
import { useState } from 'react';
import { Upload, CheckCircle, FileText } from 'lucide-react';

export default function TreinamentoPage() {
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<string[]>([]);
  const [error, setError] = useState('');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/training/upload', { method: 'POST', body: formData });
    if (res.ok) {
      setFiles((prev) => [...prev, file.name]);
    } else {
      const err = await res.json();
      setError(err.error ?? 'Erro ao enviar arquivo.');
    }
    setUploading(false);
    e.target.value = '';
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Treinar o Bot</h1>
      <p className="text-gray-500 text-sm mb-6">
        Envie documentos com informações da sua empresa. O bot usará esses arquivos para responder clientes.
      </p>
      <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-green-300 transition-colors">
        <Upload className="mx-auto text-gray-300 mb-3" size={40} />
        <p className="text-gray-500 text-sm mb-3">PDF, DOCX ou TXT — máx. 20 MB</p>
        <label className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-medium cursor-pointer hover:bg-green-700 transition">
          {uploading ? 'Enviando...' : 'Escolher arquivo'}
          <input
            type="file" accept=".pdf,.docx,.txt"
            onChange={handleUpload} className="hidden" disabled={uploading}
          />
        </label>
      </div>
      {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
      {files.length > 0 && (
        <ul className="mt-5 space-y-2">
          {files.map((f, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-gray-700 bg-green-50 rounded-lg px-4 py-2">
              <FileText size={16} className="text-green-600" />
              {f}
              <CheckCircle size={16} className="text-green-600 ml-auto" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
