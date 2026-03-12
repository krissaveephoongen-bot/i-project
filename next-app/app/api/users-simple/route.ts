import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";

export async function GET(request: NextRequest) {
  try {
    const { data: users, error } = await supabaseAdmin
      .from("users")
      .select(`
        id, 
        name, 
        email, 
        role, 
        department, 
        position, 
        employee_code, 
        phone, 
        status,
        is_active,
        created_at,
        updated_at
      `)
      .eq("is_active", true)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Users API error:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch users",
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: users || [],
      count: users?.length || 0,
    });
  } catch (error) {
    console.error("Users API server error:", error);
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
