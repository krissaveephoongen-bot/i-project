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

  // Sample project data for testing
  const sampleProjects = {
    "proj-001": {
      id: "proj-001",
      name: "Website Redesign",
      code: "WR-2024",
      description: "Complete website redesign project",
      status: "in_progress",
      progress: 75,
      start_date: "2024-01-15",
      end_date: "2024-06-30",
      budget: 50000,
      spent: 37500,
      client_id: "client-001",
      manager_id: "user-001",
      category: "web",
      is_archived: false,
      created_at: "2024-01-15T00:00:00Z",
      updated_at: "2024-03-13T00:00:00Z"
    },
    "proj-002": {
      id: "proj-002", 
      name: "Mobile App Development",
      code: "MA-2024",
      description: "iOS and Android mobile application",
      status: "in_progress",
      progress: 45,
      start_date: "2024-02-01",
      end_date: "2024-08-31",
      budget: 75000,
      spent: 33750,
      client_id: "client-002",
      manager_id: "user-002",
      category: "mobile",
      is_archived: false,
      created_at: "2024-02-01T00:00:00Z",
      updated_at: "2024-03-13T00:00:00Z"
    },
    "proj-003": {
      id: "proj-003",
      name: "Database Migration",
      code: "DM-2024",
      description: "Legacy database migration to new system",
      status: "planning",
      progress: 10,
      start_date: "2024-03-01",
      end_date: "2024-12-31",
      budget: 100000,
      spent: 10000,
      client_id: "client-003",
      manager_id: "user-003",
      category: "infrastructure",
      is_archived: false,
      created_at: "2024-03-01T00:00:00Z",
      updated_at: "2024-03-13T00:00:00Z"
    }
  };

  // Get project from sample data or database
  const project = sampleProjects[projectId as keyof typeof sampleProjects] || await getProjectFromDatabase(projectId, supabase);

  if (!project) {
    notFound();
  }

  // Get sample tasks, documents, and members
  const tasks = await getTasksFromDatabase(projectId, supabase) || getSampleTasks(projectId);
  const documents = await getDocumentsFromDatabase(projectId, supabase) || getSampleDocuments(projectId);
  const teamMembers = await getMembersFromDatabase(projectId, supabase) || getSampleMembers(projectId);

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

async function getProjectFromDatabase(projectId: string, supabase: any) {
  try {
    const { data, error } = await supabase.from("projects").select("*").eq("id", projectId).single();
    if (data) return data;
    
    const adminSupabase = createAdminClient();
    const { data: adminData } = await adminSupabase.from("projects").select("*").eq("id", projectId).single();
    return adminData;
  } catch (error) {
    console.error("Error getting project from database:", error);
    return null;
  }
}

async function getTasksFromDatabase(projectId: string, supabase: any) {
  try {
    const { data } = await supabase.from("tasks").select("*").eq("project_id", projectId).order("created_at", { ascending: false });
    if (data) return data;
    
    const adminSupabase = createAdminClient();
    const { data: adminData } = await adminSupabase.from("tasks").select("*").eq("project_id", projectId).order("created_at", { ascending: false });
    return adminData || [];
  } catch (error) {
    console.error("Error getting tasks from database:", error);
    return null;
  }
}

async function getDocumentsFromDatabase(projectId: string, supabase: any) {
  try {
    const { data } = await supabase.from("documents").select("*").eq("project_id", projectId).order("created_at", { ascending: false });
    if (data) return data;
    
    const adminSupabase = createAdminClient();
    const { data: adminData } = await adminSupabase.from("documents").select("*").eq("project_id", projectId).order("created_at", { ascending: false });
    return adminData || [];
  } catch (error) {
    console.error("Error getting documents from database:", error);
    return null;
  }
}

async function getMembersFromDatabase(projectId: string, supabase: any) {
  try {
    const { data } = await supabase.from("project_members").select("*").eq("project_id", projectId);
    if (data) return data;
    
    const adminSupabase = createAdminClient();
    const { data: adminData } = await adminSupabase.from("project_members").select("*").eq("project_id", projectId);
    return adminData || [];
  } catch (error) {
    console.error("Error getting members from database:", error);
    return null;
  }
}

function getSampleTasks(projectId: string) {
  return [
    {
      id: "task-001",
      title: "Design Homepage",
      description: "Create homepage design mockups",
      status: "in_progress",
      priority: "high",
      project_id: projectId,
      created_at: "2024-01-20T00:00:00Z",
      updated_at: "2024-03-13T00:00:00Z"
    },
    {
      id: "task-002",
      title: "Develop Navigation",
      description: "Implement responsive navigation",
      status: "todo",
      priority: "medium",
      project_id: projectId,
      created_at: "2024-01-25T00:00:00Z",
      updated_at: "2024-03-13T00:00:00Z"
    }
  ];
}

function getSampleDocuments(projectId: string) {
  return [
    {
      id: "doc-001",
      name: "Project Requirements",
      type: "pdf",
      size: 1024000,
      project_id: projectId,
      created_at: "2024-01-15T00:00:00Z",
      updated_at: "2024-03-13T00:00:00Z"
    },
    {
      id: "doc-002",
      name: "Design Mockups",
      type: "jpg",
      size: 2048000,
      project_id: projectId,
      created_at: "2024-01-22T00:00:00Z",
      updated_at: "2024-03-13T00:00:00Z"
    }
  ];
}

function getSampleMembers(projectId: string) {
  return [
    {
      id: "member-001",
      user_id: "user-001",
      name: "John Doe",
      role: "Project Manager",
      project_id: projectId,
      joined_at: "2024-01-15T00:00:00Z",
      created_at: "2024-01-15T00:00:00Z",
      updated_at: "2024-03-13T00:00:00Z"
    },
    {
      id: "member-002",
      user_id: "user-002",
      name: "Jane Smith",
      role: "Lead Developer",
      project_id: projectId,
      joined_at: "2024-01-20T00:00:00Z",
      created_at: "2024-01-20T00:00:00Z",
      updated_at: "2024-03-13T00:00:00Z"
    }
  ];
}
