import React from "react";
import { Activity } from "lucide-react";
import type { ActivityEntry } from "../types";

interface RecentActivitiesCardProps {
  activities: ActivityEntry[];
}

function RecentActivitiesCard({ activities }: RecentActivitiesCardProps) {
  return (
    <div className="bg-card text-card-foreground rounded-2xl shadow-sm border border-border p-6 flex flex-col hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold">กิจกรรมล่าสุด</h3>
        <Activity
          className="w-5 h-5 text-muted-foreground"
          aria-hidden="true"
        />
      </div>
      <div
        className="flex-1 overflow-y-auto space-y-6 pr-2 max-h-[400px]"
        role="feed"
        aria-label="กิจกรรมล่าสุด"
      >
        {activities.map((act) => (
          <article key={act.id} className="flex gap-4 group">
            <div
              className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                act.type === "audit"
                  ? "bg-purple-500"
                  : act.type === "timesheet"
                    ? "bg-blue-500"
                    : "bg-green-500"
              }`}
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-medium group-hover:text-blue-600 transition-colors line-clamp-1">
                {act.title}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {act.description}
              </p>
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <span className="font-medium">{act.user}</span>
                <span aria-hidden="true">•</span>
                <time dateTime={act.date}>
                  {new Date(act.date).toLocaleDateString()}
                </time>
              </div>
            </div>
          </article>
        ))}
        {activities.length === 0 && (
          <div
            className="text-center text-muted-foreground py-8 text-sm"
            role="status"
          >
            ไม่มีกิจกรรมล่าสุด
          </div>
        )}
      </div>
    </div>
  );
}

export default React.memo(RecentActivitiesCard);
