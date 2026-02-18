import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/app/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'admin client missing' }, { status: 500 })
    }

    // Direct query to spi_cpi_daily_snapshot table
    const { data, error } = await supabaseAdmin
      .from('spi_cpi_daily_snapshot')
      .select('id, projectId, date, spi, cpi, created_at')
      .order('date', { ascending: false })
      .limit(10)

    if (error) {
      return NextResponse.json({ 
        error: error.message,
        note: 'This confirms if spi_cpi_daily_snapshot table exists and column names'
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      snapshots: data || [],
      count: data?.length || 0,
      query: 'Direct SELECT from spi_cpi_daily_snapshot table',
      columns: data?.length > 0 ? Object.keys(data[0]) : []
    })

  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 })
  }
}
