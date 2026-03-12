import React from 'react';
import { Users, Calendar, TrendingUp } from 'lucide-react';

interface ProjectCardProps {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'on_hold' | 'cancelled';
  progress: number;
  budget: {
    spent: number;
    total: number;
  };
  team: number;
  dueDate?: string;
  onClick?: () => void;
}

const statusConfig = {
  active: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  completed: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  on_hold: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  cancelled: { bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-500' },
};

export function ProjectCard({
  id,
  name,
  description,
  status,
  progress,
  budget,
  team,
  dueDate,
  onClick,
}: ProjectCardProps) {
  const config = statusConfig[status];
  const budgetPercent = Math.round((budget.spent / budget.total) * 100);

  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-lg border border-gray-200 p-6
        hover:shadow-lg hover:border-gray-300 transition-all duration-200
        ${onClick ? 'cursor-pointer' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${config.bg}`}>
          <span className={`w-2 h-2 rounded-full ${config.dot}`} />
          <span className={`text-xs font-medium ${config.text} capitalize`}>
            {status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-600">Progress</p>
          <p className="text-sm font-semibold text-gray-900">{progress}%</p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-600 to-cyan-500 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Budget */}
        <div>
          <p className="text-xs font-medium text-gray-600 mb-1">Budget</p>
          <p className="text-sm font-semibold text-gray-900">
            ฿{(budget.spent / 1000).toFixed(0)}K
          </p>
          <p className="text-xs text-gray-500 mt-1">
            of ฿{(budget.total / 1000).toFixed(0)}K
          </p>
        </div>

        {/* Team */}
        <div>
          <div className="flex items-center gap-1 mb-1">
            <Users className="w-3 h-3 text-gray-600" />
            <p className="text-xs font-medium text-gray-600">Team</p>
          </div>
          <p className="text-sm font-semibold text-gray-900">{team}</p>
          <p className="text-xs text-gray-500 mt-1">members</p>
        </div>

        {/* Due Date */}
        <div>
          {dueDate && (
            <>
              <div className="flex items-center gap-1 mb-1">
                <Calendar className="w-3 h-3 text-gray-600" />
                <p className="text-xs font-medium text-gray-600">Due</p>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {new Date(dueDate).toLocaleDateString('th-TH', {
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-gray-200">
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">
          Open Project →
        </button>
      </div>
    </div>
  );
}
