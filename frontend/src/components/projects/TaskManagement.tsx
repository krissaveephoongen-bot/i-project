import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Edit2, Trash2, Check, Circle, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface Task {
  id: string;
  name?: string;
  title?: string;
  description: string;
  status: 'todo' | 'progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee?: string;
  due_date?: string;
}

interface TaskManagementProps {
  projectId: string;
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
}

export function TaskManagement({ projectId, tasks, onTasksChange }: TaskManagementProps) {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    assignee: '',
  });

  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      toast.error('Task name is required');
      return;
    }

    try {
      const response = await api.post(`/projects/${projectId}/tasks`, {
        name: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        assignee: newTask.assignee,
        status: 'todo',
      });

      if (response.data?.success || response.status === 201) {
        const createdTask = response.data.data;
        onTasksChange([...tasks, createdTask]);
        setNewTask({ title: '', description: '', priority: 'medium', assignee: '' });
        setIsAddingTask(false);
        toast.success('Task created');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: Task['status']) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      const updatedTasks = tasks.map(t =>
        t.id === taskId ? { ...t, status: newStatus } : t
      );
      onTasksChange(updatedTasks);
      toast.success('Task updated');
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Delete this task?')) return;

    try {
      await api.delete(`/tasks/${taskId}`);
      onTasksChange(tasks.filter(t => t.id !== taskId));
      toast.success('Task deleted');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'todo':
        return <Circle className="h-5 w-5 text-gray-400" />;
      case 'progress':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'review':
        return <Check className="h-5 w-5 text-blue-600" />;
      case 'completed':
        return <Check className="h-5 w-5 text-green-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    return colors[priority] || colors.medium;
  };

  const getStatusOptions = (currentStatus: Task['status']) => {
    const statuses: Task['status'][] = ['todo', 'progress', 'review', 'completed'];
    return statuses.filter(s => s !== currentStatus);
  };

  return (
    <div className="space-y-4">
      {/* Add Task Form */}
      {isAddingTask && (
        <Card className="bg-blue-50 dark:bg-blue-900/20 p-4">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Task Name *</label>
              <Input
                placeholder="Enter task name"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                placeholder="Enter task description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Assignee</label>
                <Input
                  placeholder="Assign to"
                  value={newTask.assignee}
                  onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAddTask}
                className="flex-1"
              >
                Create Task
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsAddingTask(false);
                  setNewTask({ title: '', description: '', priority: 'medium', assignee: '' });
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Add Task Button */}
      {!isAddingTask && (
        <Button
          variant="outline"
          onClick={() => setIsAddingTask(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      )}

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No tasks yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <Card key={task.id} className="p-4">
              <div className="flex items-start gap-4">
                {/* Status Icon and Click Area */}
                <div className="flex-shrink-0">
                  <div className="relative group">
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="cursor-pointer"
                    >
                      {getStatusIcon(task.status)}
                    </button>
                    {/* Status Dropdown */}
                    <div className="absolute left-0 top-8 hidden group-hover:block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-max">
                      {getStatusOptions(task.status).map((status) => (
                        <button
                          key={status}
                          onClick={() => handleUpdateStatus(task.id, status)}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg text-sm capitalize"
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Task Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {task.name || task.title}
                      </p>
                      {task.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {task.description}
                        </p>
                      )}
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <span className={`text-xs px-2 py-1 rounded capitalize font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        {task.assignee && (
                          <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                            {task.assignee}
                          </span>
                        )}
                        {task.due_date && (
                          <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                            {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingId(task.id)}
                        className="gap-1"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteTask(task.id)}
                        className="gap-1 text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
