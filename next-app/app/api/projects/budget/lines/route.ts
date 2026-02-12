import { NextRequest, NextResponse } from 'next/server';
import { pool } from '../../../_lib/db';
import { supabase } from '../../../../lib/supabaseClient';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    if (!projectId) return NextResponse.json({}, { status: 200 });

    let project: any = null;
    try {
      const { data } = await supabase.from('projects').select('*').eq('id', projectId).single();
      project = data;
    } catch {
      const r = await pool.query('SELECT * FROM projects WHERE id=$1', [projectId]);
      project = r.rows[0] || null;
    }
    if (!project) return NextResponse.json({}, { status: 200 });
    const budget = Number(project.budget ?? 0);

    let milestones: any[] = [];
    try {
      const { data } = await supabase.from('milestones').select('*').eq('project_id', projectId);
      milestones = data || [];
    } catch {
      const r = await pool.query(`SELECT id,name,percentage,status,due_date FROM milestones WHERE project_id=$1`, [projectId]);
      milestones = r.rows || [];
    }

    const paid = milestones.filter(m => (m.status || '').toLowerCase() === 'paid')
      .map(m => ({ id: m.id, amount: (Number(m.percentage || 0) / 100) * budget, date: m.due_date || null, type: 'paid' }));
    const approved = milestones.filter(m => (m.status || '').toLowerCase() === 'approved')
      .map(m => ({ id: m.id, amount: (Number(m.percentage || 0) / 100) * budget, date: m.due_date || null, type: 'committed' }));
    const lines = [...approved, ...paid];

    const summary = {
      approvedBudget: approved.reduce((s, l) => s + l.amount, 0),
      paidAmount: paid.reduce((s, l) => s + l.amount, 0),
      actualCost: Number(project.spent ?? 0),
      committedCost: approved.reduce((s, l) => s + l.amount, 0),
      remainingBudget: Math.max(budget - Number(project.spent ?? 0) - approved.reduce((s, l) => s + l.amount, 0), 0),
      totalBudget: budget
    };

    return NextResponse.json({ lines, summary }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'budget lines error' }, { status: 500 });
  }
}
