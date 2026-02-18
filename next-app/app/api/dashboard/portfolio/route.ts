import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/app/lib/supabaseAdmin'

export const revalidate = 0

export async function GET(req: NextRequest) {
  // Add cache-busting headers
  const headers = new Headers({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  
  try {
    if (!supabaseAdmin) return NextResponse.json({ rows: [], cashflow: [], spiTrend: [], spiSnaps: [], error: 'admin client missing' }, { status: 200, headers })

    const { data: projects, error } = await supabaseAdmin
      .from('projects')
      .select('*')
      .order('updatedAt', { ascending: false })

    if (error) throw error
    const list: any[] = projects || []

    const managerIds = Array.from(new Set(list.map((p: any) => p.managerId || p.manager_id).filter(Boolean)))
    const clientIds = Array.from(new Set(list.map((p: any) => p.clientId || p.client_id).filter(Boolean)))
    const { data: managers } = managerIds.length ? await supabaseAdmin.from('users').select('id,name').in('id', managerIds) : { data: [] }
    const { data: clients } = clientIds.length ? await supabaseAdmin.from('clients').select('id,name').in('id', clientIds) : { data: [] }
    const managersMap: Record<string, any> = {}
    const clientsMap: Record<string, any> = {}
    for (const m of (managers || [])) managersMap[m.id] = m
    for (const c of (clients || [])) clientsMap[c.id] = c

    const ids = list.map(p => p.id)
    const { data: milestones } = ids.length ? await supabaseAdmin.from('milestones').select('id,projectId,project_id,status,percentage,dueDate,due_date').in('project_id', ids) : { data: [] }
    const budgetByProject: Record<string, number> = {}
    for (const p of list) budgetByProject[p.id] = Number(p.budget || 0)
    // Pre-process milestones for all projects
    const milestonesByProject: Record<string, any[]> = {}
    const overdueCounts: Record<string, number> = {}
    const committedByProject: Record<string, number> = {}
    
    const today = new Date().toISOString().slice(0, 10);

    for (const m of (milestones || [])) {
        const pid = m.projectId || m.project_id
        if (!milestonesByProject[pid]) milestonesByProject[pid] = []
        milestonesByProject[pid].push(m)

        // Overdue check
        const d = m.dueDate || m.due_date
        const st = String(m.status || '').toLowerCase()
        if (d && d < today && st !== 'paid' && st !== 'completed') {
            overdueCounts[pid] = (overdueCounts[pid] || 0) + 1
        }

        // Committed check (approved status)
        if (st === 'approved') {
            const budget = budgetByProject[pid] || 0
            const pct = Number(m.percentage || 0)
            const amt = (pct / 100) * budget
            committedByProject[pid] = (committedByProject[pid] || 0) + amt
        }
    }

    const linesByProject: Record<string, any[]> = {}
    for (const m of (milestones || [])) {
      const pid = m.projectId || m.project_id
      const budget = budgetByProject[pid] || 0
      const pct = Number(m.percentage || 0)
      const amount = (pct / 100) * budget
      const date = m.dueDate || m.due_date || null
      const status = String(m.status || '').toLowerCase()
      const type = status === 'paid' ? 'paid' : (status === 'approved' ? 'committed' : null)
      if (!type) continue
      linesByProject[pid] = linesByProject[pid] || []
      linesByProject[pid].push({ amount, date, type })
    }
    const monthly: Record<string, { committed: number; paid: number }> = {}
    for (const pid of Object.keys(linesByProject)) {
      for (const l of linesByProject[pid]) {
        const d = (l.date || '').slice(0, 7)
        if (!d) continue
        monthly[d] = monthly[d] || { committed: 0, paid: 0 }
        if (l.type === 'committed') monthly[d].committed += Number(l.amount || 0)
        if (l.type === 'paid') monthly[d].paid += Number(l.amount || 0)
      }
    }
    const cashflow = Object.keys(monthly).sort().map(m => ({ month: m, committed: monthly[m].committed, paid: monthly[m].paid }))

    const since = new Date(); since.setDate(since.getDate() - 30)
    const sinceStr = since.toISOString().slice(0, 10)
    const { data: snaps } = ids.length ? await supabaseAdmin
      .from('spi_cpi_daily_snapshot')
      .select('projectId,date,spi')
      .in('projectId', ids)
      .gte('date', sinceStr)
      : { data: [] }
    const spiByDate: Record<string, { sum: number; count: number }> = {}
    for (const s of (snaps || [])) {
      const d = s.date
      spiByDate[d] = spiByDate[d] || { sum: 0, count: 0 }
      spiByDate[d].sum += Number(s.spi || 1)
      spiByDate[d].count += 1
    }
    const spiTrend = Object.keys(spiByDate).sort().map(d => ({ date: d, spi: spiByDate[d].count ? spiByDate[d].sum / spiByDate[d].count : 1 }))

    // Risk Aggregation
    const { data: risks } = ids.length ? await supabaseAdmin.from('risks').select('projectId,severity,status').in('projectId', ids) : { data: [] }
    const risksByProject: Record<string, { high: number; medium: number; low: number }> = {}
    for (const r of (risks || [])) {
        const pid = r.projectId
        if (!risksByProject[pid]) risksByProject[pid] = { high: 0, medium: 0, low: 0 }
        const sev = (r.severity || '').toLowerCase()
        if (sev === 'high') risksByProject[pid].high++
        else if (sev === 'medium') risksByProject[pid].medium++
        else if (sev === 'low') risksByProject[pid].low++
    }

    const rows = list.map((p: any) => {
      const budget = Number(p.budget || 0)
      const progress = Number(p.progress || 0)
      const actual = Number(p.spent || 0)
      const committed = committedByProject[p.id] || 0
      const ev = budget * (progress / 100)
      const cpi = actual > 0 ? ev / actual : (progress > 0 ? 2 : 1)
      const riskCounts = risksByProject[p.id] || { high: 0, medium: 0, low: 0 }
      
      return {
        id: p.id,
        name: p.name,
        status: p.status || 'Active',
        progress,
        spi: Number(p.spi ?? 1),
        cpi,
        weeklyDelta: 0,
        budget,
        committed,
        actual,
        remaining: Math.max(budget - actual - committed, 0),
        risks: riskCounts,
        overdueMilestones: overdueCounts[p.id] || 0,
        managerName: managersMap[p.managerId || p.manager_id]?.name || '',
        clientName: clientsMap[p.clientId || p.client_id]?.name || ''
      }
    })

    return NextResponse.json({ rows, cashflow, spiTrend, spiSnaps: snaps || [] }, { status: 200, headers })
  } catch (e: any) {
    return NextResponse.json({ rows: [], cashflow: [], spiTrend: [], spiSnaps: [], error: e?.message || 'error' }, { status: 200, headers })
  }
}

