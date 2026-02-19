
import { ok, err } from '../../_lib/db';
import { NextRequest } from 'next/server';
import { supabase } from '@/app/lib/supabaseClient';
import redis from '@/lib/redis';
import { orEq } from '../../_lib/supabaseCompat';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return ok(data, 200);
  } catch (e: any) {
    return err(e?.message || 'error', 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    
    // Protect fields
    const allowed = ['title', 'description', 'status', 'priority', 'dueDate', 'estimatedHours', 'actualHours', 'assignedTo', 'projectId', 'milestoneId'];
    const nowIso = new Date().toISOString();
    const toSnake: Record<string, string> = {
      dueDate: 'due_date',
      estimatedHours: 'estimated_hours',
      actualHours: 'actual_hours',
      assignedTo: 'assigned_to',
      projectId: 'project_id',
      milestoneId: 'milestone_id',
    };
    const snakePayload: any = { updated_at: nowIso };
    const camelPayload: any = { updatedAt: nowIso };
    for (const k of allowed) {
      if (!(k in body)) continue;
      const v = (body as any)[k];
      camelPayload[k] = v;
      snakePayload[toSnake[k] ?? k] = v;
    }

    let data: any = null;
    let error: any = null;
    for (const p of [snakePayload, camelPayload]) {
      const res = await supabase.from('tasks').update(p).eq('id', id).select().single();
      data = res.data;
      error = res.error;
      if (!error) break;
      const msg = `${error.message || ''}`;
      if (msg.includes('Could not find the') || msg.includes('schema cache')) continue;
      break;
    }
    if (error) throw error;
    
    // Invalidate all tasks cache after updating a task
    await redis.delPattern('tasks:*');
    console.log('Invalidated all tasks cache after PUT');
    
    return ok(data, 200);
  } catch (e: any) {
    return err(e?.message || 'error', 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    // Check for existing timesheet entries referencing this task
    const base = supabase.from('time_entries').select('id').limit(1);
    const { data: entries, error: entriesErr } = await orEq(base, ['task_id', 'taskId', 'taskid'], id);
    if (entriesErr) throw entriesErr;

    if ((entries || []).length > 0) {
      // Soft deactivate task to preserve data integrity (Single Source of Truth)
      let updErr: any = null;
      for (const p of [
        { status: 'inactive', updated_at: new Date().toISOString() },
        { status: 'inactive', updatedAt: new Date().toISOString() },
      ]) {
        const { error } = await supabase.from('tasks').update(p as any).eq('id', id);
        if (!error) {
          updErr = null;
          break;
        }
        updErr = error;
        const msg = `${error.message || ''}`;
        if (msg.includes('Could not find the') || msg.includes('schema cache')) continue;
        break;
      }
      if (updErr) throw updErr;
      return ok({ success: true, mode: 'soft_inactive' }, 200);
    } else {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      if (error) throw error;
      
      // Invalidate all tasks cache after deleting a task
      await redis.delPattern('tasks:*');
      console.log('Invalidated all tasks cache after DELETE');
      
      return ok({ success: true, mode: 'deleted' }, 200);
    }
  } catch (e: any) {
    return err(e?.message || 'error', 500);
  }
}
