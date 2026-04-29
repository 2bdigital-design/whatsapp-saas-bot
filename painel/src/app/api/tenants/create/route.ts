import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const backendUrl = process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      return NextResponse.json({ error: 'BACKEND_URL não configurada' }, { status: 500 });
    }

    const res = await fetch(`${backendUrl}/api/tenants/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('[/api/tenants/create]', err);
    return NextResponse.json({ error: 'Erro interno ao criar tenant' }, { status: 500 });
  }
}
