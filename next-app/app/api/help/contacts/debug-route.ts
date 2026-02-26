// next-app/app/api/help/contacts/debug-route.ts (Debug Version)
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 DEBUG: Help contacts API called");

    // Test database connection
    const { supabase } = await import("@/app/lib/supabaseClient");

    console.log("🔍 DEBUG: Testing Supabase connection...");

    // Test simple query
    const { data: testResult, error: testError } = await supabase
      .from("users")
      .select("count")
      .limit(1);

    if (testError) {
      console.error("❌ DEBUG: Database test failed:", testError);
      return NextResponse.json({
        debug: {
          step: "database_test",
          success: false,
          error: testError.message,
          details: testError,
        },
      });
    }

    console.log("✅ DEBUG: Database test passed:", testResult);

    // Fetch actual data
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select(
        "id,name,full_name,phone,phone_number,email,position,role,department,isActive",
      )
      .limit(5); // Limit for debug

    if (usersError) {
      console.error("❌ DEBUG: Users fetch failed:", usersError);
      return NextResponse.json({
        debug: {
          step: "users_fetch",
          success: false,
          error: usersError.message,
          details: usersError,
        },
      });
    }

    console.log("✅ DEBUG: Users fetched:", users?.length || 0);

    // Test stakeholders table
    const { data: stakeholders, error: stakeholdersError } = await supabase
      .from("stakeholders")
      .select("id,name,full_name,phone,phone_number,email,position,title")
      .limit(5); // Limit for debug

    if (stakeholdersError) {
      console.error("❌ DEBUG: Stakeholders fetch failed:", stakeholdersError);
      return NextResponse.json({
        debug: {
          step: "stakeholders_fetch",
          success: false,
          error: stakeholdersError.message,
          details: stakeholdersError,
        },
      });
    }

    console.log("✅ DEBUG: Stakeholders fetched:", stakeholders?.length || 0);

    // Return debug info
    return NextResponse.json({
      debug: {
        step: "success",
        databaseConnected: true,
        usersCount: users?.length || 0,
        stakeholdersCount: stakeholders?.length || 0,
        sampleData: {
          users: users?.slice(0, 2) || [],
          stakeholders: stakeholders?.slice(0, 2) || [],
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("💥 DEBUG: Unexpected error:", error);
    return NextResponse.json({
      debug: {
        step: "unexpected_error",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
