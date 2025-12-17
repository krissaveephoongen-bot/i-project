import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Target,
  Users,
  DollarSign,
  Calendar
} from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

interface Project {
  id: string;
  name: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  progress: number;
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  tasksCount: number;
  completedTasks: number;
  teamMembers: string[];
}

interface AdvancedStatsProps {
  projects: Project[];
  loading?: boolean;
}

const AdvancedStats: React.FC<AdvancedStatsProps> = ({ projects, loading = false }) => {
  const stats = useMemo(() => {
    if (!projects.length) {
      return {
        statusDistribution: [],
        priorityDistribution: [],
        budgetTrend: [],
        progressTrend: [],
        healthScore: 0,
        riskMetrics: { high: 0, medium: 0, low: 0 },
        scheduleMetrics: [],
        costMetrics: [],
      };
    }

    // Status distribution
    const statusCounts = projects.reduce((acc, p) => {
      const existing = acc.find(s => s.name === p.status);
      if (existing) {
        existing.value += 1;
      } else {
        acc.push({ name: p.status.replace('-', ' '), value: 1 });
      }
      return acc;
    }, [] as { name: string; value: number }[]);

    // Priority distribution
    const priorityCounts = projects.reduce((acc, p) => {
      const existing = acc.find(s => s.name === p.priority);
      if (existing) {
        existing.value += 1;
      } else {
        acc.push({ name: p.priority, value: 1 });
      }
      return acc;
    }, [] as { name: string; value: number }[]);

    // Progress trend (group by status)
    const progressByStatus = projects.reduce((acc, p) => {
      const existing = acc.find(s => s.name === p.status);
      if (existing) {
        existing.progress.push(p.progress);
      } else {
        acc.push({ name: p.status.replace('-', ' '), progress: [p.progress] });
      }
      return acc;
    }, [] as { name: string; progress: number[] }[]).map(item => ({
      name: item.name,
      value: Math.round(item.progress.reduce((a, b) => a + b, 0) / item.progress.length)
    }));

    // Budget trend
    const budgetData = projects.map(p => ({
      name: p.name.substring(0, 10),
      allocated: p.budget,
      spent: p.spent,
      remaining: p.budget - p.spent
    }));

    // Health score calculation
    const healthScores = projects.map(p => {
      let score = 100;
      if (p.spent > p.budget) score -= (((p.spent - p.budget) / p.budget) * 20);
      if (p.progress < 50 && p.status === 'active') score -= 10;
      if (p.progress > 100) score -= 5;
      return Math.max(0, score);
    });
    const overallHealth = Math.round(healthScores.reduce((a, b) => a + b, 0) / healthScores.length);

    // Risk metrics
    const riskMetrics = {
      high: projects.filter(p => p.spent > p.budget * 0.9 && p.status !== 'completed').length,
      medium: projects.filter(p => p.spent > p.budget * 0.7 && p.spent <= p.budget * 0.9).length,
      low: projects.filter(p => p.spent <= p.budget * 0.7).length,
    };

    // Schedule metrics
    const scheduleData = projects.map(p => {
      const totalDays = new Date(p.endDate).getTime() - new Date(p.startDate).getTime();
      const elapsed = new Date().getTime() - new Date(p.startDate).getTime();
      const timeProgress = (elapsed / totalDays) * 100;
      return {
        name: p.name.substring(0, 8),
        timeProgress: Math.min(100, Math.max(0, timeProgress)),
        workProgress: p.progress
      };
    });

    // Cost metrics
    const costByPriority = projects.reduce((acc, p) => {
      const existing = acc.find(c => c.name === p.priority);
      if (existing) {
        existing.spent += p.spent;
        existing.budget += p.budget;
      } else {
        acc.push({ name: p.priority, spent: p.spent, budget: p.budget });
      }
      return acc;
    }, [] as { name: string; spent: number; budget: number }[]);

    return {
      statusDistribution: statusCounts,
      priorityDistribution: priorityCounts,
      budgetTrend: budgetData,
      progressTrend: progressByStatus,
      healthScore: overallHealth,
      riskMetrics,
      scheduleMetrics: scheduleData,
      costMetrics: costByPriority,
    };
  }, [projects]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-64" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Health Score</p>
                <p className={`text-3xl font-bold mt-2 ${
                  stats.healthScore >= 80 ? 'text-green-600 dark:text-green-400' :
                  stats.healthScore >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-red-600 dark:text-red-400'
                }`}>
                  {stats.healthScore}%
                </p>
              </div>
              <CheckCircle className={`h-8 w-8 ${
                stats.healthScore >= 80 ? 'text-green-600 dark:text-green-400' :
                stats.healthScore >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                'text-red-600 dark:text-red-400'
              }`} />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">High Risk Projects</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
                  {stats.riskMetrics.high}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Avg Progress</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                  {Math.round(projects.reduce((a, p) => a + p.progress, 0) / projects.length)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Total Budget</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                  {formatCurrency(projects.reduce((a, p) => a + p.budget, 0))}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Project Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} (${value})`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.statusDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Priority Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.priorityDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Progress vs Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Work Progress vs Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.scheduleMetrics.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="workProgress" stackId="a" fill="#3b82f6" name="Work Progress" />
                <Bar dataKey="timeProgress" stackId="a" fill="#10b981" name="Time Progress" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Budget by Priority */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Spending by Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.costMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Bar dataKey="spent" fill="#ef4444" name="Spent" />
                <Bar dataKey="budget" fill="#10b981" name="Budget" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Budget Utilization */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Project Budget Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.budgetTrend.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Bar dataKey="spent" fill="#ef4444" name="Spent" />
                <Bar dataKey="remaining" fill="#10b981" name="Remaining" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdvancedStats;
