import React, { useState } from 'react';
import { Layout } from '@/components/layout';
import { ProjectCard } from '@/components/projects';
import { Filter, Grid3X3, List } from 'lucide-react';

// Mock data - replace with API call
const mockProjects = [
  {
    id: '1',
    name: 'Advanced Data Analytics Platform',
    description: 'Real-time analytics dashboard',
    status: 'active' as const,
    progress: 60,
    budget: { spent: 200000, total: 500000 },
    team: 5,
    dueDate: '2026-04-30',
  },
  {
    id: '2',
    name: 'Mobile App Redesign',
    description: 'iOS and Android native apps',
    status: 'active' as const,
    progress: 45,
    budget: { spent: 150000, total: 400000 },
    team: 3,
    dueDate: '2026-05-15',
  },
  {
    id: '3',
    name: 'Cloud Infrastructure Migration',
    description: 'AWS multi-region setup',
    status: 'in_progress' as const,
    progress: 80,
    budget: { spent: 320000, total: 400000 },
    team: 6,
    dueDate: '2026-03-30',
  },
  {
    id: '4',
    name: 'Customer Portal Enhancement',
    description: 'UI/UX improvements',
    status: 'completed' as const,
    progress: 100,
    budget: { spent: 180000, total: 200000 },
    team: 4,
    dueDate: '2026-02-15',
  },
  {
    id: '5',
    name: 'Security Audit & Compliance',
    description: 'ISO 27001 certification',
    status: 'active' as const,
    progress: 35,
    budget: { spent: 75000, total: 250000 },
    team: 2,
    dueDate: '2026-06-30',
  },
  {
    id: '6',
    name: 'API Development Framework',
    description: 'GraphQL API layer',
    status: 'on_hold' as const,
    progress: 25,
    budget: { spent: 60000, total: 300000 },
    team: 3,
    dueDate: '2026-07-15',
  },
];

export default function ProjectsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredProjects = mockProjects.filter(
    (project) =>
      statusFilter === 'all' || project.status === statusFilter
  );

  return (
    <Layout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
        <p className="text-gray-600 mt-1">
          {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Filters */}
          <div className="flex items-center gap-2 flex-1">
            <Filter className="w-4 h-4 text-gray-600" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
            </select>
          </div>

          {/* View Mode */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="Grid view"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Action Button */}
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm whitespace-nowrap">
            + New Project
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              {...project}
              onClick={() => console.log(`Open project ${project.id}`)}
            />
          ))}
        </div>
      ) : (
        /* Projects Table */
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">
                  Budget
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">
                  Team
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-900">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => (
                <tr
                  key={project.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{project.name}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {project.description}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                        project.status === 'active'
                          ? 'bg-green-50 text-green-700'
                          : project.status === 'completed'
                          ? 'bg-blue-50 text-blue-700'
                          : project.status === 'on_hold'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          project.status === 'active'
                            ? 'bg-green-500'
                            : project.status === 'completed'
                            ? 'bg-blue-500'
                            : project.status === 'on_hold'
                            ? 'bg-amber-500'
                            : 'bg-gray-500'
                        }`}
                      />
                      {project.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {project.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">
                      ฿{(project.budget.spent / 1000).toFixed(0)}K /
                      ฿{(project.budget.total / 1000).toFixed(0)}K
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">
                      {project.team} members
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Open →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
