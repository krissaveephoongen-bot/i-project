import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabaseClient';
import { firstOk, MILESTONE_ID_COLUMNS, PROJECT_ID_COLUMNS } from '../../_lib/supabaseCompat';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const milestoneId = searchParams.get('milestoneId');
    let data: any[] | null = null;
    let error: any = null;

    if (projectId && milestoneId) {
      const res = await firstOk(PROJECT_ID_COLUMNS, async (pCol) =>
        firstOk(MILESTONE_ID_COLUMNS, (mCol) =>
          supabase.from('tasks').select('*').eq(pCol, projectId).eq(mCol, milestoneId)
        )
      );
      data = (res as any)?.data ?? null;
      error = (res as any)?.error ?? null;
    } else if (projectId) {
      const res = await firstOk(PROJECT_ID_COLUMNS, (pCol) => supabase.from('tasks').select('*').eq(pCol, projectId));
      data = (res as any).data;
      error = (res as any).error;
    } else if (milestoneId) {
      const res = await firstOk(MILESTONE_ID_COLUMNS, (mCol) => supabase.from('tasks').select('*').eq(mCol, milestoneId));
      data = (res as any).data;
      error = (res as any).error;
    } else {
      const res = await supabase.from('tasks').select('*');
      data = res.data;
      error = res.error;
    }
    if (error) return NextResponse.json([], { status: 200 });
    const rows = (data || []).map((t: any) => ({
      id: t.id,
      name: t.name,
      phase: t.phase ?? null,
      milestoneId: t.milestoneId ?? null,
      projectId: t.projectId ?? t.project_id ?? null,
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
