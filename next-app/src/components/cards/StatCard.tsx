import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  status?: 'success' | 'warning' | 'danger' | 'neutral';
  icon?: React.ReactNode;
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  change,
  status = 'neutral',
  icon,
  onClick,
}: StatCardProps) {
  const statusColors = {
    success: 'text-green-600',
    warning: 'text-amber-600',
    danger: 'text-red-600',
    neutral: 'text-blue-600',
  };

  const changeColor =
    change && change > 0
      ? 'text-green-600'
      : change && change < 0
      ? 'text-red-600'
      : 'text-gray-600';

  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-lg border border-gray-200 p-6
        hover:shadow-md transition-shadow duration-200
        ${onClick ? 'cursor-pointer hover:border-gray-300' : ''}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change !== undefined && (
            <p className={`text-xs font-medium mt-1 flex items-center gap-1 ${changeColor}`}>
              {change > 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {change > 0 ? '+' : ''}{change}% from last week
            </p>
          )}
        </div>
        {icon && (
          <div className={`text-3xl ${statusColors[status]}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
