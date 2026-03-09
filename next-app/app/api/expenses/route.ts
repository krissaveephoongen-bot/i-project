import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import { apiResponse, apiError, toCamelCase } from "@/app/lib/api-utils";
import crypto from "node:crypto";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || searchParams.get("user_id");

    if (!userId) {
      return apiError("userId required", 400);
    }

    const { data, error } = await supabaseAdmin
      .from("expenses")
      .select(`
        *,
        project:projects(id, name),
        task:tasks(id, title),
        approver:users!approver_id(id, name)
      `)
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (error) throw error;

    return apiResponse(toCamelCase(data || []));
  } catch (e: any) {
    return apiError(e?.message || "Internal Server Error", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      projectId,
      taskId,
      date,
      amount,
      category,
      description,
      receiptUrl,
      details,
      approverId,
    } = body;

    if (!userId || !projectId || !date || !amount || !category) {
      return apiError("Missing required fields", 400);
    }

    const payload = {
      id: crypto.randomUUID(),
      user_id: userId,
      project_id: projectId,
      task_id: taskId || null,
      date,
      amount: Number(amount),
      category,
      description: description || null,
      receipt_url: receiptUrl || null,
      details: details || null,
      approver_id: approverId || null,
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from("expenses")
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    return apiResponse(toCamelCase(data), 201);
  } catch (e: any) {
    return apiError(e?.message || "Internal Server Error", 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      projectId,
      taskId,
      date,
      amount,
      category,
      description,
      receiptUrl,
      details,
      status, // Optional: for approvals
    } = body;

    if (!id) return apiError("ID required", 400);

    const { data: existing } = await supabaseAdmin
      .from("expenses")
      .select("status")
      .eq("id", id)
      .single();

    if (existing && existing.status !== "pending" && existing.status !== "rejected" && !status) {
      return apiError("Cannot edit processed expense", 403);
    }

    const payload: any = {
      updated_at: new Date().toISOString(),
    };

    if (projectId) payload.project_id = projectId;
    if (taskId !== undefined) payload.task_id = taskId || null;
    if (date) payload.date = date;
    if (amount) payload.amount = Number(amount);
    if (category) payload.category = category;
    if (description !== undefined) payload.description = description;
    if (receiptUrl !== undefined) payload.receipt_url = receiptUrl;
    if (details !== undefined) payload.details = details;
    if (status !== undefined) payload.status = status;

    if (existing && existing.status === "rejected" && !status) {
      payload.status = "pending";
      payload.rejected_reason = null;
    }

    const { data, error } = await supabaseAdmin
      .from("expenses")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return apiResponse(toCamelCase(data));
  } catch (e: any) {
    return apiError(e?.message || "Internal Server Error", 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return apiError("ID required", 400);

    const { data: existing } = await supabaseAdmin
      .from("expenses")
      .select("status")
      .eq("id", id)
      .single();

    if (existing && existing.status !== "pending" && existing.status !== "rejected") {
      return apiError("Cannot delete processed expense", 403);
    }

    const { error } = await supabaseAdmin.from("expenses").delete().eq("id", id);

    if (error) throw error;

    return apiResponse({ success: true });
  } catch (e: any) {
    return apiError(e?.message || "Internal Server Error", 500);
  }
}
