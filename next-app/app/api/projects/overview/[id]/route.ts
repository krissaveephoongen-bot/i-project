import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabaseClient';
import { withProjectId } from '../../../_lib/supabaseCompat';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const projectId = params.id;
  try {
    // Project base
    const { data: project } = await supabase.from('projects').select('*').eq('id', projectId).single();
    if (!project) return NextResponse.json({ error: 'project not found' }, { status: 404 });

    // Tasks
    const { data: tasks } = await withProjectId(supabase.from('tasks').select('*'), projectId);
    const totalWeight = (tasks || []).reduce((s: number, t: any) => s + Number(t.weight || 0), 0) || 1;
    const actualWeighted = (tasks || []).reduce((s: number, t: any) => s + (Number(t.weight || 0) * Number(t.progressActual ?? t.progress_actual ?? 0)), 0);
    const progressOverall = Number((actualWeighted / totalWeight).toFixed(2));
    const planningWeighted = (tasks || []).reduce((s: number, t: any) => s + (Number(t.weight || 0) * Number(t.progressPlan ?? t.progress_plan ?? 0)), 0);
    const progressPlanning = Number((planningWeighted / totalWeight).toFixed(2));

    // Milestones
    const { data: milestonesRaw } = await withProjectId(supabase.from('milestones').select('*'), projectId);
    const milestones = (milestonesRaw || []).map((m: any) => ({
      id: m.id,
      title: m.title ?? m.name ?? '',
      description: m.description ?? null,
      progress: Number(m.progress ?? 0),
      amount: Number(m.amount ?? 0),
      percentage: Number(m.percentage ?? 0),
      status: m.status ?? 'Pending',
      dueDate: m.dueDate ?? m.due_date ?? null,
      actualDate: m.actualDate ?? m.actual_date ?? null,
      invoiceDate: m.invoiceDate ?? m.invoice_date ?? null,
      planReceivedDate: m.planReceivedDate ?? m.plan_received_date ?? null,
      receiptDate: m.receiptDate ?? m.receipt_date ?? null,
    }));

    // Risks
    const { data: risks } = await withProjectId(supabase.from('risks').select('*'), projectId);
    const riskCounts = {
      high: (risks || []).filter((r: any) => (r.severity || '').toLowerCase() === 'high').length,
      medium: (risks || []).filter((r: any) => (r.severity || '').toLowerCase() === 'medium').length,
      low: (risks || []).filter((r: any) => (r.severity || '').toLowerCase() === 'low').length,
    };

    // Documents
    const { data: documents } = await withProjectId(supabase.from('documents').select('*'), projectId);

    // Team
    const { data: team } = await withProjectId(supabase.from('project_members').select('*'), projectId);
    let teamWithNames = team || [];
    if ((team || []).length > 0) {
      const userIds = (team || []).map((t: any) => t.userId ?? t.user_id).filter(Boolean);
      if (userIds.length > 0) {
        const { data: users } = await supabase
          .from('users')
          .select('id,name')
          .in('id', userIds);
        const nameMap = new Map((users || []).map((u: any) => [u.id, u.name]));
        teamWithNames = (team || []).map((t: any) => ({ ...t, name: nameMap.get(t.userId ?? t.user_id) || null }));
      }
    }

    // Budget summary (basic)
    const budget = Number(project.budget ?? 0);
    const paidAmount = (milestones || [])
      .filter((m: any) => (m.status || '').toLowerCase() === 'paid')
      .reduce((s: number, m: any) => s + (Number(m.amount || ((Number(m.progress || 0) / 100) * budget)) || 0), 0);
    const approvedAmount = (milestones || [])
      .filter((m: any) => (m.status || '').toLowerCase() === 'approved')
      .reduce((s: number, m: any) => s + (Number(m.amount || ((Number(m.progress || 0) / 100) * budget)) || 0), 0);
    const actualCost = Number(project.spent ?? 0);
    const committedCost = approvedAmount;
    const remainingBudget = Math.max(budget - actualCost - committedCost, 0);

    const overview = {
      project: {
        id: project.id,
        name: project.name,
        status: project.status,
        startDate: project.start_date ?? project.startDate ?? null,
        endDate: project.end_date ?? project.endDate ?? null,
        warrantyStartDate: project.warranty_start_date ?? null,
        warrantyEndDate: project.warranty_end_date ?? null,
        closureChecklist: project.closure_checklist ?? [],
        budget,
        progress: progressOverall,
        planning: progressPlanning,
      },
      tasks: tasks || [],
      milestones: milestones || [],
      risks: risks || [],
      documents: documents || [],
      team: teamWithNames || [],
      summary: {
        approvedBudget: approvedAmount,
        actualCost,
        committedCost,
        remainingBudget,
        paidAmount,
        pendingAmount: Math.max(budget - paidAmount, 0),
        totalBudget: budget,
      }
    };
    return NextResponse.json(overview, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'overview error' }, { status: 500 });
  }
}
