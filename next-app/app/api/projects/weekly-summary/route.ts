import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/app/lib/supabaseAdmin';

export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    if (!supabaseAdmin) return NextResponse.json({ error: 'admin client missing' }, { status: 500 });

    const { data: projects, error: projError } = await supabaseAdmin
        .from('projects')
        .select('id, name, progress, progress_plan, spi');
    
    if (projError) throw projError;

    const ids = (projects || []).map((p: any) => p.id);
    const today = new Date();
    const lastWeek = new Date(); lastWeek.setDate(lastWeek.getDate() - 7);
    const lastWeekStr = lastWeek.toISOString().slice(0, 10);

    // Fetch snapshot from ~7 days ago for all projects
    const { data: snaps, error: snapError } = ids.length ? await supabaseAdmin
        .from('spi_cpi_daily_snapshot')
        .select('projectid, date, progress')
        .in('projectid', ids)
        .gte('date', lastWeekStr)
        .order('date', { ascending: true }) // Oldest first (closest to 7 days ago)
        : { data: [], error: null };

    if (snapError) throw snapError;

    const snapMap: Record<string, number> = {};
    (snaps || []).forEach((s: any) => {
        // Since sorted asc, first one encountered for a project is the oldest in range
        if (!snapMap[s.projectid]) snapMap[s.projectid] = Number(s.progress || 0);
    });

    const summary = (projects || []).map((p: any) => {
        const currentProgress = Number(p.progress || 0);
        const prevProgress = snapMap[p.id] ?? currentProgress; // If no snap, assume no change
        const delta = currentProgress - prevProgress;

        return {
            id: p.id,
            name: p.name,
            progressActual: currentProgress,
            progressPlan: Number(p.progressPlan || 0),
            spi: Number(p.spi || 1),
            weeklyDelta: Number(delta.toFixed(2))
        };
    });

    // Sort by progress desc
    summary.sort((a: any, b: any) => b.progressActual - a.progressActual);

    return NextResponse.json({ summary, timestamp: new Date().toISOString() }, { status: 200 });

  } catch (e: any) {
    console.error('Weekly Summary Error:', e);
    return NextResponse.json({ error: e?.message || 'weekly summary error' }, { status: 500 });
  }
}
