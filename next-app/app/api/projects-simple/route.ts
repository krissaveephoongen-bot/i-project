import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";

export async function GET(request: NextRequest) {
  try {
    const { data: projects, error } = await supabaseAdmin
      .from("projects")
      .select(`
        id, 
        name, 
        description, 
        status, 
        start_date, 
        end_date, 
        budget,
        client_id,
        created_at,
        updated_at
      `)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Projects API error:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch projects",
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: projects || [],
      count: projects?.length || 0,
    });
  } catch (error) {
    console.error("Projects API server error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
