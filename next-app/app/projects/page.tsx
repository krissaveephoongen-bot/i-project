import { cookies } from "next/headers";
import { createClient, createAdminClient } from "@/utils/supabase/server";
import Header from "../components/Header";
import PageTransition from "../components/PageTransition";
import ProjectsClient from "./ProjectsClient";
import { Project } from "@/lib/projects";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Fetch Projects with fallback
  let projectsData: any[] = [];
  let projectsError: any = null;

  // 1. Try User Session
  const res = await supabase.from("projects").select(`*`).order("created_at", { ascending: false });
  
  if (res.data && res.data.length > 0) {
    projectsData = res.data;
  } else {
    projectsError = res.error;
    // 2. Fallback to Admin Client (only for admin/manager)
    const { data: { user } } = await supabase.auth.getUser();
    let roleClaim = String(
      // prefer auth metadata if present
      (user as any)?.app_metadata?.role ||
        (user as any)?.user_metadata?.role ||
        "",
    ).toLowerCase();
    if (!roleClaim && user) {
      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();
      roleClaim = String(profile?.role || "").toLowerCase();
    }
    if (["admin", "manager"].includes(roleClaim)) {
      const adminSupabase = createAdminClient();
      const adminRes = await adminSupabase
        .from("projects")
        .select(`*`)
        .order("created_at", { ascending: false });

      if (adminRes.data) {
        projectsData = adminRes.data;
        projectsError = null; // Clear error if fallback succeeds
      } else if (adminRes.error) {
        projectsError = adminRes.error;
      }
    }
  }

  if (projectsError) {
    console.error("Error fetching projects:", projectsError);
  }

  // Transform projects to match expected type
  const projects: Project[] = (projectsData || []).map((p: any) => ({
    id: p.id,
    code: p.code || p.project_code || "",
    name: p.name,
    status: p.status,
    progress: p.progress,
    budget: p.budget,
    spent: p.spent,
    startDate: p.start_date,
    endDate: p.end_date,
    managerId: p.manager_id,
    clientId: p.client_id,
    priority: p.priority,
    category: p.category,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
    manager_name: p.manager_name || p.users?.name || null,
    description: p.description,
  }));

  // Fetch Managers with fallback
  let managersData: any[] = [];
  let managersError: any = null;

  const managersRes = await supabase
    .from("users")
    .select("id, name, email, role, avatar_url")
    .in("role", ["admin", "manager"])
    .order("name");

  if (managersRes.data && managersRes.data.length > 0) {
    managersData = managersRes.data;
  } else {
    managersError = managersRes.error;
    const adminSupabase = createAdminClient();
    const adminManagersRes = await adminSupabase
      .from("users")
      .select("id, name, email, role, avatar_url")
      .in("role", ["admin", "manager"])
      .order("name");
    
    if (adminManagersRes.data) {
      managersData = adminManagersRes.data;
      managersError = null;
    } else {
      managersError = adminManagersRes.error;
    }
  }

  if (managersError) {
    console.error("Error fetching managers:", managersError);
  }

  const managers = (managersData || []).map((m: any) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    role: m.role,
    avatar: m.avatar_url,
  }));

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
        <Header
          title="โครงการ (Projects)"
          breadcrumbs={[{ label: "แดชบอร์ด", href: "/" }, { label: "โครงการ" }]}
        />
        <div className="container mx-auto px-4 md:px-6 py-8 pt-24 max-w-[1600px]">
          <ProjectsClient
            initialProjects={projects}
            initialManagers={managers}
          />
        </div>
      </div>
    </PageTransition>
  );
}
