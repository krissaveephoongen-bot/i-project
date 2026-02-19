import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabaseClient';
import { firstOk, PROJECT_ID_COLUMNS } from '../../../_lib/supabaseCompat';

type Point = { date: string; plan: number; actual: number; spi: number; milestone: number };

function startOfWeek(d: Date) {
  const dt = new Date(d);
  const day = dt.getDay();
  const diff = (day + 6) % 7; // make Monday start
  dt.setDate(dt.getDate() - diff);
  dt.setHours(0,0,0,0);
  return dt;
}

function addDays(d: Date, days: number) {
  const dt = new Date(d);
  dt.setDate(dt.getDate() + days);
  return dt;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId') || '';
    if (!projectId) return NextResponse.json({ points: [] }, { status: 200 });

    const { data: project } = await supabase.from('projects').select('*').eq('id', projectId).single();
    if (!project) return NextResponse.json({ points: [] }, { status: 200 });

    const budget = Number(project.budget ?? 0);
    const startDate: string | null = project.start_date ?? project.startDate ?? null;
    const endDate: string | null = project.end_date ?? project.endDate ?? null;

    const msRes = await firstOk(PROJECT_ID_COLUMNS, (col) => supabase.from('milestones').select('*').eq(col, projectId));
    const milestones = (msRes as any).data || [];

    const ms = (milestones || []).map((m: any) => {
      const pct = m.percentage != null ? Number(m.percentage || 0)
        : (budget > 0 ? Math.min(100, (Number(m.amount || 0) / budget) * 100) : 0);
      return {
        due: m.dueDate ?? m.due_date ?? null,
        actual: m.actualDate ?? m.actual_date ?? m.receiptDate ?? m.receipt_date ?? null,
        percentage: pct,
        id: m.id
      };
    });

    const tRes = await firstOk(PROJECT_ID_COLUMNS, (col) => supabase.from('tasks').select('*').eq(col, projectId));
    const tasks = (tRes as any).data || [];
    const tasksByMilestone: Record<string, any[]> = {};
    for (const t of (tasks || [])) {
      const mid = t.milestoneId || t.milestone_id || 'none';
      tasksByMilestone[mid] = tasksByMilestone[mid] || [];
      tasksByMilestone[mid].push(t);
    }

    // Determine timeline range
    const earliest = startDate || (ms.map((m: any) => m.due).filter(Boolean).sort()[0] || new Date().toISOString());
    const latest = endDate || (ms.map((m: any) => m.due).filter(Boolean).sort().slice(-1)[0] || addDays(new Date(), 180).toISOString());
    const start = startOfWeek(new Date(earliest));
    const end = startOfWeek(new Date(latest));

    // Prepare week buckets
    const weekKeys: string[] = [];
    const planInc: Record<string, number> = {};
    const actualInc: Record<string, number> = {};
    const milestoneInc: Record<string, number> = {};
    for (let dt = new Date(start); dt <= addDays(end, 7*30); dt = addDays(dt, 7)) {
      const k = startOfWeek(dt).toISOString().slice(0,10);
      weekKeys.push(k);
      planInc[k] = 0;
      actualInc[k] = 0;
      milestoneInc[k] = 0;
      if (dt > addDays(end, 7)) break;
    }

    // Financial milestones credited on due week
    for (const m of ms) {
      if (!m.due) continue;
      const k = startOfWeek(new Date(m.due)).toISOString().slice(0,10);
      if (k in milestoneInc) milestoneInc[k] += Number(m.percentage || 0);
    }

    // Distribute plan based on tasks duration and milestone percentage
    const weightOf = (t: any) => Number(t.weight ?? t.estimatedHours ?? t.estimated_hours ?? 1) || 0;
    const totalWeight = (tasks || []).reduce((s: number, t: any) => s + weightOf(t), 0) || 1;
    for (const mid of Object.keys(tasksByMilestone)) {
      const list = tasksByMilestone[mid];
      const msObj = ms.find((m: any) => String(m.id) === String(mid));
      const msPct = Number(msObj?.percentage || 0);
      const msWeight = list.reduce((s: number, t: any) => s + weightOf(t), 0) || 1;
      // If no tasks under this milestone, credit the milestone at its due week directly
      if (!list || list.length === 0) {
        if (msObj?.due) {
          const k = startOfWeek(new Date(msObj.due)).toISOString().slice(0,10);
          if (k in planInc) planInc[k] += msPct;
        }
        // Actual based on milestone actual/receipt/status
        const actualDate = msObj?.actual ?? null;
        const status = String((milestones || []).find((m: any) => String(m.id) === String(mid))?.status || '').toLowerCase();
        if (actualDate || status === 'paid') {
          const k = startOfWeek(new Date(actualDate || msObj!.due)).toISOString().slice(0,10);
          if (k in actualInc) actualInc[k] += msPct;
        }
        continue;
      }
      for (const t of list) {
        const taskShare = msPct > 0
          ? (weightOf(t) / msWeight) * msPct
          : (weightOf(t) / totalWeight) * 100;
        const sDate = t.startDate ?? t.start_date ?? earliest;
        const eDate = t.endDate ?? t.end_date ?? latest;
        const sW = startOfWeek(new Date(sDate));
        const eW = startOfWeek(new Date(eDate));
        let weeks = 0;
        for (let dt = new Date(sW); dt <= eW; dt = addDays(dt, 7)) weeks++;
        weeks = Math.max(weeks, 1);
        const perWeek = taskShare / weeks;
        for (let dt = new Date(sW); dt <= eW; dt = addDays(dt, 7)) {
          const k = startOfWeek(dt).toISOString().slice(0,10);
          if (k in planInc) planInc[k] += perWeek;
        }
        // Actual allocation
        const progressActual = Number(t.progressActual ?? t.progress_actual ?? 0);
        const status = String(t.status || '').toLowerCase();
        const receipt = t.actualDate ?? t.actual_date ?? null;
        if (receipt) {
          const k = startOfWeek(new Date(receipt)).toISOString().slice(0,10);
          if (k in actualInc) actualInc[k] += taskShare;
        } else if (progressActual > 0) {
          const nowW = startOfWeek(new Date());
          let weeksActual = 0;
          for (let dt = new Date(sW); dt <= nowW; dt = addDays(dt, 7)) weeksActual++;
          weeksActual = Math.max(weeksActual, 1);
          const actualShare = taskShare * (progressActual / 100);
          const perActual = actualShare / weeksActual;
          for (let dt = new Date(sW); dt <= nowW; dt = addDays(dt, 7)) {
            const k = startOfWeek(dt).toISOString().slice(0,10);
            if (k in actualInc) actualInc[k] += perActual;
          }
        } else if (status === 'completed') {
          const k = startOfWeek(new Date(eDate)).toISOString().slice(0,10);
          if (k in actualInc) actualInc[k] += taskShare;
        }
      }
    }

    // Build cumulative points
    const points: Point[] = [];
    let planCum = 0, actualCum = 0;
    for (const k of weekKeys) {
      planCum += Number(planInc[k] || 0);
      actualCum += Number(actualInc[k] || 0);
      planCum = Math.min(planCum, 100);
      actualCum = Math.min(actualCum, 100);
      const spi = planCum > 0 ? Number((actualCum / planCum).toFixed(2)) : 1;
      points.push({ date: k, plan: Number(planCum.toFixed(2)), actual: Number(actualCum.toFixed(2)), spi, milestone: Number(milestoneInc[k] || 0) });
    }

    return NextResponse.json({ points }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ points: [], error: e?.message || 'snapshot error' }, { status: 200 });
  }
}
