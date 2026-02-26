import { ok, err } from "../_lib/db";
import { supabase } from "@/app/lib/supabaseClient";
import crypto from "node:crypto";
import { NextRequest } from "next/server";
import { isSchemaColumnError } from "../_lib/supabaseCompat";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const u = new URL(req.url);
    const id = u.searchParams.get("id");
    const projectId = u.searchParams.get("projectId");

    try {
      if (id) {
        const res = await supabase
          .from("contacts")
          .select("*")
          .eq("id", id)
          .limit(1)
          .single();
        if (res.error) {
          if (isSchemaColumnError(res.error)) throw res.error;
          return err(res.error.message, 500);
        }
        return ok(res.data || null, 200);
      }

      let query = supabase.from("contacts").select("*");
      if (projectId) query = query.eq("project_id", projectId);
      const res = await query.order("created_at", { ascending: false });
      if (res.error) {
        if (isSchemaColumnError(res.error)) throw res.error;
        return err(res.error.message, 500);
      }
      const rows = (res.data || []).filter((c: any) =>
        ["stakeholder", "client", "Stakeholder", "Client"].includes(
          String(c.type || ""),
        ),
      );
      return ok(rows, 200);
    } catch (e: any) {
      const base = supabase.from("stakeholders").select("*");
      if (id) {
        const r = await base.eq("id", id).limit(1).single();
        if (r.error) return err(r.error.message, 500);
        return ok(r.data || null, 200);
      }
      const r = await base.order("created_at", { ascending: false });
      if (r.error) return err(r.error.message, 500);
      return ok(r.data || [], 200);
    }
  } catch (e: any) {
    return err(e?.message || "error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      position,
      email,
      phone,
      project_id,
      projectId,
      type,
      organization,
      role,
    } = body;

    if (!name) return err("Name is required", 400);
    const pid = project_id || projectId;
    const now = new Date().toISOString();
    const payload: any = {
      id: crypto.randomUUID(),
      name,
      position: position || null,
      email,
      phone,
      project_id: pid,
      type: type || "stakeholder",
      is_key_person: false,
      created_at: now,
      updated_at: now,
    };

    const res = await supabase.from("contacts").insert(payload);
    if (!res.error) return ok(payload, 201);
    if (!isSchemaColumnError(res.error)) return err(res.error.message, 500);

    const fallback: any = {
      id: payload.id,
      name,
      role: role ?? position ?? null,
      organization: organization ?? null,
      email,
      phone,
      created_at: now,
      updated_at: now,
    };
    const r2 = await supabase.from("stakeholders").insert(fallback);
    if (r2.error) return err(r2.error.message, 500);
    return ok(fallback, 201);
  } catch (e: any) {
    return err(e?.message || "error", 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      name,
      position,
      email,
      phone,
      type,
      project_id,
      projectId,
      is_key_person,
      organization,
      role,
    } = body;

    if (!id) return err("ID required", 400);

    const payload: any = {
      name,
      position,
      email,
      phone,
      type,
      project_id: project_id || projectId,
      is_key_person,
      updated_at: new Date().toISOString(),
    };

    const res = await supabase.from("contacts").update(payload).eq("id", id);
    if (!res.error) return ok({ id, ...payload }, 200);
    if (!isSchemaColumnError(res.error)) return err(res.error.message, 500);

    const fallback: any = {
      name,
      role: role ?? position ?? null,
      organization: organization ?? null,
      email,
      phone,
      updated_at: payload.updated_at,
    };
    const r2 = await supabase
      .from("stakeholders")
      .update(fallback)
      .eq("id", id);
    if (r2.error) return err(r2.error.message, 500);
    return ok({ id, ...fallback }, 200);
  } catch (e: any) {
    return err(e?.message || "error", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const u = new URL(req.url);
    const id = u.searchParams.get("id");
    if (!id) return err("ID required", 400);

    const res = await supabase.from("contacts").delete().eq("id", id);
    if (!res.error) return ok({ success: true }, 200);
    if (!isSchemaColumnError(res.error)) return err(res.error.message, 500);

    const r2 = await supabase.from("stakeholders").delete().eq("id", id);
    if (r2.error) return err(r2.error.message, 500);
    return ok({ success: true }, 200);
  } catch (e: any) {
    return err(e?.message || "error", 500);
  }
}
