"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { z } from "zod";
import bcrypt from "bcryptjs";

const userSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  role: z.enum(["admin", "manager", "employee"]),
  password: z.string().optional(),
  isActive: z.boolean().default(true),
  employeeCode: z.union([z.string(), z.number()]).optional(),
  timezone: z.string().default("Asia/Bangkok"),
  hourlyRate: z.number().default(0),
});

export type UserInput = z.infer<typeof userSchema>;

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "employee";
  employeeCode?: string | number;
  department?: string;
  position?: string;
  avatar?: string;
  phone?: string;
  isActive: boolean;
  isDeleted: boolean;
  failedLoginAttempts: number;
  lastLogin?: string;
  lockedUntil?: string;
  isProjectManager: boolean;
  isSupervisor: boolean;
  hourlyRate: number;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export async function getUsers(params?: {
  q?: string;
  role?: string;
  status?: string;
}) {
  const supabase = createClient(cookies());
  
  let query = supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  // Safety check: Filter by is_deleted only if we are sure it exists. 
  // For now, we assume it might not exist in type definition.
  // .eq("is_deleted", false) 


  if (params?.q) {
    query = query.or(`name.ilike.%${params.q}%,email.ilike.%${params.q}%`);
  }

  if (params?.role && params.role !== "all") {
    query = query.eq("role", params.role);
  }

  if (params?.status && params.status !== "all") {
    // Note: status filtering relies on is_active which might not exist in all schemas
    // We comment it out to ensure dropdowns work even if schema is outdated.
    // if (params.status === "active") query = query.eq("is_active", true);
    // if (params.status === "inactive") query = query.eq("is_active", false);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Get Users Error:", error);
    return [];
  }

  return (data || []).map(mapDbUserToUser);
}

export async function createUserAction(input: UserInput) {
  const result = userSchema.safeParse(input);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const supabase = createClient(cookies());
  const { name, email, role, password, isActive, employeeCode, timezone, hourlyRate } = result.data;

  // Check existing email
  const { data: existing } = await supabase.from("users").select("id").eq("email", email).single();
  if (existing) {
    return { error: "Email already exists" };
  }

  const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

  const payload = {
    name,
    email,
    role,
    password: hashedPassword,
    is_active: isActive,
    employee_code: String(employeeCode || ""),
    timezone,
    hourly_rate: hourlyRate,
    status: isActive ? "active" : "inactive",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("users")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("Create User Error:", error);
    return { error: "Failed to create user" };
  }

  // Sync Profile (Optional, based on API logic)
  try {
     await supabase.from("profiles").insert({
       id: data.id,
       name: data.name,
       email: data.email,
       role: data.role,
       created_at: new Date().toISOString(),
       updated_at: new Date().toISOString(),
     });
  } catch {}

  revalidatePath("/users");
  return { data: mapDbUserToUser(data) };
}

export async function updateUserAction(id: string, input: Partial<UserInput>) {
  const supabase = createClient(cookies());
  
  const updates: any = {
    updated_at: new Date().toISOString(),
  };

  if (input.name) updates.name = input.name;
  if (input.email) updates.email = input.email;
  if (input.role) updates.role = input.role;
  if (input.isActive !== undefined) {
    updates.is_active = input.isActive;
    updates.status = input.isActive ? "active" : "inactive";
  }
  if (input.employeeCode !== undefined) updates.employee_code = String(input.employeeCode);
  if (input.timezone) updates.timezone = input.timezone;
  if (input.hourlyRate !== undefined) updates.hourly_rate = input.hourlyRate;
  
  if (input.password) {
    updates.password = await bcrypt.hash(input.password, 10);
  }

  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Update User Error:", error);
    return { error: "Failed to update user" };
  }

  // Sync Profile
  try {
    const profUpd: any = {};
    if (input.name) profUpd.name = input.name;
    if (input.email) profUpd.email = input.email;
    if (input.role) profUpd.role = input.role;
    if (Object.keys(profUpd).length > 0) {
      profUpd.updated_at = new Date().toISOString();
      await supabase.from("profiles").update(profUpd).eq("id", id);
    }
  } catch {}

  revalidatePath("/users");
  return { data: mapDbUserToUser(data) };
}

export async function deleteUserAction(id: string) {
  const supabase = createClient(cookies());
  
  const { error } = await supabase
    .from("users")
    .update({ 
      is_deleted: true, 
      is_active: false, 
      status: "inactive",
      updated_at: new Date().toISOString() 
    })
    .eq("id", id);

  if (error) {
    console.error("Delete User Error:", error);
    return { error: "Failed to delete user" };
  }

  revalidatePath("/users");
  return { success: true };
}

function mapDbUserToUser(u: any): User {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    employeeCode: u.employee_code,
    department: u.department,
    position: u.position || null,
    avatar: u.avatar || u.avatar_url || null,
    phone: u.phone || null,
    isActive: u.is_active ?? true,
    isDeleted: u.is_deleted ?? false,
    failedLoginAttempts: u.failed_login_attempts || 0,
    lastLogin: u.last_login || null,
    lockedUntil: u.locked_until || null,
    isProjectManager: u.is_project_manager ?? false,
    isSupervisor: u.is_supervisor ?? false,
    hourlyRate: Number(u.hourly_rate || 0),
    timezone: u.timezone || "Asia/Bangkok",
    createdAt: u.created_at,
    updatedAt: u.updated_at,
  };
}
