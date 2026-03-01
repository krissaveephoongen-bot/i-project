"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Skeleton } from "@/app/components/ui/skeleton";
import { Activity, Clock, Folder, RefreshCcw } from "lucide-react";

interface WeeklyItem {
  id?: string;
  projectId?: string;
  projectName?: string;
  spi?: number;
  plan?: number;
  actual?: number;
  delta?: number;
  date?: string;
}

export default function WeeklyActivities() {
  const [items, setItems] = useState<WeeklyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      if (!loading) setRefreshing(true);
      setError(null);

      const res = await fetch("/api/projects/weekly-summary", {
        cache: "no-store",
      });
      const json = res.ok ? await res.json() : { summary: [] };
      const summary: any[] = json?.summary || [];

      const normalized: WeeklyItem[] = summary.map((s: any) => ({
        id: s.id || s.projectId || s.project_id,
        projectId: s.projectId || s.project_id,
        projectName: s.projectName || s.project_name || s.name,
        spi: Number(s.spi ?? 1),
        plan: Number(s.plan ?? s.progress_plan ?? 0),
        actual: Number(s.actual ?? s.progress_actual ?? 0),
        delta: Number(s.delta ?? 0),
        date: s.date,
      }));

      setItems(normalized);
    } catch (e: any) {
      setError(e?.message || "โหลดข้อมูลล้มเหลว");
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const top6 = useMemo(() => items.slice(0, 6), [items]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <Activity className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-red-700">เกิดข้อผิดพลาด</p>
            <p className="text-xs text-red-600">{error}</p>
          </div>
        </div>
        <button
          onClick={load}
          className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700 transition-colors"
        >
          ลองใหม่
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">ผลงานรายสัปดาห์</h3>
          <p className="text-sm text-slate-500">
            ติดตามค่า Plan/Actual/SPI รายโครงการ
          </p>
        </div>
        <button
          onClick={load}
          title="รีเฟรช"
          className={`p-2.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all ${refreshing ? "animate-spin text-blue-600" : ""}`}
        >
          <RefreshCcw className="w-5 h-5" />
        </button>
      </div>

      {items.length === 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Folder className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900">ไม่พบข้อมูล</p>
              <p className="text-xs text-blue-700">
                ยังไม่มีสรุปกิจกรรมรายสัปดาห์
              </p>
            </div>
          </div>
          <Link
            href="/projects"
            className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ไปหน้าโครงการ
          </Link>
        </div>
      )}

      {items.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-3 px-2 font-medium text-slate-500">
                  โครงการ
                </th>
                <th className="text-right py-3 px-2 font-medium text-slate-500">
                  Actual
                </th>
                <th className="text-right py-3 px-2 font-medium text-slate-500">
                  Plan
                </th>
                <th className="text-right py-3 px-2 font-medium text-slate-500">
                  SPI
                </th>
                <th className="text-right py-3 px-2 font-medium text-slate-500">
                  เปลี่ยนแปลง
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {top6.map((w) => (
                <tr
                  key={w.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="py-3 px-2 font-medium text-slate-900">
                    <Link
                      href={`/projects/${w.projectId || w.id}/overview`}
                      className="hover:text-blue-600"
                    >
                      {w.projectName || `Project ${w.projectId || w.id}`}
                    </Link>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        {w.date ? new Date(w.date).toLocaleDateString() : "-"}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-right text-slate-600">
                    {Number(w.actual || 0).toFixed(1)}%
                  </td>
                  <td className="py-3 px-2 text-right text-slate-600">
                    {Number(w.plan || 0).toFixed(1)}%
                  </td>
                  <td className="py-3 px-2 text-right font-medium">
                    {Number(w.spi || 1).toFixed(2)}
                  </td>
                  <td className="py-3 px-2 text-right">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        Number(w.delta || 0) >= 0
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {Number(w.delta || 0) > 0 ? "+" : ""}
                      {Number(w.delta || 0).toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
