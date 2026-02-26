import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import Header from "../components/Header";
import PageTransition from "../components/PageTransition";
import ProjectsClient from "./ProjectsClient";
import { Project } from "@/lib/projects";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Fetch Projects
  const { data: projectsData, error: projectsError } = await supabase
    .from("projects")
    .select(`
      *,
      users!projects_manager_id_fkey (
        name
      )
    `)
    .order("created_at", { ascending: false });

  if (projectsError) {
    console.error("Error fetching projects:", projectsError);
  }

  // Transform projects to match expected type
  const projects: Project[] = (projectsData || []).map((p: any) => ({
    ...p,
    manager_name: p.users?.name || null,
  }));

  // Fetch Managers
  const { data: managersData, error: managersError } = await supabase
    .from("users")
    .select("id, name, email, role, avatar_url")
    .in("role", ["admin", "manager"])
    .order("name");

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
