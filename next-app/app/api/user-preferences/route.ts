import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, message: "Database connection not available" },
        { status: 500 }
      );
    }

    // Get user ID from token
    const cookieStore = cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify token and get user info
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: "Invalid authentication" },
        { status: 401 }
      );
    }

    // Get user preferences
    const { data: preferences, error } = await supabaseAdmin
      .from("user_preferences")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error("Error fetching user preferences:", error);
      return NextResponse.json(
        { success: false, message: "Failed to fetch user preferences" },
        { status: 500 }
      );
    }

    // Return default preferences if none found
    const defaultPreferences = {
      theme: "light",
      language: "en",
      sidebar_collapsed: false,
      table_page_size: 10,
      date_format: "YYYY-MM-DD",
      time_format: "HH:mm",
      timezone: "UTC",
      notifications_enabled: true,
      auto_save_enabled: true,
    };

    return NextResponse.json({
      success: true,
      data: preferences || defaultPreferences,
    });
  } catch (error) {
    console.error("User preferences API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      theme,
      language,
      sidebar_collapsed,
      table_page_size,
      date_format,
      time_format,
      timezone,
      notifications_enabled,
      auto_save_enabled,
    } = body;

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, message: "Database connection not available" },
        { status: 500 }
      );
    }

    // Get user ID from token
    const cookieStore = cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify token and get user info
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: "Invalid authentication" },
        { status: 401 }
      );
    }

    // Update or insert user preferences
    const { data, error } = await supabaseAdmin
      .from("user_preferences")
      .upsert({
        user_id: user.id,
        theme,
        language,
        sidebar_collapsed,
        table_page_size,
        date_format,
        time_format,
        timezone,
        notifications_enabled,
        auto_save_enabled,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error updating user preferences:", error);
      return NextResponse.json(
        { success: false, message: "Failed to update user preferences" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("User preferences update error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
