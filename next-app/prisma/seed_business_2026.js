const { Pool } = require("pg");
const crypto = require("node:crypto");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.DATABASE_URL &&
    process.env.DATABASE_URL.includes("supabase.com")
      ? { rejectUnauthorized: false }
      : undefined,
});

async function getColumns(table) {
  const r = await pool.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name=$1",
    [table],
  );
  return r.rows.map((x) => x.column_name);
}
function q(col) {
  return /[A-Z]/.test(col) ? `"${col}"` : col;
}
async function insertDynamic(table, values) {
  const cols = await getColumns(table);
  const usable = Object.keys(values).filter((k) => cols.includes(k));
  if (!usable.length) return;
  const sql = `INSERT INTO ${table} (${usable.map(q).join(",")}) VALUES (${usable.map((_, i) => `$${i + 1}`).join(",")})`;
  const params = usable.map((k) => values[k]);
  await pool.query(sql, params);
}
async function selectOne(sql, params) {
  try {
    const r = await pool.query(sql, params);
    return r.rows[0] || null;
  } catch {
    return null;
  }
}

const monthKey = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12,
};
const thMonths = {
  "ม.ค.": 1,
  "ก.พ.": 2,
  "มี.ค.": 3,
  "เม.ย.": 4,
  "พ.ค.": 5,
  "มิ.ย.": 6,
  "ก.ค.": 7,
  "ส.ค.": 8,
  "ก.ย.": 9,
  "ต.ค.": 10,
  "พ.ย.": 11,
  "ธ.ค.": 12,
};
function parseThaiDate(s) {
  if (!s || typeof s !== "string") return null;
  const parts = s.trim().split(" ");
  if (parts.length !== 3) return null;
  const d = parseInt(parts[0], 10);
  const m = thMonths[parts[1]] || 1;
  const y = parseInt(parts[2], 10);
  const year = y < 100 ? 2000 + y : y;
  const mm = String(m).padStart(2, "0");
  const dd = String(d).padStart(2, "0");
  return new Date(`${year}-${mm}-${dd}T00:00:00Z`);
}
function monthsIn2026(start, end) {
  const res = [];
  const s = new Date(start || "2026-01-01T00:00:00Z");
  const e = new Date(end || "2026-12-31T00:00:00Z");
  for (let m = 1; m <= 12; m++) {
    const d = new Date(`2026-${String(m).padStart(2, "0")}-01T00:00:00Z`);
    if (d >= s && d <= e) res.push(m);
  }
  return res.length ? res : [1];
}
function orgFromJobCode(code) {
  if (!code) return null;
  const parts = code.split("-");
  return parts.length >= 3 ? parts[2] : null;
}

const backlog = {
  project_backlog_2026: [
    {
      id: 1,
      project_name:
        "งานติดตั้งโครงสร้างพื้นฐานของระบบ M-Flow (M-Flow System Infrastructure) ของทางหลวงพิเศษระหว่างเมืองหมายเลข 7",
      job_code: "A-2023-DOH-PJ-022",
      contract_value: 386000000.0,
      start_date: "4 ส.ค. 23",
      end_date: "28 ก.ค. 24",
      installments: "7 งวด",
      delivery_status: "3 งวด",
      backlog_total: 108124180.0,
      monthly_revenue_2026: {},
    },
    {
      id: 2,
      project_name: "OM MFE Enhancement for New BRM Integration",
      job_code: "A-2024-YIT-PJ-057",
      contract_value: 532000.0,
      start_date: "4 เม.ย. 25",
      end_date: "3 เม.ย. 26",
      installments: "1 งวด",
      delivery_status: "-",
      backlog_total: 532000.0,
      monthly_revenue_2026: {},
    },
    {
      id: 3,
      project_name:
        "จ้างโครงการเพิ่มประสิทธิภาพระบบ OM Unified my Frontend (my by NT) จำนวน 1 ระบบ",
      job_code: "A-2025-NT-PJ-036",
      contract_value: 9280000.0,
      start_date: "14 ส.ค. 25",
      end_date: "9 ก.พ. 26",
      installments: "4 งวด",
      delivery_status: "ส่งมอบแล้ว 3 เหลืองวดสุดท้าย",
      backlog_total: 4656000.0,
      monthly_revenue_2026: { jan: 4656000.0 },
    },
    {
      id: 4,
      project_name: "ติดตั้งระบบเดินสายสัญญาณ Automated Border Control",
      job_code: "A-2025-IW-PJ-039",
      contract_value: 2200000.0,
      start_date: "1 ส.ค. 25",
      end_date: "24 พ.ย. 26",
      installments: "4 งวด",
      delivery_status: "เก็บเงิน 2026",
      backlog_total: 2200000.0,
      monthly_revenue_2026: {
        may: 550000.0,
        jun: 550000.0,
        jul: 550000.0,
        aug: 550000.0,
      },
    },
    {
      id: 5,
      project_name:
        "Rental SAN Director (Payment by Yearly) and Implementation",
      job_code: "A-2025-CIMB-PJ-030",
      contract_value: 25141330.0,
      start_date: null,
      end_date: null,
      installments: "2 งวด",
      delivery_status:
        "2 งวดงานติดตั้ง 5 งวดงานเช่ารายปี ค่าติดตั้ง งวดที่ 1 926,960 บาท งวดที่ 2 231,740 บาท ค่าเช่ารายปี 1-5 งวดละเท่าๆกัน 4,796,526 บาท",
      backlog_total: 25141330.0,
      monthly_revenue_2026: { jan: 1158700.0, feb: 4796526.0 },
    },
    {
      id: 6,
      project_name:
        "Rental Cohesity Data Protection Cohesity Appliance & Cohesity Software Subscription 5 Years for OS Backup Recovery Tools Enhancement",
      job_code: "A-2025-CIMB-PJ-038",
      contract_value: 22398000.0,
      start_date: null,
      end_date: null,
      installments: "1 งวด",
      delivery_status: "ติดตั้ง 1 งวด=998,000 เช่า 5 ปี งวดละ 4,280,000",
      backlog_total: 22398000.0,
      monthly_revenue_2026: { jan: 998000.0, feb: 4280000.0 },
    },
    {
      id: 7,
      project_name:
        "ซื้อรถครัวสนามเคลื่อนที่ชนิด 6 ล้อ พร้อมอุปกรณ์ประกอบอาหาร",
      job_code: "A-2025-DNP-PJ-044",
      contract_value: 61191000.0,
      start_date: "9 ต.ค. 25",
      end_date: "6 เม.ย. 26",
      installments: "1 งวด",
      delivery_status: null,
      backlog_total: 61191000.0,
      monthly_revenue_2026: { mar: 61191000.0 },
    },
    {
      id: 8,
      project_name:
        "งานจ้างโครงการปรับปรุงสถาปัตยกรรมและปรับปรุงระบบบริหารจัดการน้ำสูญเสีย กปภ. (DMAMA)",
      job_code: "A-2025-PWA-PJ-050",
      contract_value: 9190654.21,
      start_date: "29 ต.ค. 25",
      end_date: "24 ส.ค. 26",
      installments: "4 งวด",
      delivery_status: "งวดที่ 1 5%, งวดที่ 2 25%, งวดที่ 3 35%, งวดที่ 4 35%",
      backlog_total: 8731121.5,
      monthly_revenue_2026: {
        feb: 2297663.55,
        jun: 3216728.97,
        jul: 3216728.97,
      },
    },
    {
      id: 9,
      project_name:
        "จ้างโครงการจัดทำแผนภูมิการบินสนามปินนครสวรรค์ด้วยเทคโนโลยีภูมิสารสนเทศและอากาศยานไร้คนขับ",
      job_code: "A-2025-DRRAA-PJ-053",
      contract_value: 19300000.0,
      start_date: "1 พ.ย. 25",
      end_date: "29 เม.ย. 26",
      installments: "3 งวด",
      delivery_status: "งวดที่ 1 15%, งวดที่ 2 45%, งวดที่ 3 40%",
      backlog_total: 16405000.0,
      monthly_revenue_2026: {},
    },
    {
      id: 10,
      project_name: "จัดซื้อระบบรักษาความปลอดภัยทางไซเบอร์แบบรวมศูนย์",
      job_code: "A-2025-SRT-PJ-056",
      contract_value: 35902803.74,
      start_date: "8 พ.ย. 25",
      end_date: "5 พ.ค. 26",
      installments: "3 งวด",
      delivery_status: "งวดที่ 1 10%, งวดที่ 2 50%, งวดที่ 3 40%",
      backlog_total: 35902803.74,
      monthly_revenue_2026: {
        feb: 3590280.37,
        apr: 17951401.87,
        may: 14361121.5,
      },
    },
    {
      id: 11,
      project_name:
        "จัดซื้อพร้อมติดตั้งการพัฒนาและปรับปรุงเครือข่ายคอมพิวเตอร์ไร้สาย (LAN) ภายใน มท.",
      job_code: "A-2025-MOI-PJ-059",
      contract_value: 3689000.0,
      start_date: "8 ธ.ค. 25",
      end_date: "6 มิ.ย. 26",
      installments: "2 งวด",
      delivery_status: "งวดที่ 1 30% งวดที่ 2 70%",
      backlog_total: 2582300.0,
      monthly_revenue_2026: { mar: 2582300.0 },
    },
  ],
};

async function ensurePipeline() {
  const p = await selectOne("SELECT id FROM sales_pipelines WHERE name = $1", [
    "Default Pipeline",
  ]);
  if (p?.id) return p.id;
  const id = crypto.randomUUID();
  await insertDynamic("sales_pipelines", {
    id,
    name: "Default Pipeline",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return id;
}

async function getProjectIdByCode(code) {
  const r = await selectOne("SELECT id FROM projects WHERE code = $1", [code]);
  return r?.id || null;
}

async function upsertMonthlyMilestones(projectId, budget, monthly) {
  const cols = await getColumns("milestones");
  const hasDue = cols.includes("dueDate")
    ? "dueDate"
    : cols.includes("due_date")
      ? "due_date"
      : null;
  for (const [mk, amt] of Object.entries(monthly || {})) {
    const m = monthKey[mk.toLowerCase()];
    if (!m) continue;
    const due = new Date(`2026-${String(m).padStart(2, "0")}-01T00:00:00Z`);
    const title = `Revenue 2026 ${mk.toUpperCase()}`;
    const exists = await selectOne(
      `SELECT id FROM milestones WHERE ${q("projectId")} = $1 AND ${q("title")} = $2`,
      [projectId, title],
    );
    if (exists?.id) continue;
    const percentage = budget ? (Number(amt || 0) / Number(budget)) * 100 : 0;
    const row = {
      id: crypto.randomUUID(),
      projectId,
      title,
      name: title,
      percentage,
      amount: Number(amt || 0),
      status: "planned",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (hasDue) row[hasDue] = due;
    await insertDynamic("milestones", row);
  }
}

function parsePercents(status) {
  if (!status) return [];
  const m = status.match(/(\d+)\s*%/g) || [];
  return m.map((x) => Number(x.replace("%", "").trim()));
}

async function distributeBacklog(
  projectId,
  budget,
  backlogAmt,
  startDate,
  endDate,
  statusText,
) {
  const months = monthsIn2026(startDate, endDate);
  let percents = parsePercents(statusText);
  if (!percents.length)
    percents = Array(months.length).fill((1 / months.length) * 100);
  const totalPct = percents.reduce((a, b) => a + b, 0);
  if (totalPct === 0)
    percents = Array(months.length).fill((1 / months.length) * 100);
  const normalized = percents.map((p) => p * (100 / totalPct));
  for (let i = 0; i < months.length; i++) {
    const m = months[i];
    const amount = Number(backlogAmt || 0) * (normalized[i] / 100);
    const title = `Revenue 2026 ${Object.keys(monthKey)
      .find((k) => monthKey[k] === m)
      .toUpperCase()}`;
    const due = new Date(`2026-${String(m).padStart(2, "0")}-01T00:00:00Z`);
    const exists = await selectOne(
      `SELECT id FROM milestones WHERE ${q("projectId")} = $1 AND ${q("title")} = $2`,
      [projectId, title],
    );
    if (exists?.id) continue;
    const row = {
      id: crypto.randomUUID(),
      projectId,
      title,
      name: title,
      percentage: budget ? (amount / Number(budget)) * 100 : 0,
      amount,
      status: "planned",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: due,
    };
    await insertDynamic("milestones", row);
  }
}

async function upsertClientContacts(projectId, org) {
  const clientName = org || "Unknown Org";
  const existing = await selectOne(
    `SELECT id FROM contacts WHERE ${q("projectId")} = $1 AND ${q("type")} = 'client'`,
    [projectId],
  );
  if (!existing) {
    await insertDynamic("contacts", {
      id: crypto.randomUUID(),
      projectId,
      name: `${clientName} Contact`,
      position: "Manager",
      email: `${clientName.toLowerCase()}@example.com`,
      phone: "080-000-0000",
      type: "client",
      isKeyPerson: true,
    });
  }
  const vend = await selectOne(
    `SELECT id FROM contacts WHERE ${q("projectId")} = $1 AND ${q("type")} = 'vendor'`,
    [projectId],
  );
  if (!vend) {
    await insertDynamic("contacts", {
      id: crypto.randomUUID(),
      projectId,
      name: "Vendor Team",
      position: "Sales",
      email: `vendor@${clientName.toLowerCase()}.com`,
      phone: "081-111-1111",
      type: "vendor",
      isKeyPerson: false,
    });
  }
}

async function upsertSalesDeal(
  pipelineId,
  projectCode,
  projectName,
  amount,
  org,
  ownerId,
) {
  const exists = await selectOne(
    `SELECT id FROM sales_deals WHERE ${q("name")} = $1`,
    [projectName],
  );
  if (exists?.id) return;
  await insertDynamic("sales_deals", {
    id: crypto.randomUUID(),
    pipelineId,
    stageId: null,
    name: projectName,
    amount: Number(amount || 0),
    currency: "THB",
    ownerId,
    clientId: null,
    clientOrg: org || "",
    status: "open",
    probability: 50,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

async function main() {
  const managerId = "82df756a-4d46-4e49-b927-bb165d7dc489";
  const pipelineId = await ensurePipeline();
  const items = backlog.project_backlog_2026 || [];
  for (const p of items) {
    const projectId = await getProjectIdByCode(p.job_code);
    if (!projectId) continue;
    const startDate = parseThaiDate(p.start_date);
    const endDate = parseThaiDate(p.end_date);
    const org = orgFromJobCode(p.job_code);
    await upsertClientContacts(projectId, org);
    await upsertMonthlyMilestones(
      projectId,
      p.contract_value,
      p.monthly_revenue_2026,
    );
    if (
      !p.monthly_revenue_2026 ||
      Object.keys(p.monthly_revenue_2026).length === 0
    ) {
      await distributeBacklog(
        projectId,
        p.contract_value,
        p.backlog_total,
        startDate,
        endDate,
        p.delivery_status,
      );
    }
    await upsertSalesDeal(
      pipelineId,
      p.job_code,
      p.project_name,
      p.contract_value,
      org,
      managerId,
    );
  }
}

main()
  .then(async () => {
    await pool.end();
    console.log("Business data 2026 seeded");
  })
  .catch(async (e) => {
    console.error(e);
    await pool.end();
    process.exit(1);
  });
