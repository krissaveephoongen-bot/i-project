import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

// GET: Fetch Contract Info
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Select specific contract fields
    const { data, error } = await supabaseAdmin
      .from("projects")
      .select(`
        contract_no,
        contract_start_date,
        contract_end_date,
        contract_value,
        penalty_daily_rate,
        max_penalty_percent,
        warranty_months,
        warranty_terms
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching contract:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform to camelCase for frontend
    const contract = {
      contractNo: data.contract_no,
      contractStartDate: data.contract_start_date,
      contractEndDate: data.contract_end_date,
      contractValue: data.contract_value,
      penaltyDailyRate: data.penalty_daily_rate,
      maxPenaltyPercent: data.max_penalty_percent,
      warrantyMonths: data.warranty_months,
      warrantyTerms: data.warranty_terms,
    };

    return NextResponse.json(contract);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PUT: Update Contract Info
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Transform camelCase to snake_case for DB
    const updateData = {
      contract_no: body.contractNo,
      contract_start_date: body.contractStartDate || null,
      contract_end_date: body.contractEndDate || null,
      contract_value: body.contractValue || null,
      penalty_daily_rate: body.penaltyDailyRate || null,
      max_penalty_percent: body.max_penalty_percent || null, // Handle typo in frontend if sent
      // Frontend sends 'maxPenaltyPercent', so:
      // max_penalty_percent: body.maxPenaltyPercent
      // wait, let's just be explicit
    };

    // Explicit mapping to avoid undefined issues
    const dbPayload: any = {};
    if (body.contractNo !== undefined) dbPayload.contract_no = body.contractNo;
    if (body.contractStartDate !== undefined) dbPayload.contract_start_date = body.contractStartDate;
    if (body.contractEndDate !== undefined) dbPayload.contract_end_date = body.contractEndDate;
    if (body.contractValue !== undefined) dbPayload.contract_value = body.contractValue;
    if (body.penaltyDailyRate !== undefined) dbPayload.penalty_daily_rate = body.penaltyDailyRate;
    if (body.maxPenaltyPercent !== undefined) dbPayload.max_penalty_percent = body.maxPenaltyPercent;
    if (body.warrantyMonths !== undefined) dbPayload.warranty_months = body.warrantyMonths;
    if (body.warrantyTerms !== undefined) dbPayload.warranty_terms = body.warrantyTerms;
    
    // Always update updated_at
    dbPayload.updated_at = new Date().toISOString();

    const { error } = await supabaseAdmin
      .from("projects")
      .update(dbPayload)
      .eq("id", id);

    if (error) {
      console.error("Error updating contract:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
