import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/app/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'admin client missing' }, { status: 500 })
    }

    const { action, sql } = await request.json();
    
    if (action === 'create_cashflow_table' && sql) {
      // Execute SQL to create cashflow table
      const { data, error } = await supabaseAdmin
        .rpc('exec_sql', { sql_query: sql })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, result: data })
    }
    
    if (action === 'create_spi_snapshot_table' && sql) {
      // Execute SQL to create spi_cpi_daily_snapshot table
      const { data, error } = await supabaseAdmin
        .rpc('exec_sql', { sql_query: sql })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, result: data })
    }
    
    if (action === 'check_tables') {
      // Check if tables exist
      const tables = [];
      
      // Check cashflow table
      const { data: cashflowData, error: cashflowError } = await supabaseAdmin
        .from('cashflow')
        .select('id')
        .limit(1);
      
      if (!cashflowError) {
        tables.push({ name: 'cashflow', exists: cashflowData && cashflowData.length > 0 });
      }
      
      // Check spi_cpi_daily_snapshot table
      const { data: snapshotData, error: snapshotError } = await supabaseAdmin
        .from('spi_cpi_daily_snapshot')
        .select('id')
        .limit(1);
      
      if (!snapshotError) {
        tables.push({ name: 'spi_cpi_daily_snapshot', exists: snapshotData && snapshotData.length > 0 });
      }
      
      return NextResponse.json({ success: true, tables })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 })
  }
}
