import { NextRequest } from "next/server";
import { ok, err } from "../../_lib/db";
import { supabase } from "@/app/lib/supabaseClient";
import { z } from "zod";
import bcrypt from "bcryptjs";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const userId = params.id;
    const body = await request.json();
    const { updates } = body;

    if (!userId || !updates) {
      return err("User ID and updates are required", 400);
    }

    const schema = z.object({
      name: z.string().min(1).optional(),
      email: z.string().email().optional(),
      role: z.enum(["admin", "manager", "employee"]).optional(),
      status: z.enum(["active", "inactive"]).optional(),
      employeeCode: z.number().int().nonnegative().optional(),
      phone: z.string().optional(),
      timezone: z.string().optional(),
      hourlyRate: z.number().optional(),
      isActive: z.boolean().optional(),
      isDeleted: z.boolean().optional(),
      password: z.string().min(6).optional(),
    });
    const parsed = schema.parse(updates);
    const payload: any = {
      updatedAt: new Date().toISOString(),
    };
    if (typeof parsed.name !== "undefined") payload.name = parsed.name;
    if (typeof parsed.email !== "undefined") payload.email = parsed.email;
    if (typeof parsed.role !== "undefined") payload.role = parsed.role;
    if (typeof parsed.status !== "undefined") payload.status = parsed.status;
    if (typeof parsed.employeeCode !== "undefined")
      payload.employeeCode = String(parsed.employeeCode);
    if (typeof parsed.phone !== "undefined") payload.phone = parsed.phone;
    if (typeof parsed.timezone !== "undefined")
      payload.timezone = parsed.timezone;
    if (typeof parsed.hourlyRate !== "undefined")
      payload.hourlyRate = parsed.hourlyRate;
    if (typeof parsed.isActive !== "undefined")
      payload.isActive = parsed.isActive;
    if (typeof parsed.isDeleted !== "undefined")
      payload.isDeleted = parsed.isDeleted;
    if (typeof parsed.password !== "undefined") {
      const hash = await bcrypt.hash(parsed.password, 10);
      payload.password = hash;
      payload.password_hash = hash;
      payload.hashed_password = hash;
    }
    const { data, error } = await supabase
      .from("users")
      .update(payload)
      .eq("id", userId)
      .select(
        "id,name,email,role,status,employeeCode,isActive,isDeleted,timezone,hourlyRate,updatedAt",
      )
      .limit(1);
    if (error) return err(error.message || "update failed", 500);
    return ok(
      { user: (data || [])[0] || {}, message: "User updated successfully" },
      200,
    );
  } catch (error) {
    return err("Internal server error", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const userId = params.id;

    if (!userId) {
      return err("User ID is required", 400);
    }

    const { error } = await supabase
      .from("users")
      .update({
        isDeleted: true,
        isActive: false,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", userId);
    if (error) return err(error.message || "delete failed", 500);
    return ok({ message: "User deleted successfully" }, 200);
  } catch (error) {
    return err("Internal server error", 500);
  }
}
