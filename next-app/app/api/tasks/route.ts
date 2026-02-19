
import { ok, err } from '../_lib/db';
import { NextRequest } from 'next/server';
import { supabase } from '@/app/lib/supabaseClient';
import redis from '@/lib/redis';
import { firstOk, isSchemaColumnError, MILESTONE_ID_COLUMNS, PROJECT_ID_COLUMNS } from '../_lib/supabaseCompat';

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

    const projectCols = projectId ? PROJECT_ID_COLUMNS : ([] as any);
    const milestoneCols = milestoneId ? MILESTONE_ID_COLUMNS : ([] as any);
    const assignedCols = assignedTo ? (['assigned_to', 'assignedTo', 'assignedto'] as const) : ([] as any);

    const run = (pCol?: string, mCol?: string, aCol?: string) => {
      let query: any = supabase.from('tasks').select('*').order('created_at', { ascending: false });
      if (q) query = query.ilike('title', `%${q}%`);
      if (status) query = query.eq('status', status);
      if (priority) query = query.eq('priority', priority);
      if (projectId && pCol) query = query.eq(pCol, projectId);
      if (milestoneId && mCol) query = query.eq(mCol, milestoneId);
      if (assignedTo && aCol) query = query.eq(aCol, assignedTo);
      return query;
    };

    let data: any = null;
    let error: any = null;
    if (projectId || milestoneId || assignedTo) {
      const pList = projectId ? (projectCols as readonly string[]) : [undefined];
      const mList = milestoneId ? (milestoneCols as readonly string[]) : [undefined];
      const aList = assignedTo ? (assignedCols as readonly string[]) : [undefined];

      let last: any = null;
      outer: for (const pCol of pList) {
        for (const mCol of mList) {
          for (const aCol of aList) {
            const res = await run(pCol, mCol, aCol);
            last = res;
            if (!res.error) {
              data = res.data;
              error = null;
              break outer;
            }
            if (!isSchemaColumnError(res.error)) {
              data = res.data;
              error = res.error;
              break outer;
            }
          }
        }
      }
      if (error == null && data == null && last) {
        data = last.data;
        error = last.error;
      }
    } else {
      const res = await run();
      data = res.data;
      error = res.error;
    }
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
    const snakeBase: any = {
      title,
      description,
      status,
      priority,
      project_id: projectId,
      created_at: nowIso,
      updated_at: nowIso
    };
    const snakeWithCreatedBy: any = { ...snakeBase, created_by: 'system' };
    const snakePayload: any = { ...snakeWithCreatedBy };
    if (dueDate) snakePayload.due_date = dueDate;
    if (estimatedHours != null) snakePayload.estimated_hours = Number(estimatedHours) || 0;
    if (milestoneId) snakePayload.milestone_id = milestoneId;
    if (assignedTo) snakePayload.assigned_to = assignedTo;

    const camelBase: any = {
      title,
      description,
      status,
      priority,
      projectId,
      created_at: nowIso,
      updated_at: nowIso
    };
    const camelWithCreatedBy: any = { ...camelBase, createdBy: 'system' };
    const camelPayload: any = { ...camelWithCreatedBy };
    if (dueDate) camelPayload.dueDate = dueDate;
    if (estimatedHours != null) camelPayload.estimatedHours = Number(estimatedHours) || 0;
    if (milestoneId) camelPayload.milestoneId = milestoneId;
    if (assignedTo) camelPayload.assignedTo = assignedTo;

    let data: any = null;
    let error: any = null;
    for (const p of [snakeBase, camelBase, snakePayload, camelPayload]) {
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
