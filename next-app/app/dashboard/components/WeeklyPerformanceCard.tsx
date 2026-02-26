import React from "react";
import { Clock } from "lucide-react";
import type { ProjectRow } from "../types";

interface WeeklyPerformanceCardProps {
  data: ProjectRow[];
}

function WeeklyPerformanceCard({ data }: WeeklyPerformanceCardProps) {
  return (
    <div className="lg:col-span-2 bg-card text-card-foreground rounded-2xl shadow-sm border border-border p-6 flex flex-col hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold">ผลงานรายสัปดาห์</h3>
        <Clock className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm" aria-label="ตารางผลงานรายสัปดาห์">
          <thead>
            <tr className="border-b border-border">
              <th
                scope="col"
                className="text-left py-3 px-2 font-medium text-muted-foreground"
              >
                โครงการ
              </th>
              <th
                scope="col"
                className="text-right py-3 px-2 font-medium text-muted-foreground"
              >
                Actual
              </th>
              <th
                scope="col"
                className="text-right py-3 px-2 font-medium text-muted-foreground"
              >
                Plan
              </th>
              <th
                scope="col"
                className="text-right py-3 px-2 font-medium text-muted-foreground"
              >
                SPI
              </th>
              <th
                scope="col"
                className="text-right py-3 px-2 font-medium text-muted-foreground"
              >
                เปลี่ยนแปลง
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {data.slice(0, 6).map((w) => (
              <tr key={w.id} className="hover:bg-muted/50 transition-colors">
                <td className="py-3 px-2 font-medium">{w.name}</td>
                <td className="py-3 px-2 text-right text-muted-foreground">
                  {Number(w.progress || 0).toFixed(1)}%
                </td>
                <td className="py-3 px-2 text-right text-muted-foreground">
                  {Number((w.progress || 0) / (w.spi || 1)).toFixed(1)}%
                </td>
                <td className="py-3 px-2 text-right font-medium">
                  {Number(w.spi || 1).toFixed(2)}
                </td>
                <td className="py-3 px-2 text-right">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      Number(w.weeklyDelta || 0) >= 0
                        ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                        : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                    }`}
                  >
                    {Number(w.weeklyDelta || 0) > 0 ? "+" : ""}
                    {Number(w.weeklyDelta || 0).toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="py-8 text-center text-muted-foreground text-sm"
                >
                  ไม่มีข้อมูล
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default React.memo(WeeklyPerformanceCard);
