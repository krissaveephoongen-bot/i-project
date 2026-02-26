import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { ActivityLog, User } from "../types/database.types";

export function useActivity() {
  const [activities, setActivities] = useState<
    (ActivityLog & { user: User | null })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        // For now, we'll fetch from activity_log table
        // In a real implementation, you might want to create a view or function
        // that combines data from multiple tables for a richer activity feed
        const { data, error: fetchError } = await supabase
          .from("activity_log")
          .select(
            `
            *,
            user:users(id, name, email)
          `,
          )
          .order("created_at", { ascending: false })
          .limit(10);

        if (fetchError) {
          console.error("Error fetching activities:", fetchError);
          // Fallback to empty array if table doesn't exist or no access
          setActivities([]);
        } else {
          setActivities(data as (ActivityLog & { user: User | null })[]);
        }
        setError(null);
      } catch (err) {
        setError("Failed to fetch activities");
        console.error("Error fetching activities:", err);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const refreshActivities = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("activity_log")
        .select(
          `
          *,
          user:users(id, name, email)
        `,
        )
        .order("created_at", { ascending: false })
        .limit(10);

      if (fetchError) {
        console.error("Error refreshing activities:", fetchError);
        setActivities([]);
      } else {
        setActivities(data as (ActivityLog & { user: User | null })[]);
      }
      setError(null);
    } catch (err) {
      setError("Failed to refresh activities");
      console.error("Error refreshing activities:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format activity for display
  const formatActivity = (activity: ActivityLog & { user: User | null }) => {
    const actionText =
      {
        create: "สร้าง",
        update: "อัปเดต",
        delete: "ลบ",
        complete: "เสร็จสิ้น",
      }[activity.action] || activity.action;

    const entityText =
      {
        project: "โปรเจกต์",
        task: "งาน",
        timesheet: "Timesheet",
        comment: "ความคิดเห็น",
      }[activity.entity_type] || activity.entity_type;

    return {
      id: activity.id,
      user: activity.user?.name || "ไม่ทราบชื่อ",
      action: actionText,
      target: `${entityText}: ${activity.description || activity.entity_id}`,
      time: formatRelativeTime(activity.created_at),
      type: `${activity.entity_type}_${activity.action}`,
      raw: activity,
    };
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return "เมื่อสักครู่";
    if (diffInHours < 24) return `${diffInHours} ชั่วโมงที่แล้ว`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} วันที่แล้ว`;
    return date.toLocaleDateString("th-TH");
  };

  const formattedActivities = activities.map(formatActivity);

  return {
    activities: formattedActivities,
    loading,
    error,
    refreshActivities,
    formatActivity,
  };
}
