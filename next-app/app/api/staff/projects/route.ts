import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get("user_id");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!user_id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    let query = supabase
      .from("projects")
      .select(
        `
        *,
        clients(id, name, email),
        tasks(id, title, status, project_id),
        time_entries(id, date, hours, project_id),
        project_members(id, user_id, role)
      `,
        { count: "exact" },
      )
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });

    // Filter by user (either as manager or member)
    query = query.or(
      `manager_id.eq.${user_id},project_members.user_id.eq.${user_id}`,
    );

    // Apply status filter if provided
    if (status) {
      query = query.eq("status", status);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: projects, error, count } = await query;

    if (error) {
      console.error("Error fetching staff projects:", error);
      return NextResponse.json(
        { error: "Failed to fetch projects" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      projects: projects || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Get staff projects error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectData, user_id } = body;

    if (!projectData || !user_id) {
      return NextResponse.json(
        { error: "Project data and user ID are required" },
        { status: 400 },
      );
    }

    // Create project with manager as the current user
    const { data: project, error } = await supabase
      .from("projects")
      .insert({
        ...projectData,
        manager_id: user_id,
        is_deleted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating project:", error);
      return NextResponse.json(
        { error: "Failed to create project", details: error.message },
        { status: 400 },
      );
    }

    // Add the creator as a project member
    await supabase.from("project_members").insert({
      id: `pm-${Date.now()}`,
      project_id: project.id,
      user_id: user_id,
      role: "manager",
      joinedAt: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({
      project,
      message: "Project created successfully",
    });
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
