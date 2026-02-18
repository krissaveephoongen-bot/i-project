import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/app/lib/supabaseAdmin'

export async function POST() {
  try {
    if (!supabaseAdmin) return NextResponse.json({ ok: false, error: 'admin client missing' }, { status: 200 })
    // Find admin user by email
    const { data: users } = await supabaseAdmin.from('users').select('id,email,name,role').eq('email', 'jakgrits.ph@appworks.co.th').limit(1)
    const admin = (users || [])[0]
    if (!admin) return NextResponse.json({ ok: false, error: 'seed user not found' }, { status: 200 })

    // Create a client
    const clientId = crypto.randomUUID()
    await supabaseAdmin.from('clients').upsert({ id: clientId, name: 'AppWorks Test Client', email: 'client@appworks.co.th' })

    // Create a project
    const projectId = crypto.randomUUID()
    await supabaseAdmin.from('projects').upsert({
      id: projectId,
      name: 'Project Alpha',
      code: 'ALPHA-001',
      status: 'Active',
      progress: 45,
      budget: 500000,
      spent: 120000,
      spi: 1.02,
      managerId: admin.id,
      clientId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    // Create tasks
    const task1 = crypto.randomUUID()
    const task2 = crypto.randomUUID()
    await supabaseAdmin.from('tasks').upsert([
      { id: task1, projectId, title: 'Design Phase', status: 'in_progress', priority: 'medium', assignedTo: admin.id, createdBy: admin.id, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: task2, projectId, title: 'Implementation Phase', status: 'todo', priority: 'high', assignedTo: admin.id, createdBy: admin.id, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    ])

    // Pending timesheet entries
    const te1 = crypto.randomUUID()
    const te2 = crypto.randomUUID()
    await supabaseAdmin.from('time_entries').upsert([
      { id: te1, userId: admin.id, projectId, taskId: task1, date: new Date().toISOString(), hours: 4, description: 'UI exploration', status: 'pending', created_at: new Date().toISOString() },
      { id: te2, userId: admin.id, projectId, taskId: task2, date: new Date().toISOString(), hours: 3, description: 'API planning', status: 'pending', created_at: new Date().toISOString() },
    ])

    // Pending expenses
    const ex1 = crypto.randomUUID()
    await supabaseAdmin.from('expenses').upsert([
      { id: ex1, userId: admin.id, projectId, taskId: task1, date: new Date().toISOString(), amount: 2500, category: 'supplies', description: 'Design materials', status: 'pending', created_at: new Date().toISOString() },
    ])

    // Milestones for cashflow
    const today = new Date()
    const m1 = crypto.randomUUID(); const m2 = crypto.randomUUID(); const m3 = crypto.randomUUID(); const m4 = crypto.randomUUID()
    const addMonths = (d: Date, m: number) => { const x = new Date(d); x.setMonth(x.getMonth()+m); return x }
    await supabaseAdmin.from('milestones').upsert([
      { id: m1, project_id: projectId, name: 'Kickoff', percentage: 25, status: 'approved', due_date: addMonths(today,-2).toISOString() },
      { id: m2, project_id: projectId, name: 'Design Complete', percentage: 25, status: 'paid', due_date: addMonths(today,-1).toISOString() },
      { id: m3, project_id: projectId, name: 'Beta', percentage: 20, status: 'approved', due_date: addMonths(today,0).toISOString() },
      { id: m4, project_id: projectId, name: 'Go-Live', percentage: 30, status: 'approved', due_date: addMonths(today,1).toISOString() },
    ])

    // Seed SPI/CPI daily snapshots for last 10 days
    const snaps: any[] = []
    for (let i=10; i>=0; i--) {
      const d = new Date(); d.setDate(d.getDate()-i)
      const dateStr = d.toISOString().slice(0,10)
      const spi = 0.95 + Math.random()*0.2
      const ev = 500000 * (45/100)
      const cpi = 120000 > 0 ? ev / 120000 : 1
      snaps.push({ id: `${projectId}-${dateStr}`, projectId, date: dateStr, spi: Number(spi.toFixed(2)), cpi: Number(cpi.toFixed(2)) })
    }
    await supabaseAdmin.from('spi_cpi_daily_snapshot').upsert(snaps, { onConflict: 'id' })

    return NextResponse.json({ ok: true, projectId, taskIds: [task1, task2] }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'seed error' }, { status: 200 })
  }
}

