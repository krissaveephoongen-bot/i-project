export const PROJECT_ID_COLUMNS = [
  "project_id",
  "projectId",
  "projectid",
] as const;
export const MILESTONE_ID_COLUMNS = [
  "milestone_id",
  "milestoneId",
  "milestoneid",
] as const;
export const TASK_ID_COLUMNS = ["task_id", "taskId", "taskid"] as const;
export const USER_ID_COLUMNS = ["user_id", "userId", "userid"] as const;

export function isSchemaColumnError(error: any) {
  const msg = `${error?.message || ""}`.toLowerCase();
  return (
    msg.includes("does not exist") ||
    msg.includes("could not find the") ||
    msg.includes("schema cache")
  );
}

export async function firstOk<T>(
  columns: readonly string[],
  run: (col: string) => Promise<T>,
) {
  let last: any = null;
  for (const col of columns) {
    const res: any = await run(col);
    last = res;
    if (!res?.error) return res as T;
    if (!isSchemaColumnError(res.error)) return res as T;
  }
  return last as T;
}
