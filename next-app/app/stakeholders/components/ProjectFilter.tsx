"use client";

import { Filter } from "lucide-react";

export default function ProjectFilter({
  projects,
  selectedProject,
  onProjectChange,
}: {
  projects: any[];
  selectedProject: string;
  onProjectChange: (projectId: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Filter className="w-4 h-4 text-slate-400" />
      <label
        htmlFor="project-filter"
        className="text-sm font-medium text-slate-600"
      >
        Filter by Project:
      </label>
      <select
        id="project-filter"
        value={selectedProject}
        onChange={(e) => onProjectChange(e.target.value)}
        className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">All Projects</option>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </select>
    </div>
  );
}
