import { ok, err } from "../../../_lib/db";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = createClient(cookies());
    const id = params.id;
    const { data: d, error } = await supabase
      .from("sales_deals")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error || !d) return err("Not found", 404);
    
    let stageName = null;
    if (d.stage_id) {
      const { data: stage } = await supabase
        .from("sales_stages")
        .select("name")
        .eq("id", d.stage_id)
        .single();
      stageName = stage?.name || null;
    }
    
    return ok(
      {
        id: d.id,
        pipelineId: d.pipeline_id,
        stageId: d.stage_id || null,
        name: d.name,
        amount: Number(d.amount || 0),
        currency: d.currency,
        ownerId: d.owner_id || null,
        clientId: d.client_id || null,
        clientOrg: d.client_org || null,
        status: d.status,
        probability: Number(d.probability || 0),
        created_at: d.created_at,
        updated_at: d.updated_at,
        stage_name: stageName,
      },
      200,
    );
  } catch (e: any) {
    console.error("GET Deal Error:", e);
    return err(e?.message || "error", 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = createClient(cookies());
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
      "pipeline_id", // Added pipeline_id just in case
    ];
    
    for (const k of keys) {
      if (body[k] !== undefined) payload[k] = body[k];
    }
    
    const { data, error } = await supabase
      .from("sales_deals")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
      
    if (error) return err(error.message || "error", 500);
    return ok(data || {}, 200);
  } catch (e: any) {
    console.error("PUT Deal Error:", e);
    return err(e?.message || "error", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = createClient(cookies());
    const id = params.id;
    const { error } = await supabase.from("sales_deals").delete().eq("id", id);
    if (error) return err(error.message || "error", 500);
    return ok({ ok: true }, 200);
  } catch (e: any) {
    console.error("DELETE Deal Error:", e);
    return err(e?.message || "error", 500);
  }
}
