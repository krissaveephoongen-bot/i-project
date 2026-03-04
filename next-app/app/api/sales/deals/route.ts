import { ok, err } from "../../_lib/db";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient(cookies());
    const u = new URL(req.url);
    const pipelineId = u.searchParams.get("pipelineId");
    // ... rest of logic but using server client
    
    let query = supabase.from("sales_deals").select("*");
    
    // ... (rest of query building is fine)
    
    // However, since we're replacing the whole file to fix imports and client usage:
    
    const stageId = u.searchParams.get("stageId");
    const status = u.searchParams.get("status");
    const q = u.searchParams.get("q");
    const minAmount = u.searchParams.get("minAmount");
    const maxAmount = u.searchParams.get("maxAmount");
    const ownerId = u.searchParams.get("ownerId");
    const clientId = u.searchParams.get("clientId");

    if (pipelineId) query = query.eq("pipeline_id", pipelineId);
    if (stageId) query = query.eq("stage_id", stageId);
    if (status) query = query.eq("status", status);
    if (ownerId) query = query.eq("owner_id", ownerId);
    if (clientId) query = query.eq("client_id", clientId);
    if (minAmount) query = query.gte("amount", Number(minAmount));
    if (maxAmount) query = query.lte("amount", Number(maxAmount));
    
    // OR syntax for search
    if (q) query = query.or(`name.ilike.%${q}%,client_org.ilike.%${q}%`);

    const { data: deals, error } = await query.order("updated_at", {
      ascending: false,
    });

    if (error) {
       console.error("Sales Deals Error:", error);
       return err(error.message || "error", 500);
    }

    // Enhance with Owner and Client Names
    // Note: We could use a join in the initial query: .select("*, owner:users(name), client:clients(name)")
    // But sticking to existing logic is safer for now if relationships aren't perfect.
    
    const ownerIds = Array.from(
      new Set((deals || []).map((d: any) => d.owner_id).filter(Boolean)),
    ) as string[];
    
    const clientIds = Array.from(
      new Set((deals || []).map((d: any) => d.client_id).filter(Boolean)),
    ) as string[];

    let owners: any[] = [];
    if (ownerIds.length > 0) {
        const { data } = await supabase.from("users").select("id,name").in("id", ownerIds);
        owners = data || [];
    }
    
    let clients: any[] = [];
    if (clientIds.length > 0) {
        const { data } = await supabase.from("clients").select("id,name").in("id", clientIds);
        clients = data || [];
    }

    const oname: Record<string, string> = {};
    owners.forEach((o: any) => {
      oname[o.id] = o.name;
    });

    const cname: Record<string, string> = {};
    clients.forEach((c: any) => {
      cname[c.id] = c.name;
    });

    const rows = (deals || []).map((d: any) => ({
      id: d.id,
      pipeline_id: d.pipeline_id,
      stage_id: d.stage_id,
      name: d.name,
      amount: Number(d.amount || 0),
      currency: d.currency,
      owner_id: d.owner_id || null,
      client_id: d.client_id || null,
      client_org: d.client_org || null,
      status: d.status,
      probability: Number(d.probability || 0),
      created_at: d.created_at,
      updated_at: d.updated_at,
      owner_name: d.owner_id ? oname[d.owner_id] : null,
      client_name: d.client_id ? cname[d.client_id] : d.client_org || null,
    }));

    return ok(rows, 200);
  } catch (e: any) {
    console.error("GET Sales Deals Exception:", e);
    return err(e?.message || "error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(cookies());
    const body = await req.json();
    
    const {
      name,
      amount = 0,
      currency = "THB",
      pipeline_id,
      stage_id,
      owner_id,
      client_id,
      client_org,
      status = "open",
      probability = 0,
    } = body || {};

    if (!pipeline_id || !name) return err("name and pipeline_id required", 400);

    const payload = {
      name,
      amount,
      currency,
      pipeline_id,
      stage_id: stage_id || null,
      owner_id: owner_id || null, // Ensure this user exists or is current user
      client_id: client_id || null,
      client_org: client_org || null,
      status,
      probability,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
        .from("sales_deals")
        .insert(payload)
        .select()
        .single();

    if (error) {
        console.error("POST Sales Deal Error:", error);
        return err(error.message || "error", 500);
    }
    
    return ok({ id: data.id }, 200);
  } catch (e: any) {
    console.error("POST Sales Deal Exception:", e);
    return err(e?.message || "error", 500);
  }
}
