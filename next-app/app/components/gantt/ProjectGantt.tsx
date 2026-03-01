"use client";

import { useState } from "react";
import {
  Gantt,
  Task as GanttTask,
  ViewMode,
  EventOption,
} from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Task } from "../../../lib/tasks";

interface ProjectGanttProps {
  tasks: Task[];
}

export default function ProjectGantt({ tasks }: ProjectGanttProps) {
  const [view, setView] = useState<ViewMode>(ViewMode.Day);
  const [isChecked, setIsChecked] = useState(true);

  // Transform tasks to Gantt format
  const ganttTasks: GanttTask[] = tasks.map((task) => {
    const start = task.startDate ? new Date(task.startDate) : new Date();
    const end = task.endDate
      ? new Date(task.endDate)
      : new Date(start.getTime() + 86400000);

    // Ensure end date is after start date
    if (end <= start) {
      end.setDate(start.getDate() + 1);
    }

    return {
      start,
      end,
      name: task.title || `Task ${task.id}`, // Fallback to ID
      id: task.id,
      type: "task",
      progress: task.progressActual || 0,
      isDisabled: true, // Read-only for now
      styles: {
        progressColor: task.status === "Completed" ? "#22c55e" : "#3b82f6",
        progressSelectedColor:
          task.status === "Completed" ? "#16a34a" : "#2563eb",
        backgroundColor: task.status === "Completed" ? "#dcfce7" : "#dbeafe",
        backgroundSelectedColor:
          task.status === "Completed" ? "#bbf7d0" : "#bfdbfe",
      },
    };
  });

  if (ganttTasks.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
        ไม่มีข้อมูลงานสำหรับแสดง Gantt Chart
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end space-x-2">
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${view === ViewMode.Day ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700"}`}
            onClick={() => setView(ViewMode.Day)}
          >
            วัน
          </button>
          <button
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${view === ViewMode.Week ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700"}`}
            onClick={() => setView(ViewMode.Week)}
          >
            สัปดาห์
          </button>
          <button
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${view === ViewMode.Month ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700"}`}
            onClick={() => setView(ViewMode.Month)}
          >
            เดือน
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm p-2">
        <Gantt
          tasks={ganttTasks}
          viewMode={view}
          locale="th"
          listCellWidth={isChecked ? "155px" : ""}
          columnWidth={view === ViewMode.Month ? 300 : 65}
          barFill={60}
          ganttHeight={500}

          // Customizing the header
          //   headerHeight={60}
          //   fontFamily="Sarabun, sans-serif"
          //   fontSize="14px"
          //   rowHeight={50}
          //   barCornerRadius={4}
        />
      </div>
    </div>
  );
}
