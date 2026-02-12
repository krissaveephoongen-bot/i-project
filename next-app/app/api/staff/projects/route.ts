import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
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
      .from('projects')
      .select(`
        *,
        clients(id, name, email),
        tasks(id, title, status, projectId),
        time_entries(id, date, hours, projectId),
        project_members(id, userId, role)
      `, { count: 'exact' })
      .eq('isDeleted', false)
      .order('createdAt', { ascending: false });

    // Filter by user (either as manager or member)
    query = query.or(`managerId.eq.${userId},project_members.userId.eq.${userId}`);

    // Apply status filter if provided
    if (status) {
      query = query.eq('status', status);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: projects, error, count } = await query;

    if (error) {
      console.error('Error fetching staff projects:', error);
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      projects: projects || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Get staff projects error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectData, userId } = body;

    if (!projectData || !userId) {
      return NextResponse.json(
        { error: 'Project data and user ID are required' },
        { status: 400 }
      );
    }

    // Create project with manager as the current user
    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        ...projectData,
        managerId: userId,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      return NextResponse.json(
        { error: 'Failed to create project', details: error.message },
        { status: 400 }
      );
    }

    // Add the creator as a project member
    await supabase
      .from('project_members')
      .insert({
        id: `pm-${Date.now()}`,
        projectId: project.id,
        userId: userId,
        role: 'manager',
        joinedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

    return NextResponse.json({
      project,
      message: 'Project created successfully'
    });

  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
