
import { ok, err, poolDirect } from '../_lib/db';
import { NextRequest } from 'next/server';

let cachedClientColumns: Set<string> | null = null;

function sqlIdent(columnName: string) {
  if (/[^a-z0-9_]/.test(columnName) || /[A-Z]/.test(columnName)) {
    return `"${columnName.replaceAll('"', '""')}"`;
  }
  return columnName;
}

async function getClientColumns() {
  if (cachedClientColumns) return cachedClientColumns;
  const res = await poolDirect.query(
    `
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'clients'
    `
  );
  cachedClientColumns = new Set(res.rows.map((r) => r.column_name));
  return cachedClientColumns;
}

function mapDbClientToApiClient(row: any) {
  return {
    id: row.id,
    name: row.name,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    address: row.address ?? undefined,
    taxId: row.taxId ?? row.tax_id ?? undefined,
    createdAt: row.createdAt ?? row.created_at ?? undefined,
    updatedAt: row.updatedAt ?? row.updated_at ?? undefined,
  };
}

export async function GET(req: NextRequest) {
  try {
    const u = new URL(req.url);
    const q = u.searchParams.get('q');

    const cols = await getClientColumns();
    const params: Array<string> = [];

    let where = '';
    if (q) {
      params.push(`%${q}%`);
      const parts = ['name ILIKE $1'];
      if (cols.has('email')) parts.push('email ILIKE $1');
      where = `WHERE (${parts.join(' OR ')})`;
    }

    const { rows } = await poolDirect.query(
      `
      SELECT *
      FROM public.clients
      ${where}
      ORDER BY name ASC
      `,
      params
    );

    return ok(rows.map(mapDbClientToApiClient), 200);
  } catch (e: any) {
    return err(e?.message || 'error', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, address, taxId } = body;

    if (!name) return err('Name is required', 400);

    const cols = await getClientColumns();

    const insertCols: string[] = [];
    const insertParams: any[] = [];

    if (cols.has('id')) {
      insertCols.push('id');
      insertParams.push(globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`);
    }

    insertCols.push('name');
    insertParams.push(name);

    if (email && cols.has('email')) {
      insertCols.push('email');
      insertParams.push(email);
    }
    if (phone && cols.has('phone')) {
      insertCols.push('phone');
      insertParams.push(phone);
    }
    if (address && cols.has('address')) {
      insertCols.push('address');
      insertParams.push(address);
    }

    if (taxId) {
      if (cols.has('taxId')) {
        insertCols.push('taxId');
        insertParams.push(taxId);
      } else if (cols.has('tax_id')) {
        insertCols.push('tax_id');
        insertParams.push(taxId);
      } else if (cols.has('notes')) {
        insertCols.push('notes');
        insertParams.push(`taxId=${taxId}`);
      }
    }

    if (cols.has('created_at')) insertCols.push('created_at');
    if (cols.has('updated_at')) insertCols.push('updated_at');
    if (cols.has('createdAt')) insertCols.push('createdAt');
    if (cols.has('updatedAt')) insertCols.push('updatedAt');

    const colSql = insertCols.map(sqlIdent).join(', ');
    const valueSql = insertCols
      .map((c, i) => {
        if (['created_at', 'updated_at', 'createdAt', 'updatedAt'].includes(c)) return 'CURRENT_TIMESTAMP';
        return `$${i + 1}`;
      })
      .join(', ');

    const { rows } = await poolDirect.query(
      `
      INSERT INTO public.clients (${colSql})
      VALUES (${valueSql})
      RETURNING *
      `,
      insertParams
    );

    return ok(mapDbClientToApiClient(rows[0]), 201);
  } catch (e: any) {
    return err(e?.message || 'error', 500);
  }
}
