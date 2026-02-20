import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabaseClient';

export const dynamic = 'force-dynamic';

// GET /api/projects/[id]/cost-sheet
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const projectId = params.id;
    if (!projectId) return NextResponse.json({ message: 'projectId is required' }, { status: 400 });
    if (!supabase) return NextResponse.json({ message: 'Supabase not configured' }, { status: 500 });

    // Fetch latest cost sheet header
    const { data: sheets, error: shErr } = await supabase
      .from('project_cost_sheets')
      .select('*')
      .eq('project_id', projectId)
      .order('version', { ascending: false })
      .limit(1);
    if (shErr) return NextResponse.json({ message: shErr.message }, { status: 500 });
    const sheet = (sheets || [])[0] || null;

    // Fetch items if sheet exists
    let items: any[] = [];
    if (sheet) {
      const { data: it, error: itErr } = await supabase
        .from('project_cost_items')
        .select('*')
        .eq('cost_sheet_id', sheet.id)
        .order('created_at', { ascending: true });
      if (itErr) return NextResponse.json({ message: itErr.message }, { status: 500 });
      items = it || [];
    }

    // Cost code catalog (for expense standardization)
    const { data: codes } = await supabase
      .from('cost_code_catalog')
      .select('*')
      .eq('is_active', true)
      .order('code', { ascending: true });

    return NextResponse.json({ sheet, items, catalog: codes || [] }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || 'Internal error' }, { status: 500 });
  }
}

// POST /api/projects/[id]/cost-sheet
// Upsert a cost sheet and items. No default amounts are set; PM manages values.
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const projectId = params.id;
    if (!projectId) return NextResponse.json({ message: 'projectId is required' }, { status: 400 });
    if (!supabase) return NextResponse.json({ message: 'Supabase not configured' }, { status: 500 });

    const body = await request.json();
    const { status, items, createdBy } = body || {};
    if (!createdBy) return NextResponse.json({ message: 'createdBy is required' }, { status: 400 });

    // Get latest version
    const { data: latestList, error: latestErr } = await supabase
      .from('project_cost_sheets')
      .select('version')
      .eq('project_id', projectId)
      .order('version', { ascending: false })
      .limit(1);
    if (latestErr) return NextResponse.json({ message: latestErr.message }, { status: 500 });
    const nextVersion = ((latestList || [])[0]?.version || 0) + 1;

    // Insert new sheet
    const now = new Date().toISOString();
    const newSheet = {
      project_id: projectId,
      version: nextVersion,
      status: status || 'Draft',
      created_by: createdBy,
      created_at: now,
      updated_at: now
    };
    const { data: inserted, error: insErr } = await supabase
      .from('project_cost_sheets')
      .insert(newSheet)
      .select('*')
      .limit(1);
    if (insErr) return NextResponse.json({ message: insErr.message }, { status: 500 });
    const sheet = (inserted || [])[0];

    // Prepare items (no default amounts set programmatically)
    const itemRows = (items || []).map((it: any) => ({
      cost_sheet_id: sheet.id,
      type: it.type, // 'labor' | 'expense'
      level: it.level ?? null,
      position: it.position ?? null,
      project_role: it.projectRole ?? null,
      daily_rate: it.dailyRate ?? null,
      hourly_rate: it.hourlyRate ?? null,
      planned_project_mandays: it.plannedProjectMandays ?? null,
      planned_project_manhours: it.plannedProjectManhours ?? null,
      planned_warranty_mandays: it.plannedWarrantyMandays ?? null,
      planned_warranty_manhours: it.plannedWarrantyManhours ?? null,
      cost_code: it.costCode ?? null,
      description: it.description ?? null,
      amount: it.amount ?? null, // left as provided (PM-managed)
      remark: it.remark ?? null,
      created_at: now,
      updated_at: now
    }));

    if (itemRows.length > 0) {
      const { error: itemsErr } = await supabase
        .from('project_cost_items')
        .insert(itemRows);
      if (itemsErr) return NextResponse.json({ message: itemsErr.message }, { status: 500 });
    }

    return NextResponse.json({ sheetId: sheet.id, version: sheet.version }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || 'Internal error' }, { status: 500 });
  }
}

