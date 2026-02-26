import React from "react";
import { CheckCircle, Clock, AlertTriangle, Calendar } from "lucide-react";
import type { DashboardSummary } from "../types";

interface DashboardStatusProps {
  summary: DashboardSummary;
}

function DashboardStatus({ summary }: DashboardStatusProps) {
  const items = [
    {
      label: "โครงการเสร็จสิ้น",
      value: summary.completedProjects,
      icon: CheckCircle,
      color: "bg-green-50 dark:bg-green-950/30",
      iconColor: "text-green-600",
    },
    {
      label: "กำลังดำเนินการ",
      value: summary.inProgressProjects,
      icon: Clock,
      color: "bg-blue-50 dark:bg-blue-950/30",
      iconColor: "text-blue-600",
    },
    {
      label: "ความเสี่ยงสูง",
      value: summary.highRisks,
      icon: AlertTriangle,
      color: "bg-red-50 dark:bg-red-950/30",
      iconColor: "text-red-600",
    },
    {
      label: "งวดงานล่าช้า",
      value: summary.overdueMilestones,
      icon: Calendar,
      color: "bg-orange-50 dark:bg-orange-950/30",
      iconColor: "text-orange-600",
    },
  ];

  return (
    <section
      aria-label="สรุปสถานะโครงการ"
      className="grid grid-cols-2 lg:grid-cols-4 gap-4 gap-y-6"
    >
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-card text-card-foreground p-4 rounded-xl border border-border shadow-sm flex items-center gap-4 hover:shadow-md transition-all"
        >
          <div
            className={`w-12 h-12 rounded-full ${item.color} flex items-center justify-center animate-pulse-slow`}
            aria-hidden="true"
          >
            <item.icon className={`w-6 h-6 ${item.iconColor}`} />
          </div>
          <div>
            <p className="text-2xl font-bold">{item.value}</p>
            <p className="text-sm text-muted-foreground">{item.label}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

export default React.memo(DashboardStatus);
