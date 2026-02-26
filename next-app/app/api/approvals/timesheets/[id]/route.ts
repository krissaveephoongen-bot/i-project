import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { action, reason, approvedBy } = body;

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const status = action === "approve" ? "approved" : "rejected";
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === "approved") {
      updateData.approved_at = new Date().toISOString();
      if (approvedBy) updateData.approved_by = approvedBy;
    } else {
      updateData.rejected_reason = reason;
    }

    const { error } = await supabaseAdmin
      .from("time_entries")
      .update(updateData)
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "error" }, { status: 500 });
  }
}
