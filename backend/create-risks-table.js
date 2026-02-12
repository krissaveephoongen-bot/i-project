import postgres from 'postgres';

const connectionString = "postgresql://postgres.rllhsiguqezuzltsjntp:mctgWK9StMyArZNv@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres?sslmode=require";

const sql = `
-- Create risks table
CREATE TABLE IF NOT EXISTS "risks" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "title" text NOT NULL,
    "description" text,
    "impact" text NOT NULL,
    "probability" text NOT NULL,
    "risk_score" integer,
    "mitigation_plan" text,
    "status" text NOT NULL DEFAULT 'open',
    "project_id" uuid,
    "assigned_to" uuid,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes for risks table
CREATE INDEX IF NOT EXISTS "idx_risks_project_id" ON "risks" ("project_id");
CREATE INDEX IF NOT EXISTS "idx_risks_status" ON "risks" ("status");
CREATE INDEX IF NOT EXISTS "idx_risks_assigned_to" ON "risks" ("assigned_to");

-- Create foreign key constraints
ALTER TABLE "risks" ADD CONSTRAINT IF NOT EXISTS "risks_project_id_projects_id_fk"
    FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL;

ALTER TABLE "risks" ADD CONSTRAINT IF NOT EXISTS "risks_assigned_to_users_id_fk"
    FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL;
`;

async function createRisksTable() {
  const client = postgres(connectionString, { ssl: 'require' });

  try {
    console.log('Creating risks table...');
    await client.unsafe(sql);
    console.log('Risks table created successfully!');

    // Verify the table was created
    const result = await client`SELECT COUNT(*) as count FROM risks`;
    console.log(`Risks table now has ${result[0].count} records`);

  } catch (error) {
    console.error('Error creating risks table:', error);
  } finally {
    await client.end();
  }
}

createRisksTable();
