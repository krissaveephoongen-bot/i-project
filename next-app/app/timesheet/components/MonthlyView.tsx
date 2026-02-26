"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, MoreHorizontal } from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { Project, TimesheetEntry } from "../types";
import { useThaiLocale } from "@/lib/hooks/useThaiLocale";

interface MonthlyViewProps {
  currentMonth: Date;
  projects: Project[];
  entries: TimesheetEntry[];
  isEditing: boolean;
  canEdit: boolean;
  onOpenDayEditor: (
    projectId: string,
    day: number,
    taskId?: string | null,
  ) => void;
}

export default function MonthlyView({
  currentMonth,
  projects,
  entries,
  isEditing,
  canEdit,
  onOpenDayEditor,
}: MonthlyViewProps) {
  const { formatNumber } = useThaiLocale();
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(
    new Set(),
  );

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: days }, (_, i) => i + 1);
  }, [currentMonth]);

  // Optimize: Pre-calculate hours map for O(1) lookup
  const hoursMap = useMemo(() => {
    const map = new Map<string, number>();
    const projectTotalMap = new Map<string, number>();
    const dailyTotalMap = new Map<string, number>();

    entries.forEach((e) => {
      // Key for specific cell: Project-Task-Date
      const cellKey = `${e.projectId}-${e.taskId || "adhoc"}-${e.date}`;
      map.set(cellKey, (map.get(cellKey) || 0) + e.hours);

      // Key for project total: Project-Date
      const projKey = `${e.projectId}-${e.date}`;
      projectTotalMap.set(
        projKey,
        (projectTotalMap.get(projKey) || 0) + e.hours,
      );

      // Key for daily total: Date
      dailyTotalMap.set(e.date, (dailyTotalMap.get(e.date) || 0) + e.hours);
    });

    return { map, projectTotalMap, dailyTotalMap };
  }, [entries]);

  const toggleExpand = (projectId: string) => {
    const newSet = new Set(expandedProjects);
    if (newSet.has(projectId)) {
      newSet.delete(projectId);
    } else {
      newSet.add(projectId);
    }
    setExpandedProjects(newSet);
  };

  const getCellHours = (
    projectId: string,
    day: number,
    taskId?: string | null,
  ) => {
    const dateStr = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day,
    )
      .toISOString()
      .split("T")[0];
    const key = `${projectId}-${taskId || "adhoc"}-${dateStr}`;
    return hoursMap.map.get(key) || 0;
  };

  const getProjectDayTotal = (projectId: string, day: number) => {
    const dateStr = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day,
    )
      .toISOString()
      .split("T")[0];
    const key = `${projectId}-${dateStr}`;
    return hoursMap.projectTotalMap.get(key) || 0;
  };

  const getDailyTotal = (day: number) => {
    const dateStr = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day,
    )
      .toISOString()
      .split("T")[0];
    return hoursMap.dailyTotalMap.get(dateStr) || 0;
  };

  const grandTotal = useMemo(() => {
    return Array.from(hoursMap.dailyTotalMap.values()).reduce(
      (a, b) => a + b,
      0,
    );
  }, [hoursMap]);

  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
              <TableHead className="w-[280px] bg-slate-50 sticky left-0 z-20 font-semibold text-slate-700">
                โครงการ / งาน (Project / Task)
              </TableHead>
              {daysInMonth.map((day) => (
                <TableHead
                  key={day}
                  className="text-center w-12 px-1 text-xs font-medium text-slate-500"
                >
                  {day}
                </TableHead>
              ))}
              <TableHead className="text-center bg-slate-50 font-bold text-slate-700 min-w-[60px]">
                รวม
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => {
              const projectTotal = daysInMonth.reduce(
                (sum, day) => sum + getProjectDayTotal(project.id, day),
                0,
              );
              const isExpanded = expandedProjects.has(project.id);
              const projectTasks = project.tasks || [];

              return (
                <>
                  <TableRow
                    key={project.id}
                    className="bg-slate-50/30 hover:bg-slate-100 transition-colors group"
                  >
                    <TableCell className="sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-r group-hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-2 py-1">
                        <button
                          onClick={() => toggleExpand(project.id)}
                          className="p-1 hover:bg-slate-200 rounded text-slate-400 transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-white shadow-sm"
                          style={{ backgroundColor: project.color }}
                        />
                        <Link
                          href={`/projects/${project.id}`}
                          className="font-semibold text-slate-900 hover:text-blue-600 transition-colors truncate max-w-[180px]"
                        >
                          {project.name}
                        </Link>
                      </div>
                    </TableCell>
                    {daysInMonth.map((day) => {
                      const daySum = getProjectDayTotal(project.id, day);

                      return (
                        <TableCell
                          key={day}
                          className="p-1 text-center border-r border-slate-50 bg-slate-50/10"
                        >
                          {isEditing && canEdit ? (
                            <div
                              onClick={() => onOpenDayEditor(project.id, day)}
                              className={`
                                 h-8 w-full min-w-[2rem] rounded-lg flex items-center justify-center cursor-pointer text-xs font-bold transition-all
                                 ${daySum > 0 ? "bg-blue-100 text-blue-700 hover:bg-blue-200 shadow-sm" : "hover:bg-slate-100 text-slate-300"}
                               `}
                            >
                              {daySum > 0
                                ? formatNumber(daySum, {
                                    maximumFractionDigits: 1,
                                  })
                                : "+"}
                            </div>
                          ) : (
                            <span
                              className={`text-sm ${daySum > 0 ? "font-bold text-slate-900" : "text-slate-200"}`}
                            >
                              {daySum > 0
                                ? formatNumber(daySum, {
                                    maximumFractionDigits: 1,
                                  })
                                : "-"}
                            </span>
                          )}
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-center font-bold text-slate-900 bg-slate-50 border-l">
                      {projectTotal > 0
                        ? formatNumber(projectTotal, {
                            maximumFractionDigits: 1,
                          })
                        : "-"}
                    </TableCell>
                  </TableRow>

                  {isExpanded && (
                    <>
                      {projectTasks.map((task) => {
                        const taskTotal = daysInMonth.reduce(
                          (sum, day) =>
                            sum + getCellHours(project.id, day, task.id),
                          0,
                        );

                        return (
                          <TableRow
                            key={`${project.id}-${task.id}`}
                            className="hover:bg-slate-50 transition-colors"
                          >
                            <TableCell className="sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-r pl-10">
                              <div className="flex items-center gap-2 text-sm text-slate-600 truncate max-w-[200px]">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                {task.name}
                              </div>
                            </TableCell>
                            {daysInMonth.map((day) => {
                              const daySum = getCellHours(
                                project.id,
                                day,
                                task.id,
                              );

                              return (
                                <TableCell
                                  key={day}
                                  className="p-1 text-center border-r border-slate-50"
                                >
                                  {isEditing && canEdit ? (
                                    <div
                                      onClick={() =>
                                        onOpenDayEditor(
                                          project.id,
                                          day,
                                          task.id,
                                        )
                                      }
                                      className={`
                                                               h-7 w-full min-w-[2rem] rounded-md flex items-center justify-center cursor-pointer text-xs transition-colors
                                                               ${daySum > 0 ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100" : "hover:bg-slate-50 text-transparent hover:text-slate-400"}
                                                           `}
                                    >
                                      {daySum > 0
                                        ? formatNumber(daySum, {
                                            maximumFractionDigits: 1,
                                          })
                                        : "+"}
                                    </div>
                                  ) : (
                                    <span
                                      className={`text-xs ${daySum > 0 ? "text-slate-600" : "text-slate-200"}`}
                                    >
                                      {daySum > 0
                                        ? formatNumber(daySum, {
                                            maximumFractionDigits: 1,
                                          })
                                        : "-"}
                                    </span>
                                  )}
                                </TableCell>
                              );
                            })}
                            <TableCell className="text-center text-xs font-medium text-slate-500 bg-slate-50/50 border-l">
                              {taskTotal > 0
                                ? formatNumber(taskTotal, {
                                    maximumFractionDigits: 1,
                                  })
                                : ""}
                            </TableCell>
                          </TableRow>
                        );
                      })}

                      <TableRow
                        key={`${project.id}-adhoc`}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <TableCell className="sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-r pl-10">
                          <div className="flex items-center gap-2 text-sm text-slate-500 italic truncate max-w-[200px]">
                            <MoreHorizontal className="w-3 h-3" />
                            งานอื่นๆ (Ad-hoc)
                          </div>
                        </TableCell>
                        {daysInMonth.map((day) => {
                          const daySum = getCellHours(project.id, day, null);

                          return (
                            <TableCell
                              key={day}
                              className="p-1 text-center border-r border-slate-50"
                            >
                              {isEditing && canEdit ? (
                                <div
                                  onClick={() =>
                                    onOpenDayEditor(project.id, day, null)
                                  }
                                  className={`
                                                       h-7 w-full min-w-[2rem] rounded-md flex items-center justify-center cursor-pointer text-xs transition-colors
                                                       ${daySum > 0 ? "bg-orange-50 text-orange-600 hover:bg-orange-100" : "hover:bg-slate-50 text-transparent hover:text-slate-400"}
                                                   `}
                                >
                                  {daySum > 0
                                    ? formatNumber(daySum, {
                                        maximumFractionDigits: 1,
                                      })
                                    : "+"}
                                </div>
                              ) : (
                                <span
                                  className={`text-xs ${daySum > 0 ? "text-slate-600" : "text-slate-200"}`}
                                >
                                  {daySum > 0
                                    ? formatNumber(daySum, {
                                        maximumFractionDigits: 1,
                                      })
                                    : "-"}
                                </span>
                              )}
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-center text-xs font-medium text-slate-500 bg-slate-50/50 border-l">
                          {daysInMonth.reduce(
                            (sum, day) =>
                              sum + getCellHours(project.id, day, null),
                            0,
                          ) > 0
                            ? formatNumber(
                                daysInMonth.reduce(
                                  (sum, day) =>
                                    sum + getCellHours(project.id, day, null),
                                  0,
                                ),
                                { maximumFractionDigits: 1 },
                              )
                            : ""}
                        </TableCell>
                      </TableRow>
                    </>
                  )}
                </>
              );
            })}
            {/* Daily Totals Row */}
            <TableRow className="bg-slate-50 font-bold border-t-2 border-slate-200">
              <TableCell className="sticky left-0 bg-slate-50 z-10 text-slate-700">
                รวมรายวัน (Daily Total)
              </TableCell>
              {daysInMonth.map((day) => {
                const dayTotal = getDailyTotal(day);
                return (
                  <TableCell
                    key={day}
                    className="text-center text-xs text-slate-700"
                  >
                    {dayTotal > 0
                      ? formatNumber(dayTotal, { maximumFractionDigits: 1 })
                      : "-"}
                  </TableCell>
                );
              })}
              <TableCell className="text-center text-blue-600 text-lg">
                {formatNumber(grandTotal, { maximumFractionDigits: 1 })}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
