import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('tasks')
      .select(`
        *,
        projects(id, name, status),
        users(id, name, email)
      `, { count: 'exact' })
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    // Filter by assigned user or created by user
    query = query.or(`assignedTo.eq.${userId},createdBy.eq.${userId}`);

    // Apply project filter if provided
    if (projectId) {
      query = query.eq('projectId', projectId);
    }

    // Apply status filter if provided
    if (status) {
      query = query.eq('status', status);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: tasks, error, count } = await query;

    if (error) {
      console.error('Error fetching vendor tasks:', error);
      return NextResponse.json(
        { error: 'Failed to fetch tasks' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      tasks: tasks || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Get vendor tasks error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId, progress, evidence, userId } = body;

    if (!taskId || !userId) {
      return NextResponse.json(
        { error: 'Task ID and user ID are required' },
        { status: 400 }
      );
    }

    // Update task progress and evidence
    const updates: any = {
      updated_at: new Date().toISOString()
    };

    if (progress !== undefined) {
      updates.progress = progress;
    }

    if (evidence !== undefined) {
      updates.evidence = evidence;
    }

    // Update task
    const { data: task, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .eq('assignedTo', userId) // Ensure user can only update their assigned tasks
      .select(`
        *,
        projects(id, name, status),
        users(id, name, email)
      `)
      .single();

    if (error) {
      console.error('Error updating vendor task:', error);
      return NextResponse.json(
        { error: 'Failed to update task', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      task,
      message: 'Task updated successfully'
    });

  } catch (error) {
    console.error('Update vendor task error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
