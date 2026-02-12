const { PrismaClient } = require('@prisma/client')
const { Pool } = require('pg')
const { PrismaPg } = require('@prisma/adapter-pg')
const crypto = require('node:crypto')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('supabase.com')
    ? { rejectUnauthorized: false }
    : undefined
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const data = {
  project_backlog_2026: [
    {
      id: 1,
      project_name: 'งานติดตั้งโครงสร้างพื้นฐานของระบบ M-Flow (M-Flow System Infrastructure) ของทางหลวงพิเศษระหว่างเมืองหมายเลข 7',
      job_code: 'A-2023-DOH-PJ-022',
      contract_value: 386000000.0,
      start_date: '4 ส.ค. 23',
      end_date: '28 ก.ค. 24',
      installments: '7 งวด',
      delivery_status: '3 งวด',
      backlog_total: 108124180.0,
      monthly_revenue_2026: {}
    },
    {
      id: 2,
      project_name: 'OM MFE Enhancement for New BRM Integration',
      job_code: 'A-2024-YIT-PJ-057',
      contract_value: 532000.0,
      start_date: '4 เม.ย. 25',
      end_date: '3 เม.ย. 26',
      installments: '1 งวด',
      delivery_status: '-',
      backlog_total: 532000.0,
      monthly_revenue_2026: {}
    },
    {
      id: 3,
      project_name: 'จ้างโครงการเพิ่มประสิทธิภาพระบบ OM Unified my Frontend (my by NT) จำนวน 1 ระบบ',
      job_code: 'A-2025-NT-PJ-036',
      contract_value: 9280000.0,
      start_date: '14 ส.ค. 25',
      end_date: '9 ก.พ. 26',
      installments: '4 งวด',
      delivery_status: 'ส่งมอบแล้ว 3 เหลืองวดสุดท้าย',
      backlog_total: 4656000.0,
      monthly_revenue_2026: { jan: 4656000.0 }
    },
    {
      id: 4,
      project_name: 'ติดตั้งระบบเดินสายสัญญาณ Automated Border Control',
      job_code: 'A-2025-IW-PJ-039',
      contract_value: 2200000.0,
      start_date: '1 ส.ค. 25',
      end_date: '24 พ.ย. 26',
      installments: '4 งวด',
      delivery_status: 'เก็บเงิน 2026',
      backlog_total: 2200000.0,
      monthly_revenue_2026: { may: 550000.0, jun: 550000.0, jul: 550000.0, aug: 550000.0 }
    },
    {
      id: 5,
      project_name: 'Rental SAN Director (Payment by Yearly) and Implementation',
      job_code: 'A-2025-CIMB-PJ-030',
      contract_value: 25141330.0,
      start_date: null,
      end_date: null,
      installments: '2 งวด',
      delivery_status: '2 งวดงานติดตั้ง 5 งวดงานเช่ารายปี ค่าติดตั้ง งวดที่ 1 926,960 บาท งวดที่ 2 231,740 บาท ค่าเช่ารายปี 1-5 งวดละเท่าๆกัน 4,796,526 บาท',
      backlog_total: 25141330.0,
      monthly_revenue_2026: { jan: 1158700.0, feb: 4796526.0 }
    },
    {
      id: 6,
      project_name: 'Rental Cohesity Data Protection Cohesity Appliance & Cohesity Software Subscription 5 Years for OS Backup Recovery Tools Enhancement',
      job_code: 'A-2025-CIMB-PJ-038',
      contract_value: 22398000.0,
      start_date: null,
      end_date: null,
      installments: '1 งวด',
      delivery_status: 'ติดตั้ง 1 งวด=998,000 เช่า 5 ปี งวดละ 4,280,000',
      backlog_total: 22398000.0,
      monthly_revenue_2026: { jan: 998000.0, feb: 4280000.0 }
    },
    {
      id: 7,
      project_name: 'ซื้อรถครัวสนามเคลื่อนที่ชนิด 6 ล้อ พร้อมอุปกรณ์ประกอบอาหาร',
      job_code: 'A-2025-DNP-PJ-044',
      contract_value: 61191000.0,
      start_date: '9 ต.ค. 25',
      end_date: '6 เม.ย. 26',
      installments: '1 งวด',
      delivery_status: null,
      backlog_total: 61191000.0,
      monthly_revenue_2026: { mar: 61191000.0 }
    },
    {
      id: 8,
      project_name: 'งานจ้างโครงการปรับปรุงสถาปัตยกรรมและปรับปรุงระบบบริหารจัดการน้ำสูญเสีย กปภ. (DMAMA)',
      job_code: 'A-2025-PWA-PJ-050',
      contract_value: 9190654.21,
      start_date: '29 ต.ค. 25',
      end_date: '24 ส.ค. 26',
      installments: '4 งวด',
      delivery_status: 'งวดที่ 1 5%, งวดที่ 2 25%, งวดที่ 3 35%, งวดที่ 4 35%',
      backlog_total: 8731121.5,
      monthly_revenue_2026: { feb: 2297663.55, jun: 3216728.97, jul: 3216728.97 }
    },
    {
      id: 9,
      project_name: 'จ้างโครงการจัดทำแผนภูมิการบินสนามปินนครสวรรค์ด้วยเทคโนโลยีภูมิสารสนเทศและอากาศยานไร้คนขับ',
      job_code: 'A-2025-DRRAA-PJ-053',
      contract_value: 19300000.0,
      start_date: '1 พ.ย. 25',
      end_date: '29 เม.ย. 26',
      installments: '3 งวด',
      delivery_status: 'งวดที่ 1 15%, งวดที่ 2 45%, งวดที่ 3 40%',
      backlog_total: 16405000.0,
      monthly_revenue_2026: {}
    },
    {
      id: 10,
      project_name: 'จัดซื้อระบบรักษาความปลอดภัยทางไซเบอร์แบบรวมศูนย์',
      job_code: 'A-2025-SRT-PJ-056',
      contract_value: 35902803.74,
      start_date: '8 พ.ย. 25',
      end_date: '5 พ.ค. 26',
      installments: '3 งวด',
      delivery_status: 'งวดที่ 1 10%, งวดที่ 2 50%, งวดที่ 3 40%',
      backlog_total: 35902803.74,
      monthly_revenue_2026: { feb: 3590280.37, apr: 17951401.87, may: 14361121.5 }
    },
    {
      id: 11,
      project_name: 'จัดซื้อพร้อมติดตั้งการพัฒนาและปรับปรุงเครือข่ายคอมพิวเตอร์ไร้สาย (LAN) ภายใน มท.',
      job_code: 'A-2025-MOI-PJ-059',
      contract_value: 3689000.0,
      start_date: '8 ธ.ค. 25',
      end_date: '6 มิ.ย. 26',
      installments: '2 งวด',
      delivery_status: 'งวดที่ 1 30% งวดที่ 2 70%',
      backlog_total: 2582300.0,
      monthly_revenue_2026: { mar: 2582300.0 }
    }
  ]
}

const thMonths = {
  'ม.ค.': 1, 'ก.พ.': 2, 'มี.ค.': 3, 'เม.ย.': 4, 'พ.ค.': 5, 'มิ.ย.': 6,
  'ก.ค.': 7, 'ส.ค.': 8, 'ก.ย.': 9, 'ต.ค.': 10, 'พ.ย.': 11, 'ธ.ค.': 12
}
function parseThaiDate(s) {
  if (!s || typeof s !== 'string') return null
  const parts = s.trim().split(' ')
  if (parts.length !== 3) return null
  const day = parseInt(parts[0], 10)
  const mon = thMonths[parts[1]] || 1
  const yy = parseInt(parts[2], 10)
  const year = yy < 100 ? 2000 + yy : yy
  const mm = String(mon).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return new Date(`${year}-${mm}-${dd}T00:00:00Z`)
}

const monthMap = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 }

async function getColumns(table) {
  const res = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = $1`, [table])
  return res.rows.map(r => r.column_name)
}
function quoteCol(col) {
  return /[A-Z]/.test(col) ? `"${col}"` : col
}
async function insertDynamic(table, values) {
  const cols = await getColumns(table)
  const usable = Object.keys(values).filter(k => cols.includes(k))
  const colSql = usable.map(quoteCol).join(',')
  const placeholders = usable.map((_, i) => `$${i + 1}`).join(',')
  const params = usable.map(k => values[k])
  const sql = `INSERT INTO ${table} (${colSql}) VALUES (${placeholders})`
  await pool.query(sql, params)
}

async function upsertProject(p) {
  let id = crypto.randomUUID()
  const startDate = parseThaiDate(p.start_date)
  const endDate = parseThaiDate(p.end_date)
  const budget = Number(p.contract_value || 0)
  const remaining = Number(p.backlog_total || budget)
  const spent = Math.max(0, budget - remaining)
  const now = new Date()
  let existing = null
  try {
    const r = await pool.query(`SELECT id FROM projects WHERE code = $1 LIMIT 1`, [p.job_code])
    existing = r.rows[0]?.id || null
  } catch {
    existing = null
  }
  if (existing) {
    id = existing
    const updates = {
      name: p.project_name,
      description: p.delivery_status || null,
      status: 'active',
      progress: 0,
      progressPlan: 0,
      spi: '1.00',
      riskLevel: 'medium',
      startDate,
      endDate,
      budget,
      spent,
      remaining,
      priority: 'normal',
      category: null,
      isArchived: false,
      updatedAt: now
    }
    const cols = await getColumns('projects')
    const usable = Object.keys(updates).filter(k => cols.includes(k))
    const setSql = usable.map((k, i) => `${quoteCol(k)} = $${i + 1}`).join(', ')
    const params = usable.map(k => updates[k])
    params.push(id)
    await pool.query(`UPDATE projects SET ${setSql} WHERE ${quoteCol('id')} = $${usable.length + 1}`, params)
  } else {
    await insertDynamic('projects', {
      id,
      name: p.project_name,
      code: p.job_code || null,
      description: p.delivery_status || null,
      status: 'active',
      progress: 0,
      progressPlan: 0,
      spi: '1.00',
      riskLevel: 'medium',
      startDate,
      endDate,
      budget,
      spent,
      remaining,
      priority: 'normal',
      category: null,
      isArchived: false,
      createdAt: now,
      updatedAt: now
    })
  }
  const rev = p.monthly_revenue_2026 || {}
  const entries = Object.entries(rev)
  for (const [monKey, amt] of entries) {
    const m = monthMap[monKey.toLowerCase()] || null
    const due = m ? new Date(`2026-${String(m).padStart(2, '0')}-01T00:00:00Z`) : null
    const mid = crypto.randomUUID()
    const pct = budget ? (Number(amt || 0) / budget) * 100 : 0
    await insertDynamic('milestones', {
      id: mid,
      projectId: id,
      title: `Revenue 2026 ${monKey.toUpperCase()}`,
      name: `Revenue 2026 ${monKey.toUpperCase()}`,
      percentage: pct,
      amount: Number(amt || 0),
      dueDate: due,
      status: 'planned',
      note: null,
      createdAt: now,
      updatedAt: now
    })
  }
  return id
}

async function main() {
  const items = data.project_backlog_2026 || []
  for (const p of items) {
    await upsertProject(p)
  }
}

main()
  .then(async () => {
    await pool.end()
    process.exit(0)
  })
  .catch(async (e) => {
    console.error(e)
    await pool.end()
    process.exit(1)
  })
