import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/app/lib/supabaseAdmin'

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from('time_entries')
      .select(`
        id,userId,projectId,taskId,date,hours,description,rejectedReason,status,approvedBy,approvedAt,
        user:users!time_entries_userId_fkey(id,name),
        project:projects!time_entries_projectId_fkey(id,name),
        task:tasks!time_entries_taskId_fkey(id,title)
      `)
      .eq('status', 'pending')
      .order('date', { ascending: false })

    if (error) throw error

    const mapped = (data || []).map((d: any) => ({
      id: d.id,
      userId: d.userId,
      projectId: d.projectId,
      taskId: d.taskId,
      date: d.date,
      hours: d.hours,
      description: d.description,
      rejectedReason: d.rejectedReason,
      status: d.status,
      approvedBy: d.approvedBy,
      approvedAt: d.approvedAt,
      user: d.user,
      project: d.project,
      task: d.task,
    }))

    return NextResponse.json(mapped, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'error' }, { status: 500 })
  }
}
