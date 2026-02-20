import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!supabase) return NextResponse.json({ message: 'Supabase not configured' }, { status: 500 });
    const { data, error } = await supabase
      .from('role_rate_catalog')
      .select('*')
      .order('level', { ascending: true });
    if (error) return NextResponse.json({ message: error.message }, { status: 500 });
    return NextResponse.json({ roles: data || [] }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || 'Internal error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!supabase) return NextResponse.json({ message: 'Supabase not configured' }, { status: 500 });
    const body = await request.json();
    const { level, position, projectRole, dailyRate, hourlyRate, isActive } = body || {};
    if (!level || (!dailyRate && !hourlyRate)) return NextResponse.json({ message: 'level and rate are required' }, { status: 400 });
    const now = new Date().toISOString();
    const row = {
      level,
      position: position ?? null,
      project_role: projectRole ?? null,
      daily_rate: dailyRate ?? null,
      hourly_rate: hourlyRate ?? null,
      is_active: isActive ?? true,
      created_at: now,
      updated_at: now
    } as any;
    const { error } = await supabase.from('role_rate_catalog').insert(row);
    if (error) return NextResponse.json({ message: error.message }, { status: 500 });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || 'Internal error' }, { status: 500 });
  }
}

