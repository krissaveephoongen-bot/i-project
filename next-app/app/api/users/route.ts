import { NextRequest } from "next/server";
import { ok, err } from "../_lib/db";
import { supabase } from "@/app/lib/supabaseClient";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import redis from "@/lib/redis";
import { isSchemaColumnError } from "../_lib/supabaseCompat";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const u = new URL(req.url);
    const q = u.searchParams.get("q") || "";
    const role = u.searchParams.get("role") || "";
    const status = u.searchParams.get("status") || "";
    const page = Number(u.searchParams.get("page") || 1);
    const pageSize = Number(u.searchParams.get("pageSize") || 50);

    // Create cache key based on filters
    const cacheKey = `users:${JSON.stringify({ q, role, status, page, pageSize })}`;

    // Try to get from Redis cache first
    const cached = await redis.get(cacheKey);

    if (cached) {
      console.log("Cache hit for users:", cacheKey);
      return ok(JSON.parse(cached), 200);
    }

    console.log("Cache miss for users, fetching from database");

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const orderCols = ["name", "created_at"] as const;
    const statusModes = status
      ? (["status", "is_active", "none"] as const)
      : (["none"] as const);
    const roleModes = role ? ([true, false] as const) : ([false] as const);

    let rows: any[] = [];
    let total = 0;
    let lastErr: any = null;

    outer: for (const orderCol of orderCols) {
      for (const statusMode of statusModes) {
        for (const applyRole of roleModes) {
          let query: any = supabase
            .from("users")
            .select("*", { count: "exact" });
          if (q) query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%`);
          if (applyRole && role) query = query.eq("role", role);
          if (status && statusMode === "status")
            query = query.eq("status", status);
          if (status && statusMode === "is_active")
            query = query.eq(
              "is_active",
              String(status).toLowerCase() === "active",
            );
          query = query.order(orderCol as any, {
            ascending: orderCol === "name",
          });
          const res = await query.range(from, to);
          if (!res.error) {
            rows = res.data || [];
            total = res.count || 0;
            lastErr = null;
            break outer;
          }
          lastErr = res.error;
          if (isSchemaColumnError(res.error)) continue;
          break outer;
        }
      }
    }
    if (lastErr) throw lastErr;

    const mapped = (rows || []).map((r: any) => ({
      id: r.id,
      name: r.name ?? r.full_name ?? "",
      email: r.email ?? "",
      role: r.role ?? "employee",
      status: r.status ?? (r.is_active === false ? "inactive" : "active"),
      department: r.department ?? null,
      position: r.position ?? null,
      avatar: r.avatar ?? r.avatar_url ?? null,
      phone: String(r.phone ?? "").replace(/[\r\n]+/g, ""),
      timezone: r.timezone ?? null,
      is_active: r.is_active ?? true,
      is_deleted: r.is_deleted ?? false,
      failed_login_attempts: r.failed_login_attempts ?? 0,
      is_project_manager: r.is_project_manager ?? false,
      is_supervisor: r.is_supervisor ?? false,
      hourly_rate: Number(r.hourly_rate ?? r.hourlyRate ?? 0),
      employee_code: r.employee_code ?? r.employeeCode ?? "",
      created_at: r.created_at ?? null,
      updated_at: r.updated_at ?? null,
    }));

    await redis.set(
      cacheKey,
      JSON.stringify({ total: total || 0, rows: mapped || [] }),
      { EX: 180 },
    );
    console.log("Cached users for 3 minutes:", cacheKey);

    return ok({ total: total || 0, rows: mapped || [] }, 200);
  } catch (e: any) {
    return err(e?.message || "failed", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body.id || crypto.randomUUID();
    const schema = z.object({
      name: z.string().min(1),
      email: z.string().email(),
      role: z.enum(["admin", "manager", "employee"]).default("employee"),
      status: z.enum(["active", "inactive"]).default("active"),
      employee_code: z.number().int().nonnegative().default(0),
    });
    const parsed = schema.parse({
      name: body.name,
      email: body.email,
      role: body.role,
      status: body.status ?? (body.is_active === false ? "inactive" : "active"),
      employee_code: Number(body.employee_code ?? 0),
    });
    const payload: any = {
      id,
      name: parsed.name,
      email: parsed.email,
      role: parsed.role,
      status: parsed.status,
      employee_code: String(parsed.employee_code),
      is_active: parsed.status === "active",
      is_deleted: false,
      is_project_manager: false,
      is_supervisor: false,
      failed_login_attempts: 0,
      timezone: body.timezone || "Asia/Bangkok",
      hourly_rate: body.hourly_rate ?? 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (body.password) {
      const hash = await bcrypt.hash(body.password, 10);
      payload.password = hash;
    }
    const { data, error } = await supabase
      .from("users")
      .insert(payload)
      .select(
        "id,name,email,role,status,employee_code,is_active,is_deleted,failed_login_attempts,timezone,hourly_rate,created_at,updated_at",
      )
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
      await supabase.from("profiles").insert(prof);
    } catch {}
    return ok(createdUser, 200);
  } catch (e) {
    return err((e as any)?.message || "create failed", 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, updatedFields = {} } = body || {};
    if (!id) return err("id required", 400);
    const payload: any = {
      name: updatedFields.name,
      email: updatedFields.email,
      role: updatedFields.role,
      status: updatedFields.status,
      failed_login_attempts: updatedFields.failed_login_attempts,
      timezone: updatedFields.timezone,
      hourly_rate: updatedFields.hourly_rate,
      updated_at: new Date().toISOString(),
    };
    if (updatedFields.password) {
      const hash = await bcrypt.hash(updatedFields.password, 10);
      payload.password = hash;
    }
    if (typeof updatedFields.is_active === "boolean")
      payload.is_active = updatedFields.is_active;
    if (typeof updatedFields.is_deleted === "boolean")
      payload.is_deleted = updatedFields.is_deleted;
    if (typeof updatedFields.employee_code !== "undefined")
      payload.employee_code = String(updatedFields.employee_code);
    const { data, error } = await supabase
      .from("users")
      .update(payload)
      .eq("id", id)
      .select(
        "id,name,email,role,status,is_active,is_deleted,failed_login_attempts,timezone,hourly_rate,employee_code,created_at,updated_at",
      )
      .limit(1);
    if (error) throw error;
    const updatedUser = (data || [])[0] || {};
    try {
      const profUpd: any = {};
      if (typeof updatedFields.name !== "undefined")
        profUpd.name = updatedFields.name;
      if (typeof updatedFields.email !== "undefined")
        profUpd.email = updatedFields.email;
      if (typeof updatedFields.role !== "undefined")
        profUpd.role = updatedFields.role;
      if (Object.keys(profUpd).length > 0) {
        profUpd.updated_at = new Date().toISOString();
        await supabase.from("profiles").update(profUpd).eq("id", id);
      }
    } catch {}
    return ok(updatedUser, 200);
  } catch (e) {
    return err((e as any)?.message || "update failed", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return err("id required", 400);
    const { error } = await supabase
      .from("users")
      .update({
        is_deleted: true,
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) throw error;
    return ok({ ok: true }, 200);
  } catch (e) {
    return err((e as any)?.message || "delete failed", 500);
  }
}
