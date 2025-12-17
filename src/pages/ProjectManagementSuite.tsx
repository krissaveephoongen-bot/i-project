import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, TrendingUp, DollarSign, Users, AlertCircle, BarChart3 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Project, Task } from '@/types/project';
import { projectService, calculateSCurveData } from '@/services/projectService';
import TaskManagement from './TaskManagement';
import SCurveChart from '@/components/SCurveChart';

export default function ProjectManagementSuite() {
  const { user } = useAuthContext();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    clientName: '',
    projectManager: user?.id || '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'planning' as const,
    budgetTotal: 0,
    budgetLabor: 0,
    budgetMaterials: 0,
    budgetEquipment: 0,
    budgetOther: 0,
  });

  // Load projects
  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/projects', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to load projects');
      const data = await response.json();
      setProjects(data);
      if (data.length > 0 && !selectedProject) {
        setSelectedProject(data[0]);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      const newProject = await projectService.createProject({
        name: formData.name,
        description: formData.description,
        clientName: formData.clientName,
        projectManager: formData.projectManager,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        status: formData.status,
        budget: {
          total: formData.budgetTotal,
          spent: 0,
          allocated: {
            labor: formData.budgetLabor,
            materials: formData.budgetMaterials,
            equipment: formData.budgetEquipment,
            other: formData.budgetOther,
          },
          currency: 'USD',
        },
        progress: {
          plannedProgress: 0,
          actualProgress: 0,
          variance: 0,
          lastUpdated: new Date(),
        },
        tasks: [],
        milestones: [],
        sCurveData: [],
        teamMembers: [user?.id || ''],
        createdBy: user?.id || '',
      });

      toast.success('Project created successfully');
      await loadProjects();
      setShowCreateForm(false);
      resetForm();
      setSelectedProject(newProject);
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        setLoading(true);
        await projectService.deleteProject(projectId);
        toast.success('Project deleted successfully');
        await loadProjects();
        setSelectedProject(null);
      } catch (error) {
        console.error('Error deleting project:', error);
        toast.error('Failed to delete project');
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      clientName: '',
      projectManager: user?.id || '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'planning',
      budgetTotal: 0,
      budgetLabor: 0,
      budgetMaterials: 0,
      budgetEquipment: 0,
      budgetOther: 0,
    });
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      planning: 'bg-blue-100 text-blue-700',
      active: 'bg-green-100 text-green-700',
      'on-hold': 'bg-yellow-100 text-yellow-700',
      completed: 'bg-gray-100 text-gray-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const handleTasksUpdate = (tasks: Task[]) => {
    if (selectedProject) {
      const sCurveData = calculateSCurveData(
        tasks,
        selectedProject.startDate,
        selectedProject.endDate
      );
      setSelectedProject({
        ...selectedProject,
        tasks,
        sCurveData,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project Management Suite</h1>
          <p className="text-sm text-gray-600 mt-1">Current User: {user?.name} ({user?.id})</p>
        </div>
        <Button 
          onClick={() => {
            setEditingProject(null);
            resetForm();
            setShowCreateForm(!showCreateForm);
          }}
          className="gap-2 bg-green-600 hover:bg-green-700"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Project</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Name *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter project name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Name
                  </label>
                  <Input
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    placeholder="Enter client name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter project description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900">Budget Allocation</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Budget ($)
                    </label>
                    <Input
                      type="number"
                      value={formData.budgetTotal}
                      onChange={(e) => setFormData({ ...formData, budgetTotal: parseFloat(e.target.value) })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Labor
                    </label>
                    <Input
                      type="number"
                      value={formData.budgetLabor}
                      onChange={(e) => setFormData({ ...formData, budgetLabor: parseFloat(e.target.value) })}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Materials
                    </label>
                    <Input
                      type="number"
                      value={formData.budgetMaterials}
                      onChange={(e) => setFormData({ ...formData, budgetMaterials: parseFloat(e.target.value) })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Equipment
                    </label>
                    <Input
                      type="number"
                      value={formData.budgetEquipment}
                      onChange={(e) => setFormData({ ...formData, budgetEquipment: parseFloat(e.target.value) })}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Other
                  </label>
                  <Input
                    type="number"
                    value={formData.budgetOther}
                    onChange={(e) => setFormData({ ...formData, budgetOther: parseFloat(e.target.value) })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="secondary"
                  onClick={() => {
                    setShowCreateForm(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
                  {loading ? 'Creating...' : 'Create Project'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Projects List */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Projects ({projects.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {loading && <div className="text-sm text-gray-500">Loading...</div>}
              {!loading && projects.length === 0 && (
                <div className="text-sm text-gray-500">No projects yet</div>
              )}
              {!loading && projects.map(project => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    selectedProject?.id === project.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-sm text-gray-900">{project.name}</div>
                  <span className={`inline-block text-xs font-medium px-2 py-1 rounded mt-1 ${getStatusBadge(project.status)}`}>
                    {project.status}
                  </span>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Project Details */}
        <div className="lg:col-span-3">
          {!selectedProject ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Select a project to view details</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="scurve">S-Curve</TabsTrigger>
                <TabsTrigger value="budget">Budget</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{selectedProject.name}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{selectedProject.description}</p>
                      </div>
                      <span className={`inline-block text-sm font-medium px-3 py-1 rounded-full ${getStatusBadge(selectedProject.status)}`}>
                        {selectedProject.status}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Client</p>
                        <p className="font-medium">{selectedProject.clientName || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Project Manager</p>
                        <p className="font-medium">{selectedProject.projectManager || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Start Date</p>
                        <p className="font-medium">{new Date(selectedProject.startDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">End Date</p>
                        <p className="font-medium">{new Date(selectedProject.endDate).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => handleDeleteProject(selectedProject.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Progress</p>
                        <p className="text-3xl font-bold text-blue-600">{selectedProject.progress.actualProgress}%</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Budget Used</p>
                        <p className="text-3xl font-bold text-green-600">${selectedProject.budget.spent}/${ selectedProject.budget.total}</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Team Size</p>
                        <p className="text-3xl font-bold text-purple-600">{selectedProject.teamMembers.length}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Tasks Tab */}
              <TabsContent value="tasks" className="space-y-4">
                <TaskManagement projectId={selectedProject.id} onTasksUpdate={handleTasksUpdate} />
              </TabsContent>

              {/* S-Curve Tab */}
              <TabsContent value="scurve" className="space-y-4">
                <SCurveChart data={selectedProject.sCurveData} title="Project Progress S-Curve" height={450} />
              </TabsContent>

              {/* Budget Tab */}
              <TabsContent value="budget" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Budget Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">Total Budget</p>
                          <p className="text-3xl font-bold text-blue-600">${selectedProject.budget.total}</p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">Amount Spent</p>
                          <p className="text-3xl font-bold text-red-600">${selectedProject.budget.spent}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h3 className="font-medium text-gray-900">Allocated Budget</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-600">Labor</span>
                            <span className="font-medium">${selectedProject.budget.allocated.labor}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-600">Materials</span>
                            <span className="font-medium">${selectedProject.budget.allocated.materials}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-600">Equipment</span>
                            <span className="font-medium">${selectedProject.budget.allocated.equipment}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-600">Other</span>
                            <span className="font-medium">${selectedProject.budget.allocated.other}</span>
                          </div>
                        </div>
                      </div>

                      {/* Budget Progress Bar */}
                      <div className="mt-6">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Budget Utilization</span>
                          <span className="text-sm font-medium text-gray-600">
                            {((selectedProject.budget.spent / selectedProject.budget.total) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all ${
                              (selectedProject.budget.spent / selectedProject.budget.total) > 0.8 ? 'bg-red-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min((selectedProject.budget.spent / selectedProject.budget.total) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}
