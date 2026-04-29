import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const { phoneNumberId, accessToken } = await req.json();
  if (!phoneNumberId || !accessToken) {
    return NextResponse.json({ error: 'phoneNumberId e accessToken são obrigatórios' }, { status: 400 });
  }

  const { data: tu } = await supabase
    .from('tenant_users')
    .select('tenants(slug)')
    .eq('user_id', user.id)
    .single();

  const slug = (tu?.tenants as unknown as { slug: string } | null)?.slug;
  if (!slug) return NextResponse.json({ error: 'Tenant não encontrado' }, { status: 404 });

  const res = await fetch(
    `${process.env.BACKEND_URL}/api/tenants/${slug}/whatsapp-credentials`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.INTERNAL_SECRET}`,
      },
      body: JSON.stringify({ phoneNumberId, accessToken }),
    }
  );

  const data = await res.json().catch(() => ({}));
  if (!res.ok) return NextResponse.json(data, { status: res.status });
  return NextResponse.json({ success: true });
}
