import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/app/lib/supabaseAdmin'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await req.json()
    const { action, reason, approvedBy } = body

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const status = action === 'approve' ? 'approved' : 'rejected'
    const updateData: any = {
      status,
      updatedAt: new Date().toISOString()
    }

    if (status === 'approved') {
      updateData.approvedAt = new Date().toISOString()
      if (approvedBy) updateData.approvedBy = approvedBy
    } else {
      updateData.rejectedReason = reason
    }

    const { error } = await supabaseAdmin
      .from('expenses')
      .update(updateData)
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'error' }, { status: 500 })
  }
}
