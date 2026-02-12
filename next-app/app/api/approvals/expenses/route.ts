import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/app/lib/supabaseClient'

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('id,userId,projectId,taskId,date,amount,category,description,rejectedReason,status,approvedBy,approvedAt, user:users(id,name), project:projects(id,name), task:tasks(id,title)')
      .eq('status', 'pending')
      .order('date', { ascending: false })

    if (error) throw error
    return NextResponse.json(data || [], { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'error' }, { status: 500 })
  }
}
