import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabaseClient';
import crypto from 'node:crypto';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const projects = (searchParams.get('projects') || '').split(',').filter(Boolean);

    if (!user_id || !start || !end) {
      return NextResponse.json({ error: 'user_id, start, end are required' }, { status: 400 });
    }

    // Query time_entries (camelCase columns)
    let q = supabase
      .from('time_entries')
      .select('*')
      .eq('userId', user_id)
      .gte('date', start)
      .lte('date', end);
      
    if (projects.length > 0) {
      q = q.in('projectId', projects);
    }
    const { data, error } = await q.order('date', { ascending: true });
    
    if (error) {
       console.error('Error fetching time_entries:', error);
       return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data || [], { status: 200 });
  } catch (error: any) {
    console.error('Timesheet entries error:', error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Payload might come as snake_case from service (mapToApiPayload), or camelCase. 
    // We should handle what we receive.
    // The service I wrote sends snake_case for some fields (user_id, project_id) but let's check.
    // Service: if (entry.userId) payload.user_id = entry.userId;
    // So service sends snake_case.
    // We need to map it to camelCase for DB insert.
    
    const { 
      user_id, 
      project_id, 
      task_id, 
      date, 
      hours, 
      start_time, 
      end_time, 
      description,
      activity_type,
      billable
    } = body || {};

    if (!user_id || !date) {
      return NextResponse.json({ error: 'user_id and date required' }, { status: 400 });
    }
    
    const payload: any = {
      id: crypto.randomUUID(),
      userId: user_id,
      projectId: project_id || null,
      taskId: task_id || null,
      date,
      hours: Number(hours || 0),
      startTime: start_time || null,
      endTime: end_time || null,
      description: description || null,
      workType: activity_type || 'project', // DB column is workType
      billableHours: billable ? Number(hours || 0) : 0,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const { data, error } = await supabase.from('time_entries').insert(payload).select().single();
    
    if (error) {
        console.error('Error inserting time_entries:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data, { status: 200 });
  } catch (e: any) {
    console.error('POST Timesheet Error:', e);
    return NextResponse.json({ error: e?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    // Service sends snake_case keys in body
    const { id, hours, task_id, start_time, end_time, description, activity_type, billable } = body || {};
    
    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }
    
    const payload: any = { updatedAt: new Date().toISOString() };
    if (typeof hours !== 'undefined') payload.hours = Number(hours || 0);
    if (typeof task_id !== 'undefined') payload.taskId = task_id || null;
    if (typeof start_time !== 'undefined') payload.startTime = start_time || null;
    if (typeof end_time !== 'undefined') payload.endTime = end_time || null;
    if (typeof description !== 'undefined') payload.description = description || null;
    if (typeof activity_type !== 'undefined') payload.workType = activity_type;
    if (typeof billable !== 'undefined') payload.billableHours = billable ? Number(hours || 0) : 0;

    const { data, error } = await supabase.from('time_entries').update(payload).eq('id', id).select().single();
    
    if (error) {
        console.error('Error updating time_entries:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (e: any) {
    console.error('PUT Timesheet Error:', e);
    return NextResponse.json({ error: e?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }
    const { error } = await supabase.from('time_entries').delete().eq('id', id);
    if (error) {
        console.error('Error deleting time_entries:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    console.error('DELETE Timesheet Error:', e);
    return NextResponse.json({ error: e?.message || 'Internal Server Error' }, { status: 500 });
  }
}
