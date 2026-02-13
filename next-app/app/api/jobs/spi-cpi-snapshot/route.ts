import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/app/lib/supabaseAdmin'

export const revalidate = 60

export async function POST() {
  try {
    if (!supabaseAdmin) return NextResponse.json({ ok: false, error: 'admin client missing' }, { status: 200 })
    const today = new Date()
    const dateStr = today.toISOString().slice(0, 10)

    const { data: projects, error } = await supabaseAdmin
      .from('projects')
      .select('id,budget,progress,spent,spi')

    if (error) throw error

    const rows = (projects || []).map((p: any) => {
      const budget = Number(p.budget || 0)
      const progress = Number(p.progress || 0)
      const actual = Number(p.spent || 0)
      const ev = budget * (progress / 100)
      const cpi = actual > 0 ? ev / actual : (progress > 0 ? 2 : 1)
      const spi = Number(p.spi ?? 1)
      return { id: `${p.id}-${dateStr}`, projectId: p.id, date: dateStr, spi: Number(spi.toFixed(2)), cpi: Number(cpi.toFixed(2)) }
    })

    const { error: upErr } = await supabaseAdmin
      .from('spi_cpi_daily_snapshot')
      .upsert(rows, { onConflict: 'id' })

    if (upErr) throw upErr
    return NextResponse.json({ ok: true, count: rows.length, date: dateStr }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'error' }, { status: 200 })
  }
}

