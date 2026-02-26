import { ok, err } from "../../../_lib/db";
import { supabase } from "@/app/lib/supabaseClient";
import { NextRequest } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = params.id;
    const { data: d } = await supabase
      .from("sales_deals")
      .select("*")
      .eq("id", id)
      .limit(1);
    const deal = (d || [])[0];
    if (!deal) return err("Not found", 404);
    let stageName = null;
    if (deal.stage_id) {
      const { data: stage } = await supabase
        .from("sales_stages")
        .select("name")
        .eq("id", deal.stage_id)
        .limit(1);
      stageName = (stage || [])[0]?.name || null;
    }
    return ok(
      {
        id: deal.id,
        pipelineId: deal.pipeline_id,
        stageId: deal.stage_id || null,
        name: deal.name,
        amount: Number(deal.amount || 0),
        currency: deal.currency,
        ownerId: deal.owner_id || null,
        clientId: deal.client_id || null,
        clientOrg: deal.client_org || null,
        status: deal.status,
        probability: Number(deal.probability || 0),
        created_at: deal.created_at,
        updated_at: deal.updated_at,
        stage_name: stageName,
      },
      200,
    );
  } catch (e: any) {
    return err(e?.message || "error", 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = params.id;
    const body = await req.json();
    const payload: any = { updated_at: new Date().toISOString() };
    const keys = [
      "name",
      "amount",
      "currency",
      "stage_id",
      "owner_id",
      "client_id",
      "client_org",
      "status",
      "probability",
    ];
    for (const k of keys) {
      if (k in body) payload[k] = body[k];
    }
    const { data, error } = await supabase
      .from("sales_deals")
      .update(payload)
      .eq("id", id)
      .select("*")
      .limit(1);
    if (error) return err(error.message || "error", 500);
    return ok((data || [])[0] || {}, 200);
  } catch (e: any) {
    return err(e?.message || "error", 500);
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = params.id;
    const { error } = await supabase.from("sales_deals").delete().eq("id", id);
    if (error) return err(error.message || "error", 500);
    return ok({ ok: true }, 200);
  } catch (e: any) {
    return err(e?.message || "error", 500);
  }
}
