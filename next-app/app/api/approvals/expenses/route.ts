import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/app/lib/supabaseAdmin'

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from('expenses')
      .select(`
        id,userId,projectId,taskId,date,amount,category,description,rejectedReason,status,approvedBy,approvedAt,
        user:users!expenses_userId_fkey(id,name),
        project:projects!expenses_projectId_fkey(id,name),
        task:tasks!expenses_taskId_fkey(id,title)
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
      amount: d.amount,
      category: d.category,
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
