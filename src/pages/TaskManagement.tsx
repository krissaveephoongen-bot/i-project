import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Check, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Task } from '@/types/project';
import { projectService } from '@/services/projectService';

interface TaskManagementProps {
  projectId: string;
  onTasksUpdate?: (tasks: Task[]) => void;
}

export default function TaskManagement({ projectId, onTasksUpdate }: TaskManagementProps) {
  const { user } = useAuthContext();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filteredStatus, setFilteredStatus] = useState<string>('all');

  const [formData, setFormData] = useState({
    name: '',
    plannedStartDate: new Date().toISOString().split('T')[0],
    plannedEndDate: new Date().toISOString().split('T')[0],
    plannedProgressWeight: 0,
    actualProgress: 0,
    status: 'pending' as const,
    assignedTo: '',
    description: '',
  });

  // Load tasks
  const loadTasks = async () => {
    try {
      setLoading(true);
      const project = await projectService.getProject(projectId);
      setTasks(project.tasks || []);
      onTasksUpdate?.(project.tasks || []);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.plannedStartDate || !formData.plannedEndDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.plannedProgressWeight <= 0 || formData.plannedProgressWeight > 100) {
      toast.error('Progress weight must be between 1 and 100');
      return;
    }

    try {
      setLoading(true);

      if (editingTask) {
        await projectService.updateTask(projectId, editingTask.id, {
          ...formData,
          plannedStartDate: new Date(formData.plannedStartDate),
          plannedEndDate: new Date(formData.plannedEndDate),
        });
        toast.success('Task updated successfully');
      } else {
        await projectService.addTask(projectId, {
          ...formData,
          plannedStartDate: new Date(formData.plannedStartDate),
          plannedEndDate: new Date(formData.plannedEndDate),
          projectId,
        });
        toast.success('Task created successfully');
      }

      await loadTasks();
      setShowForm(false);
      setEditingTask(null);
      resetForm();
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        setLoading(true);
        await projectService.deleteTask(projectId, taskId);
        toast.success('Task deleted successfully');
        await loadTasks();
      } catch (error) {
        console.error('Error deleting task:', error);
        toast.error('Failed to delete task');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      name: task.name,
      plannedStartDate: task.plannedStartDate.toString().split('T')[0],
      plannedEndDate: task.plannedEndDate.toString().split('T')[0],
      plannedProgressWeight: task.plannedProgressWeight,
      actualProgress: task.actualProgress,
      status: task.status,
      assignedTo: task.assignedTo || '',
      description: task.description || '',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      plannedStartDate: new Date().toISOString().split('T')[0],
      plannedEndDate: new Date().toISOString().split('T')[0],
      plannedProgressWeight: 0,
      actualProgress: 0,
      status: 'pending',
      assignedTo: '',
      description: '',
    });
  };

  const filteredTasks = filteredStatus === 'all' 
    ? tasks 
    : tasks.filter(task => task.status === filteredStatus);

  const totalWeight = tasks.reduce((sum, task) => sum + task.plannedProgressWeight, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Task Management</h2>
          <p className="text-sm text-gray-600 mt-1">Current User: {user?.name} ({user?.id})</p>
        </div>
        <Button 
          onClick={() => {
            setEditingTask(null);
            resetForm();
            setShowForm(!showForm);
          }}
          className="gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingTask ? 'Edit Task' : 'Create New Task'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Task Name *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter task name"
                  />
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
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="on-hold">On Hold</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter task description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Planned Start Date *
                  </label>
                  <Input
                    type="date"
                    value={formData.plannedStartDate}
                    onChange={(e) => setFormData({ ...formData, plannedStartDate: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Planned End Date *
                  </label>
                  <Input
                    type="date"
                    value={formData.plannedEndDate}
                    onChange={(e) => setFormData({ ...formData, plannedEndDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Progress Weight (%) *
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.plannedProgressWeight}
                    onChange={(e) => setFormData({ ...formData, plannedProgressWeight: parseFloat(e.target.value) })}
                    placeholder="e.g., 20"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Total weight: {totalWeight}% {totalWeight > 100 && '⚠️ Exceeds 100%'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Actual Progress (%) *
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.actualProgress}
                    onChange={(e) => setFormData({ ...formData, actualProgress: parseFloat(e.target.value) })}
                    placeholder="e.g., 0"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditingTask(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                  {loading ? 'Saving...' : editingTask ? 'Update Task' : 'Create Task'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Status
          </label>
          <Select value={filteredStatus} onValueChange={setFilteredStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="on-hold">On Hold</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {loading && <div className="text-center py-8">Loading tasks...</div>}
        
        {!loading && filteredTasks.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No tasks found</p>
            </CardContent>
          </Card>
        )}

        {!loading && filteredTasks.map((task) => (
          <Card key={task.id} className="hover:shadow-md transition-shadow">
            <CardContent className="py-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{task.name}</h3>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </div>

                  {task.description && (
                    <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Start Date</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(task.plannedStartDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">End Date</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(task.plannedEndDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Weight</p>
                      <p className="text-sm font-medium text-gray-900">{task.plannedProgressWeight}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Progress</p>
                      <p className="text-sm font-medium text-gray-900">{task.actualProgress}%</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${task.actualProgress}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleEdit(task)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(task.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats */}
      {tasks.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{tasks.filter(t => t.status === 'completed').length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{tasks.filter(t => t.status === 'in-progress').length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Weight</p>
                <p className="text-2xl font-bold text-indigo-600">{totalWeight}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
