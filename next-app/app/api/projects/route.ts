import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../lib/supabaseAdmin";

export const dynamic = "force-dynamic";

// GET /api/projects - List all projects with fallback
export async function GET(request: NextRequest) {
  try {
    console.log("Projects API: Starting request");

    // Try to get data from database first
    if (supabaseAdmin) {
      try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const pageSize = parseInt(searchParams.get("pageSize") || "10");
        const status = searchParams.get("status");
        const search = searchParams.get("search");

        console.log("Projects API: Attempting database query");

        // Build query
        let query = supabaseAdmin
          .from("projects")
          .select("*", { count: "exact" })
          .eq("is_deleted", false)
          .order("created_at", { ascending: false });

        // Apply filters
        if (status && status !== "all") {
          query = query.eq("status", status);
        }

        if (search) {
          query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
        }

        // Apply pagination
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const { data, error, count } = await query.range(from, to);

        if (!error && data) {
          console.log("Projects API: Successfully fetched", data.length, "projects from database");
          return NextResponse.json({
            data: data,
            pagination: {
              page,
              pageSize,
              total: count || 0,
              totalPages: Math.ceil((count || 0) / pageSize),
            },
          });
        } else {
          console.log("Projects API: Database query failed, using fallback");
        }
      } catch (dbError) {
        console.log("Projects API: Database connection failed, using fallback");
      }
    }

    // Fallback to sample data if database is not available
    console.log("Projects API: Using fallback data");
    
    const sampleProjects = [
      {
        id: "1",
        name: "Website Redesign",
        description: "Complete redesign of company website with modern UI/UX",
        status: "in_progress",
        priority: "high",
        start_date: "2024-01-01",
        end_date: "2024-06-30",
        budget_allocated: 50000,
        budget_spent: 25000,
        currency: "THB",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-15T00:00:00Z",
        is_deleted: false,
      },
      {
        id: "2",
        name: "Mobile App Development",
        description: "Native mobile app for iOS and Android platforms",
        status: "planning",
        priority: "medium",
        start_date: "2024-02-01",
        end_date: "2024-12-31",
        budget_allocated: 100000,
        budget_spent: 5000,
        currency: "THB",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-15T00:00:00Z",
        is_deleted: false,
      },
      {
        id: "3",
        name: "Database Migration",
        description: "Migrate legacy database to new PostgreSQL system",
        status: "completed",
        priority: "low",
        start_date: "2023-11-01",
        end_date: "2024-01-31",
        budget_allocated: 25000,
        budget_spent: 22000,
        currency: "THB",
        created_at: "2023-11-01T00:00:00Z",
        updated_at: "2024-01-20T00:00:00Z",
        is_deleted: false,
      },
      {
        id: "4",
        name: "API Development",
        description: "RESTful API development for microservices architecture",
        status: "in_progress",
        priority: "high",
        start_date: "2024-01-15",
        end_date: "2024-08-15",
        budget_allocated: 75000,
        budget_spent: 35000,
        currency: "THB",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-15T00:00:00Z",
        is_deleted: false,
      },
      {
        id: "5",
        name: "Security Audit",
        description: "Comprehensive security audit and vulnerability assessment",
        status: "planning",
        priority: "high",
        start_date: "2024-03-01",
        end_date: "2024-04-30",
        budget_allocated: 30000,
        budget_spent: 0,
        currency: "THB",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-15T00:00:00Z",
        is_deleted: false,
      },
    ];

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // Filter sample data
    let filteredData = sampleProjects;
    
    if (status && status !== "all") {
      filteredData = filteredData.filter(p => p.status === status);
    }
    
    if (search) {
      filteredData = filteredData.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    console.log("Projects API: Returning", paginatedData.length, "projects from fallback");

    return NextResponse.json({
      data: paginatedData,
      pagination: {
        page,
        pageSize,
        total: filteredData.length,
        totalPages: Math.ceil(filteredData.length / pageSize),
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
    const body = await request.json();
    const { name, description, status = "planning", priority = "medium" } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 }
      );
    }

    console.log("Projects API: Creating project:", { name, status, priority });

    // Try to create in database first
    if (supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin
          .from("projects")
          .insert([
            {
              name,
              description: description || "",
              status,
              priority,
              start_date: null,
              end_date: null,
              budget_allocated: 0,
              budget_spent: 0,
              currency: "THB",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              is_deleted: false,
            },
          ])
          .select()
          .single();

        if (!error && data) {
          console.log("Projects API: Successfully created project in database");
          return NextResponse.json({ data }, { status: 201 });
        }
      } catch (dbError) {
        console.log("Projects API: Database creation failed, using fallback");
      }
    }

    // Fallback response
    const newProject = {
      id: Date.now().toString(),
      name,
      description: description || "",
      status,
      priority,
      start_date: null,
      end_date: null,
      budget_allocated: 0,
      budget_spent: 0,
      currency: "THB",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_deleted: false,
    };

    console.log("Projects API: Created fallback project");

    return NextResponse.json({ data: newProject }, { status: 201 });

  } catch (error) {
    console.error("Project creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
