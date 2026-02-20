import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!supabase) return NextResponse.json({ message: 'Supabase not configured' }, { status: 500 });
    const id = params.id;
    if (!id) return NextResponse.json({ message: 'id is required' }, { status: 400 });
    const body = await request.json();
    const { level, position, projectRole, dailyRate, hourlyRate, isActive } = body || {};
    const payload: any = { updated_at: new Date().toISOString() };
    if (level !== undefined) payload.level = level;
    if (position !== undefined) payload.position = position;
    if (projectRole !== undefined) payload.project_role = projectRole;
    if (dailyRate !== undefined) payload.daily_rate = dailyRate;
    if (hourlyRate !== undefined) payload.hourly_rate = hourlyRate;
    if (isActive !== undefined) payload.is_active = isActive;
    const { error } = await supabase.from('role_rate_catalog').update(payload).eq('id', id);
    if (error) return NextResponse.json({ message: error.message }, { status: 500 });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!supabase) return NextResponse.json({ message: 'Supabase not configured' }, { status: 500 });
    const id = params.id;
    if (!id) return NextResponse.json({ message: 'id is required' }, { status: 400 });
    const { error } = await supabase.from('role_rate_catalog').delete().eq('id', id);
    if (error) return NextResponse.json({ message: error.message }, { status: 500 });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || 'Internal error' }, { status: 500 });
  }
}

