import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export async function GET(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, message: "Database connection not available" },
        { status: 500 }
      );
    }

    const { data: menuItems, error } = await supabaseAdmin
      .from("menu_items")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error fetching menu items:", error);
      return NextResponse.json(
        { success: false, message: "Failed to fetch menu items" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: menuItems || [],
    });
  } catch (error) {
    console.error("Menu items API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { key, label, icon, path, parent_key, sort_order } = body;

    if (!key || !label) {
      return NextResponse.json(
        { success: false, message: "Key and label are required" },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, message: "Database connection not available" },
        { status: 500 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("menu_items")
      .insert({
        key,
        label,
        icon,
        path,
        parent_key,
        sort_order: sort_order || 0,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating menu item:", error);
      return NextResponse.json(
        { success: false, message: "Failed to create menu item" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Menu item creation error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
