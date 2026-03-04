"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { TimeEntry, EntryStatus, WorkType, WeeklyData, ActivityData } from "./types";

// Direct PostgreSQL connection
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ============================================================================
// PROJECTS & TASKS
// ============================================================================

export async function getTimesheetProjectsAction(userId: string) {
  try {
    console.log('Fetching projects directly from database...');
    
    // Get active projects
    const projectsQuery = `
      SELECT id, name, status, code
      FROM projects 
      WHERE status = 'Active' AND is_archived = false
      ORDER BY name
    `;
    
    const projectsResult = await pool.query(projectsQuery);
    const projects = projectsResult.rows;
    
    console.log('Projects found:', projects.length);

    // Get active tasks for these projects
    const projectIds = projects.map((p: any) => p.id);
    let tasks = [];
    
    if (projectIds.length > 0) {
      const tasksQuery = `
        SELECT id, title, project_id, status 
        FROM tasks 
        WHERE project_id = ANY($1) 
        AND status = 'Active'
      `;
      
      const tasksResult = await pool.query(tasksQuery, [projectIds]);
      tasks = tasksResult.rows;
      
      console.log('Tasks found:', tasks.length);
    }

    // Map tasks to projects
    const tasksMap: Record<string, Array<{ id: string; name: string }>> = {};
    for (const t of tasks) {
      const name = t.title || t.id;
      const pid = t.project_id;
      if (pid) {
        if (!tasksMap[pid]) tasksMap[pid] = [];
        tasksMap[pid].push({ id: t.id, name });
      }
    }

    // Construct response
    return projects.map((p: any) => ({
      id: p.id,
      name: p.name || "Untitled Project",
      code: p.code,
      is_billable: false,
      tasks: tasksMap[p.id] || [],
    }));
    
  } catch (error) {
    console.error("Error in getTimesheetProjectsAction:", error);
    return [];
  }
}

// ============================================================================
// TIMESHEET ENTRIES (using original Supabase client for now)
// ============================================================================

import { createClient } from "@/utils/supabase/server";

function mapDbToTimeEntry(dbEntry: any) {
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
  
  const payload = {
    user_id: entry.userId,
    project_id: entry.projectId || null,
    task_id: entry.taskId || null,
    date: entry.date,
    hours: Number(entry.hours || 0),
    start_time: entry.startTime || null,
    end_time: entry.endTime || null,
    description: entry.description || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
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
