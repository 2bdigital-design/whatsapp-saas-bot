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
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Treinar o Assistente</h1>
      <p className="text-gray-500 text-sm mb-6">
        Envie documentos com informações sobre a sua empresa, produtos e serviços.
        O assistente aprende com esses ficheiros para responder melhor aos seus clientes.
      </p>
      <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center hover:border-green-300 transition-colors">
        <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Upload className="text-green-600" size={24} />
        </div>
        <p className="font-medium text-gray-700 mb-1">Arraste um ficheiro ou clique para escolher</p>
        <p className="text-gray-400 text-sm mb-4">PDF, DOCX ou TXT — máx. 20 MB</p>
        <label className="bg-green-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold cursor-pointer hover:bg-green-700 transition inline-block">
          {uploading ? 'A enviar...' : 'Escolher ficheiro'}
          <input
            type="file" accept=".pdf,.docx,.txt"
            onChange={handleUpload} className="hidden" disabled={uploading}
          />
        </label>
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-3 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}
      {files.length > 0 && (
        <div className="mt-5">
          <p className="text-sm font-medium text-gray-700 mb-2">Ficheiros enviados</p>
          <ul className="space-y-2">
            {files.map((f, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-gray-700 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
                <FileText size={16} className="text-green-600 flex-shrink-0" />
                <span className="flex-1 truncate">{f}</span>
                <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
