import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabaseClient";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, updatedFields = {} } = body || {};
    if (!id)
      return NextResponse.json({ error: "id required" }, { status: 400 });
    const nowIso = new Date().toISOString();
    const snakeMap: any = {
      name: "title",
      title: "title",
      percentage: "progress",
      progress: "progress",
      amount: "amount",
      due_date: "due_date",
      dueDate: "due_date",
      actual_date: "actual_date",
      actualDate: "actual_date",
      invoice_date: "invoice_date",
      invoiceDate: "invoice_date",
      plan_received_date: "plan_received_date",
      planReceivedDate: "plan_received_date",
      receipt_date: "receipt_date",
      receiptDate: "receipt_date",
      status: "status",
      note: "notes",
      notes: "notes",
    };
    const camelMap: any = {
      name: "title",
      title: "title",
      percentage: "progress",
      progress: "progress",
      amount: "amount",
      due_date: "dueDate",
      dueDate: "dueDate",
      actual_date: "actualDate",
      actualDate: "actualDate",
      invoice_date: "invoiceDate",
      invoiceDate: "invoiceDate",
      plan_received_date: "planReceivedDate",
      planReceivedDate: "planReceivedDate",
      receipt_date: "receiptDate",
      receiptDate: "receiptDate",
      status: "status",
      note: "notes",
      notes: "notes",
    };

    const snakePayload: any = { updated_at: nowIso };
    const camelPayload: any = { updatedAt: nowIso };
    for (const k of Object.keys(updatedFields || {})) {
      if (k in snakeMap) snakePayload[snakeMap[k]] = updatedFields[k];
      if (k in camelMap) camelPayload[camelMap[k]] = updatedFields[k];
    }

    let data: any = null;
    let error: any = null;
    for (const p of [snakePayload, camelPayload]) {
      const res = await supabase
        .from("milestones")
        .update(p)
        .eq("id", id)
        .select("*")
        .limit(1);
      data = res.data;
      error = res.error;
      if (!error) break;
      const msg = `${error.message || ""}`;
      if (msg.includes("Could not find the") || msg.includes("schema cache"))
        continue;
      break;
    }
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json((data || [])[0], { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
