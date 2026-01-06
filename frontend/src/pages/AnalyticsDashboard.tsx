import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectChart } from '@/components/charts/ProjectChart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart3,
  TrendingUp,
  Users,
  CheckCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  FileText,
  Activity,
  RefreshCw
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/api-config';
import ErrorState from '@/components/ErrorState';
import LoadingState from '@/components/LoadingState';
import { parseApiError } from '@/lib/error-handler';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/formatCurrency';

interface DashboardAnalytics {
  projects: {
    total: number;
    active: number;
    completed: number;
    overdue: number;
    archived: number;
  };
  tasks: {
    total: number;
    todo: number;
    inProgress: number;
    inReview: number;
    completed: number;
    overdue: number;
    completionRate: number;
  };
  users: {
    total: number;
    active: number;
    inactive: number;
  };
  budget: {
    totalBudget: number;
    totalSpent: number;
    totalRemaining: number;
    utilizationRate: number;
  };
  monthly: {
    hours: number;
    expenses: number;
    pendingExpenses: number;
    approvedExpenses: number;
  };
}

export default function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<DashboardAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [period, setPeriod] = useState('30');

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/analytics/dashboard`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAnalyticsData(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(parseApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (error) {
    return (
      <div className="p-6">
        <ErrorState error={error} onRetry={fetchAnalytics} />
      </div>
    );
  }

  if (isLoading || !analyticsData) {
    return <LoadingState message="Loading analytics..." />;
  }

  const projectChartData = [
    { name: 'Completed', value: analyticsData.projects.completed, fill: '#10b981' },
    { name: 'Active', value: analyticsData.projects.active, fill: '#3b82f6' },
    { name: 'Overdue', value: analyticsData.projects.overdue, fill: '#ef4444' },
  ];

  const taskChartData = [
    { name: 'Todo', value: analyticsData.tasks.todo, fill: '#6b7280' },
    { name: 'In Progress', value: analyticsData.tasks.inProgress, fill: '#f59e0b' },
    { name: 'In Review', value: analyticsData.tasks.inReview, fill: '#8b5cf6' },
    { name: 'Completed', value: analyticsData.tasks.completed, fill: '#10b981' },
  ];

  const budgetChartData = [
    { name: 'Spent', value: analyticsData.budget.totalSpent, fill: '#ef4444' },
    { name: 'Remaining', value: analyticsData.budget.totalRemaining, fill: '#10b981' },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Real-time project performance metrics</p>
        </div>
        <Button onClick={fetchAnalytics} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Projects</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{analyticsData.projects.total}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {analyticsData.projects.active} active · {analyticsData.projects.completed} completed
                </p>
              </div>
              <BarChart3 className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tasks</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{analyticsData.tasks.total}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {analyticsData.tasks.completionRate}% completion rate
                </p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{analyticsData.users.active}</p>
                <p className="text-xs text-gray-500 mt-1">
                  of {analyticsData.users.total} total users
                </p>
              </div>
              <Users className="h-10 w-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Budget Utilization</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{analyticsData.budget.utilizationRate}%</p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatCurrency(analyticsData.budget.totalSpent)} spent
                </p>
              </div>
              <DollarSign className="h-10 w-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month Hours</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{analyticsData.monthly.hours.toFixed(1)}h</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Expenses</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(analyticsData.monthly.expenses)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Expenses</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">{formatCurrency(analyticsData.monthly.pendingExpenses)}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue Tasks</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{analyticsData.tasks.overdue}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-3">
        <ProjectChart
          title="Project Status Distribution"
          type="pie"
          data={projectChartData}
          height={300}
        />
        <ProjectChart
          title="Task Status Distribution"
          type="pie"
          data={taskChartData}
          height={300}
        />
        <ProjectChart
          title="Budget Allocation"
          type="pie"
          data={budgetChartData}
          height={300}
        />
      </div>

      {/* Budget Details */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <p className="text-sm text-gray-600 mb-2">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.budget.totalBudget)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Total Spent</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(analyticsData.budget.totalSpent)}</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-red-500 h-2 rounded-full" 
                  style={{ width: `${analyticsData.budget.utilizationRate}%` }}
                />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Remaining</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(analyticsData.budget.totalRemaining)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Task Progress Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-gray-600">To Do</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{analyticsData.tasks.todo}</p>
            </div>
            <div className="p-4 border rounded-lg bg-orange-50">
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{analyticsData.tasks.inProgress}</p>
            </div>
            <div className="p-4 border rounded-lg bg-purple-50">
              <p className="text-sm text-gray-600">In Review</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{analyticsData.tasks.inReview}</p>
            </div>
            <div className="p-4 border rounded-lg bg-green-50">
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{analyticsData.tasks.completed}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">Project Health</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">On Track</span>
                  <span className="text-sm font-bold text-green-600">78%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: '78%' }} />
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">At Risk</span>
                  <span className="text-sm font-bold text-yellow-600">15%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500" style={{ width: '15%' }} />
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Critical</span>
                  <span className="text-sm font-bold text-red-600">7%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500" style={{ width: '7%' }} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">Resource Utilization</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Fully Allocated</span>
                  <span className="text-sm font-bold text-blue-600">60%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: '60%' }} />
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Partially Allocated</span>
                  <span className="text-sm font-bold text-blue-600">30%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400" style={{ width: '30%' }} />
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Available</span>
                  <span className="text-sm font-bold text-blue-600">10%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-300" style={{ width: '10%' }} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">Schedule Status</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">On Schedule</span>
                  <span className="text-sm font-bold text-green-600">82%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: '82%' }} />
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Behind Schedule</span>
                  <span className="text-sm font-bold text-red-600">10%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500" style={{ width: '10%' }} />
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Ahead of Schedule</span>
                  <span className="text-sm font-bold text-blue-600">8%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: '8%' }} />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
