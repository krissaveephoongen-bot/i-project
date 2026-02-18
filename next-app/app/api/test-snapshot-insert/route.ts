import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/app/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'admin client missing' }, { status: 500 })
    }

    const body = await request.json();
    
    // Try to insert a test record with the provided column name
    const { data, error } = await supabaseAdmin
      .from('spi_cpi_daily_snapshot')
      .insert([body])
      .select();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 200 })
    }

    // Clean up the test record
    if (data && data.length > 0) {
      await supabaseAdmin
        .from('spi_cpi_daily_snapshot')
        .delete()
        .eq('id', data[0].id);
    }

    return NextResponse.json({ ok: true, inserted: data }, { status: 200 })

  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Unknown error' }, { status: 500 })
  }
}
