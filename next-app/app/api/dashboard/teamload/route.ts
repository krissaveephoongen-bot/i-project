import { ok } from "../../_lib/db";
import { pool } from "../../_lib/db";

export async function GET() {
  try {
    const res = await pool.query(`
      SELECT
        u.id,
        u.name,
        SUM(t.hours)::numeric AS hours
      FROM users u
      LEFT JOIN timesheets t ON t.user_id = u.id
      GROUP BY u.id, u.name
      ORDER BY hours DESC NULLS LAST
    `);
    return ok(res.rows, 200);
  } catch (error) {
    return ok([], 200);
  } finally {
  }
}
