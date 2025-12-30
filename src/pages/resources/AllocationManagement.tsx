import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Plus,
  TrendingUp,
  Users,
  Briefcase,
  Search,
  Trash2,
  Clock,
  AlertCircle,
  Check,
  Pause,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ResourceAllocation } from '@/types/resource';

interface AllocationWithUser extends ResourceAllocation {
  userName?: string;
  userEmail?: string;
}

interface UserWithAllocations {
  userId: string;
  userName: string;
  userEmail: string;
  totalCapacity: number;
  allocatedCapacity: number;
  availableCapacity: number;
  utilizationPercentage: number;
  allocations: AllocationWithUser[];
}

export default function AllocationManagement() {
  const [users, setUsers] = useState<UserWithAllocations[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewAllocationModal, setShowNewAllocationModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithAllocations | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterUtilization, setFilterUtilization] = useState<string>('all');

  const [newAllocation, setNewAllocation] = useState({
    projectName: '',
    allocatedHours: '',
    startDate: '',
    endDate: '',
    role: '',
    status: 'active' as const,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/resources', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch resources');
      }

      const resourcesData = await response.json();

      // Transform the API response to match UserWithAllocations format
      const transformedUsers: UserWithAllocations[] = resourcesData.map((resource: any) => {
        const allocatedCapacity = resource.projects?.reduce((sum: number, p: any) => sum + (p.allocatedHours || 0), 0) || 0;
        const availableCapacity = Math.max(0, (resource.totalCapacity || 0) - allocatedCapacity);
        const utilizationPercentage = resource.totalCapacity ? (allocatedCapacity / resource.totalCapacity) * 100 : 0;

        return {
          userId: resource.userId,
          userName: resource.userName || 'Unknown User',
          userEmail: resource.userEmail || '',
          totalCapacity: resource.totalCapacity || 160,
          allocatedCapacity,
          availableCapacity,
          utilizationPercentage,
          allocations: (resource.projects || []).map((proj: any) => ({
            projectId: proj.projectId,
            projectName: proj.projectName,
            allocatedHours: proj.allocatedHours || 0,
            startDate: new Date(proj.startDate),
            endDate: new Date(proj.endDate),
            role: proj.role || 'Team Member',
            status: proj.status || 'active',
            userName: resource.userName,
            userEmail: resource.userEmail,
          })),
        };
      });

      setUsers(transformedUsers);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load allocation data');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAllocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !newAllocation.projectName.trim() || !newAllocation.allocatedHours) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const allocatedHours = parseFloat(newAllocation.allocatedHours);
      
      // Call the API to allocate resource
      const response = await fetch(`/api/resources/${selectedUser.userId}/allocate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          projectName: newAllocation.projectName,
          allocatedHours,
          startDate: newAllocation.startDate,
          endDate: newAllocation.endDate,
          role: newAllocation.role,
          status: newAllocation.status,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create allocation');
      }

      toast.success('Allocation created successfully');
      setShowNewAllocationModal(false);
      setNewAllocation({
        projectName: '',
        allocatedHours: '',
        startDate: '',
        endDate: '',
        role: '',
        status: 'active',
      });
      
      // Reload data to refresh
      await loadData();
    } catch (error: any) {
      console.error('Error creating allocation:', error);
      toast.error(error?.message || 'Failed to create allocation');
    }
  };

  const handleRemoveAllocation = async (userId: string, projectId: string) => {
    if (!window.confirm('Remove this allocation?')) return;

    try {
      const response = await fetch(`/api/resources/${userId}/deallocate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ projectId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to remove allocation');
      }

      toast.success('Allocation removed');
      
      // Reload data to refresh
      await loadData();
    } catch (error: any) {
      console.error('Error removing allocation:', error);
      toast.error(error?.message || 'Failed to remove allocation');
    }
  };

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-100 text-red-800';
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getUtilizationTextColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      'on-hold': 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || colors.active;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Check className="h-4 w-4" />;
      case 'completed':
        return <Check className="h-4 w-4" />;
      case 'on-hold':
        return <Pause className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'over' && user.utilizationPercentage > 90) ||
      (filterStatus === 'critical' && user.utilizationPercentage > 100);

    const matchesUtilization =
      filterUtilization === 'all' ||
      (filterUtilization === 'high' && user.utilizationPercentage >= 70) ||
      (filterUtilization === 'medium' &&
        user.utilizationPercentage >= 50 &&
        user.utilizationPercentage < 70) ||
      (filterUtilization === 'low' && user.utilizationPercentage < 50);

    return matchesSearch && matchesStatus && matchesUtilization;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Resource Allocation
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage team member allocations across projects
          </p>
        </div>
        <Button
          onClick={() => {
            if (!selectedUser) {
              toast.error('Please select a user first');
              return;
            }
            setShowNewAllocationModal(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          New Allocation
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{users.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Allocations</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {users.reduce((sum, u) => sum + u.allocations.length, 0)}
                </p>
              </div>
              <Briefcase className="h-8 w-8 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Avg. Utilization
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {(
                    users.reduce((sum, u) => sum + u.utilizationPercentage, 0) / users.length
                  ).toFixed(0)}
                  %
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="over">Over Capacity</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Utilization
              </label>
              <select
                value={filterUtilization}
                onChange={(e) => setFilterUtilization(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Levels</option>
                <option value="high">High (70%+)</option>
                <option value="medium">Medium (50-70%)</option>
                <option value="low">Low (&lt;50%)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users and Allocations */}
      {filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? 'No users found matching your search' : 'No allocation data available'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <Card
              key={user.userId}
              className={`hover:shadow-lg transition-all cursor-pointer ${
                selectedUser?.userId === user.userId ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedUser(user)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                      {user.userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base">{user.userName}</CardTitle>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user.userEmail}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${getUtilizationColor(
                      user.utilizationPercentage
                    )}`}
                  >
                    <TrendingUp className="h-4 w-4" />
                    {user.utilizationPercentage.toFixed(0)}%
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Capacity Overview */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Total Capacity
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {user.totalCapacity}h
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Allocated
                    </p>
                    <p className="text-lg font-bold text-blue-600">{user.allocatedCapacity}h</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Available</p>
                    <p
                      className={`text-lg font-bold ${getUtilizationTextColor(
                        user.utilizationPercentage
                      )}`}
                    >
                      {user.availableCapacity}h
                    </p>
                  </div>
                </div>

                {/* Utilization Bar */}
                <div>
                  <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        user.utilizationPercentage >= 90
                          ? 'bg-red-500'
                          : user.utilizationPercentage >= 70
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                      }`}
                      style={{
                        width: `${Math.min(user.utilizationPercentage, 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Allocations */}
                {user.allocations.length > 0 && (
                  <div className="pt-2">
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">
                      Active Allocations ({user.allocations.length})
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {user.allocations.map((allocation) => (
                        <div
                          key={allocation.projectId}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                              {allocation.projectName}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {allocation.allocatedHours}h
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(allocation.status)} flex items-center gap-1`}>
                                {getStatusIcon(allocation.status)}
                                {allocation.status}
                              </span>
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveAllocation(user.userId, allocation.projectId);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Allocation Button */}
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedUser(user);
                      setShowNewAllocationModal(true);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Add Allocation
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* New Allocation Modal */}
      {showNewAllocationModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md max-h-96 overflow-y-auto bg-white dark:bg-white">
            <CardHeader>
              <CardTitle className="text-gray-900">Add Allocation for {selectedUser.userName}</CardTitle>
            </CardHeader>
            <CardContent className="bg-white dark:bg-white">
              <form onSubmit={handleAddAllocation} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={newAllocation.projectName}
                    onChange={(e) =>
                      setNewAllocation({ ...newAllocation, projectName: e.target.value })
                    }
                    placeholder="e.g., Project Alpha"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Allocated Hours *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={selectedUser.availableCapacity}
                    step="0.5"
                    value={newAllocation.allocatedHours}
                    onChange={(e) =>
                      setNewAllocation({ ...newAllocation, allocatedHours: e.target.value })
                    }
                    placeholder={`Max available: ${selectedUser.availableCapacity}h`}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {selectedUser.availableCapacity < 10 && (
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Limited capacity available
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Role
                  </label>
                  <input
                    type="text"
                    value={newAllocation.role}
                    onChange={(e) =>
                      setNewAllocation({ ...newAllocation, role: e.target.value })
                    }
                    placeholder="e.g., Developer"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={newAllocation.startDate}
                      onChange={(e) =>
                        setNewAllocation({ ...newAllocation, startDate: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={newAllocation.endDate}
                      onChange={(e) =>
                        setNewAllocation({ ...newAllocation, endDate: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Status
                  </label>
                  <select
                    value={newAllocation.status}
                    onChange={(e) =>
                      setNewAllocation({
                        ...newAllocation,
                        status: e.target.value as 'active' | 'completed' | 'on-hold',
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="on-hold">On Hold</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="submit" className="flex-1">
                    Create Allocation
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowNewAllocationModal(false);
                      setNewAllocation({
                        projectName: '',
                        allocatedHours: '',
                        startDate: '',
                        endDate: '',
                        role: '',
                        status: 'active',
                      });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
