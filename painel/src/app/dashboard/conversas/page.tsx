import { createClient } from '@/lib/supabase-server';
import ConversasClient from './conversas-client';

export default async function ConversasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: tenantUser } = await supabase
    .from('tenant_users')
    .select('tenant_id')
    .eq('user_id', user!.id)
    .single();

  const { data: conversations } = await supabase
    .from('conversations')
    .select('id, phone, status, updated_at')
    .eq('tenant_id', tenantUser?.tenant_id ?? '')
    .order('updated_at', { ascending: false })
    .limit(200);

  return <ConversasClient conversations={conversations ?? []} />;
}
