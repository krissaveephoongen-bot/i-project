import React from 'react';
import { Layout } from '@/components/layout';
import { StatCard } from '@/components/cards';
import { 
  Folder, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  TrendingUp
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <Layout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, Jakgrits</h1>
        <p className="text-gray-600 mt-1">Last updated 2 hours ago</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Active Projects"
          value="24"
          change={2.5}
          status="success"
          icon="📁"
        />
        <StatCard
          title="Completed"
          value="12"
          change={1.2}
          status="success"
          icon="✅"
        />
        <StatCard
          title="At Risk"
          value="3"
          change={-5}
          status="warning"
          icon="⚠️"
        />
        <StatCard
          title="Overdue"
          value="1"
          change={0}
          status="danger"
          icon="🔴"
        />
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* My Projects */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">My Projects</h2>
            <a href="/projects" className="text-blue-600 hover:text-blue-700 text-sm">
              View all →
            </a>
          </div>
          <div className="space-y-3">
            {[
              { name: 'Project A', progress: 60 },
              { name: 'Project B', progress: 45 },
              { name: 'Project C', progress: 80 },
            ].map((project) => (
              <div key={project.name} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-900">{project.name}</p>
                  <p className="text-sm text-gray-600">{project.progress}%</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
              + New Project
            </button>
            <button className="w-full px-4 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm">
              + Create Task
            </button>
            <button className="w-full px-4 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm">
              Submit Timesheet
            </button>
          </div>
        </div>
      </div>

      {/* Timesheet Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Timesheet (This Week)</h2>
          <a href="/timesheet" className="text-blue-600 hover:text-blue-700 text-sm">
            View →
          </a>
        </div>
        <div className="grid grid-cols-6 gap-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Total'].map((day) => (
            <div key={day} className="text-center">
              <p className="text-xs font-medium text-gray-600 mb-2">{day}</p>
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-lg font-bold text-blue-600">
                  {day === 'Total' ? '40' : '8'}
                </p>
                <p className="text-xs text-gray-600 mt-1">hrs</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-800">
            ✓ <strong>40 hours</strong> logged this week - meeting capacity
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {[
            { time: '2m ago', action: 'Jakgrits submitted timesheet' },
            { time: '1h ago', action: 'Task #123 marked as completed' },
            { time: '2h ago', action: 'Invoice #456 marked as paid' },
            { time: '3h ago', action: 'New project created by Manager' },
            { time: '5h ago', action: 'Timesheet approved for phase 1' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{item.action}</p>
                <p className="text-xs text-gray-500 mt-1">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
