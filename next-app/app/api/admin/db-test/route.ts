import { NextRequest } from 'next/server';
import { ok, err, poolDirect } from '../../_lib/db';

export async function GET(_req: NextRequest) {
  try {
    const ping = await poolDirect.query('SELECT 1');
    const r = await poolDirect.query('SELECT COUNT(*)::int AS count FROM projects');
    const projectsCount = r.rows?.[0]?.count ?? 0;
    return ok({ connected: ping.rowCount === 1, projectsCount }, 200);
  } catch (e: any) {
    return err('db test error', 500, e?.message || String(e));
  }
}
