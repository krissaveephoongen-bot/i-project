import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabaseClient";

export const dynamic = "force-dynamic";

// GET /api/projects/[id]/cost-sheet
export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const projectId = params.id;
    if (!projectId)
      return NextResponse.json(
        { message: "projectId is required" },
        { status: 400 },
      );
    if (!supabase)
      return NextResponse.json(
        { message: "Supabase not configured" },
        { status: 500 },
      );

    // 1. Fetch latest cost sheet header
    const { data: sheets, error: shErr } = await supabase
      .from("project_cost_sheets")
      .select("*")
      .eq("project_id", projectId)
      .order("version", { ascending: false })
      .limit(1);
    if (shErr)
      return NextResponse.json({ message: shErr.message }, { status: 500 });
    const sheet = (sheets || [])[0] || null;

    // 2. Fetch items if sheet exists
    let items: any[] = [];
    if (sheet) {
      const { data: it, error: itErr } = await supabase
        .from("project_cost_items")
        .select("*")
        .eq("cost_sheet_id", sheet.id)
        .order("created_at", { ascending: true });
      if (itErr)
        return NextResponse.json({ message: itErr.message }, { status: 500 });
      items = it || [];
    }

    // 3. Cost code catalog
    const { data: codes } = await supabase
      .from("cost_code_catalog")
      .select("*")
      .eq("is_active", true)
      .order("code", { ascending: true });

    // 4. Calculate Actual Labor Cost from Timesheets
    // This is the "Heart" of the system: Real-time cost aggregation
    const { data: timeEntries, error: timeErr } = await supabase
      .from("time_entries")
      .select("hours, userId") // Note: Assuming 'userId' is the column name, verify if it's user_id
      .eq("projectId", projectId)
      .eq("status", "approved"); // Only count approved hours

    let actualLaborCost = 0;
    let actualHours = 0;

    if (!timeErr && timeEntries && timeEntries.length > 0) {
      // Get unique user IDs to fetch rates
      const userIds = Array.from(new Set(timeEntries.map((t: any) => t.userId)));
      
      // Fetch users with their hourly rates
      // Assuming 'users' table has 'hourly_rate' or similar. 
      // If not, we might need to fallback to a default or role-based rate.
      const { data: users } = await supabase
        .from("users")
        .select("id, hourly_rate")
        .in("id", userIds);

      const userRateMap: Record<string, number> = {};
      (users || []).forEach((u: any) => {
        userRateMap[u.id] = Number(u.hourly_rate || 0);
      });

      // Sum up cost
      timeEntries.forEach((t: any) => {
        const hrs = Number(t.hours || 0);
        const rate = userRateMap[t.userId] || 0;
        actualHours += hrs;
        actualLaborCost += hrs * rate;
      });
    }

    return NextResponse.json(
      { 
        sheet, 
        items, 
        catalog: codes || [],
        actuals: {
          laborCost: actualLaborCost,
          totalHours: actualHours
        }
      },
      { status: 200 },
    );
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message || "Internal error" },
      { status: 500 },
    );
  }
}

// POST /api/projects/[id]/cost-sheet
// Upsert a cost sheet and items. No default amounts are set; PM manages values.
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const projectId = params.id;
    if (!projectId)
      return NextResponse.json(
        { message: "projectId is required" },
        { status: 400 },
      );
    if (!supabase)
      return NextResponse.json(
        { message: "Supabase not configured" },
        { status: 500 },
      );

    const body = await request.json();
    const { status, items, createdBy } = body || {};
    if (!createdBy)
      return NextResponse.json(
        { message: "createdBy is required" },
        { status: 400 },
      );

    // Get latest version
    const { data: latestList, error: latestErr } = await supabase
      .from("project_cost_sheets")
      .select("version")
      .eq("project_id", projectId)
      .order("version", { ascending: false })
      .limit(1);
    if (latestErr)
      return NextResponse.json({ message: latestErr.message }, { status: 500 });
    const nextVersion = ((latestList || [])[0]?.version || 0) + 1;

    // Insert new sheet
    const now = new Date().toISOString();
    const newSheet = {
      project_id: projectId,
      version: nextVersion,
      status: status || "Draft",
      created_by: createdBy,
      created_at: now,
      updated_at: now,
    };
    const { data: inserted, error: insErr } = await supabase
      .from("project_cost_sheets")
      .insert(newSheet)
      .select("*")
      .limit(1);
    if (insErr)
      return NextResponse.json({ message: insErr.message }, { status: 500 });
    const sheet = (inserted || [])[0];

    // Prepare items (no default amounts set programmatically)
    const itemRows = (items || []).map((it: any) => ({
      cost_sheet_id: sheet.id,
      type: it.type, // 'labor' | 'expense'
      level: it.level ?? null,
      position: it.position ?? null,
      project_role: it.project_role ?? null,
      daily_rate: it.daily_rate ?? null,
      hourly_rate: it.hourly_rate ?? null,
      planned_project_mandays: it.planned_project_mandays ?? null,
      planned_project_manhours: it.planned_project_manhours ?? null,
      planned_warranty_mandays: it.planned_warranty_mandays ?? null,
      planned_warranty_manhours: it.planned_warranty_manhours ?? null,
      cost_code: it.cost_code ?? null,
      description: it.description ?? null,
      amount: it.amount ?? null, // left as provided (PM-managed)
      remark: it.remark ?? null,
      created_at: now,
      updated_at: now,
    }));

    if (itemRows.length > 0) {
      const { error: itemsErr } = await supabase
        .from("project_cost_items")
        .insert(itemRows);
      if (itemsErr)
        return NextResponse.json(
          { message: itemsErr.message },
          { status: 500 },
        );
    }

    return NextResponse.json(
      { sheetId: sheet.id, version: sheet.version },
      { status: 200 },
    );
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message || "Internal error" },
      { status: 500 },
    );
  }
}
