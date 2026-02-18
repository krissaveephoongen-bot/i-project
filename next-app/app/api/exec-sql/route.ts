import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/app/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'admin client missing' }, { status: 500 })
    }

    const { sql } = await request.json();
    
    if (!sql) {
      return NextResponse.json({ error: 'SQL query required' }, { status: 400 })
    }

    // Execute the SQL directly using rpc
    const { data, error } = await supabaseAdmin.rpc('exec_sql', { sql_query: sql })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, result: data })

  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 })
  }
}
