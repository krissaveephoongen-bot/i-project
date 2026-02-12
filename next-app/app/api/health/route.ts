import { NextRequest } from 'next/server';
import { ok, err, pool, poolDirect } from '../_lib/db';
import { supabase } from '../../lib/supabaseClient';
import { supabaseAdmin } from '@/lib/supabaseAdminClient';

export async function GET(_req: NextRequest) {
  const result: any = {
    app: 'Ticket APW API Backend',
    version: '1.0.0',
    database: {
      urlPresent: Boolean(process.env.DATABASE_URL),
      directUrlPresent: Boolean(process.env.DIRECT_URL || process.env.DATABASE_URL),
      connected: false,
      error: null,
      host: null,
      port: null
    },
    supabase: {
      urlPresent: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      keyPresent: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      connected: false,
      error: null,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || null
    },
    timestamp: new Date().toISOString()
  };

  try {
    const r = await poolDirect.query('SELECT 1');
    result.database.connected = r?.rowCount === 1;
  } catch (e: any) {
    result.database.error = e?.message || String(e);
    try {
      const r2 = await pool.query('SELECT 1');
      result.database.connected = r2?.rowCount === 1;
    } catch (e2: any) {
      result.database.error = result.database.error || e2?.message || String(e2);
    }
  }
  try {
    const url = new URL(process.env.DIRECT_URL || process.env.DATABASE_URL || '');
    result.database.host = url.hostname || null;
    result.database.port = url.port || '5432';
  } catch {}

  try {
    const adminRes = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1 });
    if (adminRes.error) throw adminRes.error;
    result.supabase.connected = true;
  } catch (e: any) {
    result.supabase.error = e?.message || String(e);
    try {
      const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/+$/, '');
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      const res = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: key } });
      result.supabase.connected = res.ok;
      if (!res.ok) {
        const txt = await res.text();
        result.supabase.error = txt || result.supabase.error;
      }
    } catch (e2: any) {
      result.supabase.error = result.supabase.error || e2?.message || String(e2);
    }
  }

  const healthy = result.database.connected || result.supabase.connected;
  if (!healthy) {
    return err('Database connection failed', 500, result);
  }
  return ok(result, 200);
}
