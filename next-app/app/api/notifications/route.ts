import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    let query = supabaseAdmin
      .from("notifications")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (unreadOnly) {
      query = query.eq("read", false);
    }

    const { data, error, count } = await query.range(
      (page - 1) * pageSize,
      page * pageSize - 1
    );

    if (error) {
      console.error("Error fetching notifications:", error);
      return NextResponse.json(
        { success: false, message: "Failed to fetch notifications" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        current: page,
        pageSize,
        total: count || 0,
      },
    });
  } catch (error) {
    console.error("Notifications API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, message, type = "info", action_url, action_text } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, message: "Title is required" },
        { status: 400 }
      );
    }

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

    const { data, error } = await supabaseAdmin
      .from("notifications")
      .insert({
        user_id: user.id,
        title,
        message,
        type,
        action_url,
        action_text,
        read: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating notification:", error);
      return NextResponse.json(
        { success: false, message: "Failed to create notification" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Notification creation error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, read } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Notification ID is required" },
        { status: 400 }
      );
    }

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

    const { data, error } = await supabaseAdmin
      .from("notifications")
      .update({ read, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating notification:", error);
      return NextResponse.json(
        { success: false, message: "Failed to update notification" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Notification update error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
