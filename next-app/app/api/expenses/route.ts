import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabaseClient';
import { supabaseAdmin } from '@/app/lib/supabaseAdmin';
import crypto from 'node:crypto';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json({ error: 'user_id required' }, { status: 400 });
    }

    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from('expenses')
      .select('id, user_id, user_id, project_id, project_id, task_id, task_id, date, amount, category, description, status, rejected_reason, rejectedReason, approved_by, approvedBy, approved_at, approvedAt, approver_id, receiptUrl, details, project:projects(id, name), task:tasks(id, title), approver:users!approver_id(id, name)')
      .eq('user_id', user_id) // or 'user_id' depending on what supabase sees
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching expenses:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Map to camelCase
    const mapped = (data || []).map((d: any) => ({
      id: d.id,
      user_id: d.user_id || d.user_id,
      project_id: d.project_id || d.project_id,
      task_id: d.task_id || d.task_id,
      date: d.date,
      amount: d.amount,
      category: d.category,
      description: d.description,
      status: d.status,
      rejectedReason: d.rejectedReason || d.rejected_reason,
      approvedBy: d.approvedBy || d.approved_by,
      approvedAt: d.approvedAt || d.approved_at,
      approverId: d.approver_id, // snake_case in db
      approver: d.approver,
      receiptUrl: d.receiptUrl,
      details: d.details,
      project: d.project,
      task: d.task
    }));

    return NextResponse.json(mapped, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, project_id, task_id, date, amount, category, description, receiptUrl, details, approverId } = body;

    const uid = user_id || user_id;
    const pid = project_id || project_id;

    if (!uid || !pid || !date || !amount || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const payload = {
      id: crypto.randomUUID(),
      user_id: uid,
      project_id: pid,
      task_id: task_id || task_id || null,
      date,
      amount: Number(amount),
      category,
      description: description || null,
      receiptUrl: receiptUrl || null,
      details: details || null,
      approvedBy: null,
      approvedAt: null,
      approver_id: approverId || null,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const client = supabaseAdmin || supabase;
    const { data, error } = await client.from('expenses').insert(payload).select().single();

    if (error) {
      console.error('Error creating expense:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, project_id, task_id, date, amount, category, description, receiptUrl, details } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    // Check if expense is editable (pending)
    const client = supabaseAdmin || supabase;
    const { data: existing } = await client.from('expenses').select('status').eq('id', id).single();
    if (existing && existing.status !== 'pending' && existing.status !== 'rejected') {
       return NextResponse.json({ error: 'Cannot edit processed expense' }, { status: 403 });
    }

    const payload: any = {
      updated_at: new Date().toISOString()
    };
    const pid = project_id || project_id;
    const tsk = task_id ?? task_id;
    if (pid) payload.project_id = pid;
    if (tsk !== undefined) payload.task_id = tsk || null;
    if (date) payload.date = date;
    if (amount) payload.amount = Number(amount);
    if (category) payload.category = category;
    if (description !== undefined) payload.description = description;
    if (receiptUrl !== undefined) payload.receiptUrl = receiptUrl;
    if (details !== undefined) payload.details = details;
    
    // Reset status to pending on edit if it was rejected
    if (existing && existing.status === 'rejected') {
        payload.status = 'pending';
        payload.rejectedReason = null;
    }

    const { data, error } = await client.from('expenses').update(payload).eq('id', id).select().single();

    if (error) {
      console.error('Error updating expense:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }
    
    // Check if expense is deletable (pending)
    const client = supabaseAdmin || supabase;
    const { data: existing } = await client.from('expenses').select('status').eq('id', id).single();
    if (existing && existing.status !== 'pending' && existing.status !== 'rejected') {
       return NextResponse.json({ error: 'Cannot delete processed expense' }, { status: 403 });
    }

    const { error } = await client.from('expenses').delete().eq('id', id);

    if (error) {
      console.error('Error deleting expense:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal Server Error' }, { status: 500 });
  }
}
