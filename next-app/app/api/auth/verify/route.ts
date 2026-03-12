import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Access token is required",
          code: "TOKEN_MISSING",
        },
        { status: 401 },
      );
    }

    // Extract token from Bearer header
    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Invalid token format",
          code: "TOKEN_INVALID",
        },
        { status: 401 },
      );
    }

    // Get user from database using token as user ID
    const { data: userRow, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", token)
      .eq("is_active", true)
      .eq("is_deleted", false)
      .limit(1);

    if (error || !userRow || userRow.length === 0) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Invalid token or user not found",
          code: "TOKEN_INVALID",
        },
        { status: 401 },
      );
    }

    const user = userRow[0];
    const { password, password_hash, hashed_password, ...userWithoutPassword } = user;

    // Try to load profile data
    let profileRow: any = null;
    try {
      const { data: pRows } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .limit(1);
      profileRow = (pRows || [])[0] || null;
    } catch (profileError) {
      console.warn("Profile query failed:", profileError);
    }

    return NextResponse.json({
      user: userWithoutPassword,
      profile: profileRow,
      valid: true,
      message: "Token is valid",
    });
  } catch (error) {
    console.error("Auth verify error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
