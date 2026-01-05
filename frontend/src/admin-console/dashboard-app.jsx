// Import auth utilities
import React from 'react';
import ReactDOM from 'react-dom/client';
import { isAuthenticated, requireAuth, logout } from './utils/auth';

// API utilities
const API = {
    auth: {
        isAuthenticated: () => isAuthenticated(),
        getCurrentUser: () => {
            const user = localStorage.getItem('user');
            return user ? JSON.parse(user) : null;
        },
        logout: async () => {
            logout();
            return Promise.resolve();
        }
    },
    analytics: {
        getDashboardStats: async () => ({
            totalUsers: 1,
            activeProjects: 1,
            pendingApprovals: 0,
            totalRevenue: 0
        }),
        getRecentActivities: async () => [
            {
                id: 1,
                user: 'System',
                action: 'Admin console initialized',
                time: 'Just now',
                type: 'system'
            }
        ]
    }
};

// Project Status Summary Component
function ProjectStatusSummary({ stats, isLoading }) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    </div>
                ))}
            </div>
        );
    }

    const statusConfig = {
        active: { label: 'โครงการที่กำลังดำเนินการ', color: 'bg-blue-500', text: 'text-blue-100' },
        completed: { label: 'โครงการที่เสร็จสิ้น', color: 'bg-green-500', text: 'text-green-100' },
        on_hold: { label: 'โครงการที่ระงับ', color: 'bg-yellow-500', text: 'text-yellow-100' },
        cancelled: { label: 'โครงการที่ยกเลิก', color: 'bg-red-500', text: 'text-red-100' }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {Object.entries(statusConfig).map(([status, config]) => (
                <div key={status} className={`${config.color} rounded-lg shadow p-6 text-white`}>
                    <p className="text-sm font-medium mb-1">{config.label}</p>
                    <p className="text-2xl font-bold">{stats[status] || 0} <span className="text-sm font-normal">โครงการ</span></p>
                </div>
            ))}
        </div>
    );
}

function StatCard({ icon, title, value, change, changeType = 'increase' }) {
    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="text-2xl font-semibold text-gray-900">{value}</p>
                </div>
                <div className={`p-3 rounded-full ${getIconBgColor(icon)}`}>
                    <i className={`${getIconClass(icon)} text-white`}></i>
                </div>
            </div>
            {change !== undefined && (
                <div className={`mt-2 text-sm ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                    <span className="font-medium">{change}%</span> from last month
                </div>
            )}
        </div>
    );
}

function ActivityItem({ activity }) {
    return (
        <div className="flex items-start pb-4">
            <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <i className={`${getActivityIcon(activity.type)} text-blue-600`}></i>
                </div>
            </div>
            <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                <p className="text-sm text-gray-500">{activity.action}</p>
                <p className="text-xs text-gray-400">{activity.time}</p>
            </div>
        </div>
    );
}

// Project status table component
// Risk Indicator Chart component
function RiskIndicatorChart({ projects, isLoading }) {
    // Calculate risk distribution with impact and probability
    const calculateRiskDistribution = () => {
        if (!projects.length) return [];

        const riskMatrix = {
            'Very High': { count: 0, impact: 4, probability: 4 },
            'High': { count: 0, impact: 3, probability: 3 },
            'Medium': { count: 0, impact: 2, probability: 2 },
            'Low': { count: 0, impact: 1, probability: 1 }
        };

        projects.forEach(project => {
            // Calculate risk score based on impact and probability if available
            const impact = project.impact_level || 1;
            const probability = project.probability_level || 1;
            const riskScore = impact * probability;

            let riskLevel = 'Low';
            if (riskScore >= 12) riskLevel = 'Very High';
            else if (riskScore >= 6) riskLevel = 'High';
            else if (riskScore >= 3) riskLevel = 'Medium';

            riskMatrix[riskLevel].count++;
        });

        return Object.entries(riskMatrix).map(([level, data]) => ({
            level,
            count: data.count,
            impact: data.impact,
            probability: data.probability,
            percentage: Math.round((data.count / projects.length) * 100) || 0
        }));
    };

    const riskData = calculateRiskDistribution();

    const getRiskColor = (level, isBackground = false) => {
        const colors = {
            'Very High': isBackground ? 'bg-red-600' : 'bg-red-500',
            'High': isBackground ? 'bg-orange-500' : 'bg-orange-400',
            'Medium': isBackground ? 'bg-yellow-400' : 'bg-yellow-300',
            'Low': isBackground ? 'bg-green-500' : 'bg-green-400'
        };
        return colors[level] || (isBackground ? 'bg-gray-300' : 'bg-gray-200');
    };

    const getRiskLabel = (level) => {
        const labels = {
            'Very High': 'ความเสี่ยงสูงมาก',
            'High': 'ความเสี่ยงสูง',
            'Medium': 'ความเสี่ยงปานกลาง',
            'Low': 'ความเสี่ยงต่ำ'
        };
        return labels[level] || level;
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
                    <div className="space-y-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-4 bg-gray-100 rounded w-full"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // Calculate risk matrix position
    const getRiskPosition = (level) => {
        const positions = {
            'Very High': 'col-start-3 col-end-4 row-start-1 row-end-2',
            'High': 'col-start-2 col-end-3 row-start-2 row-end-3',
            'Medium': 'col-start-1 col-end-2 row-start-2 row-end-3',
            'Low': 'col-start-1 col-end-2 row-start-1 row-end-2'
        };
        return positions[level] || '';
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Risk Indicator</h3>
                <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">ความเสี่ยงทั้งหมด: {projects.length} โครงการ</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Risk Matrix */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-center text-sm font-medium text-gray-500 mb-2">ความรุนแรง (Impact)</div>
                    <div className="grid grid-cols-3 gap-1 h-48">
                        <div className="bg-red-100 rounded-tl-lg p-2 text-xs flex items-end justify-center">สูง</div>
                        <div className="bg-yellow-100 p-2 text-xs flex items-end justify-center">ปานกลาง</div>
                        <div className="bg-green-100 rounded-tr-lg p-2 text-xs flex items-end justify-center">ต่ำ</div>

                        {riskData.map(({ level, count }) => (
                            <div
                                key={level}
                                className={`${getRiskPosition(level)} ${getRiskColor(level, true)} rounded-lg p-2 flex flex-col items-center justify-center text-white font-medium text-sm`}
                            >
                                <span>{getRiskLabel(level)}</span>
                                <span className="text-xs">{count} โครงการ</span>
                            </div>
                        ))}

                        <div className="bg-gray-100 rounded-bl-lg p-2 text-xs flex items-center justify-center rotate-[-90deg] transform origin-left">
                            <span>ความน่าจะเกิด (Probability)</span>
                        </div>
                        <div className="bg-gray-100 p-2"></div>
                        <div className="bg-gray-100 rounded-br-lg p-2"></div>
                    </div>
                </div>

                {/* Risk Distribution */}
                <div className="space-y-4">
                    {riskData.map(({ level, count, percentage }) => (
                        <div key={level} className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium flex items-center">
                                    <span className={`w-3 h-3 rounded-full ${getRiskColor(level)} mr-2`}></span>
                                    {getRiskLabel(level)}
                                </span>
                                <span className="text-gray-500">{count} โครงการ ({percentage}%)</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                    className={`h-2.5 rounded-full ${getRiskColor(level)}`}
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            );
};

            function ProjectStatusTable({projects = [], isLoading = false}) {
  if (isLoading) {
    return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-12 bg-gray-100 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
            );
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
                active: 'bg-green-100 text-green-800',
            completed: 'bg-blue-100 text-blue-800',
            on_hold: 'bg-yellow-100 text-yellow-800',
            cancelled: 'bg-red-100 text-red-800',
            planning: 'bg-purple-100 text-purple-800'
    };

            const statusText = {
                active: 'กำลังดำเนินการ',
            completed: 'เสร็จสิ้น',
            on_hold: 'ระงับ',
            cancelled: 'ยกเลิก',
            planning: 'วางแผน'
    };

            return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
                {statusText[status] || status}
            </span>
            );
  };

  const getProgressColor = (progress) => {
    if (progress < 30) return 'bg-red-500';
            if (progress < 70) return 'bg-yellow-500';
            return 'bg-green-500';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
            const options = {year: 'numeric', month: 'short', day: 'numeric' };
            return new Date(dateString).toLocaleDateString('th-TH', options);
  };

            return (
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">สถานะโครงการ</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ลำดับ
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ชื่อโครงการ
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    สถานะ
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    วันที่เริ่มต้น
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    วันที่สิ้นสุด
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ความคืบหน้า
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    งบประมาณ (บาท)
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {projects.length > 0 ? (
                                projects.map((project, index) => (
                                    <tr key={project.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{project.name}</div>
                                            <div className="text-sm text-gray-500">{project.code || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(project.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(project.start_date)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(project.end_date)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                <div
                                                    className={`h-2.5 rounded-full ${getProgressColor(project.progress || 0)}`}
                                                    style={{ width: `${project.progress || 0}%` }}
                                                ></div>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1 text-right">
                                                {project.progress || 0}%
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                            {project.budget ? new Intl.NumberFormat('th-TH').format(project.budget) : '-'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                                        ไม่พบข้อมูลโครงการ
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            );
};

            function AdminDashboard() {
  const [stats, setStats] = React.useState({
                totalUsers: 0,
            activeProjects: 0,
            pendingApprovals: 0,
            totalRevenue: 0,
  });

            const [projects, setProjects] = React.useState([]);
            const [projectStats, setProjectStats] = React.useState({
                active: 0,
            completed: 0,
            on_hold: 0,
            cancelled: 0
  });
            const [isLoadingProjects, setIsLoadingProjects] = React.useState(true);
            const [recentActivities, setRecentActivities] = React.useState([]);
            const [isLoading, setIsLoading] = React.useState(true);
            const [error, setError] = React.useState(null);
            const [currentUser, setCurrentUser] = React.useState(null);

  // Check authentication and role on component mount
  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check authentication and redirect if not authenticated
        if (!requireAuth()) {
          return;
        }

            const user = API.auth.getCurrentUser();

            // Check if user has admin role
            if (!user || user.role !== 'admin') {
                logout();
            return;
        }

            setCurrentUser(user);
            await loadDashboardData();
      } catch (err) {
                setError('Failed to load dashboard data. Please try again.');
            console.error('Dashboard error:', err);
            logout();
      } finally {
                setIsLoading(false);
      }
    };

            checkAuth();
  }, []);

  React.useEffect(() => {
                loadDashboardData();
            loadProjects();
  }, []);

  // Fetch projects data
  const loadProjects = async () => {
    try {
                setIsLoadingProjects(true);
            const response = await fetch('/api/admin/projects', {
                headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        }
      });

            if (response.ok) {
        const data = await response.json();
            const projectsData = data.data || [];
            setProjects(projectsData);

            // Calculate project stats
            const stats = {
                active: 0,
            completed: 0,
            on_hold: 0,
            cancelled: 0
        };
        
        projectsData.forEach(project => {
          if (project.status && stats.hasOwnProperty(project.status)) {
                stats[project.status]++;
          }
        });

            setProjectStats(stats);
      } else {
                console.error('Failed to fetch projects');
            setProjects([]);
            setProjectStats({
                active: 0,
            completed: 0,
            on_hold: 0,
            cancelled: 0
        });
      }
    } catch (error) {
                console.error('Error fetching projects:', error);
            setProjects([]);
    } finally {
                setIsLoadingProjects(false);
    }
  };

  const loadDashboardData = async () => {
    try {
                setIsLoading(true);
            setError(null);

            // Fetch dashboard stats from API
            const response = await fetch('/api/admin/dashboard/stats', {
                headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        }
      });

            if (response.ok) {
        const statsData = await response.json();
            setStats({
                totalUsers: statsData.users?.total_users || 0,
            activeProjects: statsData.projects?.active_projects || 0,
            pendingApprovals: statsData.timesheets?.pending_approvals || 0,
            totalRevenue: 0, // Not available in current API
        });
      }

            // Fetch recent activities from database
            try {
        const activitiesResponse = await fetch('/api/activities/recent', {
                headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          }
        });
            if (activitiesResponse.ok) {
          const activitiesData = await activitiesResponse.json();
            setRecentActivities(activitiesData);
        } else {
                setRecentActivities([]);
        }
      } catch (err) {
                console.error('Error fetching activities:', err);
            setRecentActivities([]);
      }
    } catch (err) {
                console.error('Error loading dashboard data:', err);
            setError('Failed to load dashboard data. Please try again.');
    } finally {
                setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
                await API.auth.logout();
    } catch (err) {
                console.error('Logout error:', err);
    } finally {
                logout();
    }
  };

  // Helper functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
                style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
    }).format(amount);
  };

  const getIconClass = (icon) => {
    const icons = {
                users: 'fas fa-users',
            folder: 'fas fa-folder',
            clock: 'fas fa-clock',
            'dollar-sign': 'fas fa-dollar-sign',
    };
            return icons[icon] || 'fas fa-info-circle';
  };

  const getIconBgColor = (icon) => {
    const colors = {
                users: 'bg-indigo-100',
            projects: 'bg-green-100',
            approvals: 'bg-yellow-100',
            revenue: 'bg-blue-100',
    };
            return colors[icon] || 'bg-gray-100';
  };

  const getActivityIcon = (type) => {
    const icons = {
                user: 'fas fa-user-plus',
            project: 'fas fa-project-diagram',
            task: 'fas fa-tasks',
            document: 'fas fa-file-alt',
    };
            return icons[type] || 'fas fa-info-circle';
  };

            if (isLoading) {
    return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
            );
  }

            if (error) {
    return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
                    <div className="text-red-500 mb-4">
                        <i className="fas fa-exclamation-circle text-4xl"></i>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Dashboard</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={loadDashboardData}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Retry
                    </button>
                </div>
            </div>
            );
  }

            const statCards = [
            {label: 'Total Users', value: stats.totalUsers, icon: 'users', color: 'blue' },
            {label: 'Active Projects', value: stats.activeProjects, icon: 'folder', color: 'green' },
            {label: 'Pending Approvals', value: stats.pendingApprovals, icon: 'clock', color: 'amber' },
            {label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: 'dollar-sign', color: 'blue' }
            ];

            return (
            <div className="min-h-screen bg-gray-100">
                <div className="flex">
                    {/* Sidebar */}
                    <div className="w-64 bg-white shadow-md">
                        {/* Sidebar content */}
                    </div>

                    {/* Main content */}
                    <main className="flex-1 p-6">
                        <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

                        {/* Stats Grid */}
                        {/* Project Status Summary */}
                        <ProjectStatusSummary
                            stats={projectStats}
                            isLoading={isLoadingProjects}
                        />

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                            {statCards.map((card, index) => (
                                <StatCard
                                    key={index}
                                    icon={card.icon}
                                    title={card.label}
                                    value={card.value}
                                />
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                            {/* Risk Indicator Chart */}
                            <div className="lg:col-span-1">
                                <RiskIndicatorChart
                                    projects={projects}
                                    isLoading={isLoadingProjects}
                                />
                            </div>

                            {/* Project Status Table */}
                            <div className="lg:col-span-2">
                                <ProjectStatusTable
                                    projects={projects}
                                    isLoading={isLoadingProjects}
                                />
                            </div>
                        </div>

                        {/* Recent Activities */}
                        <div className="mt-6 bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activities</h2>
                            <div className="space-y-4">
                                {recentActivities.map((activity, index) => (
                                    <ActivityItem key={index} activity={activity} />
                                ))}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
            );
};

            // Export the component
            export default AdminDashboard;

            // Initialize the app
            const root = ReactDOM.createRoot(document.getElementById('root'));
            root.render(
            <React.StrictMode>
                <AdminDashboard />
            </React.StrictMode>
            );
