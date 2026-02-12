
import { ok, err } from '../_lib/db';
import { NextRequest } from 'next/server';
import { supabase } from '@/app/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const u = new URL(req.url);
    const q = u.searchParams.get('q');
    const status = u.searchParams.get('status');
    const priority = u.searchParams.get('priority');
    const projectId = u.searchParams.get('projectId');
    const assignedTo = u.searchParams.get('assignedTo');

    let query = supabase
      .from('tasks')
      .select('*, projects(id, name), assigned_user:users!assignedTo(id, name)')
      .order('dueDate', { ascending: true });

    if (q) query = query.ilike('title', `%${q}%`);
    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);
    if (projectId) query = query.eq('projectId', projectId);
    if (assignedTo) query = query.eq('assignedTo', assignedTo);

    const { data, error } = await query;
    if (error) throw error;
    
    return ok(data || [], 200);
  } catch (e: any) {
    return err(e?.message || 'error', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      title, description, status = 'todo', priority = 'medium', 
      dueDate, estimatedHours, projectId, assignedTo 
    } = body;

    if (!title) return err('Title is required', 400);
    if (!projectId) return err('Project is required', 400);

    const payload = {
      title,
      description,
      status,
      priority,
      dueDate: dueDate || null,
      estimatedHours: estimatedHours ? Number(estimatedHours) : 0,
      projectId,
      assignedTo: assignedTo || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return ok(data, 201);
  } catch (e: any) {
    return err(e?.message || 'error', 500);
  }
}
