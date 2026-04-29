import { Worker } from 'bullmq';
import { redisConnection } from './messageQueue';
import {
  getTenantBySlug,
  getOrCreateConversation,
  saveMessage,
  updateConversationThread,
  setConversationStatus,
} from '../services/supabase';
import { chat } from '../services/openai';
import { sendTextMessage } from '../services/whatsapp-cloud';
import { log } from '../utils/logger';

export const worker = new Worker(
  'messages',
  async (job) => {
    const { tenantId: slug, phone, message, phoneNumberId, waAccessToken } = job.data as {
      tenantId: string;
      tenantDbId?: string;
      phoneNumberId?: string;
      waAccessToken?: string;
      phone: string;
      message: string;
    };

    log('info', `Processando mensagem`, { slug, phone });

    const tenant = await getTenantBySlug(slug);
    if (!tenant) {
      log('warn', `Tenant não encontrado: ${slug}`);
      return;
    }

    if (!tenant.assistant_id) {
      log('warn', `Tenant sem assistant_id: ${slug}`);
      return;
    }

    // Credenciais WhatsApp Cloud API (vêm do job ou do tenant no DB)
    const pnId  = phoneNumberId  ?? tenant.wa_phone_number_id;
    const token = waAccessToken  ?? tenant.wa_access_token;

    if (!pnId || !token) {
      log('warn', `Tenant sem credenciais WA Cloud API: ${slug}`);
      return;
    }

    const conversation = await getOrCreateConversation(tenant.id, phone);
    if (conversation.status === 'human') return;

    await saveMessage(tenant.id, conversation.id, 'user', message);

    const { response, threadId } = await chat(
      tenant.assistant_id,
      conversation.thread_id ?? null,
      message
    );

    if (!conversation.thread_id) {
      await updateConversationThread(conversation.id, threadId);
    }

    if (response.trim() === 'TRANSFERIR_HUMANO') {
      await setConversationStatus(conversation.id, 'human');
      const handoffMsg = tenant.bot_name
        ? `Aguarde um momento, ${tenant.bot_name} vai te conectar com nossa equipe!`
        : 'Aguarde um momento, vou te conectar com nossa equipe!';
      await sendTextMessage(pnId, token, phone, handoffMsg);
      return;
    }

    await saveMessage(tenant.id, conversation.id, 'assistant', response);
    await sendTextMessage(pnId, token, phone, response);

    log('info', `Resposta enviada`, { slug, phone, chars: response.length });
  },
  { connection: redisConnection, concurrency: 10 }
);

worker.on('failed', (job, err) => {
  log('error', `Job ${job?.id} falhou`, { error: err.message });
});

worker.on('completed', (job) => {
  log('info', `Job ${job.id} concluído`);
});
