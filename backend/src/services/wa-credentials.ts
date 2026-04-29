/**
 * Armazena as credenciais WhatsApp Cloud API no Supabase Storage.
 * Não requer alterações ao esquema da base de dados.
 *
 * Estrutura de ficheiros:
 *   wa-credentials/pnid/{phoneNumberId}.json  → { slug, accessToken }
 *   wa-credentials/slug/{slug}.json           → { phoneNumberId, accessToken }
 */
import { supabaseAdmin } from './supabase';

const BUCKET = 'wa-credentials';

// Garantir que o bucket existe (chamado uma vez no startup)
let bucketReady = false;
async function ensureBucket() {
  if (bucketReady) return;
  const { error } = await supabaseAdmin.storage.createBucket(BUCKET, {
    public: false,
    allowedMimeTypes: ['application/json'],
  });
  // Ignorar erro "already exists"
  if (!error || error.message?.includes('already exists') || (error as { statusCode?: string }).statusCode === '409') {
    bucketReady = true;
  }
}

export async function saveWaCredentials(
  slug: string,
  phoneNumberId: string,
  accessToken: string
): Promise<void> {
  await ensureBucket();

  const byPnid = new Blob(
    [JSON.stringify({ slug, accessToken })],
    { type: 'application/json' }
  );
  const bySlug = new Blob(
    [JSON.stringify({ phoneNumberId, accessToken })],
    { type: 'application/json' }
  );

  await Promise.all([
    supabaseAdmin.storage.from(BUCKET).upload(`pnid/${phoneNumberId}.json`, byPnid, { upsert: true }),
    supabaseAdmin.storage.from(BUCKET).upload(`slug/${slug}.json`,           bySlug, { upsert: true }),
  ]);
}

export async function getCredsByPhoneNumberId(
  phoneNumberId: string
): Promise<{ slug: string; accessToken: string } | null> {
  await ensureBucket();
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .download(`pnid/${phoneNumberId}.json`);
  if (error || !data) return null;
  try {
    return JSON.parse(await data.text());
  } catch {
    return null;
  }
}

export async function getCredsBySlug(
  slug: string
): Promise<{ phoneNumberId: string; accessToken: string } | null> {
  await ensureBucket();
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .download(`slug/${slug}.json`);
  if (error || !data) return null;
  try {
    return JSON.parse(await data.text());
  } catch {
    return null;
  }
}
