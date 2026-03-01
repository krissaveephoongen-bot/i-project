"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/app/components/ui/skeleton";
import ReportsSunburst from "@/app/components/ReportsSunburst";
import { Button } from "@/app/components/ui/button";
import { getInsightsReportAction } from "../actions";
import { PieChart } from "lucide-react";

export default function InsightsTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [focus, setFocus] = useState("project");
  const [mode, setMode] = useState("structure");

  const loadData = async () => {
    setLoading(true);
    try {
      const json = await getInsightsReportAction(year, month, focus, mode);
      if (json.root) setData(json.root);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [year, month, focus, mode]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <PieChart className="w-5 h-5 text-slate-500" />
          <span className="font-medium text-slate-700">Filters:</span>
        </div>

        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="border rounded px-3 py-1 text-sm bg-slate-50"
        >
          {Array.from({ length: 5 }).map((_, i) => {
            const y = new Date().getFullYear() - i;
            return (
              <option key={y} value={y}>
                {y}
              </option>
            );
          })}
        </select>

        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="border rounded px-3 py-1 text-sm bg-slate-50"
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(0, i).toLocaleString("en", { month: "long" })}
            </option>
          ))}
        </select>

        <select
          value={focus}
          onChange={(e) => setFocus(e.target.value)}
          className="border rounded px-3 py-1 text-sm bg-slate-50"
        >
          <option value="project">Focus: Project</option>
          <option value="staff">Focus: Staff</option>
        </select>

        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="border rounded px-3 py-1 text-sm bg-slate-50"
        >
          <option value="structure">View: Structure</option>
          <option value="worktype">View: Work Type</option>
        </select>

        <Button
          onClick={loadData}
          variant="outline"
          size="sm"
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </Button>
      </div>

      {/* Chart */}
      {loading ? (
        <Skeleton className="h-[500px] w-full rounded-xl" />
      ) : data ? (
        <div className="flex justify-center">
          {/* Check if data has children, otherwise chart might crash or show nothing */}
          {data.children && data.children.length > 0 ? (
            <ReportsSunburst data={data} />
          ) : (
            <div className="p-12 text-center text-slate-500 border rounded-xl w-full">
              No data found for the selected period.
            </div>
          )}
        </div>
      ) : (
        <div className="text-red-500">Failed to load data</div>
      )}
    </div>
  );
}
