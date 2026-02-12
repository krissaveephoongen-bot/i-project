import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabaseClient';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get('taskId');
    if (!taskId) return NextResponse.json([], { status: 200 });
    const { data } = await supabase
      .from('task_actual_logs')
      .select('*')
      .eq('task_id', taskId)
      .order('date', { ascending: true });
    return NextResponse.json(data || [], { status: 200 });
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { task_id, date, progress_percent = 0 } = body || {};
    if (!task_id || !date) return NextResponse.json({}, { status: 200 });
    const id = crypto.randomUUID();
    const { data } = await supabase
      .from('task_actual_logs')
      .insert({ id, task_id, date, progress_percent })
      .select()
      .single();
    return NextResponse.json(data || {}, { status: 200 });
  } catch {
    return NextResponse.json({}, { status: 200 });
  }
}
