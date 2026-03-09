import { cookies } from "next/headers";
import { createClient, createAdminClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import PageTransition from "../../components/PageTransition";
import ProjectDetailClient from "./ProjectDetailClient";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const projectId = params.id;

  // Parallel Data Fetching
  // We'll define helper functions for each query
  const getProject = async () => {
    // Try normal fetch
    const { data, error } = await supabase.from("projects").select("*").eq("id", projectId).single();
    
    if (data) return data;
    
    // Fallback for admin/manager if RLS blocked it
    const adminSupabase = createAdminClient();
    const { data: adminData } = await adminSupabase.from("projects").select("*").eq("id", projectId).single();
    return adminData;
  };

  const getTasks = async () => {
      const { data } = await supabase.from("tasks").select("*").eq("project_id", projectId).order("created_at", { ascending: false });
      if (data) return data;
      // Fallback
      const adminSupabase = createAdminClient();
      const { data: adminData } = await adminSupabase.from("tasks").select("*").eq("project_id", projectId).order("created_at", { ascending: false });
      return adminData || [];
  };

  const getDocuments = async () => {
      const { data } = await supabase.from("documents").select("*").eq("project_id", projectId).order("created_at", { ascending: false });
      if (data) return data;
      // Fallback
      const adminSupabase = createAdminClient();
      const { data: adminData } = await adminSupabase.from("documents").select("*").eq("project_id", projectId).order("created_at", { ascending: false });
      return adminData || [];
  };

  const getMembers = async () => {
      const { data } = await supabase.from("project_members").select("*").eq("project_id", projectId);
      if (data) return data;
       // Fallback
      const adminSupabase = createAdminClient();
      const { data: adminData } = await adminSupabase.from("project_members").select("*").eq("project_id", projectId);
      return adminData || [];
  };

  const [project, tasks, documents, teamMembers] = await Promise.all([
    getProject(),
    getTasks(),
    getDocuments(),
    getMembers(),
  ]);

  if (!project) {
    notFound();
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50/50">
        <ProjectDetailClient
          project={project}
          tasks={tasks || []}
          documents={documents || []}
          teamMembers={teamMembers || []}
        />
      </div>
    </PageTransition>
  );
}
