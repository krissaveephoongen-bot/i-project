import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/app/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'admin client missing' }, { status: 500 })
    }

    // Direct query to cashflow/budget_lines table
    const { data, error } = await supabaseAdmin
      .from('cashflow')
      .select('month, committed, paid, created_at')
      .order('month', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      cashflow: data || [],
      count: data?.length || 0,
      query: 'Direct SELECT from cashflow table'
    })

  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 })
  }
}
