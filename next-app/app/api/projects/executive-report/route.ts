import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/app/lib/supabaseAdmin';

export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    if (!supabaseAdmin) return NextResponse.json({ error: 'admin client missing' }, { status: 500 });

    // 1. Fetch all projects
    const { data: projects, error: projError } = await supabaseAdmin
        .from('projects')
        .select('id, name, spi, budget, status');

    if (projError) throw projError;

    const ids = (projects || []).map((p: any) => p.id);

    // 2. Fetch High Risks
    const { data: risks, error: riskError } = ids.length ? await supabaseAdmin
        .from('risks')
        .select('projectId, severity, status')
        .in('projectId', ids) 
        : { data: [], error: null };
    
    if (riskError) throw riskError;

    // 3. Fetch Overdue Milestones
    const today = new Date().toISOString().slice(0, 10);
    const { data: milestones, error: mileError } = ids.length ? await supabaseAdmin
        .from('milestones')
        .select('id, projectId, dueDate, due_date, status')
        .in('projectId', ids)
        .lt('due_date', today) // Overdue
        : { data: [], error: null };

    if (mileError) throw mileError;

    // --- Calculations ---

    // A. High Risk Projects
    const riskCounts: Record<string, number> = {};
    (risks || []).forEach((r: any) => {
        if ((r.severity || '').toLowerCase() === 'high' && (r.status || '').toLowerCase() !== 'closed') {
            riskCounts[r.projectId] = (riskCounts[r.projectId] || 0) + 1;
        }
    });

    const highRiskProjects = (projects || []).filter((p: any) => riskCounts[p.id] > 0).map((p: any) => ({
        id: p.id,
        name: p.name,
        highRiskCount: riskCounts[p.id]
    }));

    // B. Overdue Milestones Count (Global)
    const overdueCount = (milestones || []).filter((m: any) => {
        const st = (m.status || '').toLowerCase();
        return st !== 'paid' && st !== 'completed';
    }).length;

    // C. Avg SPI
    const totalSpi = (projects || []).reduce((sum: number, p: any) => sum + Number(p.spi || 1), 0);
    const avgSpi = projects?.length ? totalSpi / projects.length : 1;

    // D. Watchlist (Lowest SPI)
    const watchlist = [...(projects || [])]
        .sort((a: any, b: any) => Number(a.spi || 1) - Number(b.spi || 1))
        .slice(0, 5)
        .map((p: any) => ({
            id: p.id,
            name: p.name,
            spi: Number(p.spi || 1)
        }));

    const report = {
      title: 'Executive Project Report',
      date: today,
      summary: {
        totalProjects: projects?.length || 0,
        avgSpi: avgSpi.toFixed(2),
        highRiskProjects,
        overdueMilestones: overdueCount,
        // budgetTotals: ... (optional, if needed)
      },
      watchlist,
      // statusCounts: ...
    };

    return NextResponse.json(report, { status: 200 });
  } catch (e: any) {
    console.error('Executive Report Error:', e);
    return NextResponse.json({ error: e?.message || 'executive report error' }, { status: 500 });
  }
}
