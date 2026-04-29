import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const { data: tu } = await supabase
    .from('tenant_users')
    .select('tenants(slug)')
    .eq('user_id', user.id)
    .single();

  const slug = (tu?.tenants as unknown as { slug: string } | null)?.slug;
  if (!slug) return NextResponse.json({ connected: false });

  const res = await fetch(
    `${process.env.BACKEND_URL}/api/tenants/${slug}/status`,
    { headers: { Authorization: `Bearer ${process.env.INTERNAL_SECRET}` } }
  );

  const data = await res.json().catch(() => ({}));
  return NextResponse.json({ connected: data?.connected ?? false });
}
