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
function quote(col) {
  return /[A-Z]/.test(col) ? `"${col}"` : col;
}
async function insertDynamic(table, values) {
  const cols = await getColumns(table);
  const usable = Object.keys(values).filter((k) => cols.includes(k));
  if (!usable.length) return;
  const sql = `INSERT INTO ${table} (${usable.map(quote).join(",")}) VALUES (${usable.map((_, i) => `$${i + 1}`).join(",")})`;
  const params = usable.map((k) => values[k]);
  await pool.query(sql, params);
}
async function upsertUnique(table, uniq, values) {
  const cols = await getColumns(table);
  const whereCol = cols.includes(uniq.col)
    ? uniq.col
    : cols.includes(uniq.altCol || "")
      ? uniq.altCol
      : uniq.col;
  const sel = await pool
    .query(
      `SELECT ${quote("id")} FROM ${table} WHERE ${quote(whereCol)} = $1 LIMIT 1`,
      [uniq.value],
    )
    .catch(() => ({ rows: [] }));
  if (sel.rows[0]?.id) return sel.rows[0].id;
  const id = crypto.randomUUID();
  await insertDynamic(table, { id, ...values, [whereCol]: uniq.value });
  return id;
}

async function seedUsers() {
  const managerId = "82df756a-4d46-4e49-b927-bb165d7dc489";
  const users = [
    {
      id: managerId,
      name: "Project Manager",
      email: "pm@example.com",
      role: "admin",
      status: "active",
      isActive: true,
      isDeleted: false,
      isProjectManager: true,
      timezone: "Asia/Bangkok",
    },
    {
      id: crypto.randomUUID(),
      name: "Engineer A",
      email: "eng.a@example.com",
      role: "user",
      status: "active",
      isActive: true,
      isDeleted: false,
      isProjectManager: false,
      timezone: "Asia/Bangkok",
    },
    {
      id: crypto.randomUUID(),
      name: "Engineer B",
      email: "eng.b@example.com",
      role: "user",
      status: "active",
      isActive: true,
      isDeleted: false,
      isProjectManager: false,
      timezone: "Asia/Bangkok",
    },
    {
      id: crypto.randomUUID(),
      name: "Analyst",
      email: "analyst@example.com",
      role: "user",
      status: "active",
      isActive: true,
      isDeleted: false,
      isProjectManager: false,
      timezone: "Asia/Bangkok",
    },
    {
      id: crypto.randomUUID(),
      name: "QA",
      email: "qa@example.com",
      role: "user",
      status: "active",
      isActive: true,
      isDeleted: false,
      isProjectManager: false,
      timezone: "Asia/Bangkok",
    },
  ];
  const cols = await getColumns("users");
  const has = (c) => cols.includes(c);
  for (const u of users) {
    const existing = await pool
      .query(
        `SELECT id FROM users WHERE ${quote("email")} = $1 OR ${quote("id")} = $2 LIMIT 1`,
        [u.email, u.id],
      )
      .catch(() => ({ rows: [] }));
    if (existing.rows[0]?.id) continue;
    const base = ["id", "name", "email"];
    // avoid role enum variance; let DB default handle
    if (has("status")) base.push("status");
    if (has("is_active")) base.push("is_active");
    else if (has("isActive")) base.push("isActive");
    if (has("is_deleted")) base.push("is_deleted");
    else if (has("isDeleted")) base.push("isDeleted");
    if (has("is_project_manager")) base.push("is_project_manager");
    else if (has("isProjectManager")) base.push("isProjectManager");
    if (has("timezone")) base.push("timezone");
    // timestamps
    if (has("updatedAt")) base.push("updatedAt");
    else if (has("updated_at")) base.push("updated_at");
    const params = [];
    for (const k of base) {
      if (k === "id") params.push(u.id);
      else if (k === "name") params.push(u.name);
      else if (k === "email") params.push(u.email);
      else if (k.toLowerCase().includes("status") && k !== "is_status")
        params.push(u.status);
      else if (k === "is_active" || k === "isActive") params.push(u.isActive);
      else if (k === "is_deleted" || k === "isDeleted")
        params.push(u.isDeleted);
      else if (k === "is_project_manager" || k === "isProjectManager")
        params.push(u.isProjectManager);
      else if (k === "timezone") params.push(u.timezone);
      else if (k === "updatedAt" || k === "updated_at")
        params.push(new Date().toISOString());
      else params.push(null);
    }
    const sql = `INSERT INTO users (${base.map(quote).join(",")}) VALUES (${base.map((_, i) => `$${i + 1}`).join(",")})`;
    await pool.query(sql, params);
  }
  return { managerId, users };
}

async function getProjects() {
  const r = await pool
    .query("SELECT id, name, code FROM projects")
    .catch(() => ({ rows: [] }));
  return r.rows;
}

function addDays(base, days) {
  const d = new Date();
  if (base) d.setTime(new Date(base).getTime());
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

async function seedContacts(projectId) {
  const rows = [
    {
      projectId,
      name: "Client Contact",
      position: "Manager",
      email: "client@example.com",
      phone: "080-000-0000",
      type: "client",
      isKeyPerson: true,
    },
    {
      projectId,
      name: "Vendor Contact",
      position: "Sales",
      email: "vendor@example.com",
      phone: "081-111-1111",
      type: "vendor",
      isKeyPerson: false,
    },
  ];
  for (const c of rows) {
    await insertDynamic("contacts", {
      id: crypto.randomUUID(),
      projectId: c.projectId,
      name: c.name,
      position: c.position,
      email: c.email,
      phone: c.phone,
      type: c.type,
      isKeyPerson: c.isKeyPerson,
    });
  }
}

async function seedTasks(projectId, managerId) {
  const phases = ["Initiation", "Planning", "Design", "Development", "Testing"];
  for (let i = 0; i < 5; i++) {
    const t = {
      id: crypto.randomUUID(),
      projectId,
      name: `Task ${i + 1}`,
      title: `Task ${i + 1}`,
      createdBy: managerId,
      phase: phases[i],
      weight: 10 + i * 5,
      progressPlan: 20 * i,
      progressActual: 15 * i,
      startDate: addDays(null, -30 + i * 5),
      endDate: addDays(null, -10 + i * 7),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await insertDynamic("tasks", t);
  }
}

async function seedDocuments(projectId) {
  const docs = [
    { name: "Requirements.pdf", type: "pdf", size: "1.2 MB" },
    { name: "Architecture.docx", type: "docx", size: "0.8 MB" },
    { name: "Schedule.xlsx", type: "xlsx", size: "0.5 MB" },
  ];
  for (const d of docs) {
    await insertDynamic("documents", {
      id: crypto.randomUUID(),
      projectId,
      name: d.name,
      url: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
}

async function seedMilestones(projectId) {
  const ms = [
    { name: "Initiation", percentage: 10, status: "Pending" },
    { name: "Planning", percentage: 25, status: "In Progress" },
    { name: "Design", percentage: 25, status: "In Progress" },
    { name: "Testing", percentage: 20, status: "Pending" },
    { name: "Go-live", percentage: 20, status: "Pending" },
  ];
  for (const m of ms) {
    await insertDynamic("milestones", {
      id: crypto.randomUUID(),
      projectId,
      title: m.name,
      name: m.name,
      percentage: m.percentage,
      dueDate: new Date().toISOString(),
      status: m.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
}

async function seedRisks(projectId) {
  const risks = [
    {
      id: crypto.randomUUID(),
      projectId,
      name: "Scope creep",
      title: "Scope creep",
      impact: 4,
      likelihood: 3,
      probability: 30,
      severity: "High",
      status: "open",
    },
    {
      id: crypto.randomUUID(),
      projectId,
      name: "Resource shortage",
      title: "Resource shortage",
      impact: 3,
      likelihood: 3,
      probability: 50,
      severity: "Medium",
      status: "open",
    },
    {
      id: crypto.randomUUID(),
      projectId,
      name: "Vendor delay",
      title: "Vendor delay",
      impact: 2,
      likelihood: 2,
      probability: 10,
      severity: "Low",
      status: "open",
    },
  ];
  for (const r of risks) {
    await insertDynamic("risks", {
      ...r,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
}

async function seedTimeEntries(projectId, userId) {
  const dates = Array.from({ length: 7 }).map((_, i) => addDays(null, -i));
  for (const date of dates) {
    await insertDynamic("timesheets", {
      id: crypto.randomUUID(),
      projectId,
      userId,
      date,
      hours: 8,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
}

async function seedSales(users) {
  // Pipeline
  const pipelineId = await upsertUnique(
    "sales_pipelines",
    { col: "name", value: "Default Pipeline" },
    {
      name: "Default Pipeline",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  );
  // Stages
  const stages = [
    { name: "Lead", orderIndex: 1, probability: 10 },
    { name: "Qualified", orderIndex: 2, probability: 25 },
    { name: "Proposal", orderIndex: 3, probability: 50 },
    { name: "Negotiation", orderIndex: 4, probability: 75 },
    { name: "Won", orderIndex: 5, probability: 100 },
  ];
  for (const s of stages) {
    await upsertUnique(
      "sales_stages",
      { col: "name", value: s.name },
      {
        id: crypto.randomUUID(),
        pipelineId,
        name: s.name,
        orderIndex: s.orderIndex,
        probability: s.probability,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    );
  }
  // Deals
  const ownerId = users[0].id;
  const deals = [
    {
      name: "ERP Suite - Innovate Corp",
      amount: 1200000,
      currency: "THB",
      clientOrg: "Innovate Corp",
      status: "open",
      probability: 30,
    },
    {
      name: "Data Platform - Quantum Solutions",
      amount: 900000,
      currency: "THB",
      clientOrg: "Quantum Solutions",
      status: "open",
      probability: 50,
    },
    {
      name: "Website Revamp - Alpha Co",
      amount: 450000,
      currency: "THB",
      clientOrg: "Alpha Co",
      status: "open",
      probability: 10,
    },
  ];
  for (const d of deals) {
    await insertDynamic("sales_deals", {
      id: crypto.randomUUID(),
      pipelineId,
      stageId: null,
      name: d.name,
      amount: d.amount,
      currency: d.currency,
      ownerId,
      clientId: null,
      clientOrg: d.clientOrg,
      status: d.status,
      probability: d.probability,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  // Activities
  const ds = await pool
    .query("SELECT id FROM sales_deals LIMIT 2")
    .catch(() => ({ rows: [] }));
  for (const row of ds.rows) {
    await insertDynamic("sales_activities", {
      id: crypto.randomUUID(),
      dealId: row.id,
      type: "note",
      note: "Follow-up call",
      userId: ownerId,
      createdAt: new Date().toISOString(),
    });
  }
}

async function seedTeamStructure(projectId, users) {
  const cols = await getColumns("team_structure");
  if (!cols.length) return;
  for (const u of users.slice(0, 3)) {
    await insertDynamic("team_structure", {
      id: crypto.randomUUID(),
      projectId,
      userId: u.id,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
}

async function main() {
  const { managerId, users } = await seedUsers();
  const projects = await getProjects();
  for (const p of projects) {
    await seedContacts(p.id);
    await seedTasks(p.id, managerId);
    await seedDocuments(p.id);
    await seedMilestones(p.id);
    await seedRisks(p.id);
    await seedTimeEntries(p.id, managerId);
    await seedTeamStructure(p.id, users);
  }
  await seedSales(users);
}

main()
  .then(async () => {
    await pool.end();
    console.log("Seed full demo completed");
  })
  .catch(async (e) => {
    console.error(e);
    await pool.end();
    process.exit(1);
  });
