// next-app/app/api/help/contacts/route.ts (Improved Version)
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabaseClient";

export async function GET(request: NextRequest) {
  try {
    console.log("🔄 Starting help contacts fetch...");

    // Fetch team members (users)
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select(
        "id,name,full_name,phone,phone_number,email,position,role,department,isActive",
      );

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
        const name = u.name || u.full_name || "Unknown";
        const phone = u.phone || u.phone_number || "";
        const email = u.email || "";
        const position = u.position || u.role || "";
        const role = u.role || "";
        const department = u.department || "";
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
          isActive: u.isActive !== false, // Default to true if not specified
        };
      })
      .filter((u: any) => u.isActive !== false); // Only show active users

    // Fetch stakeholders
    const { data: stakeholderRows, error: stakeholdersError } = await supabase
      .from("stakeholders")
      .select(
        "id,name,full_name,phone,phone_number,email,position,title,organization",
      );

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
      const name = s.name || s.full_name || "Unknown";
      const phone = s.phone || s.phone_number || "";
      const email = s.email || "";
      const position = s.position || s.title || "";

      return {
        id: s.id || "",
        name: name.trim(),
        phone: phone || null,
        email: email || null,
        position: position.trim(),
        management: false,
        organization: s.organization || "",
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
