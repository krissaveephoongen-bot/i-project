'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import Header from '../components/Header';
import { getUsers, updateUser, deleteUser, createUser, User } from '../lib/users';
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  User as UserIcon, 
  Mail, 
  Shield, 
  Clock, 
  Trash2, 
  Edit,
  Download,
  CheckCircle2,
  XCircle
} from 'lucide-react';

// Shadcn UI
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/app/components/ui/Select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { Badge } from '@/app/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/Dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';

export default function UsersPage() {
  // State
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all'|'employee'|'manager'|'admin'>('all');
  const [statusFilter, setStatusFilter] = useState<'all'|'active'|'inactive'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    role: 'employee',
    isActive: true,
    employeeCode: 0 as any,
    timezone: 'Asia/Bangkok'
  });
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const queryClient = useQueryClient();

  // Fetch Users
  const usersQuery = useQuery({
    queryKey: ['users', search, roleFilter, statusFilter],
    queryFn: async () => {
      const rows = await getUsers({
        q: search || '',
        role: roleFilter === 'all' ? '' : roleFilter,
        status: statusFilter === 'all' ? '' : statusFilter
      });
      return rows;
    }
  });

  useEffect(() => {
    setLoading(usersQuery.isLoading);
    setUsers(usersQuery.data || []);
    setError(usersQuery.isError ? (usersQuery.error as any)?.message || 'Failed to load users' : null);
  }, [usersQuery.isLoading, usersQuery.data, usersQuery.isError, usersQuery.error]);

  // Client-side filtering (optional, if server filtering isn't enough or for immediate feedback)
  const filteredUsers = users.filter(u => {
    const s = search.toLowerCase();
    const matchesSearch = !s || u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s);
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? u.isActive : !u.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Handlers
  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        employeeCode: user.employeeCode,
        timezone: user.timezone
      });
      setPassword('');
      setShowPassword(false);
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        role: 'employee',
        isActive: true,
        employeeCode: 0 as any,
        timezone: 'Asia/Bangkok'
      });
      setPassword('');
      setShowPassword(true);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.email) {
        toast.error('Please fill in required fields');
        return;
      }
      if (!editingUser && !password) {
        toast.error('Please set password for new user');
        return;
      }
      if (password && password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }

      if (editingUser) {
        // Update
        const payload: any = { ...formData };
        if (showPassword && password) payload.password = password;
        await updateUser(editingUser.id, payload);
        toast.success('User updated successfully');
      } else {
        // Create
        const payload: any = { ...formData, password };
        await createUser(payload);
        toast.success('User created successfully');
      }
      
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsModalOpen(false);
    } catch (e: any) {
      toast.error(e?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(id);
      toast.success('User deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (e: any) {
      toast.error(e?.message || 'Delete failed');
    }
  };

  const exportCsv = () => {
    const header = ['Name','Email','Role','Active','EmployeeCode','Timezone'];
    const lines = [header.join(','), ...filteredUsers.map(u => 
      [u.name, u.email, u.role, String(u.isActive), u.employeeCode || '', u.timezone].join(',')
    )];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'users.csv'; a.click(); 
    window.URL.revokeObjectURL(url);
  };

  // Helper for Badge colors
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive'; // Red/High
      case 'manager': return 'default';    // Blue/Primary
      default: return 'secondary';         // Grey
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header title="Users Management" breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Users' }]} />
      
      <div className="container mx-auto px-6 py-8 pt-24 space-y-6">
        
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Users</h1>
            <p className="text-slate-500 mt-1">Manage system access and employee details.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={exportCsv} className="gap-2">
              <Download className="h-4 w-4" /> Export CSV
            </Button>
            <Button onClick={() => handleOpenModal()} className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" /> Add User
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <Input 
                  placeholder="Search name, email..." 
                  className="pl-9"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              
              <Select value={roleFilter} onValueChange={(val: any) => setRoleFilter(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={(val: any) => setStatusFilter(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Emp Code</TableHead>
                  <TableHead>Timezone</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900">{user.name}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)} className="uppercase text-[10px]">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.isActive ? (
                          <div className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                            <CheckCircle2 className="h-4 w-4" /> Active
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-slate-400 text-sm font-medium">
                            <XCircle className="h-4 w-4" /> Inactive
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm font-mono text-slate-600">
                        {user.employeeCode || '-'}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {user.timezone || 'Asia/Bangkok'}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleOpenModal(user)}>
                              <Edit className="h-4 w-4 mr-2" /> Edit User
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(user.id)}>
                              <Trash2 className="h-4 w-4 mr-2" /> Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No users found matching your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Add/Edit Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Edit User' : 'Create New User'}</DialogTitle>
              <DialogDescription>
                {editingUser ? 'Update user details and permissions.' : 'Add a new user to the system.'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input 
                  type="email"
                  value={formData.email} 
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <Select value={formData.role} onValueChange={(val: any) => setFormData({ ...formData, role: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Employee Code</label>
                  <Input 
                    type="number"
                    value={formData.employeeCode} 
                    onChange={e => setFormData({ ...formData, employeeCode: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    {editingUser ? 'New Password (optional)' : 'Password'}
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-600">
                    {editingUser && (
                      <>
                        <input type="checkbox" checked={showPassword} onChange={e=>setShowPassword(e.target.checked)} />
                        <span>Change password</span>
                      </>
                    )}
                  </label>
                </div>
                {(!editingUser || showPassword) && (
                  <Input 
                    type="password"
                    value={password} 
                    onChange={e => setPassword(e.target.value)}
                    placeholder={editingUser ? 'Leave blank to keep current password' : 'Set initial password'}
                  />
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select 
                  value={formData.isActive ? 'active' : 'inactive'} 
                  onValueChange={(val) => setFormData({ ...formData, isActive: val === 'active' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>
                {editingUser ? 'Save Changes' : 'Create User'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}
