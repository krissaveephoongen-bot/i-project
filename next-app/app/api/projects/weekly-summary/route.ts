import { NextRequest } from 'next/server';
import { ok, err } from '../../_lib/db';

export async function GET(_req: NextRequest) {
  try {
    const host = _req.headers.get('host') || 'localhost:3000';
    const proto = _req.headers.get('x-forwarded-proto') || 'http';
    const base = `${proto}://${host}`;
    const res = await fetch(`${base}/api/projects/`, { cache: 'no-store' });
    const projects = res.ok ? await res.json() : [];
    const summary: any[] = [];
    for (const p of (projects || [])) {
      try {
        const snapRes = await fetch(`${base}/api/projects/progress/snapshot?projectId=${p.id}`, { cache: 'no-store' });
        const snap = snapRes.ok ? await snapRes.json() : { points: [] };
        const pts = snap.points || [];
        const last = pts.slice(-1)[0];
        const prev = pts.slice(-8, -7)[0] || pts.slice(0, 1)[0];
        const delta = last && prev ? Number(last.actual || 0) - Number(prev.actual || 0) : 0;
        summary.push({
          id: p.id,
          name: p.name,
          progressActual: Number(last?.actual || 0),
          progressPlan: Number(last?.plan || 0),
          spi: Number(last?.spi || 1),
          weeklyDelta: Number(delta.toFixed(2))
        });
      } catch {}
    }
    return ok({ summary, timestamp: new Date().toISOString() }, 200);
  } catch (e: any) {
    return err(e?.message || 'weekly summary error', 500);
  }
}
