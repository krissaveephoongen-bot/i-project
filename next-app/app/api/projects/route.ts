import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import redis from "@/lib/redis";
import crypto from "node:crypto";
import { apiResponse, apiError, toCamelCase } from "@/app/lib/api-utils";

export const dynamic = "force-dynamic";

// GET: List all projects
export async function GET() {
  try {
    if (!supabaseAdmin) {
      return apiError("Supabase is not configured", 500);
    }

    const { data: projects, error } = await supabaseAdmin
      .from("projects")
      .select("*")
      .order("name");

    if (error) {
      throw error;
    }

    // Transform field names to camelCase for consistency
    const enrichedProjects = (projects || []).map((p: any) => ({
      ...toCamelCase(p),
      // Ensure specific fields are correctly mapped if auto-conversion fails or needs overrides
      managerId: p.manager_id,
      clientId: p.client_id,
      startDate: p.start_date,
      endDate: p.end_date,
      hourlyRate: p.hourly_rate,
      isArchived: p.is_archived,
      warrantyStartDate: p.warranty_start_date,
      warrantyEndDate: p.warranty_end_date,
      closureChecklist: p.closure_checklist,
    }));

    return apiResponse(enrichedProjects);
  } catch (e: any) {
    console.error("Projects API error:", e);
    return apiError(e?.message || "Internal server error", 500);
  }
}

// POST: Create a new project
export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return apiError("Supabase is not configured", 500);
    }

    const body = await request.json();
    const {
      id,
      name,
      code,
      description,
      status = "in_progress",
      progress = 0,
      startDate,
      endDate,
      budget = 0,
      managerId,
      clientId,
      priority = "medium",
      category,
      milestones = [],
      members = [],
      tasks = [],
      contacts = [],
    } = body || {};

    if (!name) {
      return apiError("Name is required", 400);
    }

    const projectId = id ?? crypto.randomUUID();
    const nowIso = new Date().toISOString();

    const payload: any = {
      id: projectId,
      name,
      code: code || null,
      description: description || null,
      status,
      progress: Number(progress ?? 0),
      progress_plan: 0,
      start_date: startDate || null,
      end_date: endDate || null,
      budget: Number(budget ?? 0),
      spent: 0,
      spi: 1.0,
      cpi: 1.0,
      client_id: clientId || null,
      manager_id: managerId || null,
      category: category || null,
      is_archived: false,
      created_at: nowIso,
      updated_at: nowIso,
    };

    const { error: createErr } = await supabaseAdmin
      .from("projects")
      .insert([payload]);

    if (createErr) {
      return apiError(createErr.message, 500);
    }

    // Handle milestones
    if (Array.isArray(milestones) && milestones.length > 0) {
      for (const m of milestones) {
        const mPayload = {
          id: m.id ?? crypto.randomUUID(),
          project_id: projectId,
          title: m.title || m.name || "",
          description: m.description || null,
          status: m.status || "pending",
          due_date: m.dueDate || m.due_date || null,
          amount: Number(m.amount || 0),
          progress: Number(m.percentage || m.progress || 0),
          created_at: nowIso,
          updated_at: nowIso,
        };

        const { error } = await supabaseAdmin.from("milestones").insert(mPayload);
        if (error) console.error("Error creating milestone:", error);
      }
    }

    // Handle members
    if (Array.isArray(members) && members.length > 0) {
      const memberPayloads = members
        .filter((m: any) => m?.user_id && m?.role)
        .map((m: any) => ({
          project_id: projectId,
          user_id: m.user_id,
          role: m.role,
          joinedAt: nowIso,
          created_at: nowIso,
          updated_at: nowIso,
        }));
      
      if (memberPayloads.length > 0) {
        const { error } = await supabaseAdmin.from("project_members").insert(memberPayloads);
        if (error) console.error("Error creating members:", error);
      }
    }

    // Handle tasks
    if (Array.isArray(tasks) && tasks.length > 0) {
      const taskPayloads = tasks.map((t: any) => ({
        id: t.id ?? crypto.randomUUID(),
        project_id: projectId,
        title: t.title || t.name || "",
        description: t.description || null,
        status: t.status || "todo",
        priority: t.priority || "medium",
        weight: Number(t.weight || 0),
        start_date: t.startDate || t.start_date || null,
        due_date: t.dueDate || t.due_date || null,
        created_by: "system",
        created_at: nowIso,
        updated_at: nowIso,
      }));

      const { error } = await supabaseAdmin.from("tasks").insert(taskPayloads);
      if (error) console.error("Error creating tasks:", error);
      
      // Note: Plan points generation omitted for brevity, can be added if critical
    }

    // Handle contacts
    if (Array.isArray(contacts) && contacts.length > 0) {
      const contactPayloads = contacts.map((c: any) => ({
        project_id: projectId,
        name: c.name,
        position: c.position || c.role,
        email: c.email,
        phone: c.phone,
        type: c.type || "Stakeholder",
        is_key_person: c.isKeyPerson || false,
      }));

      const { error } = await supabaseAdmin.from("contacts").insert(contactPayloads);
      if (error) console.error("Error creating contacts:", error);
    }

    await redis.del("projects:all");
    return apiResponse({ id: projectId }, 201);
  } catch (error: any) {
    return apiError(error?.message || "Internal server error", 500);
  }
}
