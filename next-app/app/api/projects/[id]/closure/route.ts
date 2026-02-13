import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/app/lib/supabaseClient'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    const { closureChecklist, status, warrantyStartDate, warrantyEndDate } = body

    // Validate progress if status is being set to 'Delivered' or 'Warranty'
    if (status === 'Delivered' || status === 'Warranty') {
        const { data: tasks } = await supabase.from('tasks').select('weight, progressActual, progress_actual').eq('projectId', id);
        
        const totalWeight = (tasks || []).reduce((s: number, t: any) => s + Number(t.weight || 0), 0) || 1;
        const actualWeighted = (tasks || []).reduce((s: number, t: any) => s + (Number(t.weight || 0) * Number(t.progressActual ?? t.progress_actual ?? 0)), 0);
        const progress = Number((actualWeighted / totalWeight).toFixed(2));

        if (progress < 100) {
             return NextResponse.json({ error: `Cannot set status to ${status}. Project progress is only ${progress}% (must be 100%)` }, { status: 400 });
        }
    }

    const payload: any = {}
    if (closureChecklist !== undefined) payload.closure_checklist = closureChecklist
    if (status !== undefined) payload.status = status
    if (warrantyStartDate !== undefined) payload.warranty_start_date = warrantyStartDate
    if (warrantyEndDate !== undefined) payload.warranty_end_date = warrantyEndDate
    
    // Always update timestamp
    payload.updatedAt = new Date().toISOString()

    const { data, error } = await supabase
      .from('projects')
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
