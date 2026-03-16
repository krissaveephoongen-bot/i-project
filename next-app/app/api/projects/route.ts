import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../lib/supabaseAdmin";

export const dynamic = "force-dynamic";

// GET /api/projects - List all projects
export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Database connection not available" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    let query = supabaseAdmin
      .from("projects")
      .select("*")
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });

    // Apply filters
    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Get total count
    const { count, error: countError } = await query.select("id", { count: "exact" });
    
    if (countError) {
      console.error("Count error:", countError);
      return NextResponse.json(
        { error: "Failed to fetch projects count" },
        { status: 500 }
      );
    }

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await supabaseAdmin
      .from("projects")
      .select("*")
      .eq("is_deleted", false)
      .order("created_at", { ascending: false })
      .range(from, to);

    // Apply filters to data query
    let filteredData = data || [];
    if (status && status !== "all") {
      filteredData = filteredData.filter((p: any) => p.status === status);
    }
    if (search) {
      filteredData = filteredData.filter((p: any) => 
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (error) {
      console.error("Projects fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch projects" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: filteredData,
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
    });

  } catch (error) {
    console.error("Projects API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Database connection not available" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      client_id,
      project_manager_id,
      status = "planning",
      priority = "medium",
      start_date,
      end_date,
      budget_allocated,
      currency = "THB",
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("projects")
      .insert([
        {
          name,
          description,
          client_id,
          project_manager_id,
          status,
          priority,
          start_date,
          end_date,
          budget_allocated,
          currency,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Project creation error:", error);
      return NextResponse.json(
        { error: "Failed to create project" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });

  } catch (error) {
    console.error("Project creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
