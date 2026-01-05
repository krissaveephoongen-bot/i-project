/**
 * Timesheet Statistics Card Component
 * Displays key metrics for timesheet
 */

import { Clock, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { TimesheetSummary } from '@/types/timesheet';

interface TimesheetStatsProps {
  stats: TimesheetSummary;
}

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

export function TimesheetStats({ stats }: TimesheetStatsProps) {
  const statCards: StatCard[] = [
    {
      label: 'Total Hours',
      value: `${stats.totalHours}h`,
      icon: <Clock className="h-6 w-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Approved Hours',
      value: `${stats.billableHours}h`,
      icon: <CheckCircle className="h-6 w-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Entries',
      value: stats.tasksCompleted,
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Daily Average',
      value: `${stats.averageDaily}h`,
      icon: <Clock className="h-6 w-6" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      label: 'Pending Approval',
      value: stats.pendingApproval,
      icon: <AlertCircle className="h-6 w-6" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  if (stats.overtimeHours && stats.overtimeHours > 0) {
    statCards.push({
      label: 'Overtime Hours',
      value: `${stats.overtimeHours}h`,
      icon: <Clock className="h-6 w-6" />,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    });
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
      {statCards.map((stat, idx) => (
        <Card key={idx} className={`${stat.bgColor} border-0`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">{stat.label}</p>
                <p className={`text-2xl font-bold mt-1 ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
              <div className={stat.color}>{stat.icon}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
