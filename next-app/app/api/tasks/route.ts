
import { ok, err } from '../_lib/db';
import { NextRequest } from 'next/server';
import { supabase } from '@/app/lib/supabaseClient';
import redis from '@/lib/redis';

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

    let query = supabase
      .from('tasks')
      .select('*, projects(id, name), milestones(id, title), assigned_user:users!assignedTo(id, name)')
      .order('dueDate', { ascending: true });

    if (q) query = query.ilike('title', `%${q}%`);
    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);
    if (projectId) query = query.eq('projectId', projectId);
    if (assignedTo) query = query.eq('assignedTo', assignedTo);
    if (milestoneId) query = query.eq('milestoneId', milestoneId);

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

    const payload = {
      title,
      description,
      status,
      priority,
      dueDate: dueDate || null,
      estimatedHours: estimatedHours ? Number(estimatedHours) : 0,
      projectId,
      milestoneId: milestoneId || null,
      assignedTo: assignedTo || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    
    // Invalidate all tasks cache after creating a new task
    await redis.del('tasks:*');
    console.log('Invalidated all tasks cache after POST');
    
    return ok(data, 201);
  } catch (e: any) {
    return err(e?.message || 'error', 500);
  }
}
