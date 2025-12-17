import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  CheckSquare,
  Plus,
  Trash2,
  Edit,
  Search as SearchIcon,
  Filter,
  ArrowUpDown,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import ScrollContainer from '@/components/layout/ScrollContainer';

interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  projectName: string;
  status: 'pending' | 'in-progress' | 'completed' | 'on-hold';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee: string;
  dueDate: string;
  progress: number;
  createdAt: string;
}

export default function TaskManagementFull() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'progress'>('dueDate');

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    projectId: '1',
    projectName: 'Sample Project',
    priority: 'medium' as const,
    assignee: 'You',
    dueDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tasks, searchQuery, statusFilter, priorityFilter, sortBy]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Design user authentication flow',
          description: 'Create wireframes and design the authentication UI',
          projectId: '1',
          projectName: 'Mobile App',
          status: 'in-progress',
          priority: 'high',
          assignee: 'Sarah Chen',
          dueDate: '2024-12-20',
          progress: 75,
          createdAt: '2024-12-01',
        },
        {
          id: '2',
          title: 'Implement API endpoints',
          description: 'Create REST API endpoints for user management',
          projectId: '1',
          projectName: 'Mobile App',
          status: 'in-progress',
          priority: 'critical',
          assignee: 'John Doe',
          dueDate: '2024-12-15',
          progress: 60,
          createdAt: '2024-12-01',
        },
        {
          id: '3',
          title: 'Write unit tests',
          description: 'Write comprehensive unit tests for core modules',
          projectId: '1',
          projectName: 'Mobile App',
          status: 'pending',
          priority: 'medium',
          assignee: 'Mike Johnson',
          dueDate: '2024-12-25',
          progress: 20,
          createdAt: '2024-12-02',
        },
        {
          id: '4',
          title: 'Setup CI/CD pipeline',
          description: 'Configure GitHub Actions for automated testing',
          projectId: '2',
          projectName: 'Backend API',
          status: 'completed',
          priority: 'high',
          assignee: 'Alice Brown',
          dueDate: '2024-12-10',
          progress: 100,
          createdAt: '2024-11-28',
        },
      ];

      await new Promise(resolve => setTimeout(resolve, 500));
      setTasks(mockTasks);
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = tasks;

    // Search
    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.assignee.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(t => t.priority === priorityFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'priority':
          const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'progress':
          return b.progress - a.progress;
        default:
          return 0;
      }
    });

    setFilteredTasks(filtered);
  };

  const handleCreateTask = () => {
    if (!newTask.title.trim()) {
      toast.error('Task title is required');
      return;
    }

    const task: Task = {
      id: Date.now().toString(),
      ...newTask,
      status: 'pending',
      progress: 0,
      createdAt: new Date().toISOString(),
    };

    setTasks([...tasks, task]);
    setShowCreateForm(false);
    setNewTask({
      title: '',
      description: '',
      projectId: '1',
      projectName: 'Sample Project',
      priority: 'medium',
      assignee: 'You',
      dueDate: new Date().toISOString().split('T')[0],
    });
    toast.success('Task created successfully');
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(tasks.filter(t => t.id !== taskId));
      toast.success('Task deleted');
    }
  };

  const getStatusColor = (status: Task['status']) => {
    const colors: Record<Task['status'], string> = {
      pending: 'bg-gray-100 text-gray-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      'on-hold': 'bg-yellow-100 text-yellow-800',
    };
    return colors[status];
  };

  const getPriorityColor = (priority: Task['priority']) => {
    const colors: Record<Task['priority'], string> = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    return colors[priority];
  };

  return (
    <ScrollContainer>
      <div className="space-y-6 p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
            <p className="text-gray-600 mt-1">{filteredTasks.length} tasks</p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on-hold">On Hold</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="all">All Priorities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="dueDate">Due Date</option>
                  <option value="priority">Priority</option>
                  <option value="progress">Progress</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button variant="outline" className="w-full">
                  <Filter className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading tasks...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <Card className="p-8 text-center">
              <CheckSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
              <p className="text-gray-600 mb-4">Create a new task to get started</p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </Card>
          ) : (
            filteredTasks.map(task => (
              <Card key={task.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{task.title}</h3>
                      <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                      <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">{task.description}</p>

                    <div className="grid gap-2 md:grid-cols-4 text-sm mb-3">
                      <div>
                        <p className="text-gray-500">Project</p>
                        <p className="font-medium text-gray-900">{task.projectName}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Assignee</p>
                        <p className="font-medium text-gray-900">{task.assignee}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Due Date</p>
                        <p className="font-medium text-gray-900">{new Date(task.dueDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Progress</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                          <span className="font-medium text-gray-900">{task.progress}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <Button variant="outline" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Create Task Modal */}
        {showCreateForm && (
          <Card className="p-6 fixed inset-0 m-4 bg-white z-50 max-w-2xl mx-auto my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Create New Task</h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <Input
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Task title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Task description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm min-h-24"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <Input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTask}>
                  Create Task
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </ScrollContainer>
  );
}
