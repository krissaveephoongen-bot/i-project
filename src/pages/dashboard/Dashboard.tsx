import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectChart } from '@/components/charts/ProjectChart';
import { Users, CheckSquare, BarChart3, TrendingUp, Clock, DollarSign, Target, AlertTriangle, ArrowUpRight, ArrowDownRight, RefreshCw, Calendar } from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';
import { SkeletonCard } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import ProjectTableView from './ProjectTableView';

interface Project {
    id: string;
    name: string;
    status: string;
    progress: number;
    budget: number;
    spent: number;
    tasksCount: number;
    completedTasks: number;
    teamMembers: string[];
}

interface Task {
    id: string;
    title: string;
    status: string;
    priority: string;
    dueDate: string;
    progress: number;
}

interface Client {
    id: string;
    name: string;
    status: string;
    revenue: number;
}

interface TimesheetEntry {
    id: string;
    hours: number;
    status: string;
}

export default function Dashboard() {
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter'>('month');

    const [projects, setProjects] = useState<Project[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [timesheet, setTimesheet] = useState<TimesheetEntry[]>([]);

    // Fetch dashboard data
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);
                const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

                const [projectsRes, tasksRes, clientsRes, timesheetRes] = await Promise.all([
                    fetch(`${apiUrl}/projects`, { credentials: 'include' }),
                    fetch(`${apiUrl}/tasks`, { credentials: 'include' }),
                    fetch(`${apiUrl}/clients`, { credentials: 'include' }),
                    fetch(`${apiUrl}/timesheet`, { credentials: 'include' }),
                ]);

                if (projectsRes.ok) setProjects(await projectsRes.json());
                if (tasksRes.ok) setTasks(await tasksRes.json());
                if (clientsRes.ok) setClients(await clientsRes.json());
                if (timesheetRes.ok) setTimesheet(await timesheetRes.json());

                setLastUpdated(new Date());
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const calculateStats = (projects: Project[], tasks: Task[], clients: Client[], timesheet: TimesheetEntry[]) => {
        const totalProjects = projects.length;
        const activeProjects = projects.filter(p => p.status === 'active').length;
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === 'completed').length;
        const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
        const overdueTasks = tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'completed').length;
        const upcomingDeadlines = tasks.filter(t => {
            const dueDate = new Date(t.dueDate);
            const now = new Date();
            const diffTime = dueDate.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 7 && diffDays >= 0 && t.status !== 'completed';
        }).length;

        const totalTeamMembers = [...new Set(projects.flatMap(p => p.teamMembers))].length;
        const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
        const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0);
        const budgetRemaining = totalBudget - totalSpent;
        const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
        const totalRevenue = clients.reduce((sum, c) => sum + c.revenue, 0);
        const totalHours = timesheet.reduce((sum, t) => sum + t.hours, 0);

        return {
            projects: totalProjects,
            activeProjects,
            tasks: totalTasks,
            completed: completedTasks,
            inProgress: inProgressTasks,
            overdueTasks,
            upcomingDeadlines,
            team: totalTeamMembers,
            totalBudget,
            totalSpent,
            budgetRemaining,
            budgetUtilization,
            totalRevenue,
            totalHours,
            newMessages: 3,
            completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
        };
    };

    useEffect(() => {
        if (projects.length > 0 || tasks.length > 0 || clients.length > 0 || timesheet.length > 0) {
            const calculatedStats = calculateStats(projects, tasks, clients, timesheet);
            setStats(calculatedStats);
        }
    }, [projects, tasks, clients, timesheet, dateRange]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="h-10 w-24 bg-indigo-200 dark:bg-indigo-900 rounded animate-pulse" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
                <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-16 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    const handleRefresh = () => {
        setIsLoading(true);
        setStats(null);
    };

    const formatTime = (date: Date | null) => {
        if (!date) return '';
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="space-y-6">
            {/* Header with Controls */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {lastUpdated && `Last updated: ${formatTime(lastUpdated)}`}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex gap-2 rounded-lg border border-gray-200 p-1 dark:border-gray-700">
                        {(['week', 'month', 'quarter'] as const).map(range => (
                            <button
                                key={range}
                                onClick={() => setDateRange(range)}
                                className={`rounded px-3 py-1 text-sm font-medium transition-colors ${dateRange === range
                                        ? 'bg-indigo-600 text-white'
                                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                                    }`}
                            >
                                {range.charAt(0).toUpperCase() + range.slice(1)}
                            </button>
                        ))}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        className="gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Projects Card */}
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                        <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.projects || 0}</div>
                        <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 mt-1">
                            <ArrowUpRight className="h-3 w-3" />
                            <span>{stats?.activeProjects || 0} active</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Tasks Card */}
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Task Completion</CardTitle>
                        <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                            <CheckSquare className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{Math.round(stats?.completionRate || 0)}%</div>
                        <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 mt-1">
                            <Clock className="h-3 w-3" />
                            <span>{stats?.inProgress || 0}/{stats?.tasks || 0} in progress</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Budget Card */}
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
                        <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                            <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{Math.round(stats?.budgetUtilization || 0)}%</div>
                        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mt-1">
                            <span>{formatCurrency(stats?.budgetRemaining || 0)} remaining</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Team Card */}
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Team Activity</CardTitle>
                        <div className="h-8 w-8 rounded-lg bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                            <Users className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.team || 0}</div>
                        <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 mt-1">
                            <Clock className="h-3 w-3" />
                            <span>{stats?.totalHours || 0}h logged</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Financial & Priority Stats Row */}
            <div className="grid gap-4 md:grid-cols-4">
                {/* Total Budget */}
                <Card className="border-l-4 border-green-500 hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Budget</p>
                                <p className="text-2xl font-bold text-green-900 dark:text-green-400">{formatCurrency(stats?.totalBudget || 0)}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Across {stats?.projects || 0} projects</p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Total Spent */}
                <Card className="border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Spent</p>
                                <p className="text-2xl font-bold text-blue-900 dark:text-blue-400">{formatCurrency(stats?.totalSpent || 0)}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    {stats?.budgetUtilization ? Math.round(stats.budgetUtilization) : 0}% of budget
                                </p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Overdue Tasks */}
                <Card className={`border-l-4 ${stats?.overdueTasks && stats.overdueTasks > 0 ? 'border-red-500' : 'border-gray-300'} hover:shadow-lg transition-shadow`}>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overdue Tasks</p>
                                <p className={`text-2xl font-bold ${stats?.overdueTasks && stats.overdueTasks > 0 ? 'text-red-900 dark:text-red-400' : 'text-green-900 dark:text-green-400'}`}>
                                    {stats?.overdueTasks || 0}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    {stats?.overdueTasks && stats.overdueTasks > 0 ? 'Needs attention' : 'All on track'}
                                </p>
                            </div>
                            <div className={`h-10 w-10 rounded-full ${stats?.overdueTasks && stats.overdueTasks > 0 ? 'bg-red-100 dark:bg-red-900' : 'bg-green-100 dark:bg-green-900'} flex items-center justify-center`}>
                                <AlertTriangle className={`h-5 w-5 ${stats?.overdueTasks && stats.overdueTasks > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Upcoming Deadlines */}
                <Card className="border-l-4 border-yellow-500 hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Upcoming Deadlines</p>
                                <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-400">{stats?.upcomingDeadlines || 0}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Within 7 days</p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                                <Calendar className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Project Table View with Charts */}
            <ProjectTableView />
        </div>
    );
}
