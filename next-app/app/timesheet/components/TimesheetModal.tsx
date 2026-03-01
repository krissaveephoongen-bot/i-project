"use client";

import { useState, useEffect } from "react";
import { X, Plus, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Project, ModalRow } from "../types";
import { useThaiLocale } from "@/lib/hooks/useThaiLocale";
import { useTranslation } from "react-i18next";

interface ConcurrentWarning {
  warnings: string[];
  isConcurrent: boolean;
  requiresComment: boolean;
  overlappingEntries?: Array<{
    id: string;
    projectName?: string;
    startTime: string;
    endTime: string;
    hours: number;
    overlapMinutes: number;
  }>;
}

interface TimesheetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  date: string;
  projects: Project[];
  initialRows: ModalRow[];
  onSave: (rows: ModalRow[]) => void;
  userId?: string;
}

export default function TimesheetModal({
  open,
  onOpenChange,
  projectId,
  date,
  projects,
  initialRows,
  onSave,
  userId,
}: TimesheetModalProps) {
  const { formatThaiDateWithDay, formatDuration } = useThaiLocale();
  const { t } = useTranslation();
  const [rows, setRows] = useState<ModalRow[]>([]);
  const [concurrentWarnings, setConcurrentWarnings] = useState<
    Record<number, ConcurrentWarning>
  >({});
  const [concurrentReasons, setConcurrentReasons] = useState<
    Record<number, string>
  >({});
  const [confirmedConcurrent, setConfirmedConcurrent] = useState<Set<number>>(
    new Set(),
  );

  useEffect(() => {
    if (open) {
      setRows(
        initialRows.length > 0
          ? initialRows
          : [
              {
                id: "new",
                date: date || new Date().toISOString().split("T")[0],
                project: projectId || "",
                task: "",
                startTime: "",
                endTime: "",
                hours: 0,
                description: "",
                status: "Draft",
              },
            ],
      );
    }
  }, [open, initialRows, projectId, date]);

  const calculateHours = (startTime: string, endTime: string): number => {
    if (!startTime || !endTime) return 0;

    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);

    if (end < start) {
      end.setDate(end.getDate() + 1);
    }

    const diffMs = end.getTime() - start.getTime();
    const hours = diffMs / (1000 * 60 * 60);
    return Math.round(hours * 100) / 100;
  };

  const updateRow = (idx: number, updates: Partial<ModalRow>) => {
    setRows((prev) =>
      prev.map((r, i) => {
        if (i === idx) {
          const updated = { ...r, ...updates };

          if (updates.startTime || updates.endTime) {
            const startTime = updates.startTime || r.startTime;
            const endTime = updates.endTime || r.endTime;
            if (startTime && endTime) {
              updated.hours = calculateHours(startTime, endTime);
            }
          }

          return updated;
        }
        return r;
      }),
    );
  };

  const deleteRow = (idx: number) => {
    setRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        date: date || new Date().toISOString().split("T")[0],
        project: projectId || "",
        task: "",
        startTime: "",
        endTime: "",
        hours: 0,
        description: "",
        status: "Draft",
      },
    ]);
  };

  const checkParallelWork = async (rowIndex: number) => {
    const row = rows[rowIndex];
    if (!row.project || !row.startTime || !row.endTime) return;

    try {
      const response = await fetch("/api/timesheet/check-concurrent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: date || new Date().toISOString().split("T")[0],
          startTime: row.startTime,
          endTime: row.endTime,
          projectId: row.project,
          userId: userId,
        }),
      });

      const result = await response.json();

      if (result.isConcurrent) {
        setConcurrentWarnings((prev) => ({
          ...prev,
          [rowIndex]: result,
        }));
      } else {
        // Clear warning if no longer concurrent
        setConcurrentWarnings((prev) => {
          const updated = { ...prev };
          delete updated[rowIndex];
          return updated;
        });
      }
    } catch (error) {
      console.error("Failed to check concurrent work:", error);
    }
  };

  const handleSave = () => {
    const invalidRows = rows.filter(
      (r) => !r.project || !r.startTime || !r.endTime,
    );
    if (invalidRows.length > 0) {
      alert(t("validation.required"));
      return;
    }

    // Check for concurrent entries that need confirmation
    const rowsNeedingConfirm = rows
      .map((_, idx) => idx)
      .filter((idx) => concurrentWarnings[idx]?.requiresComment);

    const unconfirmedConcurrent = rowsNeedingConfirm.filter(
      (idx) => !confirmedConcurrent.has(idx) || !concurrentReasons[idx],
    );

    if (unconfirmedConcurrent.length > 0) {
      alert(t("timesheet.parallelWorkReason"));
      return;
    }

    onSave(rows);
    onOpenChange(false);
  };

  const selectedProject = projects.find((p) => p.id === projectId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            {t("timesheet.title")}
          </DialogTitle>
          <DialogDescription>
            {date && formatThaiDateWithDay(new Date(date))}
            {selectedProject && ` - ${selectedProject.name}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {rows.map((row, idx) => (
            <div key={row.id} className="space-y-2">
              {/* Concurrent Warning */}
              {concurrentWarnings[idx] && (
                <div
                  className={`p-3 rounded-lg border-l-4 ${
                    concurrentWarnings[idx].requiresComment
                      ? "bg-yellow-50 border-yellow-400 text-yellow-800"
                      : "bg-blue-50 border-blue-400 text-blue-800"
                  }`}
                >
                  <div className="flex gap-2 items-start">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      {concurrentWarnings[idx].warnings.map((w, i) => (
                        <p key={i}>{w}</p>
                      ))}

                      {concurrentWarnings[idx].overlappingEntries && (
                        <div className="mt-2 pl-2 border-l-2 border-current opacity-75">
                          <p className="text-xs font-medium mb-1">
                            {t("timesheet.parallelWork")}:
                          </p>
                          {concurrentWarnings[idx].overlappingEntries!.map(
                            (e) => (
                              <p key={e.id} className="text-xs">
                                • {e.projectName} {e.startTime}-{e.endTime} (
                                {
                                  formatDuration(e.overlapMinutes / 60).split(
                                    " ",
                                  )[0]
                                }
                                h)
                              </p>
                            ),
                          )}
                        </div>
                      )}

                      {concurrentWarnings[idx].requiresComment && (
                        <div className="mt-3">
                          <label className="text-xs font-medium block mb-1">
                            {t("timesheet.parallelWorkReason")} *
                          </label>
                          <Input
                            placeholder="อธิบายเหตุผล เช่น 'Code review บน A, bug fix บน B'"
                            value={concurrentReasons[idx] || ""}
                            onChange={(e) => {
                              setConcurrentReasons((prev) => ({
                                ...prev,
                                [idx]: e.target.value,
                              }));
                            }}
                            className="h-8 text-xs"
                          />
                          <label className="flex items-center gap-2 mt-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={confirmedConcurrent.has(idx)}
                              onChange={(e) => {
                                const newSet = new Set(confirmedConcurrent);
                                if (e.target.checked) {
                                  newSet.add(idx);
                                } else {
                                  newSet.delete(idx);
                                }
                                setConfirmedConcurrent(newSet);
                              }}
                              className="w-4 h-4"
                            />
                            <span className="text-xs">
                              {t("timesheet.concurrentProjects")}:{" "}
                              {concurrentWarnings[idx].overlappingEntries
                                ?.length || 1}
                            </span>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-12 gap-3 items-start p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="col-span-1 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">
                    #{idx + 1}
                    {concurrentWarnings[idx] && (
                      <span className="ml-1 inline-block w-2 h-2 bg-yellow-400 rounded-full"></span>
                    )}
                  </span>
                  {rows.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteRow(idx)}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>

                <div className="col-span-3 space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    {t("timesheet.project")} *
                  </label>
                  <Select
                    value={row.project || ""}
                    onValueChange={(val) =>
                      updateRow(idx, { project: val, task: "" })
                    }
                  >
                    <SelectTrigger className="h-10 text-sm bg-white">
                      <SelectValue placeholder={t("common.select")} />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-3 space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    {t("common.type")}
                  </label>
                  <Select
                    value={row.task || "none"}
                    onValueChange={(val) =>
                      updateRow(idx, { task: val === "none" ? undefined : val })
                    }
                  >
                    <SelectTrigger className="h-10 text-sm bg-white">
                      <SelectValue placeholder={t("common.select")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        -- {t("workTypes.general")} --
                      </SelectItem>
                      {(
                        projects.find((p) => p.id === row.project)?.tasks || []
                      ).map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2 grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">
                      {t("timesheet.startTime")} *
                    </label>
                    <Input
                      type="time"
                      value={row.startTime}
                      onChange={(e) =>
                        updateRow(idx, { startTime: e.target.value })
                      }
                      className="h-10 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">
                      {t("timesheet.endTime")} *
                    </label>
                    <Input
                      type="time"
                      value={row.endTime}
                      onChange={(e) =>
                        updateRow(idx, { endTime: e.target.value })
                      }
                      className="h-10 text-sm"
                    />
                  </div>
                </div>

                <div className="col-span-1 space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    {t("timesheet.hours")}
                  </label>
                  <div className="h-10 flex items-center px-3 bg-white border border-slate-200 rounded-md text-sm font-medium">
                    {row.hours.toFixed(2)}
                  </div>
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    {t("common.description")}
                  </label>
                  <Input
                    placeholder={t("placeholders.enterText")}
                    value={row.description || ""}
                    onChange={(e) =>
                      updateRow(idx, { description: e.target.value })
                    }
                    className="h-10 text-sm"
                  />
                </div>
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            onClick={addRow}
            className="w-full h-10 border-dashed border-slate-300 text-slate-600 hover:border-slate-400 hover:text-slate-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t("common.create")}
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
