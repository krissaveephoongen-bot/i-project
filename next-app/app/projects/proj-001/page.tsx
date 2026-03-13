import { cookies } from "next/headers";
import { createClient, createAdminClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import PageTransition from "../../components/PageTransition";
import ProjectDetailClient from "../[id]/ProjectDetailClient";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const projectId = "proj-001";

  // Sample project data for proj-001
  const project = {
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
  };

  // Get sample tasks, documents, and members
  const tasks = getSampleTasks(projectId);
  const documents = getSampleDocuments(projectId);
  const teamMembers = getSampleMembers(projectId);

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
