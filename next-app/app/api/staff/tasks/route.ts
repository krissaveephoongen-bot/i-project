import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    const project_id = searchParams.get('project_id');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    let query = supabaseAdmin
      .from('tasks')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Filter by assigned user or created by user
    query = query.or(`assignedTo.eq.${user_id},createdBy.eq.${user_id}`);

    // Apply project filter if provided
    if (project_id) {
      query = query.eq('project_id', project_id);
    }

    // Apply status filter if provided
    if (status) {
      query = query.eq('status', status);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    let { data: tasks, error, count } = await query;
    if (error) {
      console.error('Error fetching staff tasks:', error);
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
    console.error('Get staff tasks error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskData, user_id } = body;

    if (!taskData || !user_id) {
      return NextResponse.json(
        { error: 'Task data and user ID are required' },
        { status: 400 }
      );
    }

    // Create task with created by as the current user
    const { data: task, error } = await supabaseAdmin
      .from('tasks')
      .insert({
        ...taskData,
        createdBy: user_id,
        is_deleted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select(`
        *,
        projects(id, name, status),
        users(id, name, email)
      `)
      .single();

    if (error) {
      console.error('Error creating task:', error);
      return NextResponse.json(
        { error: 'Failed to create task', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      task,
      message: 'Task created successfully'
    });

  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
