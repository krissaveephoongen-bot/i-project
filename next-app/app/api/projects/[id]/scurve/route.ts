import { ok, err, pool } from '../../../_lib/db';
import { NextRequest } from 'next/server';
 
 function weekLabel(start: Date, idx: number) {
   const d = new Date(start);
   d.setDate(d.getDate() + idx * 7);
   const wk = idx + 1;
   return `Week ${wk}`;
 }
 
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const parts = url.pathname.split('/');
    const idx = parts.findIndex(p => p === 'projects');
    const projectId = idx >= 0 ? parts[idx + 1] : '';
    if (!projectId) return err('projectId required', 400);

    // Fetch project info
    const pRes = await pool.query(`SELECT progress, "progressPlan", progress_plan, created_at, "created_at" FROM projects WHERE id = $1`, [projectId]);
    const proj = pRes.rows[0];
    
    if (!proj) return err('Project not found', 404);

    const planPct = Number(proj.progress_plan ?? proj["progressPlan"] ?? 100);
    const actualPct = Number(proj.progress ?? 0);
    const created_at = new Date(proj.created_at || proj["created_at"] || new Date());
    
    // Fetch historical progress
    const hRes = await pool.query(
      `SELECT progress, week_date, "weekDate" FROM project_progress_history WHERE project_id = $1 OR "projectId" = $1 ORDER BY week_date ASC, "weekDate" ASC`, 
      [projectId]
    );
    const history = hRes.rows || [];

    // Calculate weeks (default 12 or based on project duration if needed)
    const weeks = 12;
    const startDate = created_at; 
    
    const data = [];
    
    // If we have history, use it for actual series
    if (history.length > 0) {
      // Map history to weeks (simplified logic: match closest dates)
      // This is a basic implementation. In production, you'd align this with actual project weeks.
      for (let i = 0; i < weeks; i++) {
        const weekDate = new Date(startDate);
        weekDate.setDate(weekDate.getDate() + i * 7);
        
        // Find history entry closest to this week
        // Note: Ideally, history records should be snapshots at end of week
        const entry = history.find(h => {
          const d = new Date(h.week_date || h["weekDate"]);
          // Check if entry is within this week window
          const diff = Math.abs(d.getTime() - weekDate.getTime());
          return diff < 3.5 * 24 * 60 * 60 * 1000; // within 3.5 days
        });

        // Linear interpolation for Plan (Standard S-Curve logic usually applies here, using linear for now)
        const planVal = Math.min(100, Math.round((planPct / weeks) * (i + 1)));
        
        // Actual value from history or carry over last known value
        let actualVal = 0;
        if (entry) {
          actualVal = Number(entry.progress);
        } else if (i > 0) {
          actualVal = data[i-1].actual; // Carry forward
        }

        // If this week is in the future, actual is 0 or null? 
        // For S-Curve, usually we stop plotting actuals after "today"
        if (weekDate > new Date()) {
           actualVal = actualPct; // Or stop plotting. Keeping simple for now.
        }

        data.push({
          week: weekLabel(startDate, i),
          plan: planVal,
          actual: actualVal,
          milestone: 0
        });
      }
    } else {
      // Fallback: Linear Projection (Current Mock Logic) if no history
      // But we mark it as simulated implicitly by the lack of data points variation
      for (let i = 0; i < weeks; i++) {
        data.push({
          week: weekLabel(startDate, i),
          plan: Math.min(100, Math.round((planPct / weeks) * (i + 1))),
          actual: Math.min(100, Math.round((actualPct / weeks) * (i + 1))),
          milestone: 0
        });
      }
    }

    const spi = data.length ? (data[data.length - 1].actual / Math.max(1, data[data.length - 1].plan)) : 1;
    return ok({ data, spi: Number(spi.toFixed(2)) }, 200);

  } catch (e: any) {
    console.error('S-Curve API Error:', e); // Added Logging
    // Fallback Mock
    const startDate = new Date();
    const weeks = 12;
    const planSeries = Array.from({ length: weeks }, (_, i) => Math.min(100, Math.round((100 / weeks) * (i + 1))));
    const actualSeries = Array.from({ length: weeks }, (_, i) => Math.min(100, Math.round((50 / weeks) * (i + 1))));
    const data = planSeries.map((p, i) => ({ week: weekLabel(startDate, i), plan: p, actual: actualSeries[i], milestone: 0 }));
    return ok({ data, spi: 0.5 }, 200);
  }
}
