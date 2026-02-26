import { NextResponse } from "next/server";
import { Pool } from "pg";

// PostgreSQL pool connections
export const pool = new Pool({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export const poolDirect = new Pool({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export function ok(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

export function err(message = "error", status = 500, details?: any) {
  return NextResponse.json({ error: message, details }, { status });
}

export function qp(urlStr: string) {
  return new URL(urlStr).searchParams;
}

export function num(n: any, d = 0) {
  const v = Number(n);
  return Number.isFinite(v) ? v : d;
}

export function bool(b: any, d = false) {
  if (b === "true" || b === true) return true;
  if (b === "false" || b === false) return false;
  return d;
}
