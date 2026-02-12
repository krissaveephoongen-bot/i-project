"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { ArrowUpRight, ArrowDownRight, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface Project {
  id: string;
  name: string;
  client: string;
  progress_plan: number;
  progress_actual: number;
  spi: number;
  risk_level: "Low" | "Medium" | "High" | "Critical";
}

interface ProjectHealthTableProps {
  projects: Project[];
  className?: string;
}

const riskStyles = {
  Low: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Medium: "bg-amber-100 text-amber-700 border-amber-200",
  High: "bg-orange-100 text-orange-700 border-orange-200",
  Critical: "bg-red-100 text-red-700 border-red-200",
};

export function ProjectHealthTable({ projects, className }: ProjectHealthTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="border-b bg-slate-50/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-slate-900">
              Portfolio Health Matrix
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {projects.length} Projects
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                  <TableHead className="font-semibold text-slate-700">Project</TableHead>
                  <TableHead className="text-center font-semibold text-slate-700">Progress</TableHead>
                  <TableHead className="text-center font-semibold text-slate-700">SPI</TableHead>
                  <TableHead className="text-center font-semibold text-slate-700">Risk Level</TableHead>
                  <TableHead className="text-right font-semibold text-slate-700">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project, index) => (
                  <motion.tr
                    key={project.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="group hover:bg-slate-50 transition-colors"
                  >
                    <TableCell className="py-4">
                      <div>
                        <p className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                          {project.name}
                        </p>
                        <p className="text-sm text-slate-500">{project.client}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-4 text-sm">
                          <span className="text-slate-500">Plan: {project.progress_plan}%</span>
                          <span className="font-medium text-slate-900">Actual: {project.progress_actual}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={project.progress_actual} className="h-2 flex-1" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium",
                        project.spi >= 1 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                      )}>
                        {project.spi >= 1 ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        )}
                        {project.spi.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={cn("font-medium", riskStyles[project.risk_level])}>
                        {project.risk_level}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/projects/${project.id}`}
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default ProjectHealthTable;
