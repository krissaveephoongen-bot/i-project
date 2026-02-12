import { NextRequest } from 'next/server';
import { ok, err, pool } from '../_lib/db';
import { supabase } from '@/app/lib/supabaseClient';
import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import { z } from 'zod';
 
export async function GET(req: NextRequest) {
  try {
    const u = new URL(req.url);
    const q = u.searchParams.get('q') || '';
    const role = u.searchParams.get('role') || '';
    const status = u.searchParams.get('status') || '';
    const page = Number(u.searchParams.get('page') || 1);
    const pageSize = Number(u.searchParams.get('pageSize') || 50);
    try {
      let query = supabase
        .from('users')
        .select('id,name,email,role,status,department,position,avatar,phone,timezone,isActive,isDeleted,failedLoginAttempts,isProjectManager,isSupervisor,hourlyRate,employeeCode,createdAt,updatedAt', { count: 'exact' })
        .order('name', { ascending: true });
      if (q) {
        query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%`);
      }
      if (role) {
        query = query.eq('role', role);
      }
      if (status) {
        query = query.eq('status', status);
      }
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data: rows, count, error } = await query.range(from, to);
      if (error) throw error;
      return ok({ total: count || 0, rows: rows || [] }, 200);
    } catch {
      const conds: string[] = [];
      const params: any[] = [];
      let idx = 1;
      if (q) {
        conds.push(`(LOWER(name) LIKE $${idx} OR LOWER(email) LIKE $${idx})`);
        params.push(`%${q.toLowerCase()}%`);
        idx++;
      }
      if (role) {
        conds.push(`LOWER(role::text) = $${idx}`);
        params.push(role.toLowerCase());
        idx++;
      }
      if (status) {
        conds.push(`LOWER(COALESCE(status, "status")) = $${idx}`);
        params.push(status.toLowerCase());
        idx++;
      }
      const whereSql = conds.length > 0 ? `WHERE ${conds.join(' AND ')}` : '';
      const countSql = `SELECT COUNT(*)::int AS count FROM users ${whereSql}`;
      const totalRes = await pool.query(countSql, params);
      params.push(pageSize);
      params.push((page - 1) * pageSize);
      const rowsSql = `
        SELECT
          id,
          name,
          email,
          role,
          status,
          department,
          position,
          avatar,
          REGEXP_REPLACE(COALESCE(phone, ''), E'[\\r\\n]+', '', 'g') AS phone,
          timezone,
          is_active,
          is_deleted,
          failed_login_attempts,
          is_project_manager,
          is_supervisor,
          hourly_rate,
          employee_code,
          created_at,
          updated_at
        FROM users
        ${whereSql}
        ORDER BY name ASC NULLS LAST
        LIMIT $${idx} OFFSET $${idx + 1}
      `;
      const rowsRes = await pool.query(rowsSql, params);
      const rows = rowsRes.rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        role: r.role,
        status: r.status,
        department: r.department,
        position: r.position,
        avatar: r.avatar,
        phone: r.phone,
        timezone: r.timezone,
        isActive: r.is_active ?? true,
        isDeleted: r.is_deleted ?? false,
        failedLoginAttempts: r.failed_login_attempts ?? 0,
        isProjectManager: r.is_project_manager ?? false,
        isSupervisor: r.is_supervisor ?? false,
        hourlyRate: Number(r.hourly_rate ?? 0),
        employeeCode: r.employee_code ?? '',
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));
      return ok({ total: totalRes.rows[0]?.count || 0, rows }, 200);
    }
  } catch (e: any) {
    return err(e?.message || 'failed', 500);
  }
}
 
 export async function POST(req: NextRequest) {
   try {
    const body = await req.json();
    const id = body.id || crypto.randomUUID();
    const schema = z.object({
      name: z.string().min(1),
      email: z.string().email(),
      role: z.enum(['admin', 'manager', 'employee']).default('employee'),
      status: z.enum(['active', 'inactive']).default('active'),
      employeeCode: z.number().int().nonnegative().default(0),
    });
    const parsed = schema.parse({
      name: body.name,
      email: body.email,
      role: body.role,
      status: body.status ?? (body.isActive === false ? 'inactive' : 'active'),
      employeeCode: Number(body.employeeCode ?? 0),
    });
    const payload: any = {
      id,
      name: parsed.name,
      email: parsed.email,
      role: parsed.role,
      status: parsed.status,
      employeeCode: String(parsed.employeeCode),
      isActive: parsed.status === 'active',
      isDeleted: false,
      isProjectManager: false,
      isSupervisor: false,
      failedLoginAttempts: 0,
      timezone: body.timezone || 'Asia/Bangkok',
      hourlyRate: body.hourlyRate ?? 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (body.password) {
      const hash = await bcrypt.hash(body.password, 10);
      payload.password = hash;
      payload.password_hash = hash;
      payload.hashed_password = hash;
    }
    const { data, error } = await supabase
      .from('users')
      .insert(payload)
      .select('id,name,email,role,status,employeeCode,isActive,isDeleted,failedLoginAttempts,timezone,hourlyRate,createdAt,updatedAt')
      .limit(1);
    if (error) throw error;
    const createdUser = (data || [])[0] || {};
    try {
      const prof = {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        avatar_url: body.avatar ?? null,
        role: createdUser.role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await supabase.from('profiles').insert(prof);
    } catch {}
    return ok(createdUser, 200);
  } catch (e) {
    return err((e as any)?.message || 'create failed', 500);
   }
 }
 
 export async function PUT(req: NextRequest) {
   try {
    const body = await req.json();
    const { id, updatedFields = {} } = body || {};
    if (!id) return err('id required', 400);
    const payload: any = {
      name: updatedFields.name,
      email: updatedFields.email,
      role: updatedFields.role,
      status: updatedFields.status,
      failedLoginAttempts: updatedFields.failedLoginAttempts,
      timezone: updatedFields.timezone,
      hourlyRate: updatedFields.hourlyRate,
      updatedAt: new Date().toISOString(),
    };
    if (updatedFields.password) {
      const hash = await bcrypt.hash(updatedFields.password, 10);
      payload.password = hash;
      payload.password_hash = hash;
      payload.hashed_password = hash;
    }
    if (typeof updatedFields.isActive === 'boolean') payload.isActive = updatedFields.isActive;
    if (typeof updatedFields.isDeleted === 'boolean') payload.isDeleted = updatedFields.isDeleted;
    if (typeof updatedFields.employeeCode !== 'undefined') payload.employeeCode = String(updatedFields.employeeCode);
    const { data, error } = await supabase
      .from('users')
      .update(payload)
      .eq('id', id)
      .select('id,name,email,role,status,isActive,isDeleted,failedLoginAttempts,timezone,hourlyRate,employeeCode,createdAt,updatedAt')
      .limit(1);
    if (error) throw error;
    const updatedUser = (data || [])[0] || {};
    try {
      const profUpd: any = {};
      if (typeof updatedFields.name !== 'undefined') profUpd.name = updatedFields.name;
      if (typeof updatedFields.email !== 'undefined') profUpd.email = updatedFields.email;
      if (typeof updatedFields.role !== 'undefined') profUpd.role = updatedFields.role;
      if (Object.keys(profUpd).length > 0) {
        profUpd.updated_at = new Date().toISOString();
        await supabase.from('profiles').update(profUpd).eq('id', id);
      }
    } catch {}
    return ok(updatedUser, 200);
  } catch (e) {
    return err((e as any)?.message || 'update failed', 500);
   }
 }
 
 export async function DELETE(req: NextRequest) {
   try {
     const { searchParams } = new URL(req.url);
     const id = searchParams.get('id');
    if (!id) return err('id required', 400);
   const { error } = await supabase
      .from('users')
      .update({ isDeleted: true, isActive: false, updatedAt: new Date().toISOString() })
      .eq('id', id);
   if (error) throw error;
    return ok({ ok: true }, 200);
  } catch (e) {
    return err((e as any)?.message || 'delete failed', 500);
   }
 }
