'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

import { 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  User, 
  Eye, 
  AlertTriangle,
  Folder,
  Activity,
  CheckCircle,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { PermissionGuard, CanCreateProjects, CanEditProjects } from '../components/PermissionGuard';
import { Permission } from '../lib/auth';
import { usePermissions } from '../hooks/usePermissions';
import { logProjectAction } from '../lib/audit';

import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/Dialog';
import { Progress } from '../components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { DataTable } from '../components/data-table';
import { PageFilter } from '../components/page-filter';
import Header from '../components/Header';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProjects, createProject, updateProject, deleteProject, Project as ProjectType } from '../lib/projects';
import { getManagers, User as UserType } from '../lib/users';
import { ColumnDef } from '@tanstack/react-table';
import PageTransition from '../components/PageTransition';
import { Skeleton } from '../components/ui/Skeleton';
import { clsx } from 'clsx';

// Enhanced Project type with derived data
interface EnhancedProject extends ProjectType {
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  statusColor: string;
  daysRemaining: number;
  isOverdue: boolean;
}

export default function ProjectsPageRefactored() {
  const queryClient = useQueryClient();
  const { userId, userName, userRole } = usePermissions();
  const router = useRouter();

  // State management
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [managerFilter, setManagerFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // React Query for data fetching
  const { data: projectsData, isLoading: isLoadingProjects, error: projectsError } = useQuery<ProjectType[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const fetchedProjects = await getProjects();
      return fetchedProjects;
    },
  });

  const { data: managersData, isLoading: isLoadingManagers } = useQuery<UserType[]>({
    queryKey: ['managers'],
    queryFn: getManagers,
  });

  // Enhanced projects with computed fields
  const enhancedProjects: EnhancedProject[] = useMemo(() => {
    if (!projectsData) return [];

    return projectsData.map(project => {
      const riskLevel = calculateRiskLevel(project);
      const daysRemaining = calculateDaysRemaining(project);
      const isOverdue = daysRemaining < 0;

      return {
        ...project,
        riskLevel,
        statusColor: getStatusColor(project.status),
        daysRemaining: Math.abs(daysRemaining),
        isOverdue,
      };
    });
  }, [projectsData]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return enhancedProjects.filter(project => {
      const matchesSearch = !searchTerm ||
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.manager?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.code?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      const matchesManager = managerFilter === 'all' || project.manager?.name === managerFilter;
      const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesManager && matchesPriority;
    });
  }, [enhancedProjects, searchTerm, statusFilter, managerFilter, priorityFilter]);

  // Filter options
  const filterOptions = [
    {
      key: 'status',
      label: 'สถานะ',
      value: statusFilter,
      options: [
        { value: 'Planning', label: 'กำลังวางแผน (Planning)' },
        { value: 'Active', label: 'กำลังดำเนินการ (Active)' },
        { value: 'On Hold', label: 'พักโครงการ (On Hold)' },
        { value: 'Completed', label: 'เสร็จสิ้น (Completed)' },
        { value: 'Cancelled', label: 'ยกเลิก (Cancelled)' },
      ],
      onChange: setStatusFilter,
    },
    {
      key: 'manager',
      label: 'ผู้จัดการ',
      value: managerFilter,
      options: managersData?.map(manager => ({
        value: manager.name,
        label: manager.name,
      })) || [],
      onChange: setManagerFilter,
    },
    {
      key: 'priority',
      label: 'ความสำคัญ',
      value: priorityFilter,
      options: [
        { value: 'low', label: 'ต่ำ' },
        { value: 'medium', label: 'ปานกลาง' },
        { value: 'high', label: 'สูง' },
      ],
      onChange: setPriorityFilter,
    },
  ];

  // Table columns definition
  const columns: ColumnDef<EnhancedProject>[] = [
    {
      accessorKey: 'name',
      header: 'ชื่อโครงการ',
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${row.original.name}`} />
            <AvatarFallback>{row.original.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <Link
              href={`/projects/${row.original.id}`}
              className="font-semibold text-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {row.original.name}
            </Link>
            <div className="text-xs text-muted-foreground font-mono mt-0.5">
              {row.original.code && `#${row.original.code}`}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'สถานะ',
      cell: ({ row }) => (
        <Badge variant={row.original.statusColor as any} className="shadow-sm">
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'progress',
      header: 'ความคืบหน้า',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1 min-w-[120px]">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span className="font-bold text-foreground">{row.original.progress}%</span>
          </div>
          <Progress value={row.original.progress} className="h-2" />
        </div>
      ),
    },
    {
      accessorKey: 'manager.name',
      header: 'ผู้รับผิดชอบ',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-muted rounded-full">
            <User className="h-3 w-3 text-muted-foreground" />
          </div>
          <span className="text-sm text-foreground">{row.original.manager?.name || 'ไม่ระบุ'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'budget',
      header: 'งบประมาณ',
      cell: ({ row }) => (
        <div className="flex items-center space-x-1 font-medium text-foreground">
          <span className="text-muted-foreground">฿</span>
          <span>{row.original.budget ? row.original.budget.toLocaleString() : '-'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'endDate',
      header: 'กำหนดส่ง',
      cell: ({ row }) => {
        if (!row.original.endDate) return <span className="text-muted-foreground text-xs">-</span>;

        const dueDate = new Date(row.original.endDate);
        const isOverdue = row.original.isOverdue;

        return (
          <div className={clsx(
            'flex items-center space-x-1.5 rounded-md w-fit px-2 py-1',
            isOverdue 
              ? 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400' 
              : 'text-muted-foreground'
          )}>
            <Calendar className="h-3.5 w-3.5" />
            <span className="text-sm">
              {format(dueDate, 'd MMM yyyy', { locale: th })}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'riskLevel',
      header: 'ความเสี่ยง',
      cell: ({ row }) => (
        <Badge variant={getRiskVariant(row.original.riskLevel)} className="shadow-sm">
          {row.original.riskLevel}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center justify-end space-x-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
            onClick={() => window.open(`/projects/${row.original.id}`, '_blank')}
            title="ดูรายละเอียด"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <CanEditProjects>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 dark:hover:text-orange-400"
              onClick={() => handleEditProject(row.original)}
              title="แก้ไข"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </CanEditProjects>
          <PermissionGuard permission={Permission.PROJECT_DELETE}>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400"
              onClick={() => setDeleteConfirm(row.original.id)}
              title="ลบ"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </PermissionGuard>
        </div>
      ),
    },
  ];

  // Mutations with audit logging
  const createProjectMutation = useMutation({
    mutationFn: createProject,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      // Audit logging
      logProjectAction(
        userId,
        userName,
        userRole,
        data.id,
        'create',
        `Created new project: ${data.name}`,
        { name: data.name, budget: data.budget, managerId: data.managerId }
      );
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: ({ id, updatedFields }: { id: string; updatedFields: Partial<ProjectType> }) =>
      updateProject(id, updatedFields),
    onSuccess: (_, { id, updatedFields }) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      // Audit logging
      logProjectAction(
        userId,
        userName,
        userRole,
        id,
        'update',
        `Updated project details`,
        updatedFields
      );
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setDeleteConfirm(null);
      // Audit logging
      logProjectAction(
        userId,
        userName,
        userRole,
        projectId,
        'delete',
        `Deleted project`,
        {}
      );
    },
  });

  // Event handlers
  const handleCreateProject = () => {
    router.push('/projects/new');
  };

  const handleEditProject = (project: ProjectType) => {
    router.push(`/projects/${project.id}/edit`);
  };

  const handleDeleteProject = async (id: string) => {
    await deleteProjectMutation.mutateAsync(id);
  };

  // Loading and error states
  if (isLoadingProjects || isLoadingManagers) {
    return (
      <div className="min-h-screen bg-muted/30">
        <Header
            title="โครงการ (Projects)"
            breadcrumbs={[{ label: 'แดชบอร์ด', href: '/' }, { label: 'โครงการ' }]}
        />
        <div className="container mx-auto px-6 py-8 pt-24 space-y-6">
            <div className="flex justify-between items-center">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
            </div>
            <Skeleton className="h-[500px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (projectsError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="w-full max-w-md shadow-lg border-red-100 dark:border-red-900/30">
          <CardContent className="pt-8 pb-8 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-500 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-foreground">ไม่สามารถโหลดข้อมูลได้</h3>
            <p className="text-muted-foreground">
              {projectsError.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'}
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              ลองใหม่อีกครั้ง
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-muted/30">
        <Header
          title="โครงการ (Projects)"
          breadcrumbs={[
            { label: 'แดชบอร์ด', href: '/' },
            { label: 'โครงการ' }
          ]}
        />

        <div className="container mx-auto px-6 py-8 pt-24 max-w-[1600px]">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">รายการโครงการ</h1>
              <p className="text-muted-foreground mt-1">
                จัดการและติดตามโครงการทั้งหมดของคุณได้ที่นี่
              </p>
            </div>
            <div className="flex items-center gap-2">
              <CanCreateProjects>
                <Button onClick={handleCreateProject} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 rounded-xl dark:bg-blue-600 dark:hover:bg-blue-700">
                  <Plus className="h-4 w-4" />
                  สร้างโครงการใหม่
                </Button>
              </CanCreateProjects>
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => {
                  const rows = filteredProjects || [];
                  const header = ['Name','Code','Status','Progress','Manager','Budget','DueDate'];
                  const lines = [header.join(','), ...rows.map(p => [
                    p.name, p.code || '', p.status, p.progress, p.manager?.name || '', p.budget || 0, p.endDate || ''
                  ].join(','))];
                  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url; a.download = 'projects.csv'; a.click();
                  window.URL.revokeObjectURL(url);
                }}
              >
                Export CSV
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="rounded-xl border-border shadow-sm hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">โครงการทั้งหมด</CardTitle>
                <Folder className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{projectsData?.length || 0}</div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-border shadow-sm hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">กำลังดำเนินการ</CardTitle>
                <Activity className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {projectsData?.filter((p: any) => {
                    const s = String(p.status || '').toLowerCase();
                    return s === 'active' || s === 'in_progress' || s === 'in progress';
                  }).length || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-border shadow-sm hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">เสร็จสิ้น</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {projectsData?.filter((p: any) => String(p.status || '').toLowerCase() === 'completed').length || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-border shadow-sm hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">ต้องแก้ไข/เสี่ยง</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {enhancedProjects.filter(p => {
                    const s = String(p.status || '').toLowerCase();
                    const risky = String(p.riskLevel || '').toLowerCase();
                    return p.isOverdue || s === 'on hold' || s === 'cancelled' || risky === 'high' || risky === 'critical';
                  }).length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Card className="rounded-xl border-border shadow-sm overflow-hidden">
            <CardHeader className="border-b border-border bg-card">
              <CardTitle>รายชื่อโครงการ</CardTitle>
              <CardDescription>
                ค้นหาและกรองข้อมูลโครงการ
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-4 bg-muted/30">
                  <PageFilter
                  searchPlaceholder="ค้นหาชื่อโครงการ, รหัส, หรือผู้รับผิดชอบ..."
                  searchValue={searchTerm}
                  onSearchChange={setSearchTerm}
                  filters={filterOptions}
                  />
              </div>

              <DataTable
                columns={columns}
                data={filteredProjects}
                searchKey="name"
                searchPlaceholder="ค้นหา..."
              />
            </CardContent>
          </Card>
        </div>

        {/* Delete Confirmation Modal */}
        <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-red-600 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  ยืนยันการลบโครงการ
              </DialogTitle>
              <DialogDescription className="pt-2">
                คุณแน่ใจหรือไม่ที่จะลบโครงการนี้? การกระทำนี้ไม่สามารถย้อนกลับได้
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="rounded-xl">
                ยกเลิก
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirm && handleDeleteProject(deleteConfirm)}
                disabled={deleteProjectMutation.isPending}
                className="rounded-xl"
              >
                {deleteProjectMutation.isPending ? 'กำลังลบ...' : 'ยืนยันลบ'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}

// Helper functions
function calculateRiskLevel(project: ProjectType): 'Low' | 'Medium' | 'High' | 'Critical' {
  if (project.status === 'Completed') return 'Low';
  if (project.status === 'Planning') return 'Medium';

  let riskScore = 0;
  if (project.progress < 30) riskScore += 2;
  if (project.progress < 70) riskScore += 1;

  if (project.endDate) {
    const daysRemaining = calculateDaysRemaining(project);
    if (daysRemaining < 0) riskScore += 2;
    else if (daysRemaining < 7) riskScore += 1;
  }

  if (riskScore >= 3) return 'Critical';
  if (riskScore >= 2) return 'High';
  if (riskScore >= 1) return 'Medium';
  return 'Low';
}

function calculateDaysRemaining(project: ProjectType): number {
  if (!project.endDate) return Infinity;
  const endDate = new Date(project.endDate);
  const today = new Date();
  return Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'completed': return 'default';
    case 'active': return 'default';
    case 'planning': return 'secondary';
    case 'on hold': return 'secondary';
    case 'cancelled': return 'destructive';
    default: return 'secondary';
  }
}

function getRiskVariant(risk: string): "default" | "secondary" | "destructive" | "outline" {
  switch (risk.toLowerCase()) {
    case 'low': return 'secondary';
    case 'medium': return 'default';
    case 'high': return 'destructive';
    case 'critical': return 'destructive';
    default: return 'secondary';
  }
}
