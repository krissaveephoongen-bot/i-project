import { NextRequest } from 'next/server';
import { ok, err } from '../../_lib/db';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  try {
    const host = _req.headers.get('host') || 'localhost:3000';
    const proto = _req.headers.get('x-forwarded-proto') || 'http';
    const base = `${proto}://${host}`;
    const res = await fetch(`${base}/api/projects/insights`, { cache: 'no-store' });
    const insights = res.ok ? await res.json() : null;
    if (!insights) return err('no insights', 500);
    const worstSpiRes = await fetch(`${base}/api/projects/`, { cache: 'no-store' });
    const projects = worstSpiRes.ok ? await worstSpiRes.json() : [];
    const series: Array<{ id: string; spi: number; name: string }> = [];
    for (const p of (projects || [])) {
      try {
        const ovr = await fetch(`${base}/api/projects/overview/${p.id}`, { cache: 'no-store' });
        const ov = ovr.ok ? await ovr.json() : null;
        if (ov) series.push({ id: p.id, name: p.name, spi: Number(ov.project?.spi || 1) });
      } catch {}
    }
    series.sort((a, b) => a.spi - b.spi);
    const watchlist = series.slice(0, 5);
    const report = {
      title: 'Executive Project Report',
      date: new Date().toISOString().slice(0, 10),
      summary: {
        totalProjects: insights.total,
        avgSpi: Number(insights.avgSpi || 1).toFixed(2),
        highRiskProjects: insights.highRiskProjects,
        overdueMilestones: insights.overdueMilestones,
        budgetTotals: insights.budgetTotals
      },
      watchlist,
      statusCounts: insights.statusCounts
    };
    return ok(report, 200);
  } catch (e: any) {
    return err(e?.message || 'executive report error', 500);
  }
}
