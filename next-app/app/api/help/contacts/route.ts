import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export async function GET(request: NextRequest) {
  try {
    console.log("🔄 Starting help contacts fetch...");

    if (!supabaseAdmin) {
      console.error("❌ Supabase admin client missing");
      return NextResponse.json(
        { error: "admin client missing" },
        { status: 500 },
      );
    }

    // Fetch team members (users) via admin client (RLS-safe on server)
    const { data: users, error: usersError } = await supabaseAdmin
      .from("users")
      .select("*");

    if (usersError) {
      console.error("❌ Error fetching users:", usersError);
      return NextResponse.json(
        { error: "Failed to fetch users", details: usersError.message },
        { status: 500 },
      );
    }

    console.log("✅ Users fetched:", users?.length || 0);

    // Map users data with better handling
    const team = (users || [])
      .map((u: any) => {
        const name = u.name || u.full_name || u.fullName || "Unknown";
        const phone = u.phone || u.phone_number || u.phoneNumber || "";
        const email = u.email || u.work_email || "";
        const position = u.position || u.title || u.role || "";
        const role = u.role || u.system_role || "";
        const department = u.department || u.division || "";
        const management = ["admin", "manager"].includes(
          String(role || "").toLowerCase(),
        );

        return {
          id: u.id || "",
          name: name.trim(),
          phone: phone || null,
          email: email || null,
          position: position.trim(),
          role: role.trim(),
          department: department.trim(),
          management,
          isActive: u.isActive !== false && u.active !== false, // Default to true if not specified
        };
      })
      .filter((u: any) => u.isActive !== false); // Only show active users

    // Fetch stakeholders
    const { data: stakeholderRows, error: stakeholdersError } =
      await supabaseAdmin.from("stakeholders").select("*");

    if (stakeholdersError) {
      console.error("❌ Error fetching stakeholders:", stakeholdersError);
      return NextResponse.json(
        {
          error: "Failed to fetch stakeholders",
          details: stakeholdersError.message,
        },
        { status: 500 },
      );
    }

    console.log("✅ Stakeholders fetched:", stakeholderRows?.length || 0);

    // Map stakeholders data with better handling
    const stakeholders = (stakeholderRows || []).map((s: any) => {
      const name = s.name || s.full_name || s.fullName || "Unknown";
      const phone = s.phone || s.phone_number || s.phoneNumber || "";
      const email = s.email || s.work_email || "";
      const position = s.position || s.title || s.role || "";

      return {
        id: s.id || "",
        name: name.trim(),
        phone: phone || null,
        email: email || null,
        position: position.trim(),
        management: false,
        organization: s.organization || s.company || "",
      };
    });

    console.log("📊 Final data:", {
      teamCount: team.length,
      stakeholderCount: stakeholders.length,
    });

    return NextResponse.json(
      {
        team,
        stakeholders,
        meta: {
          totalTeam: team.length,
          totalStakeholders: stakeholders.length,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("💥 Unexpected error in help contacts:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        team: [],
        stakeholders: [],
        meta: {
          totalTeam: 0,
          totalStakeholders: 0,
          timestamp: new Date().toISOString(),
          fallback: true,
        },
      },
      { status: 500 },
    );
  }
}
