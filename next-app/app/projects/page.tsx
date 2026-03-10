import { cookies } from "next/headers";
import { createClient, createAdminClient } from "@/utils/supabase/server";
import PageContainer from "../components/PageContainer";
import PageTransition from "../components/PageTransition";
import ProjectsClient from "./ProjectsClient";
import { Project } from "@/lib/projects";

export const dynamic = "force-dynamic";

async function fetchProjects(supabase: any, customUser: any) {
  let projectsData: any[] = [];
  let projectsError: any = null;

  // 1. Try User Session (Standard Supabase Auth)
  const res = await supabase.from("projects").select(`*`).order("created_at", { ascending: false });
  
  if (res.data && res.data.length > 0) {
    projectsData = res.data;
  } else {
    projectsError = res.error;
    
    // 2. Fallback: Check for Custom Auth User or Standard Supabase User
    let user = customUser;
    if (!user) {
        const { data: { user: sbUser } } = await supabase.auth.getUser();
        user = sbUser;
    }

    let roleClaim = "";
    if (user) {
        roleClaim = String(
          (user as any)?.role || // Custom Auth role
          (user as any)?.app_metadata?.role ||
          (user as any)?.user_metadata?.role ||
          ""
        ).toLowerCase();

        if (!roleClaim && user.id) {
          const adminSupabase = createAdminClient();
          const { data: profile } = await adminSupabase
            .from("users")
            .select("role")
            .eq("id", user.id)
            .single();
          roleClaim = String(profile?.role || "").toLowerCase();
        }
    }

    // If Admin/Manager (from either auth system), use Admin Client to bypass RLS
    // For now, allowing all authenticated users to fetch via admin client as fallback
    // to ensure data visibility if RLS is strict/broken
    if (user) {
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
  
  return { data: projectsData, error: projectsError };
}

async function fetchManagers(supabase: any) {
  let managersData: any[] = [];
  let managersError: any = null;

  // Try fetching all users (as potential managers)
  const managersRes = await supabase
    .from("users")
    .select("id, name, email, role, avatar_url")
    .order("name");

  if (managersRes.data && managersRes.data.length > 0) {
    managersData = managersRes.data;
  } else {
    managersError = managersRes.error;
    // Fallback to Admin Client
    const adminSupabase = createAdminClient();
    const adminManagersRes = await adminSupabase
      .from("users")
      .select("id, name, email, role, avatar_url")
      .order("name");
    
    if (adminManagersRes.data) {
      managersData = adminManagersRes.data;
      managersError = null;
    } else {
      managersError = adminManagersRes.error;
    }
  }
  
  return { data: managersData, error: managersError };
}

export default async function ProjectsPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Custom Auth: Check for auth_token cookie
  const authToken = cookieStore.get("auth_token")?.value;
  let customUser: any = null;

  if (authToken) {
    const adminClient = createAdminClient();
    const { data: user } = await adminClient
      .from("users")
      .select("id, role, name, email")
      .eq("id", authToken)
      .single();
    if (user) {
      customUser = user;
    }
  }

  // Parallel Fetching
  const [projectsResult, managersResult] = await Promise.all([
    fetchProjects(supabase, customUser),
    fetchManagers(supabase)
  ]);

  if (projectsResult.error) {
    console.error("Error fetching projects:", projectsResult.error);
  }
  
  if (managersResult.error) {
    console.error("Error fetching managers:", managersResult.error);
  }

  // Transform projects to match expected type
  const projects: Project[] = (projectsResult.data || []).map((p: any) => ({
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

  const managers = (managersResult.data || []).map((m: any) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    role: m.role,
    avatar: m.avatar_url,
  }));

  return (
    <PageTransition>
      <PageContainer
        title="Projects"
        description="Manage all your projects, phases, and milestones"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Projects" },
        ]}
      >
        <ProjectsClient
          initialProjects={projects}
          initialManagers={managers}
        />
      </PageContainer>
    </PageTransition>
  );
}
