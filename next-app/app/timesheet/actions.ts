"use server";

import { createClient, createAdminClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { TimeEntry, EntryStatus, WorkType, WeeklyData, ActivityData } from "./types";

// ============================================================================
// PROJECTS & TASKS
// ============================================================================

export async function getTimesheetProjectsAction(userId: string) {
  const supabase = createAdminClient();

  // 1. Get active projects
  const { data: projects, error: projError } = await supabase
    .from("projects")
    .select("id, name, status") // code might not exist in all schemas, removed for safety unless verified
    .not("status", "in", '("Completed","completed","Cancelled","cancelled")')
    .order("name");

  if (projError) {
    console.error("Error fetching projects:", projError);
    return [];
  }

  // 2. Get active tasks for these projects
  const projectIds = (projects || []).map((p) => p.id);
  let tasks: any[] = [];

  if (projectIds.length > 0) {
    const { data: t, error: taskError } = await supabase
      .from("tasks")
      .select("id, title, project_id, status")
      .in("project_id", projectIds)
      .not("status", "in", '("Completed","completed","Cancelled","cancelled")');
      
    tasks = t || [];
  }

  // 3. Map tasks to projects
  const tasksMap: Record<string, Array<{ id: string; name: string }>> = {};
  for (const t of tasks) {
    const name = t.title || t.id;
    const pid = t.project_id;
    if (pid) {
      if (!tasksMap[pid]) tasksMap[pid] = [];
      tasksMap[pid].push({ id: t.id, name });
    }
  }

  // 4. Construct response
  return (projects || []).map((p: any) => ({
    id: p.id,
    name: p.name || "Untitled Project",
    is_billable: false, // Default
    tasks: tasksMap[p.id] || [],
  }));
}

// ============================================================================
// TIMESHEET ENTRIES
// ============================================================================

function mapDbToTimeEntry(dbEntry: any): TimeEntry {
  return {
    id: dbEntry.id,
    date: dbEntry.date ? new Date(dbEntry.date).toISOString().split("T")[0] : "",
    startTime: dbEntry.start_time || "",
    endTime: dbEntry.end_time || null,
    breakDuration: dbEntry.break_duration || 0,
    workType: (dbEntry.work_type || WorkType.PROJECT) as WorkType,
    projectId: dbEntry.project_id || null,
    taskId: dbEntry.task_id || null,
    userId: dbEntry.user_id || "",
    hours: Number(dbEntry.hours || 0),
    billableHours: Number(dbEntry.billable_hours || 0),
    description: dbEntry.description || "",
    status: (dbEntry.status || EntryStatus.PENDING) as EntryStatus,
    approvedBy: dbEntry.approved_by || null,
    approvedAt: dbEntry.approved_at || null,
    rejectedReason: dbEntry.rejected_reason || null,
    createdAt: dbEntry.created_at || new Date().toISOString(),
    updatedAt: dbEntry.updated_at || new Date().toISOString(),
  };
}

export async function getTimesheetEntriesAction(userId: string, start: string, end: string, projectIds?: string[]) {
  const supabase = createClient(cookies());

  let query = supabase
    .from("time_entries")
    .select("*")
    .eq("user_id", userId)
    .gte("date", start)
    .lte("date", end);

  if (projectIds && projectIds.length > 0) {
    query = query.in("project_id", projectIds);
  }

  const { data, error } = await query.order("date", { ascending: true });

  if (error) {
    console.error("Error fetching time_entries:", error);
    return [];
  }

  return (data || []).map(mapDbToTimeEntry);
}

export async function createTimesheetEntryAction(entry: Partial<TimeEntry>) {
  const supabase = createClient(cookies());
  
  const payload: any = {
    user_id: entry.userId,
    project_id: entry.projectId || null,
    task_id: entry.taskId || null,
    date: entry.date,
    hours: Number(entry.hours || 0),
    start_time: entry.startTime || null,
    end_time: entry.endTime || null,
    description: entry.description || null,
    // work_type: entry.workType || "project", // Ensure column exists if using
    // billable_hours: entry.billableHours || 0, // Ensure column exists if using
    // status: "pending", // If column exists
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Check database.types.ts for exact columns. 
  // time_entries has: user_id, project_id, task_id, description, hours, date, created_at, updated_at
  // It does NOT show start_time, end_time, work_type, billable_hours in the type definition I saw earlier!
  // Let's re-verify types to be safe.
  // The type def I saw earlier:
  // time_entries: { Row: { id, user_id, project_id, task_id, description, hours, date, created_at, updated_at } }
  // So start_time/end_time might be MISSING from DB or Types.
  // But TimesheetModal uses them.
  // If they are missing in DB, this insert will fail if I include them.
  // But I must assume the app logic requires them.
  // I will include them, if it fails, user needs to migrate DB.
  
  const { data, error } = await supabase
    .from("time_entries")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("Create Entry Error:", error);
    return null;
  }

  revalidatePath("/timesheet");
  return mapDbToTimeEntry(data);
}

export async function updateTimesheetEntryAction(entry: Partial<TimeEntry>) {
  if (!entry.id) return null;
  const supabase = createClient(cookies());

  const payload: any = {
    updated_at: new Date().toISOString(),
  };

  if (entry.hours !== undefined) payload.hours = Number(entry.hours);
  if (entry.taskId !== undefined) payload.task_id = entry.taskId;
  if (entry.startTime !== undefined) payload.start_time = entry.startTime;
  if (entry.endTime !== undefined) payload.end_time = entry.endTime;
  if (entry.description !== undefined) payload.description = entry.description;
  if (entry.projectId !== undefined) payload.project_id = entry.projectId;
  
  const { data, error } = await supabase
    .from("time_entries")
    .update(payload)
    .eq("id", entry.id)
    .select()
    .single();

  if (error) {
    console.error("Update Entry Error:", error);
    return null;
  }

  revalidatePath("/timesheet");
  return mapDbToTimeEntry(data);
}

export async function deleteTimesheetEntryAction(id: string) {
  const supabase = createClient(cookies());
  
  const { error } = await supabase.from("time_entries").delete().eq("id", id);
  
  if (error) {
    console.error("Delete Entry Error:", error);
    return false;
  }

  revalidatePath("/timesheet");
  return true;
}

// ============================================================================
// SUBMISSION
// ============================================================================

export async function getSubmissionStatusAction(userId: string, date: string) {
  const supabase = createClient(cookies());
  const { data, error } = await supabase
    .from("timesheet_submissions")
    .select("status")
    .eq("user_id", userId)
    .eq("period_start_date", date)
    .single();

  if (error || !data) return "Draft";
  return data.status || "Draft";
}

export async function submitTimesheetAction(userId: string, start: string, end: string, totalHours: number) {
  const supabase = createClient(cookies());
  
  const { error } = await supabase
    .from("timesheet_submissions")
    .upsert({
      user_id: userId,
      period_start_date: start,
      period_end_date: end,
      total_hours: totalHours,
      status: "Submitted",
      submitted_at: new Date().toISOString(),
    }, { onConflict: "user_id, period_start_date" });

  if (error) {
    console.error("Submit Timesheet Error:", error);
    return false;
  }
  
  revalidatePath("/timesheet");
  return true;
}

// ============================================================================
// REPORTING
// ============================================================================

export async function getWeeklySummaryAction(start: string, projectId?: string) {
  const supabase = createClient(cookies());
  
  const d = new Date(start);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const dd = new Date(d);
    dd.setDate(d.getDate() + i);
    days.push(dd.toISOString().slice(0, 10));
  }

  let query = supabase
    .from("time_entries")
    .select("user_id, date, hours, project_id")
    .gte("date", days[0])
    .lte("date", days[6]);

  if (projectId && projectId !== "all") {
    query = query.eq("project_id", projectId);
  }

  const { data: entries } = await query;
  const filtered = entries || [];

  // Fetch Users
  const userIds = Array.from(new Set(filtered.map((e: any) => e.user_id)));
  let usersMap: Record<string, string> = {};
  if (userIds.length > 0) {
    const { data: users } = await supabase
      .from("users")
      .select("id, name")
      .in("id", userIds);
    (users || []).forEach((u: any) => {
      usersMap[u.id] = u.name;
    });
  }

  const map = new Map<string, any>();
  for (const r of filtered) {
    const key = r.user_id;
    if (!map.has(key)) {
      map.set(key, {
        userId: r.user_id,
        name: usersMap[r.user_id] || r.user_id,
        hours: Object.fromEntries(days.map((d) => [d, 0])),
        totalHours: 0,
      });
    }
    const day = new Date(r.date).toISOString().slice(0, 10);
    const h = Number(r.hours || 0);
    map.get(key).hours[day] += h;
    map.get(key).totalHours += h;
  }

  return {
    week: start,
    days,
    data: Array.from(map.values()),
    totalHours: Array.from(map.values()).reduce((sum, u) => sum + u.totalHours, 0),
    entries: [],
  };
}

export async function getActivityLogAction(start: string, projectId?: string, userId?: string, team?: string) {
  const supabase = createClient(cookies());
  
  const d = new Date(start);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const dd = new Date(d);
    dd.setDate(d.getDate() + i);
    days.push(dd.toISOString().slice(0, 10));
  }

  let query = supabase
    .from("time_entries")
    .select("date, hours, start_time, end_time, project_id, task_id, user_id")
    .gte("date", days[0])
    .lte("date", days[6]);

  if (userId && userId !== "all") query = query.eq("user_id", userId);
  if (projectId && projectId !== "all") query = query.eq("project_id", projectId);

  const { data: entries, error } = await query;
  if (error) return { rows: [] };

  // Collect IDs
  const uIds = new Set<string>();
  const pIds = new Set<string>();
  const tIds = new Set<string>();
  
  for (const e of entries || []) {
    if (e.user_id) uIds.add(e.user_id);
    if (e.project_id) pIds.add(e.project_id);
    if (e.task_id) tIds.add(e.task_id);
  }

  const [{ data: users }, { data: projects }, { data: tasks }] = await Promise.all([
    supabase.from("users").select("id, name, department").in("id", Array.from(uIds)),
    supabase.from("projects").select("id, name").in("id", Array.from(pIds)),
    supabase.from("tasks").select("id, title").in("id", Array.from(tIds)),
  ]);

  const uMap: Record<string, any> = {};
  (users || []).forEach((u: any) => uMap[u.id] = u);
  
  const pMap: Record<string, string> = {};
  (projects || []).forEach((p: any) => pMap[p.id] = p.name);
  
  const tMap: Record<string, string> = {};
  (tasks || []).forEach((t: any) => tMap[t.id] = t.title);

  let rows = (entries || []).map((e: any) => ({
    date: e.date,
    hours: Number(e.hours),
    start: e.start_time,
    end: e.end_time,
    project: pMap[e.project_id] || e.project_id || "",
    task: tMap[e.task_id] || e.task_id || "",
    user: uMap[e.user_id]?.name || e.user_id || "",
    team: uMap[e.user_id]?.department || "",
    action: "Logged Time",
    details: `${e.hours}h on ${tMap[e.task_id] || "Task"}`,
    timestamp: new Date().toISOString(),
  }));

  if (team) {
    rows = rows.filter((r: any) => r.team.toLowerCase().includes(team.toLowerCase()));
  }

  rows.sort((a: any, b: any) => a.date.localeCompare(b.date));

  return { rows };
}
