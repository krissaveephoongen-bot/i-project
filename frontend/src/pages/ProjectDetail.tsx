import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import {
    ArrowLeft, Plus, Users, DollarSign, CheckCircle, AlertCircle,
    TrendingUp, FileText, Trash2, Edit, Mail, Phone,
    MapPin, Building2, Briefcase, Download
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import SCurveChart from '../components/charts/SCurveChart';
import SCurveStatusCards from '../components/charts/SCurveStatusCards';
import ErrorState from '@/components/ErrorState';
import LoadingState from '@/components/LoadingState';
import { parseApiError } from '@/lib/error-handler';

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
}

interface TeamMember {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    department: string;
    joinDate: string;
    status: 'active' | 'inactive' | 'on-leave';
    projectsAssigned: number;
    hoursLogged: number;
    skills: string[];
    availability: number;
}

// Client interface removed (unused)

interface Expense {
    id: string;
    date: string;
    project_id?: string;
    project?: string;
    category: 'travel' | 'food' | 'accommodation' | 'equipment' | 'software' | 'service' | 'other';
    amount: number;
    description: string;
    user_name?: string;
    status: 'pending' | 'approved' | 'rejected';
}

interface SCurveDataPoint {
    month: string;
    date: string;
    plannedPercentage: number;
    actualPercentage: number;
    plannedWeight: number;
    actualWeight: number;
}

interface SCurveData {
    projectId: string;
    projectName: string;
    startDate: string;
    endDate: string;
    totalWeight: number;
    totalTasks: number;
    completedTasks: number;
    plannedPercentage: number;
    actualPercentage: number;
    variance: number;
    data: SCurveDataPoint[];
    summary: {
        onTrack: boolean;
        performanceStatus: string;
        daysVariance: number;
    };
}

// ============================================================================
// DATA FETCHING
// ============================================================================

// Data will be fetched from API instead of using mock data

// ============================================================================
// ENHANCED PROJECT DETAIL COMPONENT
// ============================================================================

export default function ProjectDetail() {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();

    // Data
    const [project, setProject] = useState<Project | undefined>();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);

    // S-Curve State
    const [sCurveData, setSCurveData] = useState<SCurveData | null>(null);
    const [sCurveLoading, setSCurveLoading] = useState(false);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    // UI State
    const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
    const [isNewExpenseDialogOpen, setIsNewExpenseDialogOpen] = useState(false);
    const [newTask, setNewTask] = useState({ title: '', description: '', assignedTo: '', priority: 'medium' as Task['priority'], dueDate: '' });
    const [newExpense, setNewExpense] = useState({ date: '', category: 'other' as Expense['category'], amount: 0, description: '' });

    // Fetch project data
    useEffect(() => {
        const fetchProjectData = async () => {
            if (!projectId) {
                setError(parseApiError(new Error('Project ID not found')));
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

                // Fetch project
                const projectRes = await fetch(`${apiUrl}/projects/${projectId}`);
                if (!projectRes.ok) throw new Error('Failed to fetch project');
                const projectData = await projectRes.json();
                setProject(projectData);

                // Fetch tasks
                const tasksRes = await fetch(`${apiUrl}/projects/${projectId}/tasks`);
                if (tasksRes.ok) {
                    const tasksData = await tasksRes.json();
                    setTasks(tasksData);
                }

                // Fetch team members
                const teamRes = await fetch(`${apiUrl}/projects/${projectId}/team`);
                if (teamRes.ok) {
                    const teamData = await teamRes.json();
                    setTeamMembers(teamData);
                }

                // Fetch expenses
                const expensesRes = await fetch(`${apiUrl}/projects/${projectId}/expenses`);
                if (expensesRes.ok) {
                    const expensesData = await expensesRes.json();
                    setExpenses(expensesData);
                }
            } catch (err) {
                setError(parseApiError(err));
                toast.error('Failed to load project');
            } finally {
                setLoading(false);
            }
        };

        fetchProjectData();
    }, [projectId]);

    // Load S-Curve data when component mounts or projectId changes
    useEffect(() => {
        if (projectId) {
            fetchSCurveData(projectId);
        }
    }, [projectId]);

    const fetchSCurveData = async (id: string) => {
        try {
            setSCurveLoading(true);
            const response = await fetch(`/api/projects/${id}/s-curve`);
            if (!response.ok) {
                throw new Error('Failed to fetch S-Curve data');
            }
            const result = await response.json();
            if (result.success && result.data) {
                setSCurveData(result.data);
            }
        } catch (error) {
            console.error('Error fetching S-Curve data:', error);
            // Continue with null data - component handles gracefully
        } finally {
            setSCurveLoading(false);
        }
    };

    const handleExportSCurvePDF = async () => {
        try {
            toast.loading('Generating PDF...');
            const response = await fetch(`/api/projects/${projectId}/s-curve/export/pdf`);
            if (!response.ok) {
                throw new Error('Failed to export PDF');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `S-Curve-Report-${projectId}-${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.dismiss();
            toast.success('PDF exported successfully');
        } catch (error) {
            console.error('Error exporting PDF:', error);
            toast.dismiss();
            toast.error('Failed to export PDF');
        }
    };

    // Utility Functions
    const getStatusColor = (status: Project['status']) => {
        const colors: Record<Project['status'], string> = {
            'completed': 'bg-green-100 text-green-800',
            'active': 'bg-blue-100 text-blue-800',
            'planning': 'bg-yellow-100 text-yellow-800',
            'on-hold': 'bg-orange-100 text-orange-800',
            'cancelled': 'bg-red-100 text-red-800',
        };
        return colors[status];
    };

    const getPriorityColor = (priority: Task['priority']) => {
        const colors: Record<Task['priority'], string> = {
            'high': 'bg-red-100 text-red-800',
            'medium': 'bg-yellow-100 text-yellow-800',
            'low': 'bg-green-100 text-green-800',
        };
        return colors[priority];
    };

    const getTaskStatusColor = (status: Task['status']) => {
        const colors: Record<Task['status'], string> = {
            'completed': 'bg-green-100 text-green-800',
            'in-progress': 'bg-blue-100 text-blue-800',
            'review': 'bg-purple-100 text-purple-800',
            'todo': 'bg-gray-100 text-gray-800',
        };
        return colors[status];
    };

    const getExpenseStatusColor = (status: Expense['status']) => {
        const colors: Record<Expense['status'], string> = {
            'approved': 'bg-green-100 text-green-800',
            'rejected': 'bg-red-100 text-red-800',
            'pending': 'bg-yellow-100 text-yellow-800',
        };
        return colors[status];
    };

    // Task Handlers
    const handleAddTask = () => {
        if (!newTask.title.trim()) {
            toast.error('Task title is required');
            return;
        }

        const task: Task = {
            id: `task-${Date.now()}`,
            title: newTask.title,
            description: newTask.description,
            status: 'todo',
            priority: newTask.priority,
            assignedTo: newTask.assignedTo,
            dueDate: newTask.dueDate,
        };

        setTasks([...tasks, task]);
        setNewTask({ title: '', description: '', assignedTo: '', priority: 'medium', dueDate: '' });
        setIsNewTaskDialogOpen(false);
        toast.success('Task created successfully');
    };

    const handleUpdateTaskStatus = (taskId: string, newStatus: Task['status']) => {
        setTasks(tasks.map(t =>
            t.id === taskId
                ? { ...t, status: newStatus, completedDate: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : undefined }
                : t
        ));
        toast.success('Task updated');
    };

    const handleDeleteTask = (taskId: string) => {
        setTasks(tasks.filter(t => t.id !== taskId));
        toast.success('Task deleted');
    };

    // Expense Handlers
    const handleAddExpense = () => {
        if (!newExpense.description.trim() || newExpense.amount <= 0) {
            toast.error('Please fill all required fields');
            return;
        }

        const expense: Expense = {
            id: `exp-${Date.now()}`,
            date: newExpense.date,
            project_id: projectId,
            project: project?.name,
            category: newExpense.category,
            amount: newExpense.amount,
            description: newExpense.description,
            status: 'pending',
        };

        setExpenses([...expenses, expense]);
        setNewExpense({ date: '', category: 'other', amount: 0, description: '' });
        setIsNewExpenseDialogOpen(false);
        toast.success('Expense added');
    };

    const handleApproveExpense = (id: string) => {
        setExpenses(expenses.map(e => e.id === id ? { ...e, status: 'approved' as const } : e));
        toast.success('Expense approved');
    };

    const handleRejectExpense = (id: string) => {
        setExpenses(expenses.map(e => e.id === id ? { ...e, status: 'rejected' as const } : e));
        toast.success('Expense rejected');
    };

    const handleDeleteExpense = (id: string) => {
        setExpenses(expenses.filter(e => e.id !== id));
        toast.success('Expense deleted');
    };

    const budgetPercentage = project ? (project.spent / project.budget) * 100 : 0;
    const remainingBudget = project ? project.budget - project.spent : 0;
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const pendingExpenses = expenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0);

    if (error && !isLoading) {
        return (
            <div className="space-y-6">
                <Button variant="outline" size="sm" onClick={() => navigate('/projects')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Projects
                </Button>
                <ErrorState 
                    error={error}
                    onRetry={() => setError(null)}
                />
            </div>
        );
    }

    if (isLoading) {
        return <LoadingState />;
    }

    if (!project) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Project not found</p>
                <Button onClick={() => navigate('/projects')} variant="outline">Back to Projects</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={() => navigate('/projects')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                        <Badge className={getStatusColor(project.status)}>
                            {project.status}
                        </Badge>
                    </div>
                    <p className="text-gray-500">{project.code}</p>
                </div>
            </div>

            {/* Project Overview Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Status</p>
                                <Badge className={`${getStatusColor(project.status)} mt-2`}>
                                    {project.status}
                                </Badge>
                            </div>
                            <TrendingUp className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Priority</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1 capitalize">{project.priority}</p>
                            </div>
                            <AlertCircle className="h-8 w-8 text-orange-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-2">Progress</p>
                            <Progress value={project.progress} className="h-2 mb-1" />
                            <p className="text-xl font-bold text-gray-900">{project.progress}%</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-2">Budget</p>
                            <p className="text-xl font-bold text-gray-900">${remainingBudget.toLocaleString()}</p>
                            <p className="text-xs text-gray-500 mt-1">${project.spent.toLocaleString()} / ${project.budget.toLocaleString()}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="tasks">Tasks</TabsTrigger>
                    <TabsTrigger value="team">Team</TabsTrigger>
                    <TabsTrigger value="clients">Clients</TabsTrigger>
                    <TabsTrigger value="expenses">Expenses</TabsTrigger>
                    <TabsTrigger value="charter">Charter</TabsTrigger>
                </TabsList>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-4">
                    {/* Project Info & Timeline */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Project Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-600">Description</p>
                                    <p className="text-gray-900">{project.description}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Client</p>
                                    <p className="text-gray-900 font-medium">{project.clientName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Project Manager</p>
                                    <p className="text-gray-900 font-medium">{project.projectManager}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Timeline</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-600">Start Date</p>
                                    <p className="text-gray-900 font-medium">{new Date(project.startDate).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">End Date</p>
                                    <p className="text-gray-900 font-medium">{new Date(project.endDate).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Duration</p>
                                    <p className="text-gray-900 font-medium">
                                        {Math.ceil((new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* S-Curve Status Cards */}
                    {sCurveData && (
                        <>
                            <div className="mt-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-blue-600" />
                                    Project Progress Tracking (S-Curve)
                                </h3>
                                <SCurveStatusCards
                                    plannedPercentage={sCurveData.plannedPercentage}
                                    actualPercentage={sCurveData.actualPercentage}
                                    variance={sCurveData.variance}
                                    completedTasks={sCurveData.completedTasks}
                                    totalTasks={sCurveData.totalTasks}
                                    status={sCurveData.summary.performanceStatus}
                                />
                            </div>

                            {/* S-Curve Chart */}
                            <Card className="mt-6">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Progress Over Time</CardTitle>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleExportSCurvePDF}
                                        className="flex items-center gap-2"
                                    >
                                        <Download className="h-4 w-4" />
                                        Export PDF
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <SCurveChart
                                        data={sCurveData.data}
                                        projectName={sCurveData.projectName}
                                        isLoading={sCurveLoading}
                                    />
                                </CardContent>
                            </Card>
                        </>
                    )}
                </TabsContent>

                {/* TASKS TAB */}
                <TabsContent value="tasks" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold">Project Tasks</h3>
                        <Dialog open={isNewTaskDialogOpen} onOpenChange={setIsNewTaskDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-blue-600 hover:bg-blue-700">
                                    <Plus className="h-4 w-4 mr-2" />
                                    New Task
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md bg-white">
                                <DialogHeader>
                                    <DialogTitle>Create New Task</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Task Title *
                                        </label>
                                        <Input
                                            placeholder="Task title"
                                            value={newTask.title}
                                            onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Description
                                        </label>
                                        <textarea
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                                            rows={3}
                                            placeholder="Task description"
                                            value={newTask.description}
                                            onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Priority
                                            </label>
                                            <select
                                                value={newTask.priority}
                                                onChange={e => setNewTask({ ...newTask, priority: e.target.value as Task['priority'] })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                            >
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Due Date
                                            </label>
                                            <Input
                                                type="date"
                                                value={newTask.dueDate}
                                                onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Assign To
                                        </label>
                                        <select
                                            value={newTask.assignedTo}
                                            onChange={e => setNewTask({ ...newTask, assignedTo: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        >
                                            <option value="">Select team member</option>
                                            {project.teamMembers.map(member => (
                                                <option key={member} value={member}>{member}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleAddTask}>
                                        Create Task
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="space-y-3">
                        {tasks.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No tasks yet. Create one to get started.</p>
                        ) : (
                            tasks.map(task => (
                                <Card key={task.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h4 className="font-medium text-gray-900">{task.title}</h4>
                                                    <Badge className={getPriorityColor(task.priority)}>
                                                        {task.priority}
                                                    </Badge>
                                                    <Badge className={getTaskStatusColor(task.status)}>
                                                        {task.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <span>📋 {task.assignedTo}</span>
                                                    <span>📅 {new Date(task.dueDate).toLocaleDateString()}</span>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <select
                                                    value={task.status}
                                                    onChange={e => handleUpdateTaskStatus(task.id, e.target.value as Task['status'])}
                                                    className="text-sm px-2 py-1 border border-gray-300 rounded"
                                                >
                                                    <option value="todo">To Do</option>
                                                    <option value="in-progress">In Progress</option>
                                                    <option value="review">Review</option>
                                                    <option value="completed">Completed</option>
                                                </select>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteTask(task.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>

                {/* TEAM TAB */}
                <TabsContent value="team" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Project Team</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">Project Manager</p>
                                            <p className="text-lg font-bold text-gray-900">{project.projectManager}</p>
                                        </div>
                                        <Users className="h-8 w-8 text-purple-600" />
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-medium text-gray-900 mb-3">Team Members ({teamMembers.length})</h4>
                                    <div className="grid gap-3">
                                        {teamMembers.map(member => (
                                            <div key={member.id} className="p-3 border border-gray-200 rounded-lg">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                            <span className="text-sm font-bold text-blue-600">
                                                                {member.name.split(' ').map(n => n[0]).join('')}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{member.name}</p>
                                                            <p className="text-sm text-gray-600">{member.role}</p>
                                                        </div>
                                                    </div>
                                                    <Badge className={member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                                        {member.status}
                                                    </Badge>
                                                </div>

                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="h-4 w-4 text-gray-400" />
                                                        <a href={`mailto:${member.email}`} className="text-blue-600 hover:underline">
                                                            {member.email}
                                                        </a>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="h-4 w-4 text-gray-400" />
                                                        <span className="text-gray-700">{member.phone}</span>
                                                    </div>
                                                </div>

                                                <div className="border-t pt-3 mt-3 grid grid-cols-3 gap-4">
                                                    <div>
                                                        <p className="text-xs text-gray-600">Projects</p>
                                                        <p className="text-lg font-bold">{member.projectsAssigned}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-600">Hours</p>
                                                        <p className="text-lg font-bold">{member.hoursLogged}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-600">Availability</p>
                                                        <p className="text-lg font-bold text-green-600">{member.availability}%</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* CLIENTS TAB */}
                <TabsContent value="clients" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Project Client</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="font-semibold text-lg text-gray-900">{project.clientName}</h3>
                                            <Badge className="mt-2 bg-green-100 text-green-800">Active</Badge>
                                        </div>
                                        <Building2 className="h-8 w-8 text-blue-600" />
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <p className="text-sm text-gray-600">Contact Person</p>
                                            <p className="text-gray-900 font-medium">John Smith</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Industry</p>
                                            <p className="text-gray-900 font-medium">Technology</p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-gray-400" />
                                            <a href="mailto:contact@techcorp.com" className="text-blue-600 hover:underline">
                                                contact@techcorp.com
                                            </a>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-gray-400" />
                                            <span className="text-gray-700">(555) 123-4567</span>
                                        </div>

                                        <div className="col-span-2 flex items-start gap-2">
                                            <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                                            <div className="text-gray-700">
                                                <p>123 Tech Street</p>
                                                <p>San Francisco, CA</p>
                                            </div>
                                        </div>

                                        <div className="col-span-2">
                                            <p className="text-sm text-gray-600">Website</p>
                                            <a href="https://www.techcorp.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                www.techcorp.com
                                            </a>
                                        </div>
                                    </div>

                                    <div className="border-t pt-3 mt-3 grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-600">Projects</p>
                                            <p className="text-2xl font-bold">3</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600">Total Revenue</p>
                                            <p className="text-2xl font-bold">$150K</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* EXPENSES TAB */}
                <TabsContent value="expenses" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold">Project Expenses</h3>
                        <Dialog open={isNewExpenseDialogOpen} onOpenChange={setIsNewExpenseDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-blue-600 hover:bg-blue-700">
                                    <Plus className="h-4 w-4 mr-2" />
                                    New Expense
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md bg-white">
                                <DialogHeader>
                                    <DialogTitle>Add New Expense</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Date
                                        </label>
                                        <Input
                                            type="date"
                                            value={newExpense.date}
                                            onChange={e => setNewExpense({ ...newExpense, date: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Category
                                        </label>
                                        <select
                                            value={newExpense.category}
                                            onChange={e => setNewExpense({ ...newExpense, category: e.target.value as Expense['category'] })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        >
                                            <option value="travel">Travel</option>
                                            <option value="food">Food & Dining</option>
                                            <option value="accommodation">Accommodation</option>
                                            <option value="equipment">Equipment</option>
                                            <option value="software">Software</option>
                                            <option value="service">Services</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Amount
                                        </label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="0.00"
                                            value={newExpense.amount}
                                            onChange={e => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Description
                                        </label>
                                        <textarea
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                                            rows={3}
                                            placeholder="Expense description"
                                            value={newExpense.description}
                                            onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
                                        />
                                    </div>

                                    <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleAddExpense}>
                                        Add Expense
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Expense Summary */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                                        <p className="text-2xl font-bold text-gray-900">${totalExpenses.toLocaleString()}</p>
                                    </div>
                                    <DollarSign className="h-8 w-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Pending</p>
                                        <p className="text-2xl font-bold text-orange-900">${pendingExpenses.toLocaleString()}</p>
                                    </div>
                                    <AlertCircle className="h-8 w-8 text-orange-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Approved</p>
                                        <p className="text-2xl font-bold text-green-900">${(totalExpenses - pendingExpenses).toLocaleString()}</p>
                                    </div>
                                    <CheckCircle className="h-8 w-8 text-green-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Expenses List */}
                    <div className="space-y-3">
                        {expenses.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No expenses recorded</p>
                        ) : (
                            expenses.map(expense => (
                                <Card key={expense.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h4 className="font-medium text-gray-900">{expense.description}</h4>
                                                    <Badge className={getExpenseStatusColor(expense.status)}>
                                                        {expense.status}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <span>📁 {expense.category}</span>
                                                    <span>📅 {expense.date}</span>
                                                    <span className="font-bold text-gray-900">${expense.amount.toLocaleString()}</span>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                {expense.status === 'pending' && (
                                                    <>
                                                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleApproveExpense(expense.id)}>
                                                            <CheckCircle className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="sm" variant="outline" onClick={() => handleRejectExpense(expense.id)}>
                                                            ✕
                                                        </Button>
                                                    </>
                                                )}
                                                <Button variant="ghost" size="sm" onClick={() => handleDeleteExpense(expense.id)}>
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>

                {/* CHARTER TAB */}
                <TabsContent value="charter" className="space-y-4">
                    {project.charter ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Project Charter
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Project Objective</h4>
                                    <p className="text-gray-700">{project.charter.projectObjective}</p>
                                </div>

                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Business Case</h4>
                                    <p className="text-gray-700">{project.charter.businessCase}</p>
                                </div>

                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Success Criteria</h4>
                                    <p className="text-gray-700">{project.charter.successCriteria}</p>
                                </div>

                                {project.charter.scope && (
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Scope</h4>
                                        <p className="text-gray-700">{project.charter.scope}</p>
                                    </div>
                                )}

                                {project.charter.constraints && (
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Constraints</h4>
                                        <p className="text-gray-700">{project.charter.constraints}</p>
                                    </div>
                                )}

                                {project.charter.assumptions && (
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Assumptions</h4>
                                        <p className="text-gray-700">{project.charter.assumptions}</p>
                                    </div>
                                )}

                                {project.charter.risks && (
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Risks</h4>
                                        <p className="text-gray-700">{project.charter.risks}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="p-8 text-center">
                            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No project charter has been created yet.</p>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
