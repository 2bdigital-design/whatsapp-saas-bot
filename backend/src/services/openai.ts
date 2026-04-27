import OpenAI from 'openai';

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function createAssistant(botName: string, instructions: string) {
  const assistant = await openai.beta.assistants.create({
    name: botName,
    instructions,
    model: 'gpt-4o-mini',
    tools: [{ type: 'file_search' }],
  });
  return assistant.id;
}

export async function addDocumentToAssistant(
  assistantId: string,
  fileBuffer: Buffer,
  fileName: string
) {
  const file = await openai.files.create({
    file: new File([fileBuffer], fileName),
    purpose: 'assistants',
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const betaAny = openai.beta as any;
  const vectorStore = await betaAny.vectorStores.create({
    name: `vs_${assistantId}`,
  });

  await betaAny.vectorStores.files.create(vectorStore.id, {
    file_id: file.id,
  });

  await openai.beta.assistants.update(assistantId, {
    tool_resources: {
      file_search: { vector_store_ids: [vectorStore.id as string] },
    },
  });

  return { fileId: file.id, vectorStoreId: vectorStore.id };
}

export async function chat(
  assistantId: string,
  threadId: string | null,
  userMessage: string
): Promise<{ response: string; threadId: string }> {
  const thread = threadId
    ? { id: threadId }
    : await openai.beta.threads.create();

  await openai.beta.threads.messages.create(thread.id, {
    role: 'user',
    content: userMessage,
  });

  const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
    assistant_id: assistantId,
  });

  if (run.status !== 'completed') {
    throw new Error(`Run falhou: ${run.status}`);
  }

  const messages = await openai.beta.threads.messages.list(thread.id);
  const last = messages.data[0];
  const text = last.content
    .filter((c) => c.type === 'text')
    .map((c) => (c as { type: 'text'; text: { value: string } }).text.value)
    .join('\n');

  return { response: text, threadId: thread.id };
}

export function buildInstructions(config: {
  botName: string;
  companyName: string;
  businessType: string;
  transferKeyword?: string;
}) {
  return `
Você é ${config.botName}, assistente virtual da ${config.companyName}.

Seu papel:
- Atender clientes de forma educada, objetiva e prestativa.
- Usar SOMENTE as informações dos documentos fornecidos para responder.
- Se não souber a resposta, diga educadamente que vai verificar.
- Não invente informações sobre preços, prazos ou produtos.

Regras importantes:
- Responda SEMPRE em português do Brasil.
- Seja conciso: máximo 3 parágrafos por resposta.
- Se o cliente pedir para falar com humano ou digitar "${config.transferKeyword || 'humano'}",
  responda: "TRANSFERIR_HUMANO" (apenas isso, sem mais texto).

Segmento da empresa: ${config.businessType}
  `.trim();
}
