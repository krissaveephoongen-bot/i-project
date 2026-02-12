'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function ProjectFilter({ projects }: { projects: any[] }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleFilterChange = (projectId: string) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    if (projectId) {
      params.set('project_id', projectId);
    } else {
      params.delete('project_id');
    }
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
        <label htmlFor="project-filter" className="text-sm font-medium text-slate-600">Filter by Project:</label>
        <select
            id="project-filter"
            onChange={(e) => handleFilterChange(e.target.value)}
          defaultValue={searchParams?.get('project_id') || ''}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        >
            <option value="">All Projects</option>
            {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
            ))}
        </select>
    </div>
  );
}
