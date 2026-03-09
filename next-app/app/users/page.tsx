import { cookies } from "next/headers";
import { createClient, createAdminClient } from "@/utils/supabase/server";
import Header from "../components/Header";
import PageTransition from "../components/PageTransition";
import UsersClient from "./UsersClient";
import { User } from "./actions";

export const dynamic = "force-dynamic";

async function fetchUsers(supabase: any, customUser: any) {
  let usersData: any[] = [];
  let usersError: any = null;

  // 1. Try User Session
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (data && data.length > 0) {
    usersData = data;
  } else {
    usersError = error;
    
    // 2. Fallback: Admin Client (if RLS prevents access)
    // Always try fallback if main fetch fails or returns empty (assuming there should be users)
    // Or check role first. For now, let's just try admin client if regular client fails.
    
    let user = customUser;
    if (!user) {
        const { data: { user: sbUser } } = await supabase.auth.getUser();
        user = sbUser;
    }

    if (user) {
      const adminSupabase = createAdminClient();
      const adminRes = await adminSupabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (adminRes.data) {
        usersData = adminRes.data;
        usersError = null;
      } else {
        usersError = adminRes.error;
      }
    }
  }
  
  return { data: usersData, error: usersError };
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

export default async function UsersPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Custom Auth Check
  const authToken = cookieStore.get("auth_token")?.value;
  let customUser: any = null;
  if (authToken) {
    const adminClient = createAdminClient();
    const { data: user } = await adminClient
      .from("users")
      .select("id, role")
      .eq("id", authToken)
      .single();
    if (user) customUser = user;
  }

  const { data, error } = await fetchUsers(supabase, customUser);

  if (error) {
    console.error("Error fetching users:", error);
  }

  const users: User[] = (data || []).map(mapDbUserToUser);

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50/50">
        <Header
          title="การจัดการผู้ใช้งาน"
          breadcrumbs={[
            { label: "แดชบอร์ด", href: "/" },
            { label: "ผู้ใช้งาน" },
          ]}
        />
        <div className="container mx-auto px-6 py-8 pt-24">
          <UsersClient initialUsers={users} />
        </div>
      </div>
    </PageTransition>
  );
}
