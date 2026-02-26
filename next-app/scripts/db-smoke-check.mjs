import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { Client } from "pg";

function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  dotenv.config({ path: envPath });
}

function cleanUrl(url) {
  let u = url;
  u = u.replace(/([?&])uselibpqcompat=true(&|$)/i, "$1");
  u = u.replace(/([?&])sslmode=require(&|$)/i, "$1");
  u = u.replace(/\?\&/, "?").replace(/\&\&/, "&").replace(/\?$/, "");
  return u;
}

async function q(client, sql, params, label) {
  const res = await client.query(sql, params);
  console.log(`\n[${label}]`);
  console.log(JSON.stringify(res.rows, null, 2));
  return res.rows;
}

async function main() {
  loadEnv();
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }
  const client = new Client({
    connectionString: cleanUrl(url),
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    await q(
      client,
      `
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema='public'
        AND (table_name, column_name) IN (('time_entries','rejectedReason'),('expenses','rejectedReason'))
      ORDER BY table_name, column_name;
    `,
      [],
      "Columns: rejectedReason on time_entries/expenses",
    );

    await q(
      client,
      `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema='public' AND table_name='milestones' AND column_name IN ('name','percentage')
      ORDER BY column_name;
    `,
      [],
      "Columns: milestones name/percentage",
    );

    await q(
      client,
      `
      SELECT conname, confdeltype
      FROM pg_constraint
      WHERE conname IN (
        'time_entries_projectId_fkey',
        'time_entries_taskId_fkey',
        'time_entries_userId_fkey',
        'time_entries_approvedBy_fkey',
        'tasks_projectId_fkey',
        'time_entries_projectId_fkey_restrict',
        'time_entries_taskId_fkey_restrict',
        'time_entries_userId_fkey_restrict',
        'tasks_projectId_fkey_restrict'
      )
      ORDER BY conname;
    `,
      [],
      "Constraints: FK referential actions sample",
    );

    await q(
      client,
      `
      SELECT t.tgname, c.relname AS table, p.proname AS function
      FROM pg_trigger t
      JOIN pg_class c ON c.oid = t.tgrelid
      JOIN pg_proc p ON p.oid = t.tgfoid
      WHERE c.relname IN ('projects','tasks','users')
      ORDER BY c.relname, t.tgname;
    `,
      [],
      "Triggers installed",
    );

    await q(
      client,
      `
      SELECT "status", COUNT(*) AS count
      FROM public.time_entries
      GROUP BY "status"
      ORDER BY "status";
    `,
      [],
      "Time Entries status distribution",
    );

    await q(
      client,
      `
      SELECT "status", COUNT(*) AS count
      FROM public.expenses
      GROUP BY "status"
      ORDER BY "status";
    `,
      [],
      "Expenses status distribution",
    );

    await q(
      client,
      `
      SELECT te.id, te.date, te.hours,
             u.name AS user_name,
             p.name AS project_name,
             t.title AS task_title,
             te."status", te."rejectedReason"
      FROM public.time_entries te
      LEFT JOIN public.users u ON u.id = te."userId"
      LEFT JOIN public.projects p ON p.id = te."projectId"
      LEFT JOIN public.tasks t ON t.id = te."taskId"
      WHERE te."status" = 'pending'
      ORDER BY te.date DESC
      LIMIT 5;
    `,
      [],
      "Sample pending timesheets with joins",
    );

    await q(
      client,
      `
      SELECT
        (SELECT COUNT(*) FROM public.projects WHERE "isArchived"=false) AS active_projects,
        (SELECT COUNT(*) FROM public.tasks WHERE status::text NOT IN ('done','cancelled','inactive')) AS open_tasks,
        (SELECT COALESCE(SUM("budget"),0) FROM public.projects) AS total_budget,
        (SELECT COALESCE(SUM("spent"),0) FROM public.projects) AS total_spent,
        (SELECT COALESCE(AVG("spi"),1) FROM public.projects) AS avg_spi
    `,
      [],
      "Dashboard KPIs snapshot",
    );
  } catch (e) {
    console.error("Smoke check error:", e.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error("Fatal:", e.message);
  process.exit(1);
});
