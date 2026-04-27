import { FastifyInstance } from 'fastify';
import { messageQueue } from '../queues/messageQueue';
import { log } from '../utils/logger';

export default async function webhookRoutes(app: FastifyInstance) {
  app.post('/evolution', async (req, reply) => {
    const body = req.body as Record<string, unknown>;

    const data = body?.data as Record<string, unknown> | undefined;
    const key  = data?.key  as Record<string, unknown> | undefined;

    if (key?.fromMe) {
      return reply.send({ ok: true });
    }

    if (body?.event !== 'messages.upsert') {
      return reply.send({ ok: true });
    }

    const tenantId = body.instance as string;
    const remoteJid = (key?.remoteJid as string) ?? '';
    const phone = remoteJid.replace('@s.whatsapp.net', '');

    const msgData = data?.message as Record<string, unknown> | undefined;
    const message =
      (msgData?.conversation as string) ||
      ((msgData?.extendedTextMessage as Record<string, unknown>)?.text as string) ||
      '';

    if (!message.trim()) return reply.send({ ok: true });

    log('info', `Webhook recebido`, { tenantId, phone, chars: message.length });

    await messageQueue.add('process-message', {
      tenantId,
      phone,
      message,
      timestamp: Date.now(),
    });

    return reply.send({ ok: true });
  });
}
