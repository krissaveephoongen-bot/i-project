import { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Activity as ActivityIcon, Users, CheckSquare, Clock, User, Settings, Search, Filter, FolderKanban, RefreshCw } from 'lucide-react';
import ErrorState from '@/components/ErrorState';
import { parseApiError } from '@/lib/error-handler';
import LoadingState from '@/components/LoadingState';
import EmptyState from '@/components/EmptyState';
import { apiRequest } from '@/lib/api-client';

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
  // State management
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('7');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  // Get unique users from activities
  const uniqueUsers = [...new Set(activities.map(a => a.user))];

  // Format timestamp to relative time
  const formatTimestamp = (timestamp: string): string => {
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

  // Get icon for activity type
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

  // Get color for activity type
  const getActivityColor = (type: ActivityItem['type']): string => {
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

  // Get badge color based on action
  const getActionBadgeColor = (action: string): string => {
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

  // Filter activities based on filters
  const filterActivities = () => {
    let filtered = [...activities];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(activity =>
        activity.description.toLowerCase().includes(query) ||
        activity.user.toLowerCase().includes(query) ||
        (activity.entityName && activity.entityName.toLowerCase().includes(query))
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
    if (dateFilter !== 'all') {
      const days = parseInt(dateFilter);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      filtered = filtered.filter(activity => new Date(activity.timestamp) >= cutoffDate);
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setFilteredActivities(filtered);
  };

  // Load activities from API
  const loadActivities = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await apiRequest<ActivityItem[]>('/api/activities');
      setActivities(data || []);
    } catch (err) {
      console.error('Error loading activities:', err);
      setError(parseApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Load activities on component mount
  useEffect(() => {
    loadActivities();
  }, []);

  // Update filtered activities when filters change
  useEffect(() => {
    filterActivities();
  }, [activities, searchQuery, typeFilter, userFilter, dateFilter]);

  // Error state
  if (error && !isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
          <Button onClick={loadActivities} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
        <ErrorState 
          error={error}
          onRetry={loadActivities}
        />
      </div>
    );
  }

  // Loading state
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

  // Empty state
  if (filteredActivities.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
        <EmptyState
          icon="📊"
          title="No activities found"
          description="There are no activities matching your filters."
          action={{
            label: "Clear Filters",
            onClick: () => {
              setSearchQuery('');
              setTypeFilter('all');
              setUserFilter('all');
              setDateFilter('7');
            }
          }}
        />
      </div>
    );
  }

  // Main view
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
        <Button onClick={loadActivities} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid gap-4 md:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search activities..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Activity Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="task">Tasks</SelectItem>
                <SelectItem value="project">Projects</SelectItem>
                <SelectItem value="timesheet">Timesheets</SelectItem>
                <SelectItem value="client">Clients</SelectItem>
                <SelectItem value="user">Users</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger>
                <SelectValue placeholder="User" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {uniqueUsers.map(user => (
                  <SelectItem key={user} value={user}>{user}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Last 24 Hours</SelectItem>
                <SelectItem value="7">Last 7 Days</SelectItem>
                <SelectItem value="30">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('all');
                setUserFilter('all');
                setDateFilter('7');
              }}
              className="w-full"
            >
              <Filter className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Activity List */}
      <div className="grid gap-4">
        {filteredActivities.map((activity) => {
          const IconComponent = getActivityIcon(activity.type);
          const colors = getActivityColor(activity.type);
          const badgeColor = getActionBadgeColor(activity.action);

          return (
            <Card key={activity.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className={`${colors} p-3 rounded-lg`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-gray-900">{activity.description}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {activity.user} • {formatTimestamp(activity.timestamp)}
                        </p>
                      </div>
                      <Badge className={badgeColor}>
                        {activity.action.charAt(0).toUpperCase() + activity.action.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
