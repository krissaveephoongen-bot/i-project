import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest, { params }: { params: { code: string } }) {
  try {
    if (!supabase) return NextResponse.json({ message: 'Supabase not configured' }, { status: 500 });
    const code = params.code;
    if (!code) return NextResponse.json({ message: 'code is required' }, { status: 400 });
    const body = await request.json();
    const { description, category, isActive } = body || {};
    const payload: any = { updated_at: new Date().toISOString() };
    if (description !== undefined) payload.description = description;
    if (category !== undefined) payload.category = category;
    if (isActive !== undefined) payload.is_active = isActive;
    const { error } = await supabase.from('cost_code_catalog').update(payload).eq('code', code);
    if (error) return NextResponse.json({ message: error.message }, { status: 500 });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { code: string } }) {
  try {
    if (!supabase) return NextResponse.json({ message: 'Supabase not configured' }, { status: 500 });
    const code = params.code;
    if (!code) return NextResponse.json({ message: 'code is required' }, { status: 400 });
    const { error } = await supabase.from('cost_code_catalog').delete().eq('code', code);
    if (error) return NextResponse.json({ message: error.message }, { status: 500 });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || 'Internal error' }, { status: 500 });
  }
}

