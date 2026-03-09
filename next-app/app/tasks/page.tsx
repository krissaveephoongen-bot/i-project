import { cookies } from "next/headers";
import Header from "../components/Header";
import PageTransition from "../components/PageTransition";
import TasksClient from "./TasksClient";
import {
  getTasksAction,
  getProjectsWithCounts,
  getUsersForDropdown,
  getMilestonesForDropdown,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: { q?: string; projectId?: string };
}) {
  const query = searchParams?.q || "";
  const projectId = searchParams?.projectId || "";

  // Parallel data fetching
  const [tasks, projects, users, milestones] = await Promise.all([
    getTasksAction({ q: query, projectId: projectId || undefined }),
    getProjectsWithCounts(),
    getUsersForDropdown(),
    getMilestonesForDropdown(),
  ]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50/50">
        <Header
          title="งาน (Tasks)"
          breadcrumbs={[
            { label: "แดชบอร์ด", href: "/" },
            { label: "งาน" },
          ]}
        />
        <div className="pt-24 px-6 pb-6 container mx-auto space-y-6 w-full max-w-full">
          <TasksClient
            initialTasks={tasks}
            initialProjects={projects}
            initialUsers={users}
            initialMilestones={milestones}
          />
        </div>
      </div>
    </PageTransition>
  );
}
