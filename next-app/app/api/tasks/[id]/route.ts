
import { ok, err } from '../../_lib/db';
import { NextRequest } from 'next/server';
import { supabase } from '@/app/lib/supabaseClient';

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
    const allowed = ['title', 'description', 'status', 'priority', 'dueDate', 'estimatedHours', 'actualHours', 'assignedTo', 'projectId'];
    const payload: any = {};
    for (const k of allowed) {
        if (k in body) payload[k] = body[k];
    }
    payload.updatedAt = new Date().toISOString();

    const { data, error } = await supabase
      .from('tasks')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return ok(data, 200);
  } catch (e: any) {
    return err(e?.message || 'error', 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    // Check for existing timesheet entries referencing this task
    const { data: entries, error: entriesErr } = await supabase
      .from('time_entries')
      .select('id')
      .eq('taskId', id)
      .limit(1);
    if (entriesErr) throw entriesErr;

    if ((entries || []).length > 0) {
      // Soft deactivate task to preserve data integrity (Single Source of Truth)
      const { error: updErr } = await supabase
        .from('tasks')
        .update({ status: 'inactive', updatedAt: new Date().toISOString() })
        .eq('id', id);
      if (updErr) throw updErr;
      return ok({ success: true, mode: 'soft_inactive' }, 200);
    } else {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return ok({ success: true, mode: 'deleted' }, 200);
    }
  } catch (e: any) {
    return err(e?.message || 'error', 500);
  }
}
