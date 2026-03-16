import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../app/lib/supabaseAdminClient";

export const dynamic = "force-dynamic";

// GET /api/projects - Fetch projects with pagination, filtering, and search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const offset = (page - 1) * pageSize;

    // Build query
    let query = supabaseAdmin
      .from("projects")
      .select(`
        *,
        users!projects_created_by_fkey (
          name,
          email
        )
      `, { count: "exact" });

    // Apply filters
    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    if (status) {
      query = query.eq("status", status);
    }

    if (priority) {
      query = query.eq("priority", parseInt(priority));
    }

    if (startDate) {
      query = query.gte("start_date", startDate);
    }

    if (endDate) {
      query = query.lte("end_date", endDate);
    }

    // Apply pagination and ordering
    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error("Error fetching projects:", error);
      return NextResponse.json(
        { error: "Failed to fetch projects", details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: data || [],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    });

  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ["name", "start_date", "end_date", "budget_allocated", "created_by"];
    const missingFields = requiredFields.filter(field => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: "Missing required fields", fields: missingFields },
        { status: 400 }
      );
    }

    const projectData = {
      name: body.name,
      description: body.description || null,
      status: body.status || "planning",
      priority: body.priority || 2,
      progress_percentage: body.progress_percentage || 0,
      start_date: body.start_date,
      end_date: body.end_date,
      budget_allocated: body.budget_allocated,
      budget_spent: 0,
      created_by: body.created_by,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from("projects")
      .insert(projectData)
      .select()
      .single();

    if (error) {
      console.error("Error creating project:", error);
      return NextResponse.json(
        { error: "Failed to create project", details: error },
        { status: 500 }
      );
    }

    // Log activity
    await supabaseAdmin.from("activity_logs").insert({
      user_id: body.created_by,
      action_type: "create",
      entity_type: "project",
      entity_id: data.id,
      old_values: null,
      new_values: projectData,
      ip_address: request.headers.get("x-forwarded-for") || "unknown",
      user_agent: request.headers.get("user-agent") || "unknown",
    });

    return NextResponse.json({ data }, { status: 201 });

  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
