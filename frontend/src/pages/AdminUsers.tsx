import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import ScrollContainer from '../components/layout/ScrollContainer';
import ErrorState from '@/components/ErrorState';
import LoadingState from '@/components/LoadingState';
import EmptyState from '@/components/EmptyState';
import { parseApiError } from '@/lib/error-handler';
import { apiRequest } from '@/lib/api-client';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'user';
  department?: string;
  position?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface UserStats {
  total_users: number;
  admin_count: number;
  manager_count: number;
  user_count: number;
  active_users: number;
  new_users_this_month: number;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
   const [stats, setStats] = useState<UserStats | null>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<any>(null);
   const [showForm, setShowForm] = useState(false);
   const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
   const [filter, setFilter] = useState({ role: '', search: '' });

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    department: '',
    position: '',
    phone: ''
  });

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filter.role) params.append('role', filter.role);
      if (filter.search) params.append('search', filter.search);

      const data = await apiRequest<{ success: boolean; data: AdminUser[] }>(`/api/admin/users?${params.toString()}`);
      setUsers(data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(parseApiError(error));
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  // Fetch statistics
  const fetchStats = useCallback(async () => {
    try {
      const data = await apiRequest<{ success: boolean; data: UserStats }>('/api/admin/stats');
      setStats(data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [fetchUsers, fetchStats]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.name || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const endpoint = editingUser
        ? `/api/admin/users/${editingUser.id}`
        : '/api/admin/users';

      const method = editingUser ? 'PUT' : 'POST';

      const payload = editingUser
        ? {
            name: formData.name,
            email: formData.email,
            department: formData.department,
            position: formData.position,
            phone: formData.phone
          }
        : formData;

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        toast.success(editingUser ? 'User updated successfully' : 'User created successfully');
        setFormData({ email: '', name: '', password: '', department: '', position: '', phone: '' });
        setEditingUser(null);
        setShowForm(false);
        fetchUsers();
        fetchStats();
      } else {
        toast.error(data.message || 'Failed to save user');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to save user');
    }
  };

  const handleEditUser = (user: AdminUser) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      name: user.name,
      password: '',
      department: user.department || '',
      position: user.position || '',
      phone: user.phone || ''
    });
    setShowForm(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        toast.success('User deleted successfully');
        fetchUsers();
        fetchStats();
      } else {
        toast.error(data.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('User role updated');
        fetchUsers();
        fetchStats();
      } else {
        toast.error(data.message || 'Failed to update role');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update role');
    }
  };

  const resetForm = () => {
    setFormData({ email: '', name: '', password: '', department: '', position: '', phone: '' });
    setEditingUser(null);
    setShowForm(false);
  };

  // Error and loading states
  if (error && !loading) {
    return (
      <ScrollContainer>
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Admin User Management</h1>
            <ErrorState 
              error={error}
              onRetry={() => {
                setError(null);
                fetchUsers();
              }}
            />
          </div>
        </div>
      </ScrollContainer>
    );
  }

  if (loading) {
    return <LoadingState />;
  }

  return (
    <ScrollContainer>
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Admin User Management</h1>
            <p className="text-gray-600 mt-2">Create and manage system admin users</p>
          </div>
          <button
            onClick={() => !showForm ? setShowForm(true) : resetForm()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md"
          >
            {showForm ? 'Cancel' : '+ Create Admin User'}
          </button>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-gray-600 text-sm font-semibold">Total Users</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">{stats.total_users}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-red-600 text-sm font-semibold">Admins</div>
              <div className="text-3xl font-bold text-red-600 mt-2">{stats.admin_count}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-blue-600 text-sm font-semibold">Managers</div>
              <div className="text-3xl font-bold text-blue-600 mt-2">{stats.manager_count}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-green-600 text-sm font-semibold">Users</div>
              <div className="text-3xl font-bold text-green-600 mt-2">{stats.user_count}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-purple-600 text-sm font-semibold">Active Users</div>
              <div className="text-3xl font-bold text-purple-600 mt-2">{stats.active_users}</div>
            </div>
          </div>
        )}

        {/* Create/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8 border-l-4 border-blue-600">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingUser ? 'Edit Admin User' : 'Create New Admin User'}
            </h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!!editingUser}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {editingUser ? 'Password (leave empty to keep current)' : 'Password *'}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="IT, Operations, etc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Position</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Administrator, Manager, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+66 2-123-4567"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Role</label>
              <select
                value={filter.role}
                onChange={(e) => setFilter({ ...filter, role: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="user">User</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search by Name or Email</label>
              <input
                type="text"
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search..."
              />
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-600">Loading users...</div>
            </div>
          ) : users.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-600">No admin users found</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-4 text-sm">
                        <select
                          value={user.role}
                          onChange={(e) => handleChangeRole(user.id, e.target.value)}
                          className={`px-3 py-1 rounded-lg text-sm font-semibold border-0 ${
                            user.role === 'admin'
                              ? 'bg-red-100 text-red-700'
                              : user.role === 'manager'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          <option value="admin">Admin</option>
                          <option value="manager">Manager</option>
                          <option value="user">User</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.department || '-'}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-blue-600 hover:text-blue-900 mr-4 font-medium text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900 font-medium text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      </div>
    </ScrollContainer>
  );
}
