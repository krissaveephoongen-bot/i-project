import { supabase } from "../supabaseClient";

export interface WeeklySummary {
  hoursWorked: number;
  tasksCompleted: number;
  meetingsAttended: number;
}

export class WeeklySummaryService {
  // Get weekly summary for current user
  static async getWeeklySummary(userId?: string): Promise<WeeklySummary> {
    try {
      // Get current week's start and end dates
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // End of week (Saturday)
      endOfWeek.setHours(23, 59, 59, 999);

      const startDate = startOfWeek.toISOString().split("T")[0];
      const endDate = endOfWeek.toISOString().split("T")[0];

      // Get current user if not provided
      let currentUserId = userId;
      if (!currentUserId) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          throw new Error("User not authenticated");
        }
        currentUserId = user.id;
      }

      // Calculate hours worked from timesheets
      const { data: timesheets, error: timesheetsError } = await supabase
        .from("time_entries")
        .select("hours")
        .eq("userId", currentUserId)
        .gte("date", startDate)
        .lte("date", endDate);

      if (timesheetsError) {
        console.error("Error fetching timesheets:", timesheetsError);
        throw new Error("Failed to fetch timesheets");
      }

      const hoursWorked =
        timesheets && Array.isArray(timesheets)
          ? timesheets.reduce((total, timesheet) => {
              const hours =
                typeof timesheet.hours === "number" ? timesheet.hours : 0;
              return total + hours;
            }, 0)
          : 0;

      // Count completed tasks
      const { data: tasks, error: tasksError } = await supabase
        .from("tasks")
        .select("id")
        .eq("assignedTo", currentUserId)
        .eq("status", "completed")
        .gte("updatedAt", startOfWeek.toISOString())
        .lte("updatedAt", endOfWeek.toISOString());

      if (tasksError) {
        console.error("Error fetching tasks:", tasksError);
        throw new Error("Failed to fetch tasks");
      }

      const tasksCompleted = tasks?.length || 0;

      // For meetings attended, we'll check activity_log for meeting-related activities
      // This is a placeholder - you might want to add a specific field or table for meetings
      const { data: meetings, error: meetingsError } = await supabase
        .from("activity_log")
        .select("id")
        .eq("userId", currentUserId)
        .ilike("action", "%meeting%")
        .gte("createdAt", startOfWeek.toISOString())
        .lte("createdAt", endOfWeek.toISOString());

      if (meetingsError) {
        console.error("Error fetching meetings:", meetingsError);
        // Don't throw error for meetings, just set to 0
      }

      const meetingsAttended = meetings?.length || 0;

      return {
        hoursWorked,
        tasksCompleted,
        meetingsAttended,
      };
    } catch (error) {
      console.error("Error getting weekly summary:", error);
      throw error;
    }
  }

  // Get weekly summary for a specific date range
  static async getWeeklySummaryForRange(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<WeeklySummary> {
    try {
      // Calculate hours worked from timesheets
      const { data: timesheets, error: timesheetsError } = await supabase
        .from("time_entries")
        .select("hours")
        .eq("userId", userId)
        .gte("date", startDate)
        .lte("date", endDate);

      if (timesheetsError) {
        console.error("Error fetching timesheets:", timesheetsError);
        throw new Error("Failed to fetch timesheets");
      }

      const hoursWorked =
        timesheets && Array.isArray(timesheets)
          ? timesheets.reduce((total, timesheet) => {
              const hours =
                typeof timesheet.hours === "number" ? timesheet.hours : 0;
              return total + hours;
            }, 0)
          : 0;

      // Count completed tasks
      const { data: tasks, error: tasksError } = await supabase
        .from("tasks")
        .select("id")
        .eq("assignedTo", userId)
        .eq("status", "completed")
        .gte("updatedAt", startDate + "T00:00:00.000Z")
        .lte("updatedAt", endDate + "T23:59:59.999Z");

      if (tasksError) {
        console.error("Error fetching tasks:", tasksError);
        throw new Error("Failed to fetch tasks");
      }

      const tasksCompleted = tasks?.length || 0;

      // For meetings attended, we'll check activity_log for meeting-related activities
      const { data: meetings, error: meetingsError } = await supabase
        .from("activity_log")
        .select("id")
        .eq("userId", userId)
        .ilike("action", "%meeting%")
        .gte("createdAt", startDate + "T00:00:00.000Z")
        .lte("createdAt", endDate + "T23:59:59.999Z");

      if (meetingsError) {
        console.error("Error fetching meetings:", meetingsError);
        // Don't throw error for meetings, just set to 0
      }

      const meetingsAttended = meetings?.length || 0;

      return {
        hoursWorked,
        tasksCompleted,
        meetingsAttended,
      };
    } catch (error) {
      console.error("Error getting weekly summary for range:", error);
      throw error;
    }
  }
}
