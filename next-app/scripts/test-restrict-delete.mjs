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

async function main() {
  loadEnv();
  const url = process.env.DATABASE_URL;
  const client = new Client({
    connectionString: cleanUrl(url),
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    await client.query("BEGIN");
    const proj = await client.query(`
      SELECT p.id
      FROM public.projects p
      WHERE EXISTS (SELECT 1 FROM public.tasks t WHERE t."projectId"=p.id)
         OR EXISTS (SELECT 1 FROM public.time_entries te WHERE te."projectId"=p.id)
         OR EXISTS (SELECT 1 FROM public.expenses e WHERE e."projectId"=p.id)
         OR EXISTS (SELECT 1 FROM public.documents d WHERE d."projectId"=p.id)
      LIMIT 1
    `);
    const projectId = proj.rows[0]?.id;
    let projectResult = "no_project_found";
    if (projectId) {
      try {
        await client.query(`DELETE FROM public.projects WHERE id=$1`, [
          projectId,
        ]);
        projectResult = "deleted_or_not_restricted";
      } catch (e) {
        projectResult = "blocked:" + e.message;
      }
    }

    const task = await client.query(`
      SELECT t.id
      FROM public.tasks t
      WHERE EXISTS (SELECT 1 FROM public.time_entries te WHERE te."taskId"=t.id)
         OR EXISTS (SELECT 1 FROM public.expenses e WHERE e."taskId"=t.id)
         OR EXISTS (SELECT 1 FROM public.comments c WHERE c."taskId"=t.id)
         OR EXISTS (SELECT 1 FROM public.documents d WHERE d."taskId"=t.id)
      LIMIT 1
    `);
    const taskId = task.rows[0]?.id;
    let taskResult = "no_task_found";
    if (taskId) {
      try {
        await client.query(`DELETE FROM public.tasks WHERE id=$1`, [taskId]);
        taskResult = "deleted_or_not_restricted";
      } catch (e) {
        taskResult = "blocked:" + e.message;
      }
    }

    console.log(
      JSON.stringify({ projectId, projectResult, taskId, taskResult }, null, 2),
    );
  } finally {
    await client.query("ROLLBACK");
    await client.end();
  }
}

main().catch((e) => {
  console.error("Fatal:", e.message);
  process.exit(1);
});
