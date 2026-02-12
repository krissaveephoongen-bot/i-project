import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/app/lib/supabaseClient'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    const action = String(body?.action || '').toLowerCase()
    const approvedBy = body?.approvedBy || null
    const reason = body?.reason || null

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const payload: any = {
      status: action === 'approve' ? 'approved' : 'rejected',
      approved_by: approvedBy,
      approved_at: new Date().toISOString(),
      rejected_reason: action === 'reject' ? (reason || null) : null,
    }

    const { data, error } = await supabase
      .from('timesheets')
      .update(payload)
      .eq('id', id)
      .select()
      .single()
    
    // Map response
    const res = data ? {
        id: data.id,
        userId: data.user_id,
        projectId: data.project_id,
        taskId: data.task_id,
        date: data.date,
        hours: data.hours,
        description: data.description,
        rejectedReason: data.rejected_reason,
        status: data.status,
        approvedBy: data.approved_by,
        approvedAt: data.approved_at
    } : null;

    if (error) throw error
    return NextResponse.json(res, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'error' }, { status: 500 })
  }
}
