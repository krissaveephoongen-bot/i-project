
import { ok, err, poolDirect } from '../../_lib/db';
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

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { rows } = await poolDirect.query(
      `
      SELECT *
      FROM public.clients
      WHERE id = $1
      LIMIT 1
      `,
      [id]
    );
    if (!rows[0]) return err('Client not found', 404);
    return ok(mapDbClientToApiClient(rows[0]), 200);
  } catch (e: any) {
    return err(e?.message || 'error', 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();

    const cols = await getClientColumns();
    const setParts: string[] = [];
    const values: any[] = [];

    const pushSet = (col: string, value: any) => {
      setParts.push(`${sqlIdent(col)} = $${values.length + 1}`);
      values.push(value);
    };

    if (body.name !== undefined && cols.has('name')) pushSet('name', body.name);
    if (body.email !== undefined && cols.has('email')) pushSet('email', body.email);
    if (body.phone !== undefined && cols.has('phone')) pushSet('phone', body.phone);
    if (body.address !== undefined && cols.has('address')) pushSet('address', body.address);

    if (body.taxId !== undefined) {
      if (cols.has('taxId')) pushSet('taxId', body.taxId);
      else if (cols.has('tax_id')) pushSet('tax_id', body.taxId);
      else if (cols.has('notes')) pushSet('notes', `taxId=${body.taxId}`);
    }

    if (cols.has('updated_at')) setParts.push(`updated_at = CURRENT_TIMESTAMP`);
    if (cols.has('updatedAt')) setParts.push(`${sqlIdent('updatedAt')} = CURRENT_TIMESTAMP`);

    if (setParts.length === 0) return err('No valid fields to update', 400);

    values.push(id);
    const { rows } = await poolDirect.query(
      `
      UPDATE public.clients
      SET ${setParts.join(', ')}
      WHERE id = $${values.length}
      RETURNING *
      `,
      values
    );

    if (!rows[0]) return err('Client not found', 404);
    return ok(mapDbClientToApiClient(rows[0]), 200);
  } catch (e: any) {
    return err(e?.message || 'error', 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { rowCount } = await poolDirect.query(
      `
      DELETE FROM public.clients
      WHERE id = $1
      `,
      [id]
    );

    if (rowCount === 0) return err('Client not found', 404);
    return ok({ success: true }, 200);
  } catch (e: any) {
    return err(e?.message || 'error', 500);
  }
}
