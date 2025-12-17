import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import ScrollContainer from '@/components/layout/ScrollContainer';
import {
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Calendar,
  FolderKanban,
  Activity,
} from 'lucide-react';

interface StatCard {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trend?: { direction: 'up' | 'down'; percentage: number };
}

interface RecentProject {
  id: string;
  name: string;
  status: 'active' | 'planning' | 'on-hold' | 'completed';
  progress: number;
  team: number;
  dueDate: string;
}

interface PendingTask {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate: string;
  assignee: string;
}

export default function EnhancedDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<StatCard[]>([]);
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [pendingTasks, setPendingTasks] = useState<PendingTask[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);

    try {
      // Simulate loading data
      await new Promise(resolve => setTimeout(resolve, 1000));

      const statsData: StatCard[] = [
        {
          title: 'Active Projects',
          value: 8,
          icon: FolderKanban,
          color: 'blue',
          trend: { direction: 'up', percentage: 12 },
        },
        {
          title: 'Team Members',
          value: 24,
          icon: Users,
          color: 'green',
          trend: { direction: 'up', percentage: 8 },
        },
        {
          title: 'Hours Logged',
          value: '156h',
          icon: Clock,
          color: 'orange',
          trend: { direction: 'down', percentage: 5 },
        },
        {
          title: 'Budget Used',
          value: '$45.2K',
          icon: DollarSign,
          color: 'red',
          trend: { direction: 'up', percentage: 15 },
        },
      ];

      const projectsData: RecentProject[] = [
        {
          id: '1',
          name: 'Mobile App Development',
          status: 'active',
          progress: 65,
          team: 5,
          dueDate: '2024-12-20',
        },
        {
          id: '2',
          name: 'Backend API Redesign',
          status: 'active',
          progress: 45,
          team: 3,
          dueDate: '2024-12-28',
        },
        {
          id: '3',
          name: 'Data Migration',
          status: 'planning',
          progress: 10,
          team: 2,
          dueDate: '2025-01-15',
        },
      ];

      const tasksData: PendingTask[] = [
        {
          id: '1',
          title: 'Complete UI Design Mockups',
          priority: 'high',
          dueDate: '2024-12-15',
          assignee: 'Sarah Chen',
        },
        {
          id: '2',
          title: 'Code Review: Authentication Module',
          priority: 'medium',
          dueDate: '2024-12-16',
          assignee: 'John Doe',
        },
        {
          id: '3',
          title: 'Write API Documentation',
          priority: 'medium',
          dueDate: '2024-12-18',
          assignee: 'Mike Johnson',
        },
      ];

      const eventsData = [
        {
          id: '1',
          title: 'Team Standup',
          date: '2024-12-13',
          time: '09:00 AM',
        },
        {
          id: '2',
          title: 'Sprint Planning',
          date: '2024-12-13',
          time: '02:00 PM',
        },
        {
          id: '3',
          title: 'Client Review',
          date: '2024-12-15',
          time: '10:00 AM',
        },
      ];

      setStats(statsData);
      setRecentProjects(projectsData);
      setPendingTasks(tasksData);
      setUpcomingEvents(eventsData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      planning: 'bg-blue-100 text-blue-800',
      'on-hold': 'bg-yellow-100 text-yellow-800',
      completed: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || colors.planning;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'text-green-600 bg-green-100',
      medium: 'text-yellow-600 bg-yellow-100',
      high: 'text-orange-600 bg-orange-100',
      critical: 'text-red-600 bg-red-100',
    };
    return colors[priority] || colors.medium;
  };

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-50 text-blue-700',
      green: 'bg-green-50 text-green-700',
      orange: 'bg-orange-50 text-orange-700',
      red: 'bg-red-50 text-red-700',
    };
    return colors[color] || colors.blue;
  };

  return (
    <ScrollContainer>
      <div className="space-y-6 p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's your project overview.</p>
          </div>
          <Button onClick={loadDashboardData}>Refresh</Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const colorClass = getColorClass(stat.color);
            return (
              <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${colorClass}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    {stat.trend && (
                      <Badge
                        className={
                          stat.trend.direction === 'up'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }
                      >
                        {stat.trend.direction === 'up' ? '↑' : '↓'} {stat.trend.percentage}%
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Projects */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle>Recent Projects</CardTitle>
                <Button variant="outline" size="sm" onClick={() => navigate('/projects')}>
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentProjects.map(project => (
                    <div
                      key={project.id}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{project.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {project.team} team member{project.team !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                      </div>

                      <div className="mb-2">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium text-gray-900">{project.progress}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 transition-all"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>

                      <p className="text-xs text-gray-500">
                        Due: {new Date(project.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Tasks & Events */}
          <div className="space-y-6">
            {/* Pending Tasks */}
            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  Pending Tasks
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => navigate('/tasks')}>
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingTasks.map(task => (
                    <div key={task.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                          {task.title}
                        </h4>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{task.assignee}</p>
                      <p className="text-xs text-gray-500">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingEvents.map(event => (
                    <div key={event.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="text-sm font-medium text-gray-900">{event.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {new Date(event.date).toLocaleDateString()} at {event.time}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-600" />
              Recent Activity
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => navigate('/activity')}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              <div className="flex items-start gap-3 pb-3 border-b border-gray-200">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Sarah Chen</span> completed task Design user authentication
                  </p>
                  <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                </div>
              </div>

              <div className="flex items-start gap-3 pb-3 border-b border-gray-200">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">John Doe</span> updated project progress to 65%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">5 hours ago</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <Users className="h-4 w-4 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Alice Brown</span> added Mike Johnson to Mobile App project
                  </p>
                  <p className="text-xs text-gray-500 mt-1">1 day ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollContainer>
  );
}
