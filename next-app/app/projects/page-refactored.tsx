'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Calendar, DollarSign, User, Clock, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { PermissionGuard, CanCreateProjects, CanEditProjects } from '../components/PermissionGuard';
import { Permission } from '../lib/auth';
import { usePermissions } from '../hooks/usePermissions';
import { logProjectAction, AuditEventType } from '../lib/audit';

import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/Dialog';
import { Progress } from '../components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { DataTable } from '../components/data-table';
import { PageFilter } from '../components/page-filter';
import Header from '../components/Header';
import ProjectForm from '../../components/ProjectForm';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProjects, createProject, updateProject, deleteProject, recalculateProjectData as recalculateProjectDataUtil, Project as ProjectType } from '../lib/projects';
import { getManagers, User as UserType } from '../lib/users';
import { ColumnDef } from '@tanstack/react-table';

// Enhanced Project type with derived data
interface EnhancedProject extends ProjectType {
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  statusColor: string;
  daysRemaining: number;
  isOverdue: boolean;
}

export default function ProjectsPageRefactored() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { userId, userName, userRole } = usePermissions();

  // State management
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectType | null>(null);
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
      label: t('projects.filters.status'),
      value: statusFilter,
      options: [
        { value: 'Planning', label: t('projects.status.planning') },
        { value: 'Active', label: t('projects.status.active') },
        { value: 'On Hold', label: t('projects.status.onHold') },
        { value: 'Completed', label: t('projects.status.completed') },
        { value: 'Cancelled', label: t('projects.status.cancelled') },
      ],
      onChange: setStatusFilter,
    },
    {
      key: 'manager',
      label: t('projects.filters.manager'),
      value: managerFilter,
      options: managersData?.map(manager => ({
        value: manager.name,
        label: manager.name,
      })) || [],
      onChange: setManagerFilter,
    },
    {
      key: 'priority',
      label: t('projects.filters.priority'),
      value: priorityFilter,
      options: [
        { value: 'low', label: t('projects.priority.low') },
        { value: 'medium', label: t('projects.priority.medium') },
        { value: 'high', label: t('projects.priority.high') },
      ],
      onChange: setPriorityFilter,
    },
  ];

  // Table columns definition
  const columns: ColumnDef<EnhancedProject>[] = [
    {
      accessorKey: 'name',
      header: t('projects.columns.name'),
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${row.original.name}`} />
            <AvatarFallback>{row.original.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <Link
              href={`/projects/${row.original.id}`}
              className="font-medium text-primary hover:underline"
            >
              {row.original.name}
            </Link>
            <div className="text-sm text-muted-foreground">
              {row.original.code && `#${row.original.code}`}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: t('projects.columns.status'),
      cell: ({ row }) => (
        <Badge variant={row.original.statusColor as any}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'progress',
      header: t('projects.columns.progress'),
      cell: ({ row }) => (
        <div className="flex items-center space-x-2 min-w-[120px]">
          <Progress value={row.original.progress} className="flex-1" />
          <span className="text-sm font-medium">{row.original.progress}%</span>
        </div>
      ),
    },
    {
      accessorKey: 'manager.name',
      header: t('projects.columns.manager'),
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.manager?.name || t('common.unassigned')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'budget',
      header: t('projects.columns.budget'),
      cell: ({ row }) => (
        <div className="flex items-center space-x-1">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.budget ? `$${row.original.budget.toLocaleString()}` : 'N/A'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'endDate',
      header: t('projects.columns.dueDate'),
      cell: ({ row }) => {
        if (!row.original.endDate) return <span className="text-muted-foreground">{t('projects.noDueDate')}</span>;

        const dueDate = new Date(row.original.endDate);
        const isOverdue = row.original.isOverdue;

        return (
          <div className="flex items-center space-x-1">
            <Calendar className={`h-4 w-4 ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`} />
            <span className={isOverdue ? 'text-destructive font-medium' : ''}>
              {format(dueDate, 'MMM dd, yyyy')}
            </span>
            {isOverdue && (
              <Badge variant="destructive" className="text-xs">
                {t('common.overdue')}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'riskLevel',
      header: t('projects.columns.risk'),
      cell: ({ row }) => (
        <Badge variant={getRiskVariant(row.original.riskLevel)}>
          {row.original.riskLevel}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: t('projects.columns.actions'),
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(`/projects/${row.original.id}`, '_blank')}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <CanEditProjects>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditProject(row.original)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </CanEditProjects>
          <PermissionGuard permission={Permission.PROJECT_DELETE}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteConfirm(row.original.id)}
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
      setShowForm(false);
      setEditingProject(null);

      // Audit logging
      const auditEntry = logProjectAction(
        userId,
        userName,
        userRole,
        data.id,
        'create',
        `Created new project: ${data.name}`,
        { name: data.name, budget: data.budget, managerId: data.managerId }
      );
      console.log('Audit Log:', auditEntry);
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: ({ id, updatedFields }: { id: string; updatedFields: Partial<ProjectType> }) =>
      updateProject(id, updatedFields),
    onSuccess: (_, { id, updatedFields }) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setShowForm(false);
      setEditingProject(null);

      // Audit logging
      const auditEntry = logProjectAction(
        userId,
        userName,
        userRole,
        id,
        'update',
        `Updated project details`,
        updatedFields
      );
      console.log('Audit Log:', auditEntry);
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setDeleteConfirm(null);

      // Audit logging
      const auditEntry = logProjectAction(
        userId,
        userName,
        userRole,
        projectId,
        'delete',
        `Deleted project`,
        {}
      );
      console.log('Audit Log:', auditEntry);
    },
  });

  // Event handlers
  const handleCreateProject = () => {
    setEditingProject(null);
    setShowForm(true);
  };

  const handleEditProject = (project: ProjectType) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleSaveProject = async (savedProject: ProjectType) => {
    if (editingProject) {
      await updateProjectMutation.mutateAsync({
        id: editingProject.id,
        updatedFields: savedProject
      });
    } else {
      await createProjectMutation.mutateAsync(savedProject);
    }
  };

  const handleDeleteProject = async (id: string) => {
    await deleteProjectMutation.mutateAsync(id);
  };

  // Loading and error states
  if (isLoadingProjects || isLoadingManagers) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (projectsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-6xl">⚠️</div>
              <h3 className="text-lg font-semibold">Error Loading Projects</h3>
              <p className="text-muted-foreground">
                {projectsError.message || 'An unexpected error occurred'}
              </p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        title="Projects"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Projects' }
        ]}
      />

      <div className="container mx-auto px-6 py-8 pt-24">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('projects.title')}</h1>
            <p className="text-muted-foreground">
              {t('projects.subtitle')}
            </p>
          </div>
          <CanCreateProjects>
            <Button onClick={handleCreateProject} className="gap-2">
              <Plus className="h-4 w-4" />
              {t('projects.create')}
            </Button>
          </CanCreateProjects>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('projects.totalProjects')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectsData?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('projects.activeProjects')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {projectsData?.filter((p: any) => p.status === 'Active').length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('projects.completedProjects')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {projectsData?.filter((p: any) => p.status === 'Completed').length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('projects.overdueProjects')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {enhancedProjects.filter(p => p.isOverdue).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle>{t('projects.title')}</CardTitle>
            <CardDescription>
              {t('projects.subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PageFilter
              searchPlaceholder={t('projects.search')}
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              filters={filterOptions}
              savedViews={{ enabled: true, userId, pageKey: 'projects/list' }}
              quickFilters={[
                { label: 'Active', value: 'Active', targetKey: 'status' },
                { label: 'Planning', value: 'Planning', targetKey: 'status' },
                { label: 'Completed', value: 'Completed', targetKey: 'status' },
              ]}
            />

            <DataTable
              columns={columns}
              data={filteredProjects}
              searchKey="name"
              searchPlaceholder="Search projects..."
            />
          </CardContent>
        </Card>
      </div>

      {/* Project Form Modal */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProject ? t('projects.edit') : t('projects.create')}
            </DialogTitle>
            <DialogDescription>
              {editingProject
                ? t('projects.editDescription')
                : t('projects.createDescription')
              }
            </DialogDescription>
          </DialogHeader>
          <ProjectForm
            project={editingProject}
            onSave={handleSaveProject}
            onCancel={() => setShowForm(false)}
            isOpen={showForm}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('projects.delete')}</DialogTitle>
            <DialogDescription>
              {t('projects.deleteConfirm')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDeleteProject(deleteConfirm)}
              disabled={deleteProjectMutation.isPending}
            >
              {deleteProjectMutation.isPending ? t('common.loading') : t('projects.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
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
