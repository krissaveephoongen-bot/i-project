import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('time_entries')
      .select(`
        *,
        projects(id, name, status),
        tasks(id, title, status),
        users(id, name, email)
      `, { count: 'exact' })
      .eq('userId', userId)
      .eq('isDeleted', false)
      .order('date', { ascending: false });

    // Apply project filter if provided
    if (projectId) {
      query = query.eq('projectId', projectId);
    }

    // Apply status filter if provided
    if (status) {
      query = query.eq('status', status);
    }

    // Apply date range filter if provided
    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: timeEntries, error, count } = await query;

    if (error) {
      console.error('Error fetching staff timesheet:', error);
      return NextResponse.json(
        { error: 'Failed to fetch timesheet entries' },
        { status: 500 }
      );
    }

    // Calculate summary statistics
    const totalHours = timeEntries?.reduce((sum: number, entry: any) => sum + (entry.hours || 0), 0) || 0;
    const approvedHours = timeEntries?.filter((entry: any) => entry.status === 'approved')
      .reduce((sum: number, entry: any) => sum + (entry.hours || 0), 0) || 0;
    const pendingHours = timeEntries?.filter((entry: any) => entry.status === 'pending')
      .reduce((sum: number, entry: any) => sum + (entry.hours || 0), 0) || 0;

    return NextResponse.json({
      timeEntries: timeEntries || [],
      summary: {
        totalHours,
        approvedHours,
        pendingHours,
        totalEntries: count || 0
      },
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Get staff timesheet error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { timeEntryData, userId } = body;

    if (!timeEntryData || !userId) {
      return NextResponse.json(
        { error: 'Time entry data and user ID are required' },
        { status: 400 }
      );
    }

    // Create time entry
    const { data: timeEntry, error } = await supabase
      .from('time_entries')
      .insert({
        ...timeEntryData,
        userId: userId,
        status: 'pending',
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .select(`
        *,
        projects(id, name, status),
        tasks(id, title, status),
        users(id, name, email)
      `)
      .single();

    if (error) {
      console.error('Error creating time entry:', error);
      return NextResponse.json(
        { error: 'Failed to create time entry', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      timeEntry,
      message: 'Time entry created successfully'
    });

  } catch (error) {
    console.error('Create time entry error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { timeEntryId, updates, userId } = body;

    if (!timeEntryId || !updates || !userId) {
      return NextResponse.json(
        { error: 'Time entry ID, updates, and user ID are required' },
        { status: 400 }
      );
    }

    // Update time entry
    const { data: timeEntry, error } = await supabase
      .from('time_entries')
      .update({
        ...updates,
        updatedAt: new Date().toISOString()
      })
      .eq('id', timeEntryId)
      .eq('userId', userId) // Ensure user can only update their own entries
      .select(`
        *,
        projects(id, name, status),
        tasks(id, title, status),
        users(id, name, email)
      `)
      .single();

    if (error) {
      console.error('Error updating time entry:', error);
      return NextResponse.json(
        { error: 'Failed to update time entry', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      timeEntry,
      message: 'Time entry updated successfully'
    });

  } catch (error) {
    console.error('Update time entry error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeEntryId = searchParams.get('timeEntryId');
    const userId = searchParams.get('userId');

    if (!timeEntryId || !userId) {
      return NextResponse.json(
        { error: 'Time entry ID and user ID are required' },
        { status: 400 }
      );
    }

    // Soft delete time entry
    const { error } = await supabase
      .from('time_entries')
      .update({ 
        isDeleted: true,
        updatedAt: new Date().toISOString()
      })
      .eq('id', timeEntryId)
      .eq('userId', userId); // Ensure user can only delete their own entries

    if (error) {
      console.error('Error deleting time entry:', error);
      return NextResponse.json(
        { error: 'Failed to delete time entry', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Time entry deleted successfully'
    });

  } catch (error) {
    console.error('Delete time entry error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
