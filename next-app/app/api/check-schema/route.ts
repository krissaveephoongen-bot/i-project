import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/app/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'admin client missing' }, { status: 500 })
    }

    const results: any = {
      tables: {},
      columns: {},
      success: true
    }

    // Check if tables exist
    const tables = ['cashflow', 'spi_cpi_daily_snapshot']
    
    for (const table of tables) {
      try {
        const { data, error } = await supabaseAdmin
          .from(table)
          .select('*')
          .limit(1)

        if (!error) {
          results.tables[table] = {
            exists: true,
            hasData: data && data.length > 0,
            sampleColumns: data && data.length > 0 ? Object.keys(data[0]) : []
          }
        } else {
          results.tables[table] = {
            exists: false,
            error: error.message
          }
        }
      } catch (e: any) {
        results.tables[table] = {
          exists: false,
          error: e.message
        }
      }
    }

    // Test SPI/CPI snapshot with different column names
    try {
      const { data: projectIdTest, error: projectIdError } = await supabaseAdmin
        .from('spi_cpi_daily_snapshot')
        .select('id, projectId, date, spi, cpi')
        .limit(1)

      if (!projectIdError) {
        results.columns.spi_cpi_snapshot_projectId = 'EXISTS'
      } else {
        results.columns.spi_cpi_snapshot_projectId = projectIdError.message
      }
    } catch (e: any) {
      results.columns.spi_cpi_snapshot_projectId = e.message
    }

    try {
      const { data: project_idTest, error: project_idError } = await supabaseAdmin
        .from('spi_cpi_daily_snapshot')
        .select('id, project_id, date, spi, cpi')
        .limit(1)

      if (!project_idError) {
        results.columns.spi_cpi_snapshot_project_id = 'EXISTS'
      } else {
        results.columns.spi_cpi_snapshot_project_id = project_idError.message
      }
    } catch (e: any) {
      results.columns.spi_cpi_snapshot_project_id = e.message
    }

    return NextResponse.json(results)

  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error', success: false }, { status: 500 })
  }
}
