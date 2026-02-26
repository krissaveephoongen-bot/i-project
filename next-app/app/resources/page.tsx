import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import ResourcesClient from "./ResourcesClient";
import Header from "../components/Header";

export const metadata = {
  title: "Resources | i-Project",
};

export default async function ResourcesPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 1. Fetch Users (Team Members)
  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("id, name, email, avatar_url")
    .order("name");

  if (usersError) {
    console.error("Error fetching users:", usersError);
    // Handle error gracefully or return empty
  }

  // 2. Fetch Active Tasks (for workload calculation)
  // We fetch tasks that are not completed/cancelled to calculate current load
  const { data: tasks, error: tasksError } = await supabase
    .from("tasks")
    .select("id, title, start_date, end_date, weight, status, assigned_to")
    .in("status", ["todo", "in_progress", "pending"])
    .not("assigned_to", "is", null);

  if (tasksError) {
    console.error("Error fetching tasks:", tasksError);
  }

  // Transform data for client
  const formattedUsers = (users || []).map((u: any) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    avatar: u.avatar_url,
  }));

  const formattedTasks = (tasks || []).map((t: any) => ({
    id: t.id,
    title: t.title,
    startDate: t.start_date,
    endDate: t.end_date,
    weight: t.weight,
    status: t.status,
    assignedTo: t.assigned_to,
  }));

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header
        title="Resources"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Resources" },
        ]}
      />
      <div className="pt-24 px-4 md:px-6 pb-6 container mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Team Workload
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor resource allocation and prevent burnout.
          </p>
        </div>

        <ResourcesClient users={formattedUsers} tasks={formattedTasks} />
      </div>
    </div>
  );
}
