import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get("user_id");
    const project_id = searchParams.get("project_id");
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!user_id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    let query = supabase
      .from("time_entries")
      .select(
        `
        *,
        projects(id, name, status),
        tasks(id, title, status),
        users(id, name, email)
      `,
        { count: "exact" },
      )
      .eq("user_id", user_id)
      .eq("is_deleted", false)
      .order("date", { ascending: false });

    // Apply project filter if provided
    if (project_id) {
      query = query.eq("project_id", project_id);
    }

    // Apply status filter if provided
    if (status) {
      query = query.eq("status", status);
    }

    // Apply date range filter if provided
    if (startDate) {
      query = query.gte("date", startDate);
    }
    if (endDate) {
      query = query.lte("date", endDate);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: timeEntries, error, count } = await query;

    if (error) {
      console.error("Error fetching staff timesheet:", error);
      return NextResponse.json(
        { error: "Failed to fetch timesheet entries" },
        { status: 500 },
      );
    }

    // Calculate summary statistics
    const totalHours =
      timeEntries?.reduce(
        (sum: number, entry: any) => sum + (entry.hours || 0),
        0,
      ) || 0;
    const approvedHours =
      timeEntries
        ?.filter((entry: any) => entry.status === "approved")
        .reduce((sum: number, entry: any) => sum + (entry.hours || 0), 0) || 0;
    const pendingHours =
      timeEntries
        ?.filter((entry: any) => entry.status === "pending")
        .reduce((sum: number, entry: any) => sum + (entry.hours || 0), 0) || 0;

    return NextResponse.json({
      timeEntries: timeEntries || [],
      summary: {
        totalHours,
        approvedHours,
        pendingHours,
        totalEntries: count || 0,
      },
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Get staff timesheet error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { timeEntryData, user_id } = body;

    if (!timeEntryData || !user_id) {
      return NextResponse.json(
        { error: "Time entry data and user ID are required" },
        { status: 400 },
      );
    }

    // Create time entry
    const { data: timeEntry, error } = await supabase
      .from("time_entries")
      .insert({
        ...timeEntryData,
        user_id: user_id,
        status: "pending",
        is_deleted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select(
        `
        *,
        projects(id, name, status),
        tasks(id, title, status),
        users(id, name, email)
      `,
      )
      .single();

    if (error) {
      console.error("Error creating time entry:", error);
      return NextResponse.json(
        { error: "Failed to create time entry", details: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json({
      timeEntry,
      message: "Time entry created successfully",
    });
  } catch (error) {
    console.error("Create time entry error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { timeEntryId, updates, user_id } = body;

    if (!timeEntryId || !updates || !user_id) {
      return NextResponse.json(
        { error: "Time entry ID, updates, and user ID are required" },
        { status: 400 },
      );
    }

    // Update time entry
    const { data: timeEntry, error } = await supabase
      .from("time_entries")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", timeEntryId)
      .eq("user_id", user_id) // Ensure user can only update their own entries
      .select(
        `
        *,
        projects(id, name, status),
        tasks(id, title, status),
        users(id, name, email)
      `,
      )
      .single();

    if (error) {
      console.error("Error updating time entry:", error);
      return NextResponse.json(
        { error: "Failed to update time entry", details: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json({
      timeEntry,
      message: "Time entry updated successfully",
    });
  } catch (error) {
    console.error("Update time entry error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeEntryId = searchParams.get("timeEntryId");
    const user_id = searchParams.get("user_id");

    if (!timeEntryId || !user_id) {
      return NextResponse.json(
        { error: "Time entry ID and user ID are required" },
        { status: 400 },
      );
    }

    // Soft delete time entry
    const { error } = await supabase
      .from("time_entries")
      .update({
        is_deleted: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", timeEntryId)
      .eq("user_id", user_id); // Ensure user can only delete their own entries

    if (error) {
      console.error("Error deleting time entry:", error);
      return NextResponse.json(
        { error: "Failed to delete time entry", details: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json({
      message: "Time entry deleted successfully",
    });
  } catch (error) {
    console.error("Delete time entry error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
