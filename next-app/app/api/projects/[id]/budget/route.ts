 import { ok, err, pool } from '../../../_lib/db';
 
 export async function GET(_: Request, { params }: { params: { id: string } }) {
   try {
     const projectId = params.id;
     if (!projectId) return err('projectId required', 400);
     const pRes = await pool.query(`SELECT id, name, budget, spent FROM projects WHERE id = $1`, [projectId]);
     const proj = pRes.rows[0] || { budget: 0, spent: 0 };
     const budget = Number(proj.budget || 0);
     const spent = Number(proj.spent || 0);
 
     const msRes = await pool.query(`
       SELECT id, name, amount, percentage, COALESCE(due_date, "dueDate") AS "dueDate", status
       FROM milestones
       WHERE project_id = $1
       ORDER BY COALESCE(due_date, "dueDate") ASC NULLS LAST
     `, [projectId]).catch(() => ({ rows: [] }));
     const milestones = (msRes.rows || []).map((m: any) => ({
       id: m.id,
       name: m.name,
       amount: Number(m.amount || 0),
       percentage: Number(m.percentage || 0),
       dueDate: m.dueDate,
       status: m.status || 'Pending'
     }));
     const paidAmount = milestones.filter(m => String(m.status).toLowerCase() === 'paid').reduce((s, m) => s + Number(m.amount || 0), 0);
     const approvedAmount = milestones.filter(m => String(m.status).toLowerCase() === 'approved').reduce((s, m) => s + Number(m.amount || 0), 0);
     const pendingAmount = Math.max(0, budget - paidAmount);
 
     const tsRes = await pool.query(`
       SELECT t.user_id, t.project_id, t.date::date AS day, t.hours, u.hourly_rate
       FROM timesheets t
       LEFT JOIN users u ON u.id = t.user_id
       WHERE t.project_id = $1
     `, [projectId]).catch(() => ({ rows: [] }));
     const monthlyMap: Record<string, { revenue: number; cost: number }> = {};
     for (const m of milestones) {
       if (!m.dueDate) continue;
       const d = new Date(m.dueDate);
       const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
       monthlyMap[key] = monthlyMap[key] || { revenue: 0, cost: 0 };
       monthlyMap[key].revenue += Number(m.amount || 0);
     }
     for (const r of (tsRes.rows || [])) {
       const d = new Date(r.day);
       const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
       monthlyMap[key] = monthlyMap[key] || { revenue: 0, cost: 0 };
       const rate = Number(r.hourly_rate || 0);
       monthlyMap[key].cost += Number(r.hours || 0) * rate;
     }
     const monthly = Object.entries(monthlyMap).map(([k, v]) => ({
       month: k,
       revenue: v.revenue.toFixed(2),
       cost: v.cost.toFixed(2)
     })).sort((a, b) => a.month.localeCompare(b.month));
 
     const summary = {
       approvedBudget: budget,
       actualCost: spent > 0 ? spent : monthly.reduce((s, x) => s + Number(x.cost), 0),
       committedCost: milestones.reduce((s, x) => s + Number(x.amount || 0), 0),
       remainingBudget: Math.max(0, budget - (spent > 0 ? spent : monthly.reduce((s, x) => s + Number(x.cost), 0))),
       paidAmount,
       approvedAmount,
       pendingAmount,
       totalBudget: budget
     };
 
     return ok({ summary, monthly, milestones }, 200);
   } catch (e: any) {
     return err(e?.message || 'error', 500);
   }
 }
