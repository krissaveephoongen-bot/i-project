import React from "react";
import { ProjectRow } from "./types";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Eye, ChevronRight } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

interface ActiveProjectsTableProps {
  projects: ProjectRow[];
}

const ActiveProjectsTable: React.FC<ActiveProjectsTableProps> = ({ projects }) => {
  // Safe array check
  const safeProjects = Array.isArray(projects) ? projects : [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center">
        <h3 className="font-semibold text-lg text-slate-900">โครงการที่ดำเนินการอยู่ (Active Projects)</h3>
        <Link href="/projects">
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
            ดูทั้งหมด <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
            <tr>
              <th className="px-6 py-3">Project Name</th>
              <th className="px-6 py-3">Manager</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Progress</th>
              <th className="px-6 py-3">SPI</th>
              <th className="px-6 py-3">Risks</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {safeProjects.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                  ไม่พบข้อมูลโครงการ
                </td>
              </tr>
            ) : (
              safeProjects.map((p) => {
                const risks = p.risks || { high: 0, medium: 0, low: 0 };
                const spi = p.spi || 0;
                const progress = p.progress || 0;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <div className="flex flex-col">
                        <span>{p.name}</span>
                        <span className="text-xs text-slate-400">{p.clientName || "-"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{p.managerName || "Unassigned"}</td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={clsx(
                        p.status === "Active" ? "bg-green-50 text-green-700 border-green-200" : "bg-slate-50 text-slate-700 border-slate-200"
                      )}>
                        {p.status || "Unknown"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-600 rounded-full" 
                            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} 
                          />
                        </div>
                        <span className="text-xs text-slate-500">{progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx("font-medium", spi < 0.9 ? "text-red-600" : "text-green-600")}>
                        {spi.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        {risks.high > 0 && <span className="w-2 h-2 rounded-full bg-red-500" title="High Risk" />}
                        {risks.medium > 0 && <span className="w-2 h-2 rounded-full bg-orange-500" title="Medium Risk" />}
                        {risks.low > 0 && <span className="w-2 h-2 rounded-full bg-blue-500" title="Low Risk" />}
                        {risks.high === 0 && risks.medium === 0 && risks.low === 0 && (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/projects/${p.id}/overview`}>
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-blue-600">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default React.memo(ActiveProjectsTable);
