import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

// Define a generic type for table names
type TableName = string;

export function useSupabaseData<T extends Record<string, any>>(
  table: TableName,
  options?: {
    select?: string;
    filter?: any;
    orderBy?: { column: any; ascending?: boolean };
    limit?: number;
    realTime?: boolean;
  },
) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();

    if (options?.realTime) {
      try {
        const channel = supabase
          .channel(`${table}-changes`)
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: table as string },
            (payload) => {
              if (payload.eventType === "INSERT") {
                setData((prev) =>
                  prev ? [...prev, payload.new as T] : [payload.new as T],
                );
              } else if (payload.eventType === "UPDATE") {
                setData((prev) =>
                  prev
                    ? prev.map((item) =>
                        (item as any).id === payload.new.id
                          ? (payload.new as T)
                          : item,
                      )
                    : [payload.new as T],
                );
              } else if (payload.eventType === "DELETE") {
                setData((prev) =>
                  prev
                    ? prev.filter((item) => (item as any).id !== payload.old.id)
                    : [],
                );
              }
            },
          )
          .subscribe((status) => {
            if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
              console.warn(
                `⚠️ Realtime subscription failed for ${table}:`,
                status,
              );
              // Fall back to polling - data is already loaded, just won't get live updates
            }
          });

        return () => {
          channel.unsubscribe().then(() => {
            supabase.removeChannel(channel);
          });
        };
      } catch (error) {
        console.warn(`Failed to setup realtime for ${table}:`, error);
        // Data loading already happened, realtime is just a nice-to-have
      }
    }
  }, [
    table,
    options?.filter,
    options?.orderBy,
    options?.limit,
    options?.realTime,
  ]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from(table).select(options?.select || "*");

      if (options?.filter) {
        Object.entries(options.filter).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }

      if (options?.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? true,
        });
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setData(data as unknown as T[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const insert = async (newData: Partial<T>) => {
    try {
      const { data, error } = await supabase
        .from(table)
        .insert(newData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as T;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to insert data",
      );
    }
  };

  const update = async (id: string, updates: Partial<T>) => {
    try {
      const { data, error } = await supabase
        .from(table)
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as T;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to update data",
      );
    }
  };

  const remove = async (id: string) => {
    try {
      const { error } = await supabase.from(table).delete().eq("id", id);

      if (error) {
        throw error;
      }

      return true;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to delete data",
      );
    }
  };

  const refetch = () => fetchData();

  return {
    data,
    loading,
    error,
    insert,
    update,
    remove,
    refetch,
  };
}

// Specific hooks for common tables
export function useTasks(userId?: string) {
  return useSupabaseData("tasks", {
    select: "*, projects(name)",
    filter: userId ? { assigned_to: userId } : undefined,
    orderBy: { column: "created_at", ascending: false },
    realTime: true,
  });
}

export function useProjects(userId?: string) {
  return useSupabaseData("projects", {
    select: "*, clients(name)",
    filter: userId ? { manager_id: userId } : undefined,
    orderBy: { column: "created_at", ascending: false },
    realTime: true,
  });
}

export function useTimesheets(userId?: string) {
  return useSupabaseData("timesheets", {
    select: "*, projects(name), tasks(title)",
    filter: userId ? { user_id: userId } : undefined,
    orderBy: { column: "date", ascending: false },
    realTime: true,
  });
}

export function useContacts(projectId?: string) {
  return useSupabaseData("contacts", {
    select: "*, clients(name)",
    filter: projectId ? { project_id: projectId } : undefined,
    orderBy: { column: "is_key_person", ascending: false },
    realTime: true,
  });
}

export function useTeamStructure(projectId?: string) {
  return useSupabaseData("team_structure", {
    select: "*, users(name, email, position, avatar)",
    filter: projectId
      ? { project_id: projectId, is_active: true }
      : { is_active: true },
    orderBy: { column: "level", ascending: true },
    realTime: true,
  });
}

export function useApprovalRequests() {
  return useSupabaseData("approval_requests", {
    select: "*, users(name, email), projects(name)",
    filter: { status: "pending" },
    orderBy: { column: "priority", ascending: false },
    realTime: true,
  });
}

export function useUsers() {
  return useSupabaseData("users", {
    orderBy: { column: "created_at", ascending: false },
    realTime: true,
  });
}
