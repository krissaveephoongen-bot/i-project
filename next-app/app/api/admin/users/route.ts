import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import { z } from "zod";
import bcrypt from "bcryptjs";

// GET /api/admin/users - List users with pagination and filtering
export async function GET(req: NextRequest) {
  try {
    if (!supabaseAdmin)
      return NextResponse.json(
        { error: "Admin client not initialized" },
        { status: 500 },
      );

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "all";

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabaseAdmin.from("users").select("*", { count: "exact" });

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    if (role !== "all") {
      query = query.eq("role", role);
    }

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    return NextResponse.json({
      users: data,
      total: count,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message, code: error?.code, details: error },
      { status: 500 },
    );
  }
}

// POST /api/admin/users - Create new user
export async function POST(req: NextRequest) {
  try {
    if (!supabaseAdmin)
      return NextResponse.json(
        { error: "Admin client not initialized" },
        { status: 500 },
      );

    const body = await req.json();

    // Validation schema
    const schema = z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(6),
      role: z.enum(["admin", "manager", "employee"]),
      department: z.string().optional(),
      position: z.string().optional(),
    });

    const result = schema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 },
      );
    }

    const { name, email, password, role, department, position } = result.data;

    // Check if user exists
    const { data: existing } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const { data: newUser, error } = await supabaseAdmin
      .from("users")
      .insert({
        id: crypto.randomUUID(),
        name,
        email,
        password: hashedPassword,
        role,
        department,
        position,
        status: "active",
        is_active: true,
        is_deleted: false,
        failed_login_attempts: 0,
        timezone: "Asia/Bangkok",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
