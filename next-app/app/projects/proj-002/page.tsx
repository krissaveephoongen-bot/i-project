import { cookies } from "next/headers";
import { createClient, createAdminClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import PageTransition from "../../components/PageTransition";
import ProjectDetailClient from "../[id]/ProjectDetailClient";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const projectId = "proj-002";

  // Sample project data for proj-002
  const project = {
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
      id: "task-003",
      title: "Design Mobile UI",
      description: "Create mobile app UI design",
      status: "in_progress",
      priority: "high",
      progress: 60,
      project_id: projectId,
      created_at: "2024-02-05T00:00:00Z",
      updated_at: "2024-03-13T00:00:00Z"
    },
    {
      id: "task-004",
      title: "Implement Backend",
      description: "Develop backend API",
      status: "todo",
      priority: "medium",
      progress: 0,
      project_id: projectId,
      created_at: "2024-02-10T00:00:00Z",
      updated_at: "2024-03-13T00:00:00Z"
    }
  ];
}

function getSampleDocuments(projectId: string) {
  return [
    {
      id: "doc-003",
      name: "Mobile Requirements",
      type: "pdf",
      size: 1536000,
      modified: "2024-02-01T00:00:00Z",
      uploaded_by: "user-002",
      uploaded_at: "2024-02-01T00:00:00Z",
      project_id: projectId,
      created_at: "2024-02-01T00:00:00Z",
      updated_at: "2024-03-13T00:00:00Z"
    },
    {
      id: "doc-004",
      name: "App Wireframes",
      type: "figma",
      size: 3072000,
      modified: "2024-02-08T00:00:00Z",
      uploaded_by: "user-002",
      uploaded_at: "2024-02-08T00:00:00Z",
      project_id: projectId,
      created_at: "2024-02-08T00:00:00Z",
      updated_at: "2024-03-13T00:00:00Z"
    }
  ];
}

function getSampleMembers(projectId: string) {
  return [
    {
      id: "member-003",
      user_id: "user-002",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      role: "Project Manager",
      project_id: projectId,
      joined_at: "2024-02-01T00:00:00Z",
      created_at: "2024-02-01T00:00:00Z",
      updated_at: "2024-03-13T00:00:00Z"
    },
    {
      id: "member-004",
      user_id: "user-003",
      name: "Bob Johnson",
      email: "bob.johnson@example.com",
      role: "Lead Developer",
      project_id: projectId,
      joined_at: "2024-02-05T00:00:00Z",
      created_at: "2024-02-05T00:00:00Z",
      updated_at: "2024-03-13T00:00:00Z"
    }
  ];
}
