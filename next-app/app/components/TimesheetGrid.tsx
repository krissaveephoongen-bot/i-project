"use client";

import { useState } from "react";
import { format, startOfWeek, addDays, isToday } from "date-fns";
import { th } from "date-fns/locale";
import { Plus, Save, X, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimesheetEntry {
  id?: string;
  date: string;
  taskId?: string;
  taskTitle?: string;
  hours: number;
  workType: string;
  status: "pending" | "approved" | "rejected";
  description?: string;
}

interface TimesheetGridProps {
  weekStart: Date;
  userId: string;
  projectId: string;
  entries: TimesheetEntry[];
  onEntriesChange?: (entries: TimesheetEntry[]) => void;
  onSubmit?: (entries: TimesheetEntry[]) => void;
  isLoading?: boolean;
  canEdit?: boolean;
}

const WORK_TYPES = [
  { value: "project", label: "Project Work", color: "bg-blue-100 text-blue-700" },
  { value: "office", label: "Office", color: "bg-gray-100 text-gray-700" },
  { value: "training", label: "Training", color: "bg-green-100 text-green-700" },
  { value: "leave", label: "Leave", color: "bg-red-100 text-red-700" },
  { value: "overtime", label: "Overtime", color: "bg-orange-100 text-orange-700" },
  { value: "non_billable", label: "Non-Billable", color: "bg-purple-100 text-purple-700" },
];

export default function TimesheetGrid({
  weekStart,
  userId,
  projectId,
  entries: initialEntries,
  onEntriesChange,
  onSubmit,
  isLoading = false,
  canEdit = true,
}: TimesheetGridProps) {
  const [entries, setEntries] = useState<TimesheetEntry[]>(initialEntries);
  const [isDirty, setIsDirty] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const totalHours = entries.reduce((sum, e) => sum + e.hours, 0);

  const handleHourChange = (date: string, hours: number) => {
    const dateStr = format(new Date(date), "yyyy-MM-dd");
    const existing = entries.find((e) => e.date === dateStr);

    let updated: TimesheetEntry[];
    if (existing) {
      if (hours === 0) {
        updated = entries.filter((e) => e.date !== dateStr);
      } else {
        updated = entries.map((e) =>
          e.date === dateStr ? { ...e, hours } : e
        );
      }
    } else if (hours > 0) {
      updated = [
        ...entries,
        {
          date: dateStr,
          hours,
          workType: "project",
          status: "pending",
        },
      ];
    } else {
      return;
    }

    setEntries(updated);
    setIsDirty(true);
    onEntriesChange?.(updated);
  };

  const getEntryForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return entries.find((e) => e.date === dateStr);
  };

  const getWorkTypeLabel = (workType: string) => {
    return WORK_TYPES.find((wt) => wt.value === workType)?.label || workType;
  };

  const handleSubmit = () => {
    onSubmit?.(entries);
    setIsDirty(false);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Weekly Timesheet</h3>
          <p className="text-sm text-gray-500 mt-1">
            {format(weekStart, "MMM dd", { locale: th })} -{" "}
            {format(addDays(weekStart, 6), "MMM dd, yyyy", { locale: th })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">{totalHours}</p>
          <p className="text-sm text-gray-500">total hours</p>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Task
              </th>
              {weekDays.map((date) => (
                <th
                  key={format(date, "yyyy-MM-dd")}
                  className={cn(
                    "px-4 py-3 text-center text-sm font-semibold",
                    isToday(date)
                      ? "bg-blue-50 text-blue-900"
                      : "text-gray-900"
                  )}
                >
                  <div className="font-medium">{format(date, "EEE", { locale: th })}</div>
                  <div className="text-xs text-gray-500">{format(date, "d/M")}</div>
                </th>
              ))}
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Existing entries rows */}
            {entries.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center">
                  <p className="text-gray-500">No timesheet entries. Add hours above.</p>
                </td>
              </tr>
            ) : (
              entries.map((entry) => {
                const workType = WORK_TYPES.find((wt) => wt.value === entry.workType);
                return (
                  <tr
                    key={entry.id || entry.date}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={cn(
                          "inline-flex px-2 py-1 rounded text-xs font-medium w-fit",
                          workType?.color
                        )}>
                          {getWorkTypeLabel(entry.workType)}
                        </span>
                        {entry.description && (
                          <p className="text-sm text-gray-600">{entry.description}</p>
                        )}
                      </div>
                    </td>
                    {weekDays.map((date) => {
                      const dateStr = format(date, "yyyy-MM-dd");
                      const isThisEntry = entry.date === dateStr;
                      return (
                        <td
                          key={dateStr}
                          className={cn(
                            "px-4 py-4 text-center",
                            isToday(date) && "bg-blue-50"
                          )}
                        >
                          {isThisEntry && (
                            <div className="flex items-center justify-center gap-1">
                              <span className="font-semibold text-gray-900">
                                {entry.hours}h
                              </span>
                              {entry.status === "approved" && (
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-4 py-4 text-center font-semibold text-gray-900">
                      {entry.hours}h
                    </td>
                  </tr>
                );
              })
            )}

            {/* Quick add row */}
            {canEdit && (
              <tr className="bg-blue-50 border-t-2 border-blue-200">
                <td colSpan={9} className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      Click on day columns to add hours
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {canEdit && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2 text-sm">
            {isDirty && (
              <div className="flex items-center gap-1 text-orange-600">
                <AlertCircle className="w-4 h-4" />
                Unsaved changes
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setEntries(initialEntries)}
              disabled={!isDirty}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Reset
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isDirty || isLoading || totalHours === 0}
              className={cn(
                "px-4 py-2 text-white rounded-lg transition-colors flex items-center gap-2",
                isDirty && !isLoading && totalHours > 0
                  ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                  : "bg-gray-300 cursor-not-allowed"
              )}
            >
              <Save className="w-4 h-4" />
              Submit Timesheet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
