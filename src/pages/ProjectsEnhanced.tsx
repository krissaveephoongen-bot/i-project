import React, { useState, useMemo } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card } from '../components/ui/card';
import { Plus, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// Components
import ProjectCard from '../components/projects/ProjectCard';
import ProjectWizard, { ProjectFormData } from '../components/projects/ProjectWizard';
import BulkOperations from '../components/projects/BulkOperations';
import AdvancedStats from '../components/projects/AdvancedStats';

// Utils
import { 
  exportToCSV, 
  exportToExcel, 
  exportToPDF, 
  exportSummaryToPDF 
} from '../utils/exportUtils';
// formatCurrency intentionally omitted (unused)

interface Project {
  id: string;
  code: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  progress: number;
  clientId: string;
  clientName: string;
  projectManager: string;
  projectManagerId: string;
  teamMembers: string[];
  tasksCount: number;
  completedTasks: number;
  charter?: any;
}

const ProjectsEnhanced: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Bulk operations
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch =
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.clientName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [projects, searchQuery, statusFilter, priorityFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'active').length,
      completedProjects: projects.filter(p => p.status === 'completed').length,
      totalBudget: projects.reduce((a, p) => a + p.budget, 0),
      totalSpent: projects.reduce((a, p) => a + p.spent, 0),
      averageProgress: projects.length > 0
        ? projects.reduce((a, p) => a + p.progress, 0) / projects.length
        : 0,
    };
  }, [projects]);

  // Check if project is at risk
  const isProjectAtRisk = (project: Project): boolean => {
    const daysRemaining = new Date(project.endDate).getTime() - new Date().getTime();
    const daysTotal = new Date(project.endDate).getTime() - new Date(project.startDate).getTime();
    const timeProgress = (daysTotal - daysRemaining) / daysTotal;
    return project.progress < timeProgress * 100 && project.status !== 'completed';
  };

  // Handlers
  const handleCreateProject = (formData: ProjectFormData) => {
    const newProject: Project = {
      id: Date.now().toString(),
      code: formData.code.toUpperCase(),
      name: formData.name,
      description: formData.description,
      status: 'planning',
      priority: formData.priority,
      startDate: formData.startDate,
      endDate: formData.endDate,
      budget: formData.budget,
      spent: 0,
      progress: 0,
      clientId: formData.clientId,
      clientName: 'Client Name',
      projectManager: 'PM Name',
      projectManagerId: formData.projectManagerId,
      teamMembers: [],
      tasksCount: 0,
      completedTasks: 0,
    };

    setProjects([newProject, ...projects]);
    toast.success(`Project "${newProject.name}" created successfully`);
  };

  const handleSelectProject = (id: string, selected: boolean) => {
    const newSelected = new Set(selectedProjects);
    if (selected) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedProjects(newSelected);
  };

  const handleSelectAll = () => {
    const allIds = new Set(filteredProjects.map(p => p.id));
    setSelectedProjects(allIds);
  };

  const handleClearSelection = () => {
    setSelectedProjects(new Set());
  };

  const handleDeleteSelected = () => {
    if (window.confirm(`Delete ${selectedProjects.size} project(s)? This cannot be undone.`)) {
      setProjects(prev => prev.filter(p => !selectedProjects.has(p.id)));
      setSelectedProjects(new Set());
      toast.success('Projects deleted successfully');
    }
  };

  const handleExportSelected = (format: 'csv' | 'excel' | 'pdf' | 'json') => {
    const selectedProjectsList = projects.filter(p => selectedProjects.has(p.id));

    if (format === 'csv') exportToCSV(selectedProjectsList);
    else if (format === 'excel') exportToExcel(selectedProjectsList);
    else if (format === 'pdf') exportToPDF(selectedProjectsList);
    else if (format === 'json') {
      const link = document.createElement('a');
      const blob = new Blob([JSON.stringify(selectedProjectsList, null, 2)], { type: 'application/json' });
      link.href = URL.createObjectURL(blob);
      link.download = `projects-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
    }

    toast.success(`Exported ${selectedProjectsList.length} project(s) as ${format.toUpperCase()}`);
  };

  const handleExportAll = () => {
    exportSummaryToPDF(projects, stats);
    toast.success('Summary report exported');
  };

  const handleDeleteProject = async (id: string) => {
    const project = projects.find(p => p.id === id);
    if (window.confirm(`Delete "${project?.name}"? This cannot be undone.`)) {
      try {
        // Call DELETE API endpoint
        const response = await fetch(`/api/projects/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete project');
        }

        // Only update UI after successful delete
        setProjects(prev => prev.filter(p => p.id !== id));
        toast.success('Project deleted');
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to delete project';
        toast.error(errorMsg);
      }
    }
  };

  const handleViewProject = (id: string) => {
    navigate(`/projects/${id}`);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Projects</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and track all projects</p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowStats(!showStats)}
            className="gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Analytics
          </Button>
          <Button
            onClick={() => setIsWizardOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 gap-2"
          >
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      {/* Advanced Analytics */}
      {showStats && (
        <AdvancedStats projects={projects} />
      )}

      {/* Bulk Operations Bar */}
      <BulkOperations
        selectedCount={selectedProjects.size}
        totalCount={filteredProjects.length}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        onDelete={handleDeleteSelected}
        onExportCSV={() => handleExportSelected('csv')}
        onExportExcel={() => handleExportSelected('excel')}
        onExportPDF={() => handleExportSelected('pdf')}
        onExportJSON={() => handleExportSelected('json')}
      />

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="planning">Planning</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="on-hold">On Hold</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full sm:w-40 bg-white">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportAll}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Projects Grid/List */}
      {filteredProjects.length > 0 ? (
        <div className={viewMode === 'grid' ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
          {filteredProjects.map(project => (
            <ProjectCard
              key={project.id}
              {...project}
              isSelected={selectedProjects.has(project.id)}
              isAtRisk={isProjectAtRisk(project)}
              onSelect={handleSelectProject}
              onView={handleViewProject}
              onDelete={handleDeleteProject}
            />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-gray-500">No projects found matching your filters</p>
        </Card>
      )}

      {/* Project Wizard */}
      <ProjectWizard
        open={isWizardOpen}
        onOpenChange={setIsWizardOpen}
        onSubmit={handleCreateProject}
      />
    </div>
  );
};

export default ProjectsEnhanced;
