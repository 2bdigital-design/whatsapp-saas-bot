import axios from 'axios';
import crypto from 'crypto';

const GRAPH_URL = 'https://graph.facebook.com/v19.0';

/**
 * Envia mensagem de texto via WhatsApp Cloud API.
 */
export async function sendTextMessage(
  phoneNumberId: string,
  accessToken: string,
  to: string,
  text: string
) {
  await axios.post(
    `${GRAPH_URL}/${phoneNumberId}/messages`,
    {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: { body: text },
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * Marca mensagem como lida.
 */
export async function markAsRead(
  phoneNumberId: string,
  accessToken: string,
  messageId: string
) {
  await axios
    .post(
      `${GRAPH_URL}/${phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId,
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
    .catch(() => {
      /* não crítico */
    });
}

/**
 * Verifica a assinatura do webhook enviada pela Meta.
 * Retorna true se válida.
 */
export function verifyWebhookSignature(
  rawBody: string | Buffer,
  signature: string,
  appSecret: string
): boolean {
  const expected =
    'sha256=' +
    crypto
      .createHmac('sha256', appSecret)
      .update(rawBody)
      .digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}
