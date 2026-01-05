import { useMemo } from 'react';
import { Card, CardContent } from '../ui/card';
import {
  FolderKanban,
  TrendingUp,
  Users,
  DollarSign,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import type { Project } from '@/services/dataService';

interface ProjectStatsProps {
  projects: Project[];
  loading?: boolean;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  trend?: 'up' | 'down' | 'stable';
  color?: 'blue' | 'green' | 'orange' | 'red';
}

/**
 * StatCard Component
 * Displays a single statistic with icon and metadata
 */
function StatCard({
  icon,
  label,
  value,
  subtext,
  trend,
  color = 'blue',
}: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    orange: 'bg-orange-50 border-orange-200',
    red: 'bg-red-50 border-red-200',
  };

  const iconColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    orange: 'text-orange-600',
    red: 'text-red-600',
  };

  return (
    <Card className={`${colorClasses[color]} border`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
          </div>
          <div className={`${iconColorClasses[color]} flex-shrink-0`}>
            {icon}
          </div>
        </div>
        {trend && (
          <div className="mt-2 flex items-center text-xs">
            <TrendingUp className={`h-3 w-3 mr-1 ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'}`} />
            <span className={trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'}>
              {trend === 'up' ? 'Trending up' : trend === 'down' ? 'Trending down' : 'Stable'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * ProjectStats Component
 * Displays overview statistics for all projects
 * Calculates key metrics and visualizes project health
 */
export function ProjectStats({ projects, loading = false }: ProjectStatsProps) {
  // Memoize calculations to prevent unnecessary recalculations
  const stats = useMemo(() => {
    if (!projects || projects.length === 0) {
      return {
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        overdueProjects: 0,
        totalBudget: 0,
        totalTeamMembers: 0,
        averageProgress: 0,
        budgetHealth: { color: 'green' as const, status: 'Healthy' },
        scheduleHealth: { color: 'green' as const, status: 'On Track' },
      };
    }

    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const overdueProjects = projects.filter(
      p => p.status !== 'completed' && new Date(p.endDate) < new Date()
    ).length;

    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    
    // Get unique team members (de-duplicate across projects)
    const uniqueMembers = new Set<string>();
    projects.forEach(p => {
      p.teamMembers?.forEach(member => {
        uniqueMembers.add(typeof member === 'string' ? member : member.toString());
      });
    });
    const totalTeamMembers = uniqueMembers.size;

    // Calculate average progress
    const averageProgress = Math.round(
      projects.reduce((sum, p) => sum + (p.progress || 0), 0) / totalProjects
    );

    // Assess budget health (projects within budget vs over budget)
    const projectsWithinBudget = projects.filter(p => {
      // Assuming we track actual spend somewhere - for now using progress as proxy
      return (p.progress || 0) <= 100;
    }).length;
    const budgetHealthPercentage = (projectsWithinBudget / totalProjects) * 100;

    // Assess schedule health
    const onTimeProjects = projects.filter(p => {
      if (p.status === 'completed') return true;
      return new Date(p.endDate) > new Date();
    }).length;
    const scheduleHealthPercentage = (onTimeProjects / totalProjects) * 100;

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      overdueProjects,
      totalBudget,
      totalTeamMembers,
      averageProgress,
      budgetHealth: {
        color: budgetHealthPercentage >= 80 ? ('green' as const) : budgetHealthPercentage >= 60 ? ('orange' as const) : ('red' as const),
        status: budgetHealthPercentage >= 80 ? 'Healthy' : budgetHealthPercentage >= 60 ? 'Attention Needed' : 'At Risk',
        percentage: Math.round(budgetHealthPercentage),
      },
      scheduleHealth: {
        color: scheduleHealthPercentage >= 80 ? ('green' as const) : scheduleHealthPercentage >= 60 ? ('orange' as const) : ('red' as const),
        status: scheduleHealthPercentage >= 80 ? 'On Track' : scheduleHealthPercentage >= 60 ? 'At Risk' : 'Behind Schedule',
        percentage: Math.round(scheduleHealthPercentage),
      },
    };
  }, [projects]);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<FolderKanban className="h-6 w-6" />}
          label="Total Projects"
          value={stats.totalProjects}
          subtext={`${stats.activeProjects} active, ${stats.completedProjects} completed`}
          color="blue"
        />
        <StatCard
          icon={<CheckCircle2 className="h-6 w-6" />}
          label="Average Progress"
          value={`${stats.averageProgress}%`}
          subtext={stats.overdueProjects > 0 ? `${stats.overdueProjects} overdue` : 'All on track'}
          trend={stats.overdueProjects === 0 ? 'up' : 'down'}
          color={stats.overdueProjects === 0 ? 'green' : 'orange'}
        />
        <StatCard
          icon={<Users className="h-6 w-6" />}
          label="Team Members"
          value={stats.totalTeamMembers}
          subtext="Across all projects"
          color="green"
        />
        <StatCard
          icon={<DollarSign className="h-6 w-6" />}
          label="Total Budget"
          value={`฿${(stats.totalBudget / 1000).toFixed(0)}K`}
          subtext={`${stats.totalProjects} projects`}
          color="blue"
        />
        <StatCard
          icon={<AlertCircle className="h-6 w-6" />}
          label="Budget Health"
          value={`${stats.budgetHealth.percentage}%`}
          subtext={stats.budgetHealth.status}
          color={stats.budgetHealth.color}
        />
        <StatCard
          icon={<TrendingUp className="h-6 w-6" />}
          label="Schedule Health"
          value={`${stats.scheduleHealth.percentage}%`}
          subtext={stats.scheduleHealth.status}
          color={stats.scheduleHealth.color}
        />
      </div>
    </div>
  );
}
