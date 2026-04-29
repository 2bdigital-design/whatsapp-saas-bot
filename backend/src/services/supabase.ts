import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

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

export async function getTenantByPhoneNumberId(phoneNumberId: string) {
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('wa_phone_number_id', phoneNumberId)
    .eq('active', true)
    .single();
  if (error) return null;
  return data;
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
