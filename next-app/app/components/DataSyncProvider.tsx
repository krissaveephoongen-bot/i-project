"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/app/lib/supabaseClient";

export default function DataSyncProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const qc = useQueryClient();
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  useEffect(() => {
    if (!supabase) return;

    try {
      const channel = supabase
        .channel("table-changes", {
          config: {
            broadcast: { self: false },
            presence: { key: "user" },
            ack: true,
          },
        })
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "projects" },
          (payload: any) => {
            qc.invalidateQueries({ queryKey: ["projects"] });
            qc.invalidateQueries({ queryKey: ["clients"] });
            qc.invalidateQueries({ queryKey: ["dashboard"] });
          },
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "tasks" },
          (payload: any) => {
            qc.invalidateQueries({ queryKey: ["tasks"] });
            qc.invalidateQueries({ queryKey: ["reports"] });
            qc.invalidateQueries({ queryKey: ["approvals:timesheets"] });
          },
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "time_entries" },
          (payload: any) => {
            qc.invalidateQueries({ queryKey: ["approvals:timesheets"] });
            qc.invalidateQueries({ queryKey: ["reports"] });
            qc.invalidateQueries({ queryKey: ["dashboard"] });
          },
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "expenses" },
          (payload: any) => {
            qc.invalidateQueries({ queryKey: ["approvals:expenses"] });
            qc.invalidateQueries({ queryKey: ["reports"] });
          },
        )
        .subscribe((status: any) => {
          if (status === "SUBSCRIBED") {
            setRealtimeConnected(true);
            console.log("✓ Realtime connected");
          } else if (status === "CHANNEL_ERROR") {
            setRealtimeConnected(false);
            console.warn("⚠️ Realtime channel error - will use polling");
          } else if (status === "TIMED_OUT") {
            setRealtimeConnected(false);
            console.warn("⚠️ Realtime connection timed out - will use polling");
          }
        });

      return () => {
        channel.unsubscribe().then(() => {
          supabase.removeChannel(channel);
        });
      };
    } catch (error) {
      console.error("Failed to setup realtime subscription:", error);
      setRealtimeConnected(false);
    }
  }, [qc]);

  return <>{children}</>;
}
