import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import redis from "@/lib/redis";
import crypto from "node:crypto";
import { apiResponse, apiError, toCamelCase } from "@/app/lib/api-utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const u = new URL(req.url);
    const q = u.searchParams.get("q");
    const status = u.searchParams.get("status");
    const priority = u.searchParams.get("priority");
    const projectId = u.searchParams.get("projectId");
    const assignedTo = u.searchParams.get("assignedTo");
    const milestoneId = u.searchParams.get("milestoneId");

    // Cache key
    const cacheKey = `tasks:${JSON.stringify({ q, status, priority, projectId, assignedTo, milestoneId })}`;
    const cachedTasks = await redis.get(cacheKey);

    if (cachedTasks) {
      return apiResponse(JSON.parse(cachedTasks));
    }

    let query = supabaseAdmin
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (q) query = query.ilike("title", `%${q}%`);
    if (status) query = query.eq("status", status);
    if (priority) query = query.eq("priority", priority);
    if (projectId) query = query.eq("project_id", projectId);
    if (milestoneId) query = query.eq("milestone_id", milestoneId);
    if (assignedTo) query = query.eq("assigned_to", assignedTo);

    const { data, error } = await query;

    if (error) throw error;

    const camelData = toCamelCase(data || []);
    await redis.set(cacheKey, JSON.stringify(camelData), { EX: 120 });

    return apiResponse(camelData);
  } catch (e: any) {
    return apiError(e?.message || "error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      description,
      status = "todo",
      priority = "medium",
      dueDate,
      estimatedHours,
      projectId,
      milestoneId,
      assignedTo,
    } = body;

    if (!title) return apiError("Title is required", 400);
    if (!projectId) return apiError("Project is required", 400);

    const nowIso = new Date().toISOString();
    const id = crypto.randomUUID();

    const payload = {
      id,
      title,
      description,
      status,
      priority,
      project_id: projectId,
      milestone_id: milestoneId || null,
      assigned_to: assignedTo || null,
      due_date: dueDate || null,
      estimated_hours: Number(estimatedHours) || 0,
      created_by: "system", // Should ideally be user ID from session
      created_at: nowIso,
      updated_at: nowIso,
    };

    const { data, error } = await supabaseAdmin
      .from("tasks")
      .insert([payload])
      .select()
      .single();

    if (error) throw error;

    await redis.delPattern("tasks:*");
    return apiResponse(toCamelCase(data), 201);
  } catch (e: any) {
    return apiError(e?.message || "error", 500);
  }
}
