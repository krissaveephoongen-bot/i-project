"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Header from "@/app/components/Header";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/Button";

export default function EditTaskPage() {
  const params = useParams() as Record<
    string,
    string | string[] | undefined
  > | null;
  const router = useRouter();
  const projectId =
    typeof params?.id === "string"
      ? (params!.id as string)
      : Array.isArray(params?.id)
        ? (params!.id as string[])[0]
        : "";
  const taskId =
    typeof params?.taskId === "string"
      ? (params!.taskId as string)
      : Array.isArray(params?.taskId)
        ? (params!.taskId as string[])[0]
        : "";

  const { data, isLoading, error } = useQuery({
    queryKey: ["tasks", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/tasks/?projectId=${projectId}`);
      return res.ok ? await res.json() : [];
    },
  });

  const task = useMemo(
    () => (data || []).find((t: any) => t.id === taskId) || null,
    [data, taskId],
  );
  const [title, setTitle] = useState<string>(task?.title || "");
  const [phase, setPhase] = useState<string>(task?.phase || "");
  const [weight, setWeight] = useState<number>(task?.weight || 0);
  const [progressPlan, setProgressPlan] = useState<number>(
    task?.progress_plan ?? task?.progressPlan ?? 0,
  );
  const [progressActual, setProgressActual] = useState<number>(
    task?.progress_actual ?? task?.progressActual ?? 0,
  );
  const [startDate, setStartDate] = useState<string>(
    task?.start_date ?? task?.startDate ?? "",
  );
  const [endDate, setEndDate] = useState<string>(
    task?.end_date ?? task?.endDate ?? "",
  );
  const [status, setStatus] = useState<string>(task?.status || "Pending");
  const [planPoints, setPlanPoints] = useState<any[]>([]);
  const [actualLogs, setActualLogs] = useState<any[]>([]);
  const [planDate, setPlanDate] = useState<string>("");
  const [planValue, setPlanValue] = useState<number>(0);
  const [actualDate, setActualDate] = useState<string>("");
  const [actualValue, setActualValue] = useState<number>(0);

  const save = async () => {
    const res = await fetch(`/api/projects/tasks/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: taskId,
        updatedFields: {
          title,
          phase,
          weight,
          progress_plan: progressPlan,
          progress_actual: progressActual,
          start_date: startDate,
          end_date: endDate,
          status,
        },
      }),
    });
    if (res.ok) router.push(`/projects/${projectId}/tasks`);
  };
  useEffect(() => {
    const loadLogs = async () => {
      const p = await fetch(`/api/projects/progress/plan?taskId=${taskId}`);
      setPlanPoints(p.ok ? await p.json() : []);
      const a = await fetch(`/api/projects/progress/actual?taskId=${taskId}`);
      setActualLogs(a.ok ? await a.json() : []);
    };
    if (taskId) loadLogs();
  }, [taskId]);
  const addPlanPoint = async () => {
    if (!planDate) return;
    const res = await fetch(`/api/projects/progress/plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        task_id: taskId,
        date: planDate,
        plan_percent: planValue,
      }),
    });
    if (res.ok) {
      const row = await res.json();
      setPlanPoints((prev) =>
        [...prev, row].sort((x, y) =>
          String(x.date).localeCompare(String(y.date)),
        ),
      );
      setPlanDate("");
      setPlanValue(0);
    }
  };
  const addActualLog = async () => {
    if (!actualDate) return;
    const res = await fetch(`/api/projects/progress/actual`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        task_id: taskId,
        date: actualDate,
        progress_percent: actualValue,
      }),
    });
    if (res.ok) {
      const row = await res.json();
      setActualLogs((prev) =>
        [...prev, row].sort((x, y) =>
          String(x.date).localeCompare(String(y.date)),
        ),
      );
      setActualDate("");
      setActualValue(0);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading task...
      </div>
    );
  }
  if (error || !task) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-6xl">⚠️</div>
              <h3 className="text-lg font-semibold">Task not found</h3>
              <Button
                onClick={() => router.push(`/projects/${projectId}/tasks`)}
              >
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        title="Edit Task"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Projects", href: "/projects" },
          { label: "Tasks", href: `/projects/${projectId}/tasks` },
          { label: "Edit" },
        ]}
      />
      <div className="container mx-auto px-6 py-8 pt-24 max-w-2xl">
        <div className="space-y-4 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <label className="block">
            <span className="text-sm text-slate-600">ชื่องาน</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="text-sm text-slate-600">ขั้นตอนงาน</span>
            <input
              value={phase}
              onChange={(e) => setPhase(e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm text-slate-600">น้ำหนัก (%)</span>
              <input
                type="number"
                min="0"
                max="100"
                value={weight}
                onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                className="mt-1 w-full border rounded px-3 py-2"
              />
            </label>
            <label className="block">
              <span className="text-sm text-slate-600">
                แผนความก้าวหน้า (%)
              </span>
              <input
                type="number"
                min="0"
                max="100"
                value={progressPlan}
                onChange={(e) =>
                  setProgressPlan(parseFloat(e.target.value) || 0)
                }
                className="mt-1 w-full border rounded px-3 py-2"
              />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm text-slate-600">ผลจริง (%)</span>
              <input
                type="number"
                min="0"
                max="100"
                value={progressActual}
                onChange={(e) =>
                  setProgressActual(parseFloat(e.target.value) || 0)
                }
                className="mt-1 w-full border rounded px-3 py-2"
              />
            </label>
            <label className="block">
              <span className="text-sm text-slate-600">สถานะ</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 w-full border rounded px-3 py-2"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm text-slate-600">วันเริ่ม</span>
              <input
                type="date"
                value={(startDate || "").slice(0, 10)}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 w-full border rounded px-3 py-2"
              />
            </label>
            <label className="block">
              <span className="text-sm text-slate-600">วันสิ้นสุด</span>
              <input
                type="date"
                value={(endDate || "").slice(0, 10)}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 w-full border rounded px-3 py-2"
              />
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/projects/${projectId}/tasks`)}
            >
              กลับ
            </Button>
            <Button onClick={save}>บันทึก</Button>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-2">
                Baseline Plan Points
              </h3>
              <div className="flex gap-2 mb-2">
                <input
                  type="date"
                  value={planDate}
                  onChange={(e) => setPlanDate(e.target.value)}
                  className="border rounded px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={planValue}
                  onChange={(e) =>
                    setPlanValue(parseFloat(e.target.value) || 0)
                  }
                  className="border rounded px-3 py-2 text-sm w-24"
                />
                <Button onClick={addPlanPoint}>เพิ่ม</Button>
              </div>
              <div className="border rounded p-3">
                {planPoints.length === 0 ? (
                  <p className="text-sm text-slate-500">ยังไม่มีแผน</p>
                ) : (
                  <ul className="space-y-1">
                    {planPoints.map((p) => (
                      <li key={p.id} className="text-sm">
                        {String(p.date)} — {Number(p.plan_percent)}%
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-2">
                Actual Progress Logs
              </h3>
              <div className="flex gap-2 mb-2">
                <input
                  type="date"
                  value={actualDate}
                  onChange={(e) => setActualDate(e.target.value)}
                  className="border rounded px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={actualValue}
                  onChange={(e) =>
                    setActualValue(parseFloat(e.target.value) || 0)
                  }
                  className="border rounded px-3 py-2 text-sm w-24"
                />
                <Button onClick={addActualLog}>เพิ่ม</Button>
              </div>
              <div className="border rounded p-3">
                {actualLogs.length === 0 ? (
                  <p className="text-sm text-slate-500">ยังไม่มีผลจริง</p>
                ) : (
                  <ul className="space-y-1">
                    {actualLogs.map((a) => (
                      <li key={a.id} className="text-sm">
                        {String(a.date)} — {Number(a.progress_percent)}%
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
