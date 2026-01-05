import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Activity as ActivityIcon, Users, CheckSquare, Clock, User, Settings, Search, Filter, FolderKanban, Calendar } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'task' | 'project' | 'client' | 'timesheet' | 'user' | 'system';
  action: string;
  description: string;
  user: string;
  timestamp: string;
  entityId?: string;
  entityName?: string;
  metadata?: any;
}

export default function Activity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('7');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  useEffect(() => {
    filterActivities();
  }, [activities, searchQuery, typeFilter, userFilter, dateFilter]);

  const loadActivities = async () => {
    setIsLoading(true);

    // Mock activity data
    const mockActivities: ActivityItem[] = [
      {
        id: '1',
        type: 'task',
        action: 'completed',
        description: 'Completed task "Design user authentication flow"',
        user: 'Sarah Chen',
        timestamp: '2024-12-04T10:30:00Z',
        entityId: 'task-1',
        entityName: 'Design user authentication flow'
      },
      {
        id: '2',
        type: 'project',
        action: 'updated',
        description: 'Updated project progress to 65%',
        user: 'John Doe',
        timestamp: '2024-12-04T09:15:00Z',
        entityId: 'proj-1',
        entityName: 'Mobile App Development'
      },
      {
        id: '3',
        type: 'timesheet',
        action: 'logged',
        description: 'Logged 8 hours on "API Integration" project',
        user: 'Mike Johnson',
        timestamp: '2024-12-04T08:45:00Z',
        entityId: 'timesheet-1',
        entityName: 'API Integration'
      },
      {
        id: '4',
        type: 'client',
        action: 'created',
        description: 'Created new client "TechCorp Solutions"',
        user: 'Jane Smith',
        timestamp: '2024-12-03T16:20:00Z',
        entityId: 'client-1',
        entityName: 'TechCorp Solutions'
      },
      {
        id: '5',
        type: 'task',
        action: 'created',
        description: 'Created new task "Setup CI/CD pipeline"',
        user: 'John Doe',
        timestamp: '2024-12-03T14:10:00Z',
        entityId: 'task-4',
        entityName: 'Setup CI/CD pipeline'
      },
      {
        id: '6',
        type: 'project',
        action: 'created',
        description: 'Created new project "Data Migration"',
        user: 'Alice Brown',
        timestamp: '2024-12-02T11:30:00Z',
        entityId: 'proj-3',
        entityName: 'Data Migration'
      },
      {
        id: '7',
        type: 'user',
        action: 'login',
        description: 'User logged in',
        user: 'John Doe',
        timestamp: '2024-12-04T08:00:00Z'
      },
      {
        id: '8',
        type: 'system',
        action: 'backup',
        description: 'Automated system backup completed',
        user: 'System',
        timestamp: '2024-12-04T02:00:00Z'
      },
      {
        id: '9',
        type: 'task',
        action: 'overdue',
        description: 'Task "Write unit tests" is now overdue',
        user: 'System',
        timestamp: '2024-12-03T23:59:00Z',
        entityId: 'task-5',
        entityName: 'Write unit tests'
      },
      {
        id: '10',
        type: 'timesheet',
        action: 'approved',
        description: 'Timesheet approved for week ending 2024-12-01',
        user: 'Jane Smith',
        timestamp: '2024-12-02T17:00:00Z'
      }
    ];

    await new Promise(resolve => setTimeout(resolve, 1000));
    setActivities(mockActivities);
    setIsLoading(false);
  };

  const filterActivities = () => {
    let filtered = activities;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(activity =>
        activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (activity.entityName && activity.entityName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(activity => activity.type === typeFilter);
    }

    // User filter
    if (userFilter !== 'all') {
      filtered = filtered.filter(activity => activity.user === userFilter);
    }

    // Date filter
    const now = new Date();
    const days = parseInt(dateFilter);
    const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    filtered = filtered.filter(activity => new Date(activity.timestamp) >= cutoffDate);

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setFilteredActivities(filtered);
  };

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'task': return CheckSquare;
      case 'project': return FolderKanban;
      case 'client': return Users;
      case 'timesheet': return Clock;
      case 'user': return User;
      case 'system': return Settings;
      default: return ActivityIcon;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'task': return 'text-blue-600 bg-blue-100';
      case 'project': return 'text-purple-600 bg-purple-100';
      case 'client': return 'text-green-600 bg-green-100';
      case 'timesheet': return 'text-orange-600 bg-orange-100';
      case 'user': return 'text-indigo-600 bg-indigo-100';
      case 'system': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'created': return 'bg-blue-100 text-blue-800';
      case 'updated': return 'bg-yellow-100 text-yellow-800';
      case 'deleted': return 'bg-red-100 text-red-800';
      case 'logged': return 'bg-purple-100 text-purple-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'login': return 'bg-gray-100 text-gray-800';
      case 'backup': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const uniqueUsers = [...new Set(activities.map(a => a.user))];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
        <div className="grid gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-gray-200 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Activity Log</h1>
          <p className="text-gray-500 mt-1">Track all activities and changes in the system</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Activity Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="task">Tasks</SelectItem>
                  <SelectItem value="project">Projects</SelectItem>
                  <SelectItem value="client">Clients</SelectItem>
                  <SelectItem value="timesheet">Timesheets</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">User</label>
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Users</SelectItem>
                  {uniqueUsers.map(user => (
                    <SelectItem key={user} value={user}>{user}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="1">Last 24 hours</SelectItem>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={() => {
                setSearchQuery('');
                setTypeFilter('all');
                setUserFilter('all');
                setDateFilter('7');
              }}>
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ActivityIcon className="h-5 w-5" />
            Activity Feed
            <Badge variant="outline" className="ml-auto">
              {filteredActivities.length} activities
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-8">
                <ActivityIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
                <p className="text-gray-500">Try adjusting your filters to see more activities.</p>
              </div>
            ) : (
              filteredActivities.map(activity => {
                const IconComponent = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${getActivityColor(activity.type)}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                        <Badge className={getActionBadgeColor(activity.action)}>
                          {activity.action}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {activity.type}
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-700 mb-2">{activity.description}</p>

                      {activity.entityName && (
                        <p className="text-xs text-gray-500 mb-2">
                          Related: <span className="font-medium">{activity.entityName}</span>
                        </p>
                      )}

                      <p className="text-xs text-gray-500">
                        {formatTimestamp(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Activities</p>
                <p className="text-2xl font-bold text-gray-900">{activities.length}</p>
              </div>
              <ActivityIcon className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Activities</p>
                <p className="text-2xl font-bold text-green-900">
                  {activities.filter(a => {
                    const today = new Date().toDateString();
                    return new Date(a.timestamp).toDateString() === today;
                  }).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-purple-900">{uniqueUsers.length}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Events</p>
                <p className="text-2xl font-bold text-orange-900">
                  {activities.filter(a => a.type === 'system').length}
                </p>
              </div>
              <Settings className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
