import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, updatedFields = {} } = body || {};
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const payload: any = {};
    const map: Record<string, string> = {
      name: 'name',
      weight: 'weight',
      progress_plan: 'progressPlan',
      progressPlan: 'progressPlan',
      progress_actual: 'progressActual',
      progressActual: 'progressActual',
      start_date: 'startDate',
      startDate: 'startDate',
      end_date: 'endDate',
      endDate: 'endDate',
      status: 'status',
      milestoneId: 'milestoneId',
      phase: 'phase'
    };
    for (const k of Object.keys(updatedFields)) {
      const col = map[k] || k;
      payload[col] = updatedFields[k];
    }
    payload.updatedAt = new Date().toISOString();
    const { data, error } = await supabase.from('tasks').update(payload).eq('id', id).select('*').single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'internal error' }, { status: 500 });
  }
}

