import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!supabase) return NextResponse.json({ message: 'Supabase not configured' }, { status: 500 });
    const { data, error } = await supabase
      .from('cost_code_catalog')
      .select('*')
      .order('code', { ascending: true });
    if (error) return NextResponse.json({ message: error.message }, { status: 500 });
    return NextResponse.json({ codes: data || [] }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || 'Internal error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!supabase) return NextResponse.json({ message: 'Supabase not configured' }, { status: 500 });
    const body = await request.json();
    const { code, description, category, isActive } = body || {};
    if (!code || !description) return NextResponse.json({ message: 'code and description are required' }, { status: 400 });
    const now = new Date().toISOString();
    const row = {
      code,
      description,
      category: category ?? null,
      is_active: isActive ?? true,
      created_at: now,
      updated_at: now
    } as any;
    const { error } = await supabase.from('cost_code_catalog').insert(row);
    if (error) return NextResponse.json({ message: error.message }, { status: 500 });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || 'Internal error' }, { status: 500 });
  }
}

