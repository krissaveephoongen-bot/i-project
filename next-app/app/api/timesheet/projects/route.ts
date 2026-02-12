
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // 1. Get all active projects (not archived)
    // In a real app, you might filter by projects assigned to the user OR all public projects
    // For now, we return all active projects to ensure "Customer -> Project -> Task" flow works for everyone
    const { data: projects, error: projError } = await supabase
      .from('projects')
      .select('id, name, code, isArchived')
      .eq('isArchived', false)
      .order('name');

    if (projError) throw projError;

    // 2. Get tasks for these projects
    // We can filter tasks assigned to user OR unassigned OR all tasks depending on policy
    // Let's fetch all tasks for these projects for now to allow selecting any task
    const projectIds = (projects || []).map((p: any) => p.id);
    
    let tasks: any[] = [];
    if (projectIds.length > 0) {
        const { data: t } = await supabase
            .from('tasks')
            .select('id, title, projectId, status')
            .in('projectId', projectIds)
            .neq('status', 'done') // Exclude completed tasks? Maybe. Let's keep it open or filtered.
            .neq('status', 'cancelled')
            .neq('status', 'inactive');
        tasks = t || [];
    }

    // 3. Map tasks to projects
    const tasksMap: Record<string, Array<{ id: string; name: string }>> = {};
    for (const t of tasks) {
      const name = t.title || t.id; // Task table has 'title', not 'name'
      const pid = t.projectId;
      tasksMap[pid] = tasksMap[pid] || [];
      tasksMap[pid].push({ id: t.id, name });
    }

    // 4. Construct response
    const rows = (projects || []).map((p: any) => ({
      id: p.id,
      name: p.name || p.code || p.id,
      is_billable: false, // Default
      tasks: tasksMap[p.id] || []
    }));

    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error('Timesheet projects error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
