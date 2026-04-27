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
  if (!slug) return NextResponse.json({ error: 'Tenant não encontrado' }, { status: 404 });

  const res = await fetch(
    `${process.env.BACKEND_URL}/api/tenants/${slug}/qrcode`,
    { headers: { Authorization: `Bearer ${process.env.INTERNAL_SECRET}` } }
  );

  const data = await res.json();
  return NextResponse.json(data);
}
