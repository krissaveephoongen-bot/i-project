import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const milestoneId = searchParams.get('milestoneId');
    let query = supabase.from('tasks').select('*');
    if (projectId) query = query.eq('projectId', projectId);
    if (milestoneId) query = query.eq('milestoneId', milestoneId);
    const { data, error } = await query;
    if (error) return NextResponse.json([], { status: 200 });
    const rows = (data || []).map((t: any) => ({
      id: t.id,
      name: t.name,
      phase: t.phase ?? null,
      milestoneId: t.milestoneId ?? null,
      projectId: t.projectId,
      weight: Number(t.weight ?? 0),
      progressPlan: Number(t.progressPlan ?? t.progress_plan ?? 0),
      progressActual: Number(t.progressActual ?? t.progress_actual ?? 0),
      startDate: t.startDate ?? t.start_date ?? null,
      endDate: t.endDate ?? t.end_date ?? null,
      status: t.status ?? 'Pending',
    }));
    return NextResponse.json(rows, { status: 200 });
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

