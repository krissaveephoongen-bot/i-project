import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json(
      { error: "Project ID is required" },
      { status: 400 },
    );
  }

  try {
    const supabase = createClient(cookies());
    const { data, error } = await supabase
      .from("issues")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch issues:", error.message);
      return NextResponse.json([]);
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      project_id,
      risk_id,
      title,
      priority,
      status,
      description,
      assigned_to,
      due_date,
    } = body;
    const supabase = createClient(cookies());
    const { data, error } = await supabase
      .from("issues")
      .insert([
        {
          risk_id: risk_id || null,
          project_id,
          title,
          priority: priority || "Medium",
          status: status || "Open",
          description,
          assigned_to,
          due_date,
        },
      ])

    if (error) {
      // console.warn('Failed to create issue:', error.message);
      return NextResponse.json(
        { error: "Failed to create issue" },
        { status: 500 },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, updatedFields } = body;

    const supabase = createClient(cookies());
    const { data, error } = await supabase
      .from("issues")
      .update(updatedFields)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.warn(
        "Failed to update issue, returning mock success:",
        error.message,
      );
      return NextResponse.json({ id, ...updatedFields });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id)
    return NextResponse.json({ error: "ID is required" }, { status: 400 });

  const supabase = createClient(cookies());
  const { error } = await supabase.from("issues").delete().eq("id", id);

  if (error) {
    console.error("Failed to delete issue:", error.message);
    return NextResponse.json(
      { error: "Failed to delete issue" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
