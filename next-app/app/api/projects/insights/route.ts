import { NextRequest } from 'next/server';
import { ok, err, pool } from '../../_lib/db';
import { supabase } from '../../../lib/supabaseClient';

export async function GET(_req: NextRequest) {
  try {
    const projects: any[] = [];
    try {
      const { data, error } = await supabase.from('projects').select('*');
      if (error) throw error;
      projects.push(...(data || []));
    } catch {
      const r = await pool.query('SELECT * FROM projects');
      projects.push(...(r.rows || []));
    }
    const list: any[] = [];
    const host = _req.headers.get('host') || 'localhost:3000';
    const proto = _req.headers.get('x-forwarded-proto') || 'http';
    const base = `${proto}://${host}`;
    for (const p of projects) {
      try {
        const res = await fetch(`${base}/api/projects/overview/${p.id}`, { cache: 'no-store' });
        const ov = res.ok ? await res.json() : null;
        if (ov) list.push({ id: p.id, name: p.name, status: p.status, overview: ov });
      } catch {}
    }
    const total = list.length;
    const statusCounts = {
      active: list.filter(x => String(x.status || '').toLowerCase() === 'active').length,
      planning: list.filter(x => String(x.status || '').toLowerCase() === 'planning').length,
      completed: list.filter(x => String(x.status || '').toLowerCase() === 'completed').length
    };
    const avgSpi = list.length ? (list.reduce((s, x) => s + Number(x.overview?.project?.spi || 1), 0) / list.length) : 1;
    const highRiskProjects = list
      .map(x => ({ id: x.id, name: x.name, high: (x.overview?.risks || []).filter((r: any) => (r.severity || '').toLowerCase() === 'high').length }))
      .sort((a, b) => b.high - a.high)
      .slice(0, 5);
    const overdueMilestones = list.reduce((s, x) => {
      const today = new Date();
      const count = (x.overview?.milestones || []).filter((m: any) => {
        const d = m.due_date || m.dueDate;
        const status = String(m.status || '').toLowerCase();
        if (!d) return false;
        const dt = new Date(d);
        return dt < today && !['paid', 'approved', 'completed'].includes(status);
      }).length;
      return s + count;
    }, 0);
    const budgetTotals = list.reduce((acc, x) => {
      const s = x.overview?.summary || {};
      acc.totalBudget += Number(s.totalBudget || 0);
      acc.committed += Number(s.committedCost || 0);
      acc.actualCost += Number(s.actualCost || 0);
      acc.remaining += Number(s.remainingBudget || 0);
      return acc;
    }, { totalBudget: 0, committed: 0, actualCost: 0, remaining: 0 });
    const payload = { total, statusCounts, avgSpi, highRiskProjects, overdueMilestones, budgetTotals, timestamp: new Date().toISOString() };
    return ok(payload, 200);
  } catch (e: any) {
    return err(e?.message || 'insights error', 500);
  }
}
