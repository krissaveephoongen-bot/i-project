import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabaseClient";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let body: any;

    // Read body once as text
    const text = await request.text();

    if (!text) {
      return NextResponse.json({ error: "Empty body" }, { status: 400 });
    }

    try {
      body = JSON.parse(text);
    } catch {
      // Try form-urlencoded
      body = Object.fromEntries(new URLSearchParams(text));
    }

    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("users")
      .select(
        "id,email,name,name_th,role,position,department,avatar,phone,is_active,is_deleted,failed_login_attempts,timezone,created_at,updated_at,hourly_rate,status,employee_code,password",
      )
      .eq("email", email)
      .limit(1);

    const user: any = (data || [])[0] || null;

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Column mapping fallback
    const is_active = user.is_active ?? true;
    const is_deleted = user.is_deleted ?? false;
    const locked_until = null; // Column doesn't exist in database
    const failed_login_attempts = user.failed_login_attempts ?? 0;
    const passwordHash =
      user.password ?? user.password_hash ?? user.hashed_password ?? null;

    // Check if user is active
    if (!is_active) {
      return NextResponse.json(
        { error: "Account is deactivated" },
        { status: 401 },
      );
    }

    // Check if user is deleted
    if (is_deleted) {
      return NextResponse.json({ error: "Account not found" }, { status: 401 });
    }

    // Check if account is locked
    if (locked_until && new Date(locked_until) > new Date()) {
      return NextResponse.json(
        { error: "Account is temporarily locked" },
        { status: 423 },
      );
    }

    // Verify password
    if (!passwordHash) {
      return NextResponse.json(
        { error: "Password not configured for this account" },
        { status: 400 },
      );
    }
    const isValidPassword = await bcrypt.compare(password, passwordHash);
    if (!isValidPassword) {
      // Increment failed login attempts
      const failedAttempts = Number(failed_login_attempts || 0) + 1;

      const updates: any = { failed_login_attempts: failedAttempts };
      if (failedAttempts >= 5) {
        updates.locked_until = new Date(
          Date.now() + 30 * 60 * 1000,
        ).toISOString();
      }

      await supabase
        .from("users")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", user.id);

      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Reset failed login attempts on successful login
    await supabase
      .from("users")
      .update({
        failed_login_attempts: 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    // Return user data without password
    const {
      password: _,
      password_hash: __,
      hashed_password: ___,
      ...userWithoutPassword
    } = user;

    // Convert camelCase to snake_case for response
    const responseUser = {
      id: userWithoutPassword.id,
      email: userWithoutPassword.email,
      name: userWithoutPassword.name,
      name_th: userWithoutPassword.name_th,
      role: userWithoutPassword.role,
      position: userWithoutPassword.position,
      department: userWithoutPassword.department,
      avatar: userWithoutPassword.avatar,
      phone: userWithoutPassword.phone,
      is_active: is_active,
      is_deleted: is_deleted,
      failed_login_attempts: failed_login_attempts,
      last_login: null, // Column doesn't exist in database
      locked_until: locked_until,
      created_at: userWithoutPassword.created_at,
      updated_at: userWithoutPassword.updated_at,
      hourly_rate: userWithoutPassword.hourly_rate,
      timezone: userWithoutPassword.timezone,
      status: userWithoutPassword.status,
      employee_code: userWithoutPassword.employee_code,
    };

    // Ensure profile record exists in public.profiles
    let profileRow: any = null;
    try {
      const { data: pRows } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .limit(1);
      profileRow = (pRows || [])[0] || null;
      if (!profileRow) {
        const insertPayload = {
          id: user.id,
          name: user.name ?? user.email,
          email: user.email ?? null,
          avatar_url: user.avatar ?? null,
          role: user.role ?? null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        const { data: created } = await supabase
          .from("profiles")
          .insert(insertPayload)
          .select("*")
          .limit(1);
        profileRow = (created || [])[0] || insertPayload;
      } else {
        // Sync role/name if changed
        const needUpdate =
          profileRow.role !== user.role ||
          profileRow.name !== user.name ||
          profileRow.email !== user.email ||
          profileRow.avatar_url !== user.avatar;
        if (needUpdate) {
          const upd = {
            name: user.name ?? profileRow.name,
            email: user.email ?? profileRow.email,
            avatar_url: user.avatar ?? profileRow.avatar_url,
            role: user.role ?? profileRow.role,
            updated_at: new Date().toISOString(),
          };
          const { data: updated } = await supabase
            .from("profiles")
            .update(upd)
            .eq("id", user.id)
            .select("*")
            .limit(1);
          profileRow = (updated || [])[0] || { ...profileRow, ...upd };
        }
      }
    } catch {}

    // Set cookie for server-side auth
    const cookieStore = cookies();
    cookieStore.set("auth_token", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return NextResponse.json({
      user: responseUser,
      profile: profileRow,
      token: user.id,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
