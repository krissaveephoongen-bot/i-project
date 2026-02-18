import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/app/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'admin client missing' }, { status: 500 })
    }

    // Get table schema information
    const { data: columns, error: schemaError } = await supabaseAdmin
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'spi_cpi_daily_snapshot')
      .order('ordinal_position')

    if (schemaError) {
      return NextResponse.json({ error: schemaError.message }, { status: 500 })
    }

    // Try to get sample data
    const { data: sample, error: dataError } = await supabaseAdmin
      .from('spi_cpi_daily_snapshot')
      .select('*')
      .limit(1)

    if (dataError) {
      return NextResponse.json({ error: dataError.message }, { status: 500 })
    }

    return NextResponse.json({
      table: 'spi_cpi_daily_snapshot',
      columns: columns || [],
      sampleData: sample || [],
      hasData: sample && sample.length > 0
    })

  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 })
  }
}
