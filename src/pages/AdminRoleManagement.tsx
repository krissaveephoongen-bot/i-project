import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import ScrollContainer from '../components/layout/ScrollContainer';
import { 
  Shield, 
  Plus, 
  Trash2, 
  Edit, 
  Search, 
  Users,
  Lock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import * as roleService from '../services/roleService';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  user_count?: number;
  created_at: string;
}

interface PermissionGroup {
  category: string;
  permissions: Array<{ id: string; name: string; description: string }>;
}

const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    category: 'Projects',
    permissions: [
      { id: 'project:view', name: 'View Projects', description: 'Can view project details' },
      { id: 'project:create', name: 'Create Projects', description: 'Can create new projects' },
      { id: 'project:edit', name: 'Edit Projects', description: 'Can edit project information' },
      { id: 'project:delete', name: 'Delete Projects', description: 'Can delete projects' },
    ]
  },
  {
    category: 'Tasks',
    permissions: [
      { id: 'task:view', name: 'View Tasks', description: 'Can view all tasks' },
      { id: 'task:create', name: 'Create Tasks', description: 'Can create tasks' },
      { id: 'task:assign', name: 'Assign Tasks', description: 'Can assign tasks to team members' },
      { id: 'task:delete', name: 'Delete Tasks', description: 'Can delete tasks' },
    ]
  },
  {
    category: 'Users',
    permissions: [
      { id: 'user:view', name: 'View Users', description: 'Can view user information' },
      { id: 'user:create', name: 'Create Users', description: 'Can create new users' },
      { id: 'user:edit', name: 'Edit Users', description: 'Can edit user information' },
      { id: 'user:delete', name: 'Delete Users', description: 'Can delete users' },
    ]
  },
  {
    category: 'Reports',
    permissions: [
      { id: 'report:view', name: 'View Reports', description: 'Can view reports' },
      { id: 'report:export', name: 'Export Reports', description: 'Can export reports' },
      { id: 'report:analytics', name: 'Analytics', description: 'Can view analytics data' },
    ]
  },
  {
    category: 'Administration',
    permissions: [
      { id: 'admin:system', name: 'System Settings', description: 'Can access system settings' },
      { id: 'admin:users', name: 'Manage Users', description: 'Can manage all users' },
      { id: 'admin:roles', name: 'Manage Roles', description: 'Can manage roles and permissions' },
      { id: 'admin:audit', name: 'Audit Logs', description: 'Can view audit logs' },
    ]
  }
];

const AdminRoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  // Fetch roles
  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      const data = await roleService.getAllRoles();
      setRoles(data);
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast.error('Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleOpenDialog = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setFormData({ name: role.name, description: role.description });
      setSelectedPermissions(role.permissions);
    } else {
      setEditingRole(null);
      setFormData({ name: '', description: '' });
      setSelectedPermissions([]);
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingRole(null);
    setFormData({ name: '', description: '' });
    setSelectedPermissions([]);
  };

  const handleSaveRole = async () => {
    if (!formData.name.trim()) {
      toast.error('Role name is required');
      return;
    }

    if (selectedPermissions.length === 0) {
      toast.error('At least one permission is required');
      return;
    }

    try {
      if (editingRole) {
        await roleService.updateRole(editingRole.id, {
          name: formData.name,
          description: formData.description,
          permissions: selectedPermissions
        });
        toast.success('Role updated successfully');
      } else {
        await roleService.createRole({
          name: formData.name,
          description: formData.description,
          permissions: selectedPermissions
        });
        toast.success('Role created successfully');
      }
      await fetchRoles();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving role:', error);
      toast.error('Failed to save role');
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!window.confirm('Are you sure you want to delete this role?')) {
      return;
    }

    try {
      await roleService.deleteRole(roleId);
      toast.success('Role deleted successfully');
      await fetchRoles();
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error('Failed to delete role');
    }
  };

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(p => p !== permissionId)
        : [...prev, permissionId]
    );
  };

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScrollContainer>
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Role Management</h1>
                <p className="text-gray-600 mt-1">Create and manage user roles with permissions</p>
              </div>
            </div>
            <Button
              onClick={() => handleOpenDialog()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Role
            </Button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Total Roles</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{roles.length}</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Active Permissions</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {PERMISSION_GROUPS.reduce((acc, group) => acc + group.permissions.length, 0)}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Lock className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Total Users</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {roles.reduce((acc, role) => acc + (role.user_count || 0), 0)}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search roles by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Roles Grid */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-600">Loading roles...</p>
            </div>
          ) : filteredRoles.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No roles found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRoles.map(role => (
                <Card key={role.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800 flex-shrink-0">
                        {role.permissions.length} perms
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Users count */}
                    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-blue-900">
                        {role.user_count || 0} users assigned
                      </span>
                    </div>

                    {/* Permissions preview */}
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-2">Permissions:</p>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.slice(0, 3).map((perm, idx) => (
                          <Badge key={idx} className="bg-green-100 text-green-800 text-xs">
                            {perm.split(':')[1] || perm}
                          </Badge>
                        ))}
                        {role.permissions.length > 3 && (
                          <Badge className="bg-gray-100 text-gray-800 text-xs">
                            +{role.permissions.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(role)}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRole(role.id)}
                        className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Role Dialog */}
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  {editingRole ? 'Edit Role' : 'Create New Role'}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Role Details */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Role Name *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Project Manager, Team Lead"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe the purpose of this role..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Permissions */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-4">
                    Permissions *
                  </label>

                  <div className="space-y-4">
                    {PERMISSION_GROUPS.map(group => (
                      <div key={group.category} className="border rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">{group.category}</h4>
                        <div className="space-y-2">
                          {group.permissions.map(perm => (
                            <label key={perm.id} className="flex items-start gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedPermissions.includes(perm.id)}
                                onChange={() => togglePermission(perm.id)}
                                className="mt-1 rounded border-gray-300"
                              />
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{perm.name}</p>
                                <p className="text-xs text-gray-600">{perm.description}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={handleCloseDialog}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveRole}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {editingRole ? 'Update Role' : 'Create Role'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </ScrollContainer>
  );
};

export default AdminRoleManagement;
