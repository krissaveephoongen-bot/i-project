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

async function main() {
  loadEnv();
  const url = process.env.DATABASE_URL;
  const client = new Client({
    connectionString: cleanUrl(url),
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    const file = path.resolve(
      process.cwd(),
      "db",
      "migrations",
      "20260211_restrict_triggers.sql",
    );
    const sql = fs.readFileSync(file, "utf8");
    await client.query(sql);
    console.log("Triggers applied successfully");
  } catch (e) {
    console.error("Trigger apply error:", e.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error("Fatal:", e.message);
  process.exit(1);
});
