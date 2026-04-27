import { createClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';

export default async function ConversaPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  const { data: messages } = await supabase
    .from('messages')
    .select('id, role, content, created_at')
    .eq('conversation_id', params.id)
    .order('created_at', { ascending: true });

  const { data: conversation } = await supabase
    .from('conversations')
    .select('phone, status')
    .eq('id', params.id)
    .single();

  if (!conversation) notFound();

  const roleStyle: Record<string, string> = {
    user: 'bg-white border self-start',
    assistant: 'bg-green-600 text-white self-end',
    agent: 'bg-orange-100 border border-orange-200 self-end',
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <a href="/dashboard/conversas" className="text-gray-400 hover:text-gray-600 text-sm">← Voltar</a>
        <h1 className="text-xl font-bold text-gray-800 font-mono">{conversation.phone}</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
          {conversation.status}
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {messages?.map((m) => (
          <div key={m.id} className={`rounded-xl px-4 py-3 max-w-[80%] text-sm ${roleStyle[m.role] ?? 'bg-gray-100'}`}>
            <p className="whitespace-pre-wrap">{m.content}</p>
            <p className="text-xs opacity-60 mt-1">
              {new Date(m.created_at).toLocaleTimeString('pt-BR')}
            </p>
          </div>
        ))}
        {!messages?.length && (
          <p className="text-gray-400 text-sm">Sem mensagens.</p>
        )}
      </div>
    </div>
  );
}
