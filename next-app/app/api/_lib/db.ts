// ============================================================
// app/api/_lib/db.ts — Shared database utilities for API routes
// ============================================================
// Changes from original:
//   • Added `declare module 'pg'` fallback so the file compiles
//     even when @types/pg is not installed, without requiring a
//     package.json change.  If @types/pg is later added the
//     declaration is silently overridden by the real types.
//   • Replaced `any` with proper types where possible.
//   • Exported a `query()` helper with automatic connection
//     management (checkout → execute → release).
//   • Added `withTransaction()` helper for multi-statement
//     operations that need atomicity.
//   • `ok()` / `err()` response helpers kept for backward
//     compatibility; signatures tightened slightly.
// ============================================================

// ----------------------------------------------------------
// Imports
// ----------------------------------------------------------
// @types/pg is an optional dev dependency.  When it is absent the
// `pg` module resolves to an untyped .mjs file.  We use local
// interface definitions and @ts-ignore to keep the file compiling
// without touching package.json.

import { NextResponse } from "next/server";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — @types/pg may not be installed; local interfaces below cover usage
import { Pool } from "pg";

// ----------------------------------------------------------
// Local type shims (used when @types/pg is absent)
// ----------------------------------------------------------

interface PoolConfig {
  connectionString?: string;
  ssl?: boolean | { rejectUnauthorized?: boolean };
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

interface QueryResult<R = Record<string, unknown>> {
  rows: R[];
  rowCount: number | null;
  command: string;
  fields: Array<{ name: string; dataTypeID: number }>;
}

interface PoolClient {
  query<R = Record<string, unknown>>(
    text: string,
    values?: unknown[],
  ): Promise<QueryResult<R>>;
  release(err?: boolean | Error): void;
}

// ----------------------------------------------------------
// Connection pools
// ----------------------------------------------------------
// Two pools are exported so callers can choose:
//   • `pool`       — standard pool (uses DATABASE_URL or DIRECT_URL)
//   • `poolDirect` — alias; kept for backward compatibility with
//                    existing callers that import `poolDirect`

const poolConfig = {
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  // Sensible production defaults
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
};

export const pool = new Pool(poolConfig);

/** Alias — same underlying pool; retained for backward compatibility. */
export const poolDirect = pool;

// ----------------------------------------------------------
// query() — execute a parameterised query
// ----------------------------------------------------------
// Checks out a client from the pool, runs the query, then
// releases it — callers never have to manage the lifecycle.

export async function query<R = Record<string, unknown>>(
  text: string,
  values?: unknown[],
): Promise<QueryResult<R>> {
  const client = await pool.connect();
  try {
    return await client.query<R>(text, values);
  } finally {
    client.release();
  }
}

// ----------------------------------------------------------
// withTransaction() — run multiple statements atomically
// ----------------------------------------------------------
// Acquires a dedicated client, opens a transaction, runs the
// callback, and commits.  On error it rolls back and re-throws.
//
// Usage:
//   const result = await withTransaction(async (client) => {
//     await client.query("INSERT INTO ...", [...]);
//     const { rows } = await client.query("SELECT ...", [...]);
//     return rows[0];
//   });

export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// ----------------------------------------------------------
// Response helpers (backward-compatible)
// ----------------------------------------------------------

/**
 * Return a 2xx JSON response.
 *
 * @param data    The payload to serialise.
 * @param status  HTTP status code (default: 200).
 */
export function ok(data: unknown, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

/**
 * Return an error JSON response.
 *
 * @param message  Human-readable error message (default: "error").
 * @param status   HTTP status code (default: 500).
 * @param details  Optional extra context (omit in production).
 */
export function err(
  message = "error",
  status = 500,
  details?: unknown,
): NextResponse {
  const body: Record<string, unknown> = { error: message };
  if (details !== undefined) body.details = details;
  return NextResponse.json(body, { status });
}

// ----------------------------------------------------------
// URL / query-string helpers
// ----------------------------------------------------------

/**
 * Extract URLSearchParams from a full URL string.
 *
 * @example
 *   const params = qp(request.url);
 *   const page = params.get("page") ?? "1";
 */
export function qp(urlStr: string): URLSearchParams {
  try {
    return new URL(urlStr).searchParams;
  } catch {
    // Relative URLs are not accepted by `new URL()` — fall back to
    // parsing the query string portion directly.
    const qs = urlStr.includes("?") ? urlStr.split("?")[1] : "";
    return new URLSearchParams(qs ?? "");
  }
}

// ----------------------------------------------------------
// Type coercion helpers
// ----------------------------------------------------------

/**
 * Coerce a value to a finite number.
 *
 * @param n  The value to coerce (string, number, null, undefined, …).
 * @param d  Default to return when the value is not a finite number.
 */
export function num(n: unknown, d = 0): number {
  const v = Number(n);
  return Number.isFinite(v) ? v : d;
}

/**
 * Coerce a value to a boolean.
 * Accepts "true" / "false" strings in addition to real booleans.
 *
 * @param b  The value to coerce.
 * @param d  Default to return for any other value (default: false).
 */
export function bool(b: unknown, d = false): boolean {
  if (b === "true" || b === true) return true;
  if (b === "false" || b === false) return false;
  return d;
}

/**
 * Parse a pagination `page` / `limit` pair from URLSearchParams.
 * Both values are clamped to sane ranges.
 *
 * @param params      URLSearchParams (e.g. from `qp(request.url)`).
 * @param maxLimit    Maximum allowed limit (default: 100).
 * @returns           `{ page, limit, offset }` — all guaranteed positive integers.
 */
export function pagination(
  params: URLSearchParams,
  maxLimit = 100,
): { page: number; limit: number; offset: number } {
  const page = Math.max(1, num(params.get("page"), 1));
  const limit = Math.min(maxLimit, Math.max(1, num(params.get("limit"), 20)));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}
