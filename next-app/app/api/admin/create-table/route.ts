import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/app/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'admin client missing' }, { status: 500 })
    }

    const { action, sql } = await request.json();
    
    if (action === 'create_table' && sql) {
      // Try to create table using raw SQL
      const { data, error } = await supabaseAdmin
        .from('spi_cpi_daily_snapshot')
        .select('*')
        .limit(1);

      // If table doesn't exist, try to create it
      if (error && error.message.includes('does not exist')) {
        const createResult = await supabaseAdmin
          .from('spi_cpi_daily_snapshot')
          .insert({
            id: 'test-record',
            projectId: 'test-project',
            date: '2026-02-17',
            spi: 1.0,
            cpi: 1.0
          });

        if (createResult.error) {
          return NextResponse.json({ error: createResult.error.message }, { status: 500 })
        }

        // Clean up test record
        await supabaseAdmin
          .from('spi_cpi_daily_snapshot')
          .delete()
          .eq('id', 'test-record');
      }

      return NextResponse.json({ 
        success: true, 
        tableExists: !error,
        message: error ? error.message : 'Table already exists'
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 })
  }
}
