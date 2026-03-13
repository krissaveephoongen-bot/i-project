import { cookies } from "next/headers";
import { createClient, createAdminClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import PageTransition from "../../components/PageTransition";
import ProjectDetailClient from "../[id]/ProjectDetailClient";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const projectId = "proj-003";

  // Sample project data for proj-003
  const project = {
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
      id: "task-005",
      title: "Database Analysis",
      description: "Analyze current database structure",
      status: "in_progress",
      priority: "high",
      progress: 80,
      project_id: projectId,
      created_at: "2024-03-05T00:00:00Z",
      updated_at: "2024-03-13T00:00:00Z"
    },
    {
      id: "task-006",
      title: "Migration Planning",
      description: "Plan migration strategy",
      status: "todo",
      priority: "medium",
      progress: 20,
      project_id: projectId,
      created_at: "2024-03-10T00:00:00Z",
      updated_at: "2024-03-13T00:00:00Z"
    }
  ];
}

function getSampleDocuments(projectId: string) {
  return [
    {
      id: "doc-005",
      name: "Database Schema",
      type: "sql",
      size: "2048000",
      modified: "2024-03-01T00:00:00Z",
      uploaded_by: "user-003",
      uploaded_at: "2024-03-01T00:00:00Z",
      project_id: projectId,
      created_at: "2024-03-01T00:00:00Z",
      updated_at: "2024-03-13T00:00:00Z"
    },
    {
      id: "doc-006",
      name: "Migration Plan",
      type: "docx",
      size: "1024000",
      modified: "2024-03-08T00:00:00Z",
      uploaded_by: "user-003",
      uploaded_at: "2024-03-08T00:00:00Z",
      project_id: projectId,
      created_at: "2024-03-08T00:00:00Z",
      updated_at: "2024-03-13T00:00:00Z"
    }
  ];
}

function getSampleMembers(projectId: string) {
  return [
    {
      id: "member-005",
      user_id: "user-003",
      name: "Alice Brown",
      email: "alice.brown@example.com",
      role: "Database Administrator",
      project_id: projectId,
      joined_at: "2024-03-01T00:00:00Z",
      created_at: "2024-03-01T00:00:00Z",
      updated_at: "2024-03-13T00:00:00Z"
    },
    {
      id: "member-006",
      user_id: "user-004",
      name: "Charlie Wilson",
      email: "charlie.wilson@example.com",
      role: "System Architect",
      project_id: projectId,
      joined_at: "2024-03-05T00:00:00Z",
      created_at: "2024-03-05T00:00:00Z",
      updated_at: "2024-03-13T00:00:00Z"
    }
  ];
}
