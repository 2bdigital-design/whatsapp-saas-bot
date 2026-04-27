import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
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

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'Arquivo não enviado' }, { status: 400 });

  const backendForm = new FormData();
  backendForm.append('file', file);

  const res = await fetch(`${process.env.BACKEND_URL}/api/training/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.INTERNAL_SECRET}`,
      'x-tenant-slug': slug,
    },
    body: backendForm,
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
