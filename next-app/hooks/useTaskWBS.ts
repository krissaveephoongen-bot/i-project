import { useQuery } from "@tanstack/react-query";
import { Task } from "@/types";

export interface TaskNode extends Task {
  children?: TaskNode[];
}

async function fetchTasksWBS(projectId: string): Promise<TaskNode[]> {
  const res = await fetch(`/api/projects/${projectId}/tasks/wbs/tree`);
  if (!res.ok) throw new Error("Failed to fetch tasks");
  const data = await res.json();
  return data.data || [];
}

export function useTaskWBS(projectId: string | undefined) {
  return useQuery({
    queryKey: ["tasks-wbs", projectId],
    queryFn: () => fetchTasksWBS(projectId!),
    enabled: !!projectId,
  });
}
