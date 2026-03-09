import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import { apiResponse, apiError, toCamelCase } from "@/app/lib/api-utils";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { data, error } = await supabaseAdmin
      .from("milestones")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return apiResponse(toCamelCase(data));
  } catch (e: any) {
    return apiError(e?.message || "error", 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { title, description, status, dueDate, amount, percentage } = body;

    const payload: any = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) payload.title = title;
    if (description !== undefined) payload.description = description;
    if (status !== undefined) payload.status = status;
    if (dueDate !== undefined) payload.due_date = dueDate;
    if (amount !== undefined) payload.amount = amount;
    if (percentage !== undefined) payload.progress = percentage; // map percentage to progress

    const { data, error } = await supabaseAdmin
      .from("milestones")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return apiResponse(toCamelCase(data));
  } catch (e: any) {
    return apiError(e?.message || "error", 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { error } = await supabaseAdmin
      .from("milestones")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return apiResponse({ success: true });
  } catch (e: any) {
    return apiError(e?.message || "error", 500);
  }
}
