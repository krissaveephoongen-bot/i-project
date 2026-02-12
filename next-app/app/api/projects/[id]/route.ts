import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/app/lib/supabaseClient'

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    // Check dependent records: tasks, time_entries, expenses, documents
    const [tasks, timesheets, expenses, documents] = await Promise.all([
      supabase.from('tasks').select('id').eq('projectId', id).limit(1),
      supabase.from('time_entries').select('id').eq('projectId', id).limit(1),
      supabase.from('expenses').select('id').eq('projectId', id).limit(1),
      supabase.from('documents').select('id').eq('projectId', id).limit(1),
    ])

    const hasDeps =
      (tasks.data || []).length > 0 ||
      (timesheets.data || []).length > 0 ||
      (expenses.data || []).length > 0 ||
      (documents.data || []).length > 0

    if (hasDeps) {
      // Archive project to preserve Single Source of Truth
      const { error: updErr } = await supabase
        .from('projects')
        .update({ isArchived: true, updatedAt: new Date().toISOString() })
        .eq('id', id)
      if (updErr) throw updErr
      return NextResponse.json({ success: true, mode: 'archived' }, { status: 200 })
    } else {
      const { error: delErr } = await supabase.from('projects').delete().eq('id', id)
      if (delErr) throw delErr
      return NextResponse.json({ success: true, mode: 'deleted' }, { status: 200 })
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'error' }, { status: 500 })
  }
}
