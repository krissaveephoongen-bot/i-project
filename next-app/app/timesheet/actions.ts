"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { TimeEntry, EntryStatus, WorkType, WeeklyData, ActivityData } from "./types";

// ============================================================================
// PROJECTS & TASKS
// ============================================================================

export async function getTimesheetProjectsAction(userId: string) {
  const supabase = createClient(cookies());

  // 1. Get active projects
  const { data: projects, error: projError } = await supabase
    .from("projects")
    .select("id, name, code, status")
    .neq("status", "Completed")
    .neq("status", "Cancelled")
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
      .select("id, title, project_id, status") // project_id is likely snake_case in tasks table based on schema
      .in("project_id", projectIds)
      .neq("status", "completed")
      .neq("status", "cancelled");
      
    // Fallback if project_id is projectId
    if (taskError) {
       const { data: t2 } = await supabase
        .from("tasks")
        .select("id, title, projectId, status")
        .in("projectId", projectIds)
        .neq("status", "completed")
        .neq("status", "cancelled");
       tasks = t2 || [];
    } else {
       tasks = t || [];
    }
  }

  // 3. Map tasks to projects
  const tasksMap: Record<string, Array<{ id: string; name: string }>> = {};
  for (const t of tasks) {
    const name = t.title || t.id;
    // Handle both snake and camel case
    const pid = t.project_id || t.projectId;
    if (pid) {
      if (!tasksMap[pid]) tasksMap[pid] = [];
      tasksMap[pid].push({ id: t.id, name });
    }
  }

  // 4. Construct response
  return (projects || []).map((p: any) => ({
    id: p.id,
    name: p.name || p.code || "Untitled Project",
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
    startTime: dbEntry.start_time || dbEntry.startTime || "",
    endTime: dbEntry.end_time || dbEntry.endTime || null,
    breakDuration: dbEntry.break_duration || dbEntry.breakDuration || 0,
    workType: (dbEntry.work_type || dbEntry.workType || dbEntry.activity_type || WorkType.PROJECT) as WorkType,
    projectId: dbEntry.project_id || dbEntry.projectId || null,
    taskId: dbEntry.task_id || dbEntry.taskId || null,
    userId: dbEntry.user_id || dbEntry.userId || "",
    hours: Number(dbEntry.hours || 0),
    billableHours: Number(dbEntry.billable_hours || dbEntry.billableHours || 0),
    description: dbEntry.description || "",
    status: (dbEntry.status || EntryStatus.PENDING) as EntryStatus,
    approvedBy: dbEntry.approved_by || dbEntry.approvedBy || null,
    approvedAt: dbEntry.approved_at || dbEntry.approvedAt || null,
    rejectedReason: dbEntry.rejected_reason || dbEntry.rejectedReason || null,
    createdAt: dbEntry.created_at || dbEntry.createdAt || new Date().toISOString(),
    updatedAt: dbEntry.updated_at || dbEntry.updatedAt || new Date().toISOString(),
  };
}

export async function getTimesheetEntriesAction(userId: string, start: string, end: string, projectIds?: string[]) {
  const supabase = createClient(cookies());

  // Try querying 'time_entries' with camelCase columns first (as per schema)
  let query = supabase
    .from("time_entries")
    .select("*")
    .eq("userId", userId)
    .gte("date", start)
    .lte("date", end);

  if (projectIds && projectIds.length > 0) {
    query = query.in("projectId", projectIds);
  }

  const { data, error } = await query.order("date", { ascending: true });

  if (error) {
    console.error("Error fetching time_entries (camelCase):", error);
    // Fallback? No, assuming schema is correct with "userId"
    return [];
  }

  return (data || []).map(mapDbToTimeEntry);
}

export async function createTimesheetEntryAction(entry: Partial<TimeEntry>) {
  const supabase = createClient(cookies());
  
  const payload: any = {
    userId: entry.userId,
    projectId: entry.projectId || null,
    taskId: entry.taskId || null,
    date: entry.date,
    hours: Number(entry.hours || 0),
    startTime: entry.startTime || null,
    endTime: entry.endTime || null,
    description: entry.description || null,
    workType: entry.workType || "project",
    billableHours: entry.billableHours || 0,
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Using "time_entries" with camelCase columns
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
    updatedAt: new Date().toISOString(),
  };

  if (entry.hours !== undefined) payload.hours = Number(entry.hours);
  if (entry.taskId !== undefined) payload.taskId = entry.taskId;
  if (entry.startTime !== undefined) payload.startTime = entry.startTime;
  if (entry.endTime !== undefined) payload.endTime = entry.endTime;
  if (entry.description !== undefined) payload.description = entry.description;
  if (entry.workType !== undefined) payload.workType = entry.workType;
  if (entry.projectId !== undefined) payload.projectId = entry.projectId;
  
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
  // timesheet_submissions uses snake_case
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
    .select("userId, date, hours, projectId")
    .gte("date", days[0])
    .lte("date", days[6]);

  if (projectId && projectId !== "all") {
    query = query.eq("projectId", projectId);
  }

  const { data: entries } = await query;
  const filtered = entries || [];

  // Fetch Users
  const userIds = Array.from(new Set(filtered.map((e: any) => e.userId)));
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
    const key = r.userId;
    if (!map.has(key)) {
      map.set(key, {
        userId: r.userId,
        name: usersMap[r.userId] || r.userId,
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
    entries: [], // Not needed for summary view
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
    .select("date, hours, startTime, endTime, projectId, taskId, userId")
    .gte("date", days[0])
    .lte("date", days[6]);

  if (userId && userId !== "all") query = query.eq("userId", userId);
  if (projectId && projectId !== "all") query = query.eq("projectId", projectId);

  const { data: entries, error } = await query;
  if (error) return { rows: [] };

  // Collect IDs
  const uIds = new Set<string>();
  const pIds = new Set<string>();
  const tIds = new Set<string>();
  
  for (const e of entries || []) {
    if (e.userId) uIds.add(e.userId);
    if (e.projectId) pIds.add(e.projectId);
    if (e.taskId) tIds.add(e.taskId);
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
    start: e.startTime,
    end: e.endTime,
    project: pMap[e.projectId] || e.projectId || "",
    task: tMap[e.taskId] || e.taskId || "",
    user: uMap[e.userId]?.name || e.userId || "",
    team: uMap[e.userId]?.department || "",
    action: "Logged Time",
    details: `${e.hours}h on ${tMap[e.taskId] || "Task"}`,
    timestamp: new Date().toISOString(), // Mock timestamp for now
  }));

  if (team) {
    rows = rows.filter((r: any) => r.team.toLowerCase().includes(team.toLowerCase()));
  }

  // Sort
  rows.sort((a: any, b: any) => a.date.localeCompare(b.date));

  return { rows };
}
