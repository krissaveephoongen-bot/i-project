import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabaseClient';
import { withProjectId } from '../_lib/supabaseCompat';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    
    let query = supabase
      .from('milestones')
      .select('id, title, description, status, due_date, created_at')
      .order('due_date', { ascending: true });
    
    if (projectId) {
      query = withProjectId(query, projectId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching milestones:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Transform to camelCase
    const transformed = (data || []).map((milestone: any) => ({
      id: milestone.id,
      title: milestone.title,
      description: milestone.description,
      status: milestone.status,
      dueDate: milestone.due_date,
      createdAt: milestone.created_at
    }));
    
    return NextResponse.json(transformed, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, status = 'pending', dueDate, projectId } = body;
    
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }
    
    const payload = {
      title,
      description: description || null,
      status,
      due_date: dueDate || null,
      project_id: projectId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('milestones')
      .insert([payload])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating milestone:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, description, status, dueDate } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    
    const payload: any = {
      updated_at: new Date().toISOString()
    };
    
    if (title !== undefined) payload.title = title;
    if (description !== undefined) payload.description = description;
    if (status !== undefined) payload.status = status;
    if (dueDate !== undefined) payload.due_date = dueDate;
    
    const { data, error } = await supabase
      .from('milestones')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating milestone:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    
    const { error } = await supabase
      .from('milestones')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting milestone:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal Server Error' }, { status: 500 });
  }
}
