import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabaseClient";

export async function GET(request: NextRequest) {
  try {
    const { data: users } = await supabase
      .from("users")
      .select(
        "id,name,full_name,phone,phone_number,email,position,role,department",
      );
    const team = (users || []).map((u: any) => ({
      id: u.id || "",
      name: u.name || u.full_name || "",
      phone: u.phone || u.phone_number || "",
      email: u.email || "",
      position: u.position || u.role || "",
      role: u.role || "",
      department: u.department || "",
      management: ["admin", "manager"].includes(
        String(u.role || "").toLowerCase(),
      ),
    }));

    const { data: stakeholderRows } = await supabase
      .from("stakeholders")
      .select("id,name,full_name,phone,phone_number,email,position,title");
    const stakeholders = (stakeholderRows || []).map((s: any) => ({
      id: s.id || "",
      name: s.name || s.full_name || "",
      phone: s.phone || s.phone_number || "",
      email: s.email || "",
      position: s.position || s.title || "",
      management: false,
    }));

    return NextResponse.json({ team, stakeholders }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ team: [], stakeholders: [] }, { status: 200 });
  }
}
