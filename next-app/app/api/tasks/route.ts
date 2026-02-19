
import { ok, err } from '../_lib/db';
import { NextRequest } from 'next/server';
import { supabase } from '@/app/lib/supabaseClient';
import redis from '@/lib/redis';
import { withMilestoneId, withProjectId } from '../_lib/supabaseCompat';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const u = new URL(req.url);
    const q = u.searchParams.get('q');
    const status = u.searchParams.get('status');
    const priority = u.searchParams.get('priority');
    const projectId = u.searchParams.get('projectId');
    const assignedTo = u.searchParams.get('assignedTo');
    const milestoneId = u.searchParams.get('milestoneId');

    // Create cache key based on filters
    const cacheKey = `tasks:${JSON.stringify({ q, status, priority, projectId, assignedTo, milestoneId })}`;
    
    // Try to get from Redis cache first
    const cachedTasks = await redis.get(cacheKey);
    
    if (cachedTasks) {
      console.log('Cache hit for tasks:', cacheKey);
      return ok(JSON.parse(cachedTasks), 200);
    }

    console.log('Cache miss for tasks, fetching from database');

    let query = supabase.from('tasks').select('*').order('due_date', { ascending: true }).order('dueDate', { ascending: true });

    if (q) query = query.ilike('title', `%${q}%`);
    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);
    if (projectId) query = withProjectId(query, projectId);
    if (assignedTo) query = query.eq('assignedTo', assignedTo);
    if (milestoneId) query = withMilestoneId(query, milestoneId);

    const { data, error } = await query;
    if (error) throw error;
    
    // Cache the tasks for 2 minutes (shorter cache for frequently changing data)
    await redis.set(cacheKey, JSON.stringify(data || []), { EX: 120 });
    console.log('Cached tasks for 2 minutes:', cacheKey);
    
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
      dueDate, estimatedHours, projectId, milestoneId, assignedTo 
    } = body;

    if (!title) return err('Title is required', 400);
    if (!projectId) return err('Project is required', 400);

    const nowIso = new Date().toISOString();
    const snakePayload: any = {
      title,
      description,
      status,
      priority,
      due_date: dueDate || null,
      estimated_hours: estimatedHours ? Number(estimatedHours) : 0,
      project_id: projectId,
      milestone_id: milestoneId || null,
      assigned_to: assignedTo || null,
      created_at: nowIso,
      updated_at: nowIso
    };
    const camelPayload: any = {
      title,
      description,
      status,
      priority,
      dueDate: dueDate || null,
      estimatedHours: estimatedHours ? Number(estimatedHours) : 0,
      projectId,
      milestoneId: milestoneId || null,
      assignedTo: assignedTo || null,
      created_at: nowIso,
      updated_at: nowIso
    };

    let data: any = null;
    let error: any = null;
    for (const p of [snakePayload, camelPayload]) {
      const res = await supabase.from('tasks').insert([p]).select().single();
      data = res.data;
      error = res.error;
      if (!error) break;
      const msg = `${error.message || ''}`;
      if (msg.includes('Could not find the') || msg.includes('schema cache')) continue;
      break;
    }
    if (error) throw error;
    
    // Invalidate all tasks cache after creating a new task
    await redis.delPattern('tasks:*');
    console.log('Invalidated all tasks cache after POST');
    
    return ok(data, 201);
  } catch (e: any) {
    return err(e?.message || 'error', 500);
  }
}
