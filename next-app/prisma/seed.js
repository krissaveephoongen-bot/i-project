const { PrismaClient } = require("@prisma/client");
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.DATABASE_URL &&
    process.env.DATABASE_URL.includes("supabase.com")
      ? { rejectUnauthorized: false }
      : undefined,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    await pool.query(
      `ALTER TABLE sales_pipelines ADD COLUMN IF NOT EXISTS "createdAt" timestamptz DEFAULT NOW();`,
    );
    await pool.query(
      `ALTER TABLE sales_pipelines ADD COLUMN IF NOT EXISTS "updatedAt" timestamptz DEFAULT NOW();`,
    );
    await pool.query(
      `ALTER TABLE sales_stages ADD COLUMN IF NOT EXISTS "createdAt" timestamptz DEFAULT NOW();`,
    );
    await pool.query(
      `ALTER TABLE sales_stages ADD COLUMN IF NOT EXISTS "updatedAt" timestamptz DEFAULT NOW();`,
    );
    await pool.query(
      `ALTER TABLE sales_deals ADD COLUMN IF NOT EXISTS "createdAt" timestamptz DEFAULT NOW();`,
    );
    await pool.query(
      `ALTER TABLE sales_deals ADD COLUMN IF NOT EXISTS "updatedAt" timestamptz DEFAULT NOW();`,
    );
  } catch {}
  const pipelineId = "pipeline-default";
  await pool.query(
    `INSERT INTO sales_pipelines (id, name) VALUES ($1,$2)
     ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name`,
    [pipelineId, "Default Pipeline"],
  );
  const stages = [
    { id: "stage-10", name: "Qualification", orderIndex: 10, probability: 10 },
    { id: "stage-30", name: "Proposal", orderIndex: 30, probability: 30 },
    { id: "stage-60", name: "Negotiation", orderIndex: 60, probability: 60 },
    { id: "stage-90", name: "Closing", orderIndex: 90, probability: 90 },
  ];
  for (const s of stages) {
    await pool.query(
      `INSERT INTO sales_stages (id, pipeline_id, name, order_index, probability)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, order_index=EXCLUDED.order_index, probability=EXCLUDED.probability`,
      [s.id, pipelineId, s.name, s.orderIndex, s.probability],
    );
  }
  await pool.query(
    `INSERT INTO sales_deals (id, name, amount, currency, pipeline_id, stage_id, status, probability)
     VALUES ($1,$2,$3,$4,$5,$6,'open',10)
     ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, amount=EXCLUDED.amount, currency=EXCLUDED.currency, pipeline_id=EXCLUDED.pipeline_id, stage_id=EXCLUDED.stage_id, status='open', probability=10`,
    ["deal-sample-1", "Sample Deal", 100000, "THB", pipelineId, "stage-10"],
  );
  const userId = "admin-user";
  try {
    await pool.query(
      `INSERT INTO users (id, name, email, role, is_active, is_deleted)
       VALUES ($1,$2,$3,$4,true,false)
       ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, email=EXCLUDED.email, role=EXCLUDED.role, is_active=true, is_deleted=false`,
      [userId, "Admin", "admin@example.com", "admin"],
    );
  } catch {}
  const projectId = "sample-project";
  try {
    await pool.query(
      `INSERT INTO projects (id, name, status)
       VALUES ($1,$2,'active')
       ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, status='active'`,
      [projectId, "Sample Project"],
    );
  } catch {}
  console.log("Seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
