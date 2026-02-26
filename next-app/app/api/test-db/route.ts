import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseAdminClient";

export async function GET(request: NextRequest) {
  try {
    // Test basic connection
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("count")
      .single();

    if (error) {
      console.log("Supabase error:", error);
      return NextResponse.json(
        {
          error: "Connection test failed",
          details: error.message,
          code: error.code,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: "Connection successful",
      count: data?.count || 0,
    });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error },
      { status: 500 },
    );
  }
}
