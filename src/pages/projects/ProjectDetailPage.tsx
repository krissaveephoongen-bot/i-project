import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit2, Archive, Trash2, Calendar, Users, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { TaskManagement } from '@/components/projects/TaskManagement';
import { TeamManagement } from '@/components/projects/TeamManagement';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '@/utils/formatCurrency';

interface ProjectDetail {
  id: string;
  code: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'completed' | 'on-hold';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  start_date: string;
  end_date: string;
  contract_amount: number;
  budget: number;
  project_manager: string;
  team_members: string;
  created_at: string;
  updated_at: string;
}

export function ProjectDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!id) {
        toast.error('Project ID is missing');
        navigate('/projects/my-projects');
        return;
      }

      try {
        setIsLoading(true);
        
        // Fetch project details
        const projectResponse = await api.get(`/projects/${id}`);
        if (projectResponse.data?.success || projectResponse.data?.data) {
          const projectData = projectResponse.data.data || projectResponse.data;
          setProject(projectData);
        }

        // Fetch tasks
        try {
          const tasksResponse = await api.get(`/projects/${id}/tasks`);
          if (tasksResponse.data?.data) {
            setTasks(tasksResponse.data.data);
          }
        } catch (e) {
          console.warn('Failed to fetch tasks:', e);
        }

        // Fetch expenses
        try {
          const expensesResponse = await api.get(`/expenses?projectId=${id}`);
          if (expensesResponse.data?.data) {
            setExpenses(expensesResponse.data.data);
          }
        } catch (e) {
          console.warn('Failed to fetch expenses:', e);
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        toast.error('Failed to load project details');
        navigate('/projects/my-projects');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectDetails();
  }, [id, navigate]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      planning: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      completed: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'on-hold': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    };
    return colors[status] || colors.active;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'text-green-600',
      medium: 'text-yellow-600',
      high: 'text-orange-600',
      critical: 'text-red-600',
    };
    return colors[priority] || colors.medium;
  };

  const handleEdit = () => {
    navigate(`/projects/${id}/edit`);
  };

  const handleArchive = async () => {
    if (!confirm('Archive this project? This action cannot be undone.')) return;
    try {
      await api.patch(`/projects/${id}`, { status: 'on-hold' });
      toast.success('Project archived');
      navigate('/projects/my-projects');
    } catch (error) {
      toast.error('Failed to archive project');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this project? This action cannot be undone.')) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted');
      navigate('/projects/my-projects');
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <p className="text-gray-600">Project not found</p>
        </div>
      </div>
    );
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const daysRemaining = project.end_date 
    ? Math.ceil((new Date(project.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{project.name}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">{project.code}</p>
            {project.description && (
              <p className="text-gray-700 dark:text-gray-300 mt-2">{project.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleEdit} className="gap-2">
              <Edit2 className="h-4 w-4" />
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={handleArchive} className="gap-2">
              <Archive className="h-4 w-4" />
              Archive
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete} className="gap-2">
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Progress</p>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <p className="text-2xl font-bold">{project.progress}%</p>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Budget</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(project.budget || project.contract_amount)}</p>
                <p className="text-xs text-gray-500">Spent: {formatCurrency(totalExpenses)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Timeline</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <p className="text-2xl font-bold">{daysRemaining}d</p>
                </div>
                <p className="text-xs text-gray-500">End: {new Date(project.end_date).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Priority</p>
                <p className={`text-2xl font-bold capitalize ${getPriorityColor(project.priority)}`}>
                  {project.priority}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0">
              <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600">
                Overview
              </TabsTrigger>
              <TabsTrigger value="tasks" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600">
                Tasks ({tasks.length})
              </TabsTrigger>
              <TabsTrigger value="team" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600">
                Team
              </TabsTrigger>
              <TabsTrigger value="expenses" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600">
                Expenses
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 pt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold mb-2">Project Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Manager:</span>
                      <span className="font-medium">{project.project_manager}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Start Date:</span>
                      <span className="font-medium">{new Date(project.start_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">End Date:</span>
                      <span className="font-medium">{new Date(project.end_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Financial Info</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Budget:</span>
                      <span className="font-medium">{formatCurrency(project.budget || project.contract_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Spent:</span>
                      <span className="font-medium text-orange-600">{formatCurrency(totalExpenses)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Remaining:</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency((project.budget || project.contract_amount) - totalExpenses)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tasks" className="space-y-4 pt-6">
              <TaskManagement
                projectId={id}
                tasks={tasks}
                onTasksChange={setTasks}
              />
            </TabsContent>

            <TabsContent value="team" className="space-y-4 pt-6">
              <TeamManagement
                projectId={id}
                teamMembers={teamMembers}
                onTeamChange={setTeamMembers}
              />
            </TabsContent>

            <TabsContent value="expenses" className="space-y-4 pt-6">
              {expenses.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No expenses recorded</p>
              ) : (
                <div className="space-y-2">
                  {expenses.map((expense) => (
                    <Card key={expense.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{expense.description}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{expense.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-orange-600">{formatCurrency(expense.amount)}</p>
                          <p className="text-xs text-gray-500">{expense.status}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                  <Card className="bg-blue-50 dark:bg-blue-900/20 p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">Total Expenses</p>
                      <p className="text-lg font-bold text-orange-600">{formatCurrency(totalExpenses)}</p>
                    </div>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}

export default ProjectDetailPage;
