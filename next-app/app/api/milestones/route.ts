import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import { apiResponse, apiError, toCamelCase } from "@/app/lib/api-utils";
import crypto from "node:crypto";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    let query = supabaseAdmin
      .from("milestones")
      .select("*")
      .order("due_date", { ascending: true });

    if (projectId) {
      query = query.eq("project_id", projectId);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Transform to camelCase using helper
    const camelData = toCamelCase(data || []);

    // Ensure specific fields match frontend expectations if simple camelCase isn't enough
    const enrichedData = camelData.map((m: any) => ({
      ...m,
      percentage: Number(m.progress || m.percentage || 0), // Handle both potential DB column names
      dueDate: m.dueDate || m.due_date,
    }));

    return apiResponse(enrichedData);
  } catch (e: any) {
    return apiError(e?.message || "Internal Server Error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, status = "pending", dueDate, projectId, percentage, amount } = body;

    if (!title) return apiError("Title is required", 400);
    if (!projectId) return apiError("Project ID is required", 400);

    const payload = {
      id: crypto.randomUUID(),
      title,
      description: description || null,
      status,
      due_date: dueDate || null,
      project_id: projectId,
      progress: percentage || 0, // DB likely uses 'progress' or 'percentage', assuming 'progress' based on other files
      amount: amount || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from("milestones")
      .insert([payload])
      .select()
      .single();

    if (error) throw error;

    return apiResponse(toCamelCase(data), 201);
  } catch (e: any) {
    return apiError(e?.message || "Internal Server Error", 500);
  }
}
