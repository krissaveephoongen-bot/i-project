import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
    ArrowLeft, Plus, Users, Calendar, DollarSign, CheckCircle, Clock, AlertCircle,
    Edit2, Trash2, Save, X, Eye, EyeOff, Copy
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import { API_BASE_URL, API_TIMEOUT } from '@/lib/api-config';
import ScrollContainer from '../components/layout/ScrollContainer';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

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
    charter?: {
        projectObjective: string;
        businessCase: string;
        successCriteria: string;
        scope: string;
        constraints: string;
        assumptions: string;
        risks: string;
    };
}

interface Task {
    id: string;
    title: string;
    description: string;
    status: 'todo' | 'in-progress' | 'review' | 'completed';
    priority: 'low' | 'medium' | 'high';
    assignedTo: string;
    dueDate: string;
    completedDate?: string;
    estimatedHours?: number;
    actualHours?: number;
}

interface Expense {
    id: string;
    date: string;
    project_id?: string;
    category: 'travel' | 'food' | 'accommodation' | 'equipment' | 'software' | 'service' | 'other';
    amount: number;
    description: string;
    user_name?: string;
    status: 'pending' | 'approved' | 'rejected';
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STATUS_COLORS = {
    planning: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    'on-hold': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    completed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
};

const PRIORITY_COLORS = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
};

const TASK_STATUS_OPTIONS = [
    { value: 'todo', label: 'To Do' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'review', label: 'Under Review' },
    { value: 'completed', label: 'Completed' },
];

const TASK_PRIORITY_OPTIONS = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
];

const EXPENSE_CATEGORIES = [
    { value: 'travel', label: 'Travel' },
    { value: 'food', label: 'Food & Dining' },
    { value: 'accommodation', label: 'Accommodation' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'software', label: 'Software' },
    { value: 'service', label: 'Services' },
    { value: 'other', label: 'Other' },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ProjectDetailComplete() {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();

    // Project data
    const [project, setProject] = useState<Project | null>(null);
    const [isEditingProject, setIsEditingProject] = useState(false);
    const [editedProject, setEditedProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(false);

    // Tasks
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [newTask, setNewTask] = useState<Omit<Task, 'id'>>({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        assignedTo: '',
        dueDate: '',
        estimatedHours: 0,
        actualHours: 0,
    });

    // Expenses
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isAddingExpense, setIsAddingExpense] = useState(false);
    const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
    const [newExpense, setNewExpense] = useState<Omit<Expense, 'id'>>({
        date: new Date().toISOString().split('T')[0],
        category: 'other',
        amount: 0,
        description: '',
        status: 'pending',
    });

    // Load project data
    useEffect(() => {
        if (projectId) {
            fetchProject();
            fetchTasks();
            fetchExpenses();
        }
    }, [projectId]);

    // ============================================================================
    // FETCH FUNCTIONS
    // ============================================================================

    const fetchProject = async () => {
        try {
            setLoading(true);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

            const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                setProject(data);
                setEditedProject(data);
            }
        } catch (error) {
            console.error('Error fetching project:', error);
            toast.error('Failed to load project');
        } finally {
            setLoading(false);
        }
    };

    const fetchTasks = async () => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

            const response = await fetch(`${API_BASE_URL}/projects/${projectId}/tasks`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                setTasks(data || []);
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
            setTasks([]);
        }
    };

    const fetchExpenses = async () => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

            const response = await fetch(`${API_BASE_URL}/projects/${projectId}/expenses`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                setExpenses(data || []);
            }
        } catch (error) {
            console.error('Error fetching expenses:', error);
            setExpenses([]);
        }
    };

    // ============================================================================
    // PROJECT OPERATIONS
    // ============================================================================

    const handleSaveProject = async () => {
        if (!editedProject) return;
        try {
            setLoading(true);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

            const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editedProject),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (response.ok) {
                setProject(editedProject);
                setIsEditingProject(false);
                toast.success('Project updated');
            } else {
                toast.error('Failed to update project');
            }
        } catch (error) {
            console.error('Error saving project:', error);
            toast.error('Error saving project');
        } finally {
            setLoading(false);
        }
    };

    // ============================================================================
    // TASK OPERATIONS
    // ============================================================================

    const handleAddTask = async () => {
        if (!newTask.title || !newTask.assignedTo) {
            toast.error('Please fill in required fields');
            return;
        }

        try {
            setLoading(true);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

            const response = await fetch(`${API_BASE_URL}/projects/${projectId}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTask),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (response.ok) {
                toast.success('Task added');
                resetTaskForm();
                setIsAddingTask(false);
                fetchTasks();
            } else {
                toast.error('Failed to add task');
            }
        } catch (error) {
            console.error('Error adding task:', error);
            toast.error('Error adding task');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateTask = async (taskId: string) => {
        try {
            setLoading(true);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

            const task = tasks.find(t => t.id === taskId);
            if (!task) return;

            const response = await fetch(`${API_BASE_URL}/projects/${projectId}/tasks/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(task),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (response.ok) {
                toast.success('Task updated');
                setEditingTaskId(null);
                fetchTasks();
            } else {
                toast.error('Failed to update task');
            }
        } catch (error) {
            console.error('Error updating task:', error);
            toast.error('Error updating task');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!confirm('Delete this task?')) return;

        try {
            setLoading(true);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

            const response = await fetch(`${API_BASE_URL}/projects/${projectId}/tasks/${taskId}`, {
                method: 'DELETE',
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (response.ok) {
                toast.success('Task deleted');
                fetchTasks();
            } else {
                toast.error('Failed to delete task');
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            toast.error('Error deleting task');
        } finally {
            setLoading(false);
        }
    };

    const resetTaskForm = () => {
        setNewTask({
            title: '',
            description: '',
            status: 'todo',
            priority: 'medium',
            assignedTo: '',
            dueDate: '',
            estimatedHours: 0,
            actualHours: 0,
        });
    };

    // ============================================================================
    // EXPENSE OPERATIONS
    // ============================================================================

    const handleAddExpense = async () => {
        if (!newExpense.description || newExpense.amount <= 0) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setLoading(true);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

            const response = await fetch(`${API_BASE_URL}/projects/${projectId}/expenses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newExpense),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (response.ok) {
                toast.success('Expense added');
                resetExpenseForm();
                setIsAddingExpense(false);
                fetchExpenses();
            } else {
                toast.error('Failed to add expense');
            }
        } catch (error) {
            console.error('Error adding expense:', error);
            toast.error('Error adding expense');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateExpense = async (expenseId: string) => {
        try {
            setLoading(true);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

            const expense = expenses.find(e => e.id === expenseId);
            if (!expense) return;

            const response = await fetch(`${API_BASE_URL}/projects/${projectId}/expenses/${expenseId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(expense),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (response.ok) {
                toast.success('Expense updated');
                setEditingExpenseId(null);
                fetchExpenses();
            } else {
                toast.error('Failed to update expense');
            }
        } catch (error) {
            console.error('Error updating expense:', error);
            toast.error('Error updating expense');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteExpense = async (expenseId: string) => {
        if (!confirm('Delete this expense?')) return;

        try {
            setLoading(true);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

            const response = await fetch(`${API_BASE_URL}/projects/${projectId}/expenses/${expenseId}`, {
                method: 'DELETE',
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (response.ok) {
                toast.success('Expense deleted');
                fetchExpenses();
            } else {
                toast.error('Failed to delete expense');
            }
        } catch (error) {
            console.error('Error deleting expense:', error);
            toast.error('Error deleting expense');
        } finally {
            setLoading(false);
        }
    };

    const resetExpenseForm = () => {
        setNewExpense({
            date: new Date().toISOString().split('T')[0],
            category: 'other',
            amount: 0,
            description: '',
            status: 'pending',
        });
    };

    // ============================================================================
    // HELPER FUNCTIONS
    // ============================================================================

    const getCategoryLabel = (category: string) => {
        return EXPENSE_CATEGORIES.find(c => c.value === category)?.label || category;
    };

    const calculateMetrics = () => {
        const remainingBudget = (project?.budget || 0) - (project?.spent || 0);
        const taskCompletionRate = (project?.completedTasks || 0) / (project?.tasksCount || 1) * 100;
        const expenseApprovedAmount = expenses
            .filter(e => e.status === 'approved')
            .reduce((sum, e) => sum + e.amount, 0);
        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

        return {
            remainingBudget,
            taskCompletionRate,
            expenseApprovedAmount,
            totalExpenses,
        };
    };

    if (loading && !project) {
        return (
            <ScrollContainer>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <Clock className="h-8 w-8 animate-spin mx-auto mb-2" />
                        <p>Loading project...</p>
                    </div>
                </div>
            </ScrollContainer>
        );
    }

    if (!project) {
        return (
            <ScrollContainer>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                        <p>Project not found</p>
                        <Button onClick={() => navigate('/projects')} className="mt-4">
                            Back to Projects
                        </Button>
                    </div>
                </div>
            </ScrollContainer>
        );
    }

    const metrics = calculateMetrics();

    return (
        <ScrollContainer>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => navigate('/projects')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{project.name}</h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{project.code}</p>
                        </div>
                    </div>
                    {!isEditingProject && (
                        <Button onClick={() => setIsEditingProject(true)}>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit Project
                        </Button>
                    )}
                </div>

                {/* Project Header Card */}
                <Card>
                    <CardContent className="pt-6">
                        {isEditingProject && editedProject ? (
                            <div className="space-y-4">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Project Name</label>
                                    <Input
                                        value={editedProject.name}
                                        onChange={(e) => setEditedProject({ ...editedProject, name: e.target.value })}
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <textarea
                                        className="w-full border rounded p-2 dark:bg-gray-700"
                                        rows={3}
                                        value={editedProject.description}
                                        onChange={(e) => setEditedProject({ ...editedProject, description: e.target.value })}
                                    />
                                </div>

                                {/* Status & Priority */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Status</label>
                                        <Select value={editedProject.status} onValueChange={(value: any) => setEditedProject({ ...editedProject, status: value })}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="planning">Planning</SelectItem>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="on-hold">On Hold</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Priority</label>
                                        <Select value={editedProject.priority} onValueChange={(value: any) => setEditedProject({ ...editedProject, priority: value })}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="low">Low</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                                <SelectItem value="critical">Critical</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Dates */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Start Date</label>
                                        <Input
                                            type="date"
                                            value={editedProject.startDate}
                                            onChange={(e) => setEditedProject({ ...editedProject, startDate: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">End Date</label>
                                        <Input
                                            type="date"
                                            value={editedProject.endDate}
                                            onChange={(e) => setEditedProject({ ...editedProject, endDate: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Budget */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Budget</label>
                                        <Input
                                            type="number"
                                            min="0"
                                            value={editedProject.budget}
                                            onChange={(e) => setEditedProject({ ...editedProject, budget: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Spent</label>
                                        <Input
                                            type="number"
                                            min="0"
                                            value={editedProject.spent}
                                            onChange={(e) => setEditedProject({ ...editedProject, spent: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                {/* Client & Manager */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Client Name</label>
                                        <Input
                                            value={editedProject.clientName}
                                            onChange={(e) => setEditedProject({ ...editedProject, clientName: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Project Manager</label>
                                        <Input
                                            value={editedProject.projectManager}
                                            onChange={(e) => setEditedProject({ ...editedProject, projectManager: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2 pt-4">
                                    <Button onClick={handleSaveProject} disabled={loading}>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save
                                    </Button>
                                    <Button variant="outline" onClick={() => {
                                        setIsEditingProject(false);
                                        setEditedProject(project);
                                    }}>
                                        <X className="h-4 w-4 mr-2" />
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                                    <Badge className={STATUS_COLORS[project.status]}>
                                        {project.status}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Priority</p>
                                    <Badge className={PRIORITY_COLORS[project.priority]}>
                                        {project.priority}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Client</p>
                                    <p className="font-semibold">{project.clientName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Manager</p>
                                    <p className="font-semibold">{project.projectManager}</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Budget Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${metrics.remainingBudget.toLocaleString()}</div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Remaining of ${project.budget.toLocaleString()}</p>
                            <Progress value={(project.spent / project.budget) * 100} className="mt-2" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Progress</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{project.progress}%</div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{project.completedTasks}/{project.tasksCount} tasks</p>
                            <Progress value={project.progress} className="mt-2" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Timeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm font-semibold">{format(parseISO(project.startDate), 'MMM d, yyyy')}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">to {format(parseISO(project.endDate), 'MMM d, yyyy')}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${metrics.totalExpenses.toLocaleString()}</div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">${metrics.expenseApprovedAmount.toLocaleString()} approved</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="tasks" className="w-full">
                    <TabsList>
                        <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
                        <TabsTrigger value="expenses">Expenses ({expenses.length})</TabsTrigger>
                        <TabsTrigger value="charter">Charter</TabsTrigger>
                    </TabsList>

                    {/* Tasks Tab */}
                    <TabsContent value="tasks" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Project Tasks</h3>
                            {!isAddingTask && (
                                <Button onClick={() => setIsAddingTask(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Task
                                </Button>
                            )}
                        </div>

                        {/* Add Task Form */}
                        {isAddingTask && (
                            <Card>
                                <CardContent className="pt-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Title *</label>
                                        <Input
                                            placeholder="Task title"
                                            value={newTask.title}
                                            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Description</label>
                                        <textarea
                                            className="w-full border rounded p-2 dark:bg-gray-700"
                                            rows={2}
                                            placeholder="Task description"
                                            value={newTask.description}
                                            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Status</label>
                                            <Select value={newTask.status} onValueChange={(value: any) => setNewTask({ ...newTask, status: value })}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {TASK_STATUS_OPTIONS.map(opt => (
                                                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Priority</label>
                                            <Select value={newTask.priority} onValueChange={(value: any) => setNewTask({ ...newTask, priority: value })}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {TASK_PRIORITY_OPTIONS.map(opt => (
                                                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Assigned To *</label>
                                            <Input
                                                placeholder="Team member name"
                                                value={newTask.assignedTo}
                                                onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Due Date</label>
                                            <Input
                                                type="date"
                                                value={newTask.dueDate}
                                                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Estimated Hours</label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={newTask.estimatedHours || 0}
                                                onChange={(e) => setNewTask({ ...newTask, estimatedHours: Number(e.target.value) })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Actual Hours</label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={newTask.actualHours || 0}
                                                onChange={(e) => setNewTask({ ...newTask, actualHours: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-4">
                                        <Button onClick={handleAddTask} disabled={loading}>
                                            <Save className="h-4 w-4 mr-2" />
                                            Save Task
                                        </Button>
                                        <Button variant="outline" onClick={() => {
                                            setIsAddingTask(false);
                                            resetTaskForm();
                                        }}>
                                            Cancel
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Tasks List */}
                        <div className="space-y-2">
                            {tasks.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No tasks added yet</p>
                            ) : (
                                tasks.map(task => (
                                    <Card key={task.id}>
                                        <CardContent className="pt-6">
                                            {editingTaskId === task.id ? (
                                                <div className="space-y-4">
                                                    <Input
                                                        value={task.title}
                                                        onChange={(e) => setTasks(tasks.map(t => t.id === task.id ? { ...t, title: e.target.value } : t))}
                                                    />
                                                    <Select value={task.status} onValueChange={(value: any) => setTasks(tasks.map(t => t.id === task.id ? { ...t, status: value } : t))}>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {TASK_STATUS_OPTIONS.map(opt => (
                                                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <div className="flex gap-2">
                                                        <Button onClick={() => handleUpdateTask(task.id)} disabled={loading} size="sm">
                                                            Save
                                                        </Button>
                                                        <Button variant="outline" onClick={() => setEditingTaskId(null)} size="sm">
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold">{task.title}</h4>
                                                        <div className="flex gap-2 mt-2">
                                                            <Badge variant="outline">{task.status}</Badge>
                                                            <Badge variant="outline">{task.priority}</Badge>
                                                        </div>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Assigned to: {task.assignedTo}</p>
                                                        {task.dueDate && (
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">Due: {format(parseISO(task.dueDate), 'MMM d, yyyy')}</p>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button onClick={() => setEditingTaskId(task.id)} size="sm" variant="ghost">
                                                            <Edit2 className="h-4 w-4" />
                                                        </Button>
                                                        <Button onClick={() => handleDeleteTask(task.id)} size="sm" variant="ghost" className="text-red-600">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </TabsContent>

                    {/* Expenses Tab */}
                    <TabsContent value="expenses" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Project Expenses</h3>
                            {!isAddingExpense && (
                                <Button onClick={() => setIsAddingExpense(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Expense
                                </Button>
                            )}
                        </div>

                        {/* Add Expense Form */}
                        {isAddingExpense && (
                            <Card>
                                <CardContent className="pt-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Date</label>
                                            <Input
                                                type="date"
                                                value={newExpense.date}
                                                onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Category</label>
                                            <Select value={newExpense.category} onValueChange={(value: any) => setNewExpense({ ...newExpense, category: value })}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {EXPENSE_CATEGORIES.map(cat => (
                                                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Description *</label>
                                        <Input
                                            placeholder="Expense description"
                                            value={newExpense.description}
                                            onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Amount *</label>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                placeholder="0.00"
                                                value={newExpense.amount}
                                                onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Status</label>
                                            <Select value={newExpense.status} onValueChange={(value: any) => setNewExpense({ ...newExpense, status: value })}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="pending">Pending</SelectItem>
                                                    <SelectItem value="approved">Approved</SelectItem>
                                                    <SelectItem value="rejected">Rejected</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-4">
                                        <Button onClick={handleAddExpense} disabled={loading}>
                                            <Save className="h-4 w-4 mr-2" />
                                            Save Expense
                                        </Button>
                                        <Button variant="outline" onClick={() => {
                                            setIsAddingExpense(false);
                                            resetExpenseForm();
                                        }}>
                                            Cancel
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Expenses List */}
                        <div className="space-y-2">
                            {expenses.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No expenses added yet</p>
                            ) : (
                                expenses.map(expense => (
                                    <Card key={expense.id}>
                                        <CardContent className="pt-6">
                                            {editingExpenseId === expense.id ? (
                                                <div className="space-y-4">
                                                    <Input
                                                        value={expense.description}
                                                        onChange={(e) => setExpenses(expenses.map(exp => exp.id === expense.id ? { ...exp, description: e.target.value } : exp))}
                                                    />
                                                    <Input
                                                        type="number"
                                                        value={expense.amount}
                                                        onChange={(e) => setExpenses(expenses.map(exp => exp.id === expense.id ? { ...exp, amount: Number(e.target.value) } : exp))}
                                                    />
                                                    <Select value={expense.status} onValueChange={(value: any) => setExpenses(expenses.map(exp => exp.id === expense.id ? { ...exp, status: value } : exp))}>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="pending">Pending</SelectItem>
                                                            <SelectItem value="approved">Approved</SelectItem>
                                                            <SelectItem value="rejected">Rejected</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <div className="flex gap-2">
                                                        <Button onClick={() => handleUpdateExpense(expense.id)} disabled={loading} size="sm">
                                                            Save
                                                        </Button>
                                                        <Button variant="outline" onClick={() => setEditingExpenseId(null)} size="sm">
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold">{expense.description}</h4>
                                                        <div className="flex gap-2 mt-2">
                                                            <Badge variant="outline">{getCategoryLabel(expense.category)}</Badge>
                                                            <Badge variant={expense.status === 'approved' ? 'default' : expense.status === 'rejected' ? 'destructive' : 'secondary'}>
                                                                {expense.status}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{format(parseISO(expense.date), 'MMM d, yyyy')}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-lg">${expense.amount.toFixed(2)}</p>
                                                        <div className="flex gap-2 mt-2">
                                                            <Button onClick={() => setEditingExpenseId(expense.id)} size="sm" variant="ghost">
                                                                <Edit2 className="h-4 w-4" />
                                                            </Button>
                                                            <Button onClick={() => handleDeleteExpense(expense.id)} size="sm" variant="ghost" className="text-red-600">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </TabsContent>

                    {/* Charter Tab */}
                    <TabsContent value="charter" className="space-y-4">
                        {project.charter ? (
                            <div className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Project Charter</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <h4 className="font-semibold mb-2">Project Objective</h4>
                                            <p className="text-gray-700 dark:text-gray-300">{project.charter.projectObjective}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-2">Business Case</h4>
                                            <p className="text-gray-700 dark:text-gray-300">{project.charter.businessCase}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-2">Success Criteria</h4>
                                            <p className="text-gray-700 dark:text-gray-300">{project.charter.successCriteria}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-2">Scope</h4>
                                            <p className="text-gray-700 dark:text-gray-300">{project.charter.scope}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-2">Constraints</h4>
                                            <p className="text-gray-700 dark:text-gray-300">{project.charter.constraints}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-2">Assumptions</h4>
                                            <p className="text-gray-700 dark:text-gray-300">{project.charter.assumptions}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-2">Risks</h4>
                                            <p className="text-gray-700 dark:text-gray-300">{project.charter.risks}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8">No project charter defined</p>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </ScrollContainer>
    );
}
