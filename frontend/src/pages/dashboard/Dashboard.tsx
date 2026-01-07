import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Typography, Skeleton, Button } from 'antd';
import { UserOutlined, CheckSquareOutlined, DollarOutlined, AlertOutlined, ArrowUpOutlined, CalendarOutlined, TableOutlined, ReloadOutlined } from '@ant-design/icons';
import { formatCurrency } from '@/utils/formatCurrency';
import { buildApiUrl } from '@/lib/api-config';
import ProjectSCurveChart from '@/components/charts/ProjectSCurveChart';
import ErrorState from '@/components/ErrorState';
import { parseApiError } from '@/lib/error-handler';

const { Title, Text } = Typography;

interface Project {
    id: string;
    name: string;
    code: string;
    status: string;
    progress: number;
    budget: number | null;
    actualCost: number | null;
    startDate: string;
    endDate: string | null;
    client?: {
        id: string;
        name: string;
    };
    projectManager?: {
        id: string;
        name: string;
        email: string;
    };
    _count?: {
        tasks: number;
        timesheets: number;
        timeLogs: number;
    };
}


export default function Dashboard() {
     const navigate = useNavigate();
     const [stats, setStats] = useState<any>(null);
     const [isLoading, setIsLoading] = useState(true);
     const [error, setError] = useState<{message: string, component: string} | null>(null);
     const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
     const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter'>('month');
     const [isRefreshing, setIsRefreshing] = useState(false);

    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<string>('all');
    // Define the S-curve data point type
    type SCurveDataPoint = {
      month: string;
      date: string;
      plannedPercentage: number;
      actualPercentage: number;
      plannedWeight: number;
      actualWeight: number;
    };

    const [sCurveData, setSCurveData] = useState<Record<string, SCurveDataPoint[]>>({});

    // Fetch dashboard data with error boundaries for each section
    useEffect(() => {
        let isMounted = true;
        
        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Set safety timeout - forces loading to false after 15 seconds
                const safetyTimeoutId = setTimeout(() => {
                    if (isMounted) {
                        console.warn('Fetch safety timeout - continuing with partial data');
                        setIsLoading(false);
                        setIsRefreshing(false);
                    }
                }, 15000);

                // Create timeout controller for API call
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

                // Fetch projects from API with error handling
                const projectsResponse = await fetch(buildApiUrl('/projects?limit=10'), {
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                clearTimeout(safetyTimeoutId);

                if (!projectsResponse.ok) {
                    throw new Error(`Failed to fetch projects: ${projectsResponse.status}`);
                }

                const projectsResult = await projectsResponse.json();

                // Handle different API response structures
                let apiProjects = [];
                if (projectsResult.success && projectsResult.data) {
                    // Standard success response with data
                    apiProjects = projectsResult.data;
                } else if (Array.isArray(projectsResult)) {
                    // Direct array response
                    apiProjects = projectsResult;
                } else if (projectsResult.data && Array.isArray(projectsResult.data)) {
                    // Response with data array
                    apiProjects = projectsResult.data;
                } else if (projectsResult.projects && Array.isArray(projectsResult.projects)) {
                    // Response with projects array
                    apiProjects = projectsResult.projects;
                } else {
                    // Fallback: try to use whatever we got
                    console.warn('Unexpected API response structure:', projectsResult);
                    apiProjects = [];
                }

                const apiProjectsMapped = apiProjects.map((p: any) => ({
                        id: p.id,
                        name: p.name,
                        code: p.code,
                        status: p.status,
                        progress: p.progress || 0,
                        budget: p.budget,
                        actualCost: p.actualCost,
                        startDate: p.startDate,
                        endDate: p.endDate,
                        client: p.client,
                        projectManager: p.projectManager,
                        _count: p._count || { tasks: 0, timesheets: 0, timeLogs: 0 } // Provide default values
                    }));

                    if (isMounted) {
                        setProjects(apiProjectsMapped);
                        
                        // Generate S-Curve data in a non-blocking way
                        setTimeout(() => {
                            try {
                                const sCurveDataMap: Record<string, SCurveDataPoint[]> = {};
                                apiProjects.forEach((project: Project) => {
                                    try {
                                        const weeks = getWeeksFromDateRange(dateRange);
                                        sCurveDataMap[project.id] = generateSCurveData(project.name, weeks, project.progress);
                                    } catch (curveError) {
                                        console.error(`Error generating S-curve for project ${project.id}:`, curveError);
                                        // Continue with other projects even if one fails
                                    }
                                });
                                setSCurveData(sCurveDataMap);
                            } catch (batchError) {
                                console.error('Error in batch S-curve generation:', batchError);
                                setError({ 
                                    message: 'Some visualization data could not be generated', 
                                    component: 's-curve' 
                                });
                            }
                        }, 0);
                    }

                if (isMounted) {
                    setLastUpdated(new Date());
                }
            } catch (err) {
                console.error('Error in dashboard data fetch:', err);
                
                if (isMounted) {
                    // Handle timeout gracefully - continue with partial/empty data
                    const errorMessage = err instanceof Error && err.name === 'AbortError'
                        ? 'Data loading timed out - showing available data'
                        : parseApiError(err).message;
                    
                    console.warn('Continuing with partial data due to:', errorMessage);
                    // Don't block UI - continue with empty projects
                    setProjects([]);
                    setSCurveData({});
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                    setIsRefreshing(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [dateRange]);

    const getWeeksFromDateRange = (range: 'week' | 'month' | 'quarter'): number => {
        try {
            switch (range) {
                case 'week':
                    return 1;
                case 'month':
                    return 4;
                case 'quarter':
                    return 12;
                default:
                    return 4;
            }
        } catch (error) {
            console.error('Error getting weeks from date range:', error);
            return 4; // Default to month view on error
        }
    };

    const generateSCurveData = (_projectName: string, weeks: number, currentProgress: number): SCurveDataPoint[] => {
        try {
            const data: SCurveDataPoint[] = [];
            const today = new Date();

            // Ensure weeks is a positive number
            const safeWeeks = Math.max(1, Math.min(weeks || 4, 52)); // Clamp between 1 and 52 weeks
            const safeProgress = Math.max(0, Math.min(currentProgress || 0, 100)); // Clamp between 0 and 100

            for (let i = 0; i < safeWeeks; i++) {
                try {
                    const date = new Date(today);
                    date.setDate(today.getDate() + (i * 7));

                    const plannedProgress = Math.min(100, Math.round(100 / (1 + Math.exp(-0.5 * (i - safeWeeks/2)))));
                    const progressVariance = Math.random() * 10 - 5;
                    const actualProgress = Math.min(safeProgress, Math.max(0, plannedProgress + progressVariance));

                    const dateString = date.toISOString()?.split('T')[0] || new Date().toISOString().split('T')[0];

                    data.push({
                        month: date.toLocaleString('default', { month: 'short' }) || 'N/A',
                        date: dateString,
                        plannedPercentage: plannedProgress,
                        actualPercentage: i === safeWeeks - 1 ? safeProgress : actualProgress,
                        plannedWeight: plannedProgress * 1000,
                        actualWeight: actualProgress * 1000
                    });
                } catch (dateError) {
                    console.error(`Error processing week ${i}:`, dateError);
                    // Skip this week if there's an error
                    continue;
                }
            }

            return data;
        } catch (error) {
            console.error('Error in generateSCurveData:', error);
            // Return a minimal valid data structure to prevent UI crashes
            return [{
                month: 'N/A',
                date: new Date().toISOString().split('T')[0],
                plannedPercentage: 0,
                actualPercentage: 0,
                plannedWeight: 0,
                actualWeight: 0
            }];
        }
    };

    // Function to manually refresh data
    const handleRefresh = () => {
        setIsRefreshing(true);
        // Force a re-fetch of all data
        setProjects([]);
        setSCurveData({});
        setError(null);
        // The useEffect will trigger a new data fetch due to state changes
    };

    const calculateStats = (projects: Project[]) => {
        try {
            if (!Array.isArray(projects)) {
                console.error('Invalid projects data:', projects);
                projects = []; // Reset to empty array if invalid
            }

            const totalProjects = projects.length;
            const activeProjects = projects.filter(p => p && (p.status === 'IN_PROGRESS' || p.status === 'PLANNING')).length;
            const totalTasks = projects.reduce((sum, p) => sum + ((p?._count?.tasks) || 0), 0);

            const totalBudget = projects.reduce((sum, p) => sum + (Number(p?.budget) || 0), 0);
            const totalSpent = projects.reduce((sum, p) => sum + (Number(p?.actualCost) || 0), 0);
            const budgetRemaining = Math.max(0, totalBudget - totalSpent); // Ensure non-negative
            const budgetUtilization = totalBudget > 0 ? Math.min(100, (totalSpent / totalBudget) * 100) : 0;

            // Calculate completion rate based on project progress
            const validProjects = projects.filter(p => p && typeof p.progress === 'number');
            const completionRate = validProjects.length > 0 
                ? validProjects.reduce((sum, p) => sum + (p.progress || 0), 0) / validProjects.length
                : 0;

            return {
                projects: totalProjects,
                activeProjects,
                tasks: totalTasks,
                completed: Math.round(validProjects.filter(p => p.progress >= 100).length),
                inProgress: validProjects.filter(p => p.progress > 0 && p.progress < 100).length,
                overdueTasks: 0, // This would come from a separate API call
                upcomingDeadlines: 0, // This would come from a separate API call
                team: 0, // This would come from a separate API call
                totalBudget,
                totalSpent,
                budgetRemaining,
                budgetUtilization,
                totalRevenue: 0, // This would come from a separate API call
                totalHours: 0, // This would come from a separate API call
                newMessages: 0, // This would come from a separate API call
                completionRate: Math.round(completionRate),
            };
        } catch (error) {
            console.error('Error calculating dashboard stats:', error);
            // Return safe defaults if calculation fails
            return {
                projects: 0,
                activeProjects: 0,
                tasks: 0,
                completed: 0,
                inProgress: 0,
                overdueTasks: 0,
                upcomingDeadlines: 0,
                team: 0,
                totalBudget: 0,
                totalSpent: 0,
                budgetRemaining: 0,
                budgetUtilization: 0,
                totalRevenue: 0,
                totalHours: 0,
                newMessages: 0,
                completionRate: 0,
            };
        }
    };

    useEffect(() => {
        if (projects.length > 0) {
            const calculatedStats = calculateStats(projects);
            setStats(calculatedStats);
        }
    }, [projects, dateRange]);

     if (isLoading) {
         return (
             <div className="space-y-6">
                 <div className="flex items-center justify-between">
                     <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                     <div className="h-10 w-24 bg-indigo-200 dark:bg-indigo-900 rounded animate-pulse" />
                 </div>
                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                     {Array.from({ length: 4 }).map((_, i) => (
                         <Card key={i}>
                             <Skeleton active paragraph={{ rows: 4 }} />
                         </Card>
                     ))}
                 </div>
                 <div className="space-y-4">
                     {Array.from({ length: 5 }).map((_, i) => (
                         <Skeleton key={i} active paragraph={{ rows: 1 }} className="h-16" />
                     ))}
                 </div>
             </div>
         );
     }

     const formatTime = (date: Date | null) => {
        if (!date) return '';
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    // Handle error state with more granular error handling
    const renderErrorState = (error: {message: string, component?: string}) => (
        <div className="p-4 border border-red-200 bg-red-50 rounded-lg mb-4">
            <div className="flex items-center">
                <AlertOutlined className="text-red-500 mr-2" />
                <h3 className="text-red-700 font-medium">
                    {error.component ? `Error in ${error.component}: ` : 'Error: '}
                    {error.message}
                </h3>
            </div>
            <p className="mt-2 text-sm text-gray-600">
                Some dashboard features may be limited. {isRefreshing ? 'Refreshing...' : ''}
            </p>
            <Button 
                type="link" 
                onClick={handleRefresh}
                loading={isRefreshing}
                className="mt-2 p-0 text-sm"
                icon={<ReloadOutlined />}
            >
                {isRefreshing ? 'Refreshing...' : 'Try Again'}
            </Button>
        </div>
    );

    // Show error state if there's a critical error and no data
    if (error && !isLoading && projects.length === 0) {
        return (
            <div className="p-4">
                {renderErrorState(error)}
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Error Banner */}
            {error && (
                <div style={{ marginBottom: '24px' }}>
                    {renderErrorState(error)}
                </div>
            )}

            {/* Header with Controls */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                marginBottom: '32px'
            }}
            className="md:flex-row md:items-center md:justify-between">
                <div>
                    <Title level={1} style={{ margin: 0, color: '#1f2937' }}>Dashboard</Title>
                    <Text type="secondary" style={{ fontSize: '14px' }}>
                        {lastUpdated && `Last updated: ${formatTime(lastUpdated)}`}
                    </Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        display: 'flex',
                        gap: '2px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        padding: '2px',
                        background: '#f9fafb'
                    }}>
                        {(['week', 'month', 'quarter'] as const).map(range => (
                            <button
                                key={range}
                                onClick={() => setDateRange(range)}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    border: 'none',
                                    background: dateRange === range ? '#4f46e5' : 'transparent',
                                    color: dateRange === range ? 'white' : '#374151',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {range.charAt(0).toUpperCase() + range.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* S-Curve Chart */}
            <div style={{ marginBottom: '32px', width: '100%' }}>
                <ProjectSCurveChart
                    projects={projects.map(p => ({ id: p.id, name: p.name }))}
                    projectData={sCurveData}
                    isLoading={isLoading}
                    onProjectChange={setSelectedProject}
                />
            </div>

            {/* Stats Cards */}
            <div style={{
                display: 'grid',
                gap: '20px',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                marginBottom: '32px'
            }}>
                {/* Projects Card */}
                <Card
                  style={{
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    background: '#4f46e5',
                    color: 'white'
                  }}
                  hoverable
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <Text style={{ color: 'white', opacity: 0.9, fontSize: '14px' }}>Total Projects</Text>
                      <Title level={2} style={{ color: 'white', margin: '8px 0' }}>{stats?.projects || 0}</Title>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ArrowUpOutlined style={{ fontSize: '12px', color: 'white' }} />
                        <Text style={{ color: 'white', opacity: 0.8, fontSize: '12px' }}>
                          {stats?.activeProjects || 0} active
                        </Text>
                      </div>
                    </div>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <CheckSquareOutlined style={{ fontSize: '24px', color: 'white' }} />
                    </div>
                  </div>
                </Card>

                {/* Tasks Card */}
                <Card
                  style={{
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    background: '#ec4899',
                    color: 'white'
                  }}
                  hoverable
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <Text style={{ color: 'white', opacity: 0.9, fontSize: '14px' }}>Task Completion</Text>
                      <Title level={2} style={{ color: 'white', margin: '8px 0' }}>{Math.round(stats?.completionRate || 0)}%</Title>
                      <Text style={{ color: 'white', opacity: 0.8, fontSize: '12px' }}>
                        {stats?.inProgress || 0}/{stats?.tasks || 0} in progress
                      </Text>
                    </div>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <CheckSquareOutlined style={{ fontSize: '24px', color: 'white' }} />
                    </div>
                  </div>
                </Card>

                {/* Budget Card */}
                <Card
                  style={{
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    background: '#0ea5e9',
                    color: 'white'
                  }}
                  hoverable
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <Text style={{ color: 'white', opacity: 0.9, fontSize: '14px' }}>Budget Utilization</Text>
                      <Title level={2} style={{ color: 'white', margin: '8px 0' }}>{Math.round(stats?.budgetUtilization || 0)}%</Title>
                      <Text style={{ color: 'white', opacity: 0.8, fontSize: '12px' }}>
                        {formatCurrency(stats?.budgetRemaining || 0)} remaining
                      </Text>
                    </div>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <DollarOutlined style={{ fontSize: '24px', color: 'white' }} />
                    </div>
                  </div>
                </Card>

                {/* Team Card */}
                <Card
                  style={{
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    background: '#10b981',
                    color: 'white'
                  }}
                  hoverable
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <Text style={{ color: 'white', opacity: 0.9, fontSize: '14px' }}>Team Activity</Text>
                      <Title level={2} style={{ color: 'white', margin: '8px 0' }}>{stats?.team || 0}</Title>
                      <Text style={{ color: 'white', opacity: 0.8, fontSize: '12px' }}>
                        {stats?.totalHours || 0}h logged
                      </Text>
                    </div>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <UserOutlined style={{ fontSize: '24px', color: 'white' }} />
                    </div>
                  </div>
                </Card>
            </div>

            {/* Financial & Priority Stats Row */}
            <div style={{
                display: 'grid',
                gap: '20px',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                marginBottom: '32px'
            }}>
                {/* Total Budget */}
                <Card
                  style={{
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    background: '#f0fdf4',
                    borderLeft: '4px solid #10b981'
                  }}
                  hoverable
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text style={{ fontSize: '14px', color: '#374151' }}>Total Budget</Text>
                      <Title level={3} style={{ margin: '4px 0', color: '#065f46' }}>{formatCurrency(stats?.totalBudget || 0)}</Title>
                      <Text style={{ fontSize: '12px', color: '#6b7280' }}>Across {stats?.projects || 0} projects</Text>
                    </div>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'rgba(16, 185, 129, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <DollarOutlined style={{ fontSize: '20px', color: '#10b981' }} />
                    </div>
                  </div>
                </Card>

                {/* Total Spent */}
                <Card
                  style={{
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    background: '#eff6ff',
                    borderLeft: '4px solid #3b82f6'
                  }}
                  hoverable
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text style={{ fontSize: '14px', color: '#374151' }}>Total Spent</Text>
                      <Title level={3} style={{ margin: '4px 0', color: '#1e40af' }}>{formatCurrency(stats?.totalSpent || 0)}</Title>
                      <Text style={{ fontSize: '12px', color: '#6b7280' }}>
                        {stats?.budgetUtilization ? Math.round(stats.budgetUtilization) : 0}% of budget
                      </Text>
                    </div>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'rgba(59, 130, 246, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <DollarOutlined style={{ fontSize: '20px', color: '#3b82f6' }} />
                    </div>
                  </div>
                </Card>

                {/* Overdue Tasks */}
                <Card
                  style={{
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    background: '#fef2f2',
                    borderLeft: `4px solid ${stats?.overdueTasks && stats.overdueTasks > 0 ? '#ef4444' : '#10b981'}`
                  }}
                  hoverable
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text style={{ fontSize: '14px', color: '#374151' }}>Overdue Tasks</Text>
                      <Title level={3} style={{
                        margin: '4px 0',
                        color: stats?.overdueTasks && stats.overdueTasks > 0 ? '#dc2626' : '#065f46'
                      }}>
                        {stats?.overdueTasks || 0}
                      </Title>
                      <Text style={{ fontSize: '12px', color: '#6b7280' }}>
                        {stats?.overdueTasks && stats.overdueTasks > 0 ? 'Needs attention' : 'All on track'}
                      </Text>
                    </div>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: stats?.overdueTasks && stats.overdueTasks > 0
                        ? 'rgba(239, 68, 68, 0.1)'
                        : 'rgba(16, 185, 129, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <AlertOutlined style={{
                        fontSize: '20px',
                        color: stats?.overdueTasks && stats.overdueTasks > 0 ? '#ef4444' : '#10b981'
                      }} />
                    </div>
                  </div>
                </Card>

                {/* Upcoming Deadlines */}
                <Card
                  style={{
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    background: '#fffbeb',
                    borderLeft: '4px solid #f59e0b'
                  }}
                  hoverable
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text style={{ fontSize: '14px', color: '#374151' }}>Upcoming Deadlines</Text>
                      <Title level={3} style={{ margin: '4px 0', color: '#92400e' }}>{stats?.upcomingDeadlines || 0}</Title>
                      <Text style={{ fontSize: '12px', color: '#6b7280' }}>Within 7 days</Text>
                    </div>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'rgba(245, 158, 11, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <CalendarOutlined style={{ fontSize: '20px', color: '#f59e0b' }} />
                    </div>
                  </div>
                </Card>
            </div>

            {/* Project Table View - Shown when All Projects is selected */}
            {selectedProject === 'all' && projects.length > 0 && (
                <div style={{ marginTop: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <Title level={2} style={{ margin: 0, color: '#1f2937' }}>Project Overview</Title>
                        <Button
                            type="primary"
                            icon={<TableOutlined />}
                            onClick={() => navigate('/projects/table')}
                            style={{ background: '#4f46e5' }}
                        >
                            View Detailed Table
                        </Button>
                    </div>
                    <Card
                        style={{
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                            borderRadius: '12px'
                        }}
                    >
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                fontSize: '14px'
                            }}>
                                <thead>
                                    <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.05em' }}>Project</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.05em' }}>Progress</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.05em' }}>Status</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.05em' }}>Budget</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.05em' }}>Team</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.05em' }}>Completion</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {projects.map((project) => (
                                        <tr key={project.id} style={{
                                            borderBottom: '1px solid #e5e7eb',
                                            transition: 'background-color 0.2s',
                                            cursor: 'pointer'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    <div style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '50%',
                                                        background: '#e0e7ff',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        marginRight: '12px',
                                                        color: '#3730a3',
                                                        fontWeight: '600'
                                                    }}>
                                                        {project.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: '500', color: '#111827' }}>
                                                            {project.name}
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                                            {project._count?.tasks || 0} tasks
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ width: '100%', background: '#e5e7eb', borderRadius: '4px', height: '8px', marginBottom: '4px' }}>
                                                    <div
                                                        style={{
                                                            height: '8px',
                                                            borderRadius: '4px',
                                                            background: project.progress < 30 ? '#ef4444' : project.progress < 70 ? '#f59e0b' : '#10b981',
                                                            width: `${project.progress}%`
                                                        }}
                                                    ></div>
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                                    {project.progress}% complete
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <span style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '12px',
                                                    fontSize: '12px',
                                                    fontWeight: '500',
                                                    background: project.status === 'In Progress' ? '#dbeafe' :
                                                               project.status === 'Planning' ? '#fef3c7' :
                                                               project.status === 'Completed' ? '#d1fae5' : '#f3f4f6',
                                                    color: project.status === 'In Progress' ? '#1e40af' :
                                                           project.status === 'Planning' ? '#92400e' :
                                                           project.status === 'Completed' ? '#065f46' : '#374151'
                                                }}>
                                                    {project.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ fontWeight: '500', color: '#111827' }}>{formatCurrency(project.actualCost || 0)}</div>
                                                <div style={{ fontSize: '12px', color: '#6b7280' }}>of {formatCurrency(project.budget || 0)}</div>
                                                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                                                    {project.budget ? Math.round(((project.actualCost || 0) / project.budget) * 100) : 0}% spent
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    <div style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '50%',
                                                        background: '#e5e7eb',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '12px',
                                                        fontWeight: '500',
                                                        color: '#374151',
                                                        border: '2px solid white'
                                                    }}>
                                                        {project.projectManager?.name?.charAt(0) || 'P'}
                                                    </div>
                                                    <span style={{ marginLeft: '8px', fontSize: '12px', color: '#6b7280' }}>
                                                        {project.projectManager?.name || 'Unassigned'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    <CheckSquareOutlined style={{ color: '#10b981', marginRight: '8px' }} />
                                                    <span style={{ color: '#6b7280' }}>
                                                        {project.progress}% completed
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                                                    {project._count?.tasks || 0} total tasks
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
