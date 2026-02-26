"use client";

import { useState } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  Label,
} from "recharts";
import { ProjectHealth } from "@/app/lib/data-service";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  Maximize2,
  LayoutList,
} from "lucide-react";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/Select";

type ExtendedProject = ProjectHealth & {
  status?: string;
  managerName?: string;
};

interface PortfolioHealthMatrixProps {
  projects: ExtendedProject[];
}

export default function PortfolioHealthMatrix({
  projects,
}: PortfolioHealthMatrixProps) {
  const [viewMode, setViewMode] = useState<"matrix" | "list">("matrix");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [managerFilter, setManagerFilter] = useState<string>("all");

  const statuses = Array.from(
    new Set((projects || []).map((p) => p.status || "Unknown")),
  ).filter(Boolean);
  const managers = Array.from(
    new Set((projects || []).map((p) => p.managerName || "Unassigned")),
  ).filter(Boolean);

  const filtered = (projects || []).filter((p) => {
    const okStatus =
      statusFilter === "all"
        ? true
        : String(p.status || "").toLowerCase() === statusFilter.toLowerCase();
    const okMgr =
      managerFilter === "all"
        ? true
        : String(p.managerName || "").toLowerCase() ===
          managerFilter.toLowerCase();
    return okStatus && okMgr;
  });

  // Prepare data for scatter plot
  const data = filtered.map((p) => ({
    ...p,
    x: p.spi,
    y: p.cpi,
    z: p.budget, // Bubble size
  }));

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg text-xs">
          <p className="font-bold text-slate-900 mb-1">{data.name}</p>
          <p className="text-slate-500 mb-2">{data.code}</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <span className="text-slate-500">SPI:</span>
            <span
              className={clsx(
                "font-mono font-medium",
                data.spi >= 1 ? "text-green-600" : "text-red-600",
              )}
            >
              {data.spi}
            </span>
            <span className="text-slate-500">CPI:</span>
            <span
              className={clsx(
                "font-mono font-medium",
                data.cpi >= 1 ? "text-green-600" : "text-red-600",
              )}
            >
              {data.cpi}
            </span>
            <span className="text-slate-500">Progress:</span>
            <span className="font-mono">{data.progress_actual}%</span>
            <span className="text-slate-500">Budget:</span>
            <span className="font-mono">
              ฿{(data.budget / 1000000).toFixed(1)}M
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case "low":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "medium":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "high":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "critical":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <Card className="col-span-1 lg:col-span-2 shadow-sm border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 bg-slate-50/50 py-4 px-6">
        <div className="flex items-center gap-6">
          <CardTitle className="text-lg font-semibold text-slate-900">
            Portfolio Health Matrix
          </CardTitle>
          <p className="text-xs text-slate-500 mt-1">
            Cost (CPI) vs Schedule (SPI) Performance
          </p>
          <div className="hidden md:flex items-center gap-2">
            <Select onValueChange={setStatusFilter} value={statusFilter}>
              <SelectTrigger className="h-8 w-40 text-xs">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={setManagerFilter} value={managerFilter}>
              <SelectTrigger className="h-8 w-48 text-xs">
                <SelectValue placeholder="Filter by manager" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Managers</SelectItem>
                {managers.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex bg-white rounded-lg border border-slate-200 p-0.5">
          <button
            onClick={() => setViewMode("matrix")}
            className={clsx(
              "p-1.5 rounded-md transition-all",
              viewMode === "matrix"
                ? "bg-slate-100 text-blue-600 shadow-sm"
                : "text-slate-400 hover:text-slate-600",
            )}
            title="Matrix View"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={clsx(
              "p-1.5 rounded-md transition-all",
              viewMode === "list"
                ? "bg-slate-100 text-blue-600 shadow-sm"
                : "text-slate-400 hover:text-slate-600",
            )}
            title="List View"
          >
            <LayoutList className="w-4 h-4" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {viewMode === "matrix" ? (
          <div className="h-[400px] w-full grid grid-cols-3 grid-rows-3">
            {/* Quadrant Labels */}
            <div className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100 self-start justify-self-end">
              STAR (Ahead & Under Budget)
            </div>
            <div className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100 self-start justify-self-start">
              POTENTIAL (Behind & Under Budget)
            </div>
            <div className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100 self-end justify-self-end">
              OVERRUN (Ahead & Over Budget)
            </div>
            <div className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100 self-end justify-self-start">
              CRITICAL (Behind & Over Budget)
            </div>

            <ResponsiveContainer
              width="100%"
              height="100%"
              className="col-start-1 col-span-3 row-start-1 row-span-3"
            >
              <ScatterChart
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="SPI"
                  label={{
                    value: "Schedule Performance Index (SPI)",
                    position: "bottom",
                    offset: 0,
                    fontSize: 12,
                  }}
                  domain={[0, 2]}
                  ticks={[0, 0.5, 1, 1.5, 2]}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="CPI"
                  label={{
                    value: "Cost Performance Index (CPI)",
                    angle: -90,
                    position: "left",
                    offset: 0,
                    fontSize: 12,
                  }}
                  domain={[0, 2]}
                  ticks={[0, 0.5, 1, 1.5, 2]}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ strokeDasharray: "3 3" }}
                />

                {/* Reference Lines for SPI=1 and CPI=1 */}
                <ReferenceLine
                  x={1}
                  stroke="#94a3b8"
                  strokeDasharray="3 3"
                  strokeWidth={2}
                />
                <ReferenceLine
                  y={1}
                  stroke="#94a3b8"
                  strokeDasharray="3 3"
                  strokeWidth={2}
                />

                <Scatter name="Projects" data={data} fill="#8884d8">
                  {data.map((entry, index) => {
                    // Determine color based on Quadrant
                    let color = "#94a3b8"; // default
                    if (entry.spi >= 1 && entry.cpi >= 1)
                      color = "#10b981"; // Green (Star)
                    else if (entry.spi < 1 && entry.cpi >= 1)
                      color = "#f59e0b"; // Amber (Potential)
                    else if (entry.spi >= 1 && entry.cpi < 1)
                      color = "#f97316"; // Orange (Overrun)
                    else color = "#ef4444"; // Red (Critical)

                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={color}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    );
                  })}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 rounded-tl-lg">
                    Project
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">
                    SPI
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">
                    CPI
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">
                    Progress
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600 rounded-tr-lg">
                    Risk
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((project, idx) => (
                  <motion.tr
                    key={project.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">
                        {project.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {project.code}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant="outline"
                        className={clsx(
                          "font-mono",
                          project.spi >= 1
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-red-50 text-red-700 border-red-200",
                        )}
                      >
                        {project.spi}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant="outline"
                        className={clsx(
                          "font-mono",
                          project.cpi >= 1
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-red-50 text-red-700 border-red-200",
                        )}
                      >
                        {project.cpi}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center text-sm font-mono">
                      {project.progress_actual}%
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant="outline"
                        className={getRiskColor(project.risk_level)}
                      >
                        {project.risk_level}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/projects/${project.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center gap-1"
                      >
                        View <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
