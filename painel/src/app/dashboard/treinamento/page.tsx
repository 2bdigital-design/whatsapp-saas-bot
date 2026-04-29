'use client';
import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export default function TreinamentoPage() {
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<{ name: string; ok: boolean }[]>([]);
  const [error, setError] = useState('');
  const [drag, setDrag] = useState(false);

  const handleUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/training/upload', { method: 'POST', body: formData });
    if (res.ok) {
      setFiles((prev) => [...prev, { name: file.name, ok: true }]);
    } else {
      const err = await res.json().catch(() => ({}));
      setError(err.error ?? 'Erro ao enviar ficheiro.');
      setFiles((prev) => [...prev, { name: file.name, ok: false }]);
    }
    setUploading(false);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleUpload(e.target.files[0]);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    if (e.dataTransfer.files?.[0]) handleUpload(e.dataTransfer.files[0]);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Treinar o Assistente</h1>
        <p className="text-white/50 text-sm mt-1">
          Envie documentos com informações da sua empresa. O assistente aprende com eles.
        </p>
      </div>

      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}
        className={`glass-card p-10 text-center transition-all ${drag ? 'border-green-400/50 bg-green-500/10' : 'border-white/10 hover:border-white/20'}`}
      >
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors ${drag ? 'bg-green-500/25' : 'bg-white/[0.06]'}`}>
          <Upload className={drag ? 'text-green-400' : 'text-white/30'} size={28} />
        </div>
        <p className="font-semibold text-white mb-1">
          {drag ? 'Solte o ficheiro aqui' : 'Arraste ou clique para enviar'}
        </p>
        <p className="text-white/40 text-sm mb-6">PDF, DOCX ou TXT — máx. 20 MB</p>
        <label className={`btn-primary cursor-pointer inline-block ${uploading ? 'opacity-40 cursor-not-allowed' : ''}`}>
          {uploading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              A enviar...
            </span>
          ) : 'Escolher ficheiro'}
          <input type="file" accept=".pdf,.docx,.txt" onChange={handleInput} className="hidden" disabled={uploading} />
        </label>
      </div>

      {error && (
        <div className="mt-4 bg-red-500/10 border border-red-500/20 text-red-300 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
          <AlertCircle size={14} className="flex-shrink-0" />
          {error}
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-6">
          <p className="text-sm font-medium text-white/60 mb-3">Ficheiros enviados nesta sessão</p>
          <div className="space-y-2">
            {files.map((f, i) => (
              <div
                key={i}
                className={`glass-card px-4 py-3 flex items-center gap-3 ${f.ok ? 'border-green-500/15' : 'border-red-500/20'}`}
              >
                <FileText size={15} className={f.ok ? 'text-green-400' : 'text-red-400'} />
                <span className="flex-1 text-sm text-white/80 truncate">{f.name}</span>
                {f.ok
                  ? <CheckCircle size={15} className="text-green-400 flex-shrink-0" />
                  : <AlertCircle size={15} className="text-red-400 flex-shrink-0" />
                }
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 glass-card p-4 bg-blue-500/[0.05] border-blue-500/15">
        <p className="text-white/50 text-xs leading-relaxed">
          <strong className="text-white/70">Dica:</strong> Pode enviar o menu do restaurante, ficha de produtos, perguntas frequentes, política de preços — qualquer documento em texto. O assistente usará esse conteúdo para responder aos clientes.
        </p>
      </div>
    </div>
  );
}
