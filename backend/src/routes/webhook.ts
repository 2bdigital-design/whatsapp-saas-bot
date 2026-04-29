import { FastifyInstance } from 'fastify';
import { messageQueue } from '../queues/messageQueue';
import { getTenantByPhoneNumberId } from '../services/supabase';
import { markAsRead, verifyWebhookSignature } from '../services/whatsapp-cloud';
import { log } from '../utils/logger';

export default async function webhookRoutes(app: FastifyInstance) {

  // ── Meta webhook verification (GET) ─────────────────────────────────────
  app.get('/meta', async (req, reply) => {
    const { 'hub.mode': mode, 'hub.verify_token': token, 'hub.challenge': challenge } =
      req.query as Record<string, string>;

    const expectedToken = process.env.WEBHOOK_VERIFY_TOKEN ?? process.env.WEBHOOK_SECRET ?? '';

    if (mode === 'subscribe' && token === expectedToken) {
      log('info', 'Webhook Meta verificado com sucesso');
      return reply.send(challenge);
    }
    log('warn', 'Falha na verificação do webhook Meta', { mode, token });
    return reply.status(403).send({ error: 'Forbidden' });
  });

  // ── Meta webhook events (POST) ───────────────────────────────────────────
  app.post('/meta', { config: { rawBody: true } }, async (req, reply) => {
    // Verificar assinatura (se APP_SECRET estiver configurado)
    const appSecret = process.env.WA_APP_SECRET;
    if (appSecret) {
      const sig = (req.headers['x-hub-signature-256'] as string) ?? '';
      const rawBody = (req as unknown as { rawBody: Buffer }).rawBody ?? Buffer.from(JSON.stringify(req.body));
      if (!verifyWebhookSignature(rawBody, sig, appSecret)) {
        log('warn', 'Assinatura do webhook Meta inválida');
        return reply.status(401).send({ error: 'Unauthorized' });
      }
    }

    const body = req.body as Record<string, unknown>;

    // Meta envia pings periódicos — responder 200 imediatamente
    if (body?.object !== 'whatsapp_business_account') {
      return reply.send({ ok: true });
    }

    const entries = (body.entry as Array<Record<string, unknown>>) ?? [];

    for (const entry of entries) {
      const changes = (entry.changes as Array<Record<string, unknown>>) ?? [];

      for (const change of changes) {
        if (change.field !== 'messages') continue;

        const value = change.value as Record<string, unknown>;
        const metadata = value.metadata as Record<string, unknown>;
        const phoneNumberId = metadata?.phone_number_id as string;

        if (!phoneNumberId) continue;

        const messages = (value.messages as Array<Record<string, unknown>>) ?? [];

        for (const msg of messages) {
          // Ignorar mensagens enviadas pelo bot ou que não sejam texto
          if (msg.type !== 'text') continue;

          const from = msg.from as string;
          const messageId = msg.id as string;
          const text = (msg.text as Record<string, unknown>)?.body as string;

          if (!text?.trim()) continue;

          // Procurar tenant pelo phone_number_id
          const tenant = await getTenantByPhoneNumberId(phoneNumberId);
          if (!tenant) {
            log('warn', 'Tenant não encontrado para phone_number_id', { phoneNumberId });
            continue;
          }

          log('info', 'Mensagem recebida via Meta', {
            tenantSlug: tenant.slug,
            from,
            chars: text.length,
          });

          // Marcar como lida (assíncrono)
          if (tenant.wa_access_token) {
            markAsRead(phoneNumberId, tenant.wa_access_token, messageId);
          }

          await messageQueue.add('process-message', {
            tenantId: tenant.slug,
            tenantDbId: tenant.id,
            phoneNumberId,
            waAccessToken: tenant.wa_access_token,
            phone: from,
            message: text,
            timestamp: Date.now(),
          });
        }
      }
    }

    return reply.send({ ok: true });
  });

  // ── Rota antiga Evolution (mantida para compatibilidade durante transição) ──
  app.post('/evolution', async (req, reply) => {
    log('warn', 'Webhook Evolution recebido (migrado para Cloud API)');
    return reply.send({ ok: true });
  });
}
