"use client";

import { useState } from "react";
import { format, startOfWeek, addDays, subDays } from "date-fns";
import { th } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import TimesheetGrid from "@/app/components/TimesheetGrid";

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

export default function TimesheetPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekEntries, setWeekEntries] = useState<TimesheetEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const userId = "current-user-id"; // Should come from auth context
  const projectId = "project-123"; // Should come from route params

  const handlePreviousWeek = () => {
    setCurrentDate(subDays(currentDate, 7));
  };

  const handleNextWeek = () => {
    setCurrentDate(addDays(currentDate, 7));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleSubmitTimesheet = async (entries: TimesheetEntry[]) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/timesheets/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekStart: format(weekStart, "yyyy-MM-dd"),
          entries,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit timesheet");
      }

      setSubmitStatus({
        type: "success",
        message: "Timesheet submitted successfully",
      });

      // Reset entries after successful submission
      setWeekEntries([]);
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to submit timesheet",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Timesheet</h1>
          <p className="text-gray-600 mt-2">
            Record and manage your weekly time entries
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Week Navigation */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handlePreviousWeek}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                title="Previous week"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={handleToday}
                className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Today
              </button>

              <button
                onClick={handleNextWeek}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                title="Next week"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center">
              <h2 className="font-semibold text-gray-900">
                Week of {format(weekStart, "MMMM d, yyyy", { locale: th })}
              </h2>
            </div>

            <div className="w-20" />
          </div>

          {/* Status Messages */}
          {submitStatus.type && (
            <div
              className={`rounded-lg p-4 ${
                submitStatus.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              <p className="text-sm font-medium">{submitStatus.message}</p>
            </div>
          )}

          {/* Timesheet Grid */}
          <TimesheetGrid
            weekStart={weekStart}
            userId={userId}
            projectId={projectId}
            entries={weekEntries}
            onEntriesChange={setWeekEntries}
            onSubmit={handleSubmitTimesheet}
            isLoading={isSubmitting}
            canEdit={true}
          />

          {/* Tips Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-3">How to use the Timesheet</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Record your daily work hours in the grid above</li>
              <li>• Select the appropriate work type for each entry (Project, Training, etc.)</li>
              <li>• Add descriptions to help with task tracking and billing</li>
              <li>• Submit your timesheet by the end of each week for approval</li>
              <li>• Approved timesheets contribute to project billing and payroll</li>
            </ul>
          </div>

          {/* Recent Timesheets */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Submission History</h3>
            <div className="text-center py-8 text-gray-500">
              <p>No recent timesheet submissions</p>
              <p className="text-sm mt-2">Your submitted timesheets will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
