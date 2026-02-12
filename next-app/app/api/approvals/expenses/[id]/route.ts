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
      approvedBy,
      approvedAt: new Date().toISOString(),
      rejectedReason: action === 'reject' ? (reason || null) : null,
    }

    const { data, error } = await supabase
      .from('expenses')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'error' }, { status: 500 })
  }
}
