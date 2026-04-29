import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const { data: tu, error } = await supabase
    .from('tenant_users')
    .select('tenants(system_prompt)')
    .eq('user_id', user.id)
    .single();

  if (error) return NextResponse.json({ instrucoes: '' });

  const tenant = tu?.tenants as unknown as { system_prompt?: string } | null;
  return NextResponse.json({ instrucoes: tenant?.system_prompt ?? '' });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const { instrucoes } = await req.json();

  const { data: tu } = await supabase
    .from('tenant_users')
    .select('tenant_id')
    .eq('user_id', user.id)
    .single();

  if (!tu?.tenant_id) return NextResponse.json({ error: 'Tenant não encontrado' }, { status: 404 });

  const { error } = await supabase
    .from('tenants')
    .update({ system_prompt: instrucoes })
    .eq('id', tu.tenant_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
