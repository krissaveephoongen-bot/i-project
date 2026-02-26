const { Pool } = require("pg");

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.DATABASE_URL &&
      process.env.DATABASE_URL.includes("supabase.com")
        ? { rejectUnauthorized: false }
        : undefined,
  });
  const managerId = "82df756a-4d46-4e49-b927-bb165d7dc489";
  const colsRes = await pool.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name = $1",
    ["projects"],
  );
  const cols = colsRes.rows.map((r) => r.column_name);
  let col = null;
  if (cols.includes("managerId")) col = '"managerId"';
  else if (cols.includes("manager_id")) col = "manager_id";
  else {
    console.log("No manager column on projects");
    await pool.end();
    return;
  }
  await pool.query(`UPDATE projects SET ${col} = $1`, [managerId]);
  const selCol = col === '"managerId"' ? '"managerId"' : "manager_id";
  const out = await pool.query(
    `SELECT id, name, ${selCol} as managerId FROM projects ORDER BY name LIMIT 10`,
  );
  console.log(out.rows);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
