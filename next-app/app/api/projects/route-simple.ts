import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET: List all projects with sample data
export async function GET(request: NextRequest) {
  try {
    // Return sample projects for testing
    const sampleProjects = [
      {
        id: "proj-001",
        name: "Website Redesign",
        code: "WR-2024",
        description: "Complete website redesign project",
        status: "in_progress",
        progress: 75,
        start_date: "2024-01-15",
        end_date: "2024-06-30",
        budget: 50000,
        spent: 37500,
        client_id: "client-001",
        manager_id: "user-001",
        category: "web",
        is_archived: false,
        created_at: "2024-01-15T00:00:00Z",
        updated_at: "2024-03-13T00:00:00Z"
      },
      {
        id: "proj-002", 
        name: "Mobile App Development",
        code: "MA-2024",
        description: "iOS and Android mobile application",
        status: "in_progress",
        progress: 45,
        start_date: "2024-02-01",
        end_date: "2024-08-31",
        budget: 75000,
        spent: 33750,
        client_id: "client-002",
        manager_id: "user-002",
        category: "mobile",
        is_archived: false,
        created_at: "2024-02-01T00:00:00Z",
        updated_at: "2024-03-13T00:00:00Z"
      },
      {
        id: "proj-003",
        name: "Database Migration",
        code: "DM-2024",
        description: "Legacy database migration to new system",
        status: "planning",
        progress: 10,
        start_date: "2024-03-01",
        end_date: "2024-12-31",
        budget: 100000,
        spent: 10000,
        client_id: "client-003",
        manager_id: "user-003",
        category: "infrastructure",
        is_archived: false,
        created_at: "2024-03-01T00:00:00Z",
        updated_at: "2024-03-13T00:00:00Z"
      }
    ];

    return NextResponse.json({
      data: sampleProjects,
      pagination: {
        page: 1,
        limit: 10,
        total: sampleProjects.length,
        totalPages: 1
      }
    });
  } catch (error: any) {
    console.error("Projects API error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
