import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Alias para uso em Storage e operações admin
export const supabaseAdmin = supabase;

export async function getTenantBySlug(slug: string) {
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', slug)
    .eq('active', true)
    .single();
  if (error) throw error;
  return data;
}

/**
 * Encontra um tenant pelo Phone Number ID do WhatsApp Cloud API.
 * As credenciais são guardadas no Supabase Storage (sem necessidade de colunas adicionais).
 */
export async function getTenantByPhoneNumberId(
  phoneNumberId: string
): Promise<(Awaited<ReturnType<typeof getTenantBySlug>> & { wa_access_token?: string }) | null> {
  // Importação dinâmica para evitar dependência circular
  const { getCredsByPhoneNumberId } = await import('./wa-credentials');
  const creds = await getCredsByPhoneNumberId(phoneNumberId);
  if (!creds) return null;
  try {
    const tenant = await getTenantBySlug(creds.slug);
    return { ...tenant, wa_access_token: creds.accessToken };
  } catch {
    return null;
  }
}

export async function getOrCreateConversation(tenantId: string, phone: string) {
  const { data: existing } = await supabase
    .from('conversations')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('phone', phone)
    .single();

  if (existing) return existing;

  const { data: created, error } = await supabase
    .from('conversations')
    .insert({ tenant_id: tenantId, phone, status: 'bot' })
    .select()
    .single();

  if (error) throw error;
  return created;
}

export async function saveMessage(
  tenantId: string,
  conversationId: string,
  role: string,
  content: string
) {
  const { error } = await supabase.from('messages').insert({
    tenant_id: tenantId,
    conversation_id: conversationId,
    role,
    content,
  });
  if (error) throw error;
}

export async function updateConversationThread(conversationId: string, threadId: string) {
  await supabase
    .from('conversations')
    .update({ thread_id: threadId, updated_at: new Date().toISOString() })
    .eq('id', conversationId);
}

export async function setConversationStatus(conversationId: string, status: 'bot' | 'human' | 'closed') {
  await supabase
    .from('conversations')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', conversationId);
}
