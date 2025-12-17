import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import {
    ArrowLeft, Plus, Users, Calendar, DollarSign, CheckCircle, Clock, AlertCircle,
    TrendingUp, FileText, Trash2, Edit, Activity, Target, BarChart3, Mail, Phone,
    MapPin, Building2, Briefcase, Lock
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useProjectRole } from '../hooks/useProjectRole';
import { useAuth } from '../hooks/use-auth';

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

interface Client {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    website: string;
    industry: string;
    status: 'active' | 'inactive' | 'prospect';
    projectCount: number;
    totalRevenue: number;
    contactPerson: string;
}

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

// ============================================================================
// ENHANCED PROJECT DETAIL COMPONENT
// ============================================================================

export default function ProjectDetailEnhanced() {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Data
    const [project, setProject] = useState<Project | null>(null);
    const projectRole = useProjectRole(project?.projectManagerId || '', user?.id, user?.role);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);

    // UI State
    const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
    const [isNewExpenseDialogOpen, setIsNewExpenseDialogOpen] = useState(false);
    const [isNewTeamDialogOpen, setIsNewTeamDialogOpen] = useState(false);
    const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState(false);
    const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
    const [editingClientId, setEditingClientId] = useState<string | null>(null);
    const [newTask, setNewTask] = useState({ title: '', description: '', assignedTo: '', priority: 'medium' as Task['priority'], dueDate: '' });
    const [newExpense, setNewExpense] = useState({ date: '', category: 'other' as Expense['category'], amount: 0, description: '' });
    const [newTeamMember, setNewTeamMember] = useState({ name: '', email: '', phone: '', role: '', department: '', joinDate: '' });
    const [newClient, setNewClient] = useState({ name: '', email: '', phone: '', address: '', city: '', state: '', website: '', industry: '', contactPerson: '' });

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

    // Team Member Handlers
    const handleAddTeamMember = () => {
        if (!newTeamMember.name.trim() || !newTeamMember.email.trim()) {
            toast.error('Name and email are required');
            return;
        }

        if (editingTeamId) {
            // Update existing member
            setTeamMembers(teamMembers.map(m =>
                m.id === editingTeamId
                    ? { ...m, ...newTeamMember, availability: m.availability }
                    : m
            ));
            toast.success('Team member updated');
            setEditingTeamId(null);
        } else {
            // Add new member
            const member: TeamMember = {
                id: `member-${Date.now()}`,
                name: newTeamMember.name,
                email: newTeamMember.email,
                phone: newTeamMember.phone,
                role: newTeamMember.role,
                department: newTeamMember.department,
                joinDate: newTeamMember.joinDate || new Date().toISOString().split('T')[0],
                status: 'active',
                projectsAssigned: 1,
                hoursLogged: 0,
                skills: [],
                availability: 80,
            };
            setTeamMembers([...teamMembers, member]);
            toast.success('Team member added');
        }

        setNewTeamMember({ name: '', email: '', phone: '', role: '', department: '', joinDate: '' });
        setIsNewTeamDialogOpen(false);
    };

    const handleEditTeamMember = (member: TeamMember) => {
        setNewTeamMember({
            name: member.name,
            email: member.email,
            phone: member.phone,
            role: member.role,
            department: member.department,
            joinDate: member.joinDate,
        });
        setEditingTeamId(member.id);
        setIsNewTeamDialogOpen(true);
    };

    const handleUpdateTeamStatus = (memberId: string, newStatus: 'active' | 'inactive' | 'on-leave') => {
        setTeamMembers(teamMembers.map(m =>
            m.id === memberId ? { ...m, status: newStatus } : m
        ));
        toast.success('Team member status updated');
    };

    // Client Handlers
    const handleAddClient = () => {
        if (!newClient.name.trim() || !newClient.email.trim()) {
            toast.error('Client name and email are required');
            return;
        }

        if (editingClientId) {
            // Note: In this implementation, clients are global, so we would need to update them differently
            toast.info('Client update feature - needs API integration');
        } else {
            // Add new client
            const client: Client = {
                id: `client-${Date.now()}`,
                name: newClient.name,
                email: newClient.email,
                phone: newClient.phone,
                address: newClient.address,
                city: newClient.city,
                state: newClient.state,
                website: newClient.website,
                industry: newClient.industry,
                status: 'active',
                projectCount: 1,
                totalRevenue: 0,
                contactPerson: newClient.contactPerson,
            };
            // In a real app, this would be sent to the API
            toast.success('Client added successfully');
        }

        setNewClient({ name: '', email: '', phone: '', address: '', city: '', state: '', website: '', industry: '', contactPerson: '' });
        setIsNewClientDialogOpen(false);
    };

    const handleEditClient = (client: Client) => {
        setNewClient({
            name: client.name,
            email: client.email,
            phone: client.phone,
            address: client.address,
            city: client.city,
            state: client.state,
            website: client.website,
            industry: client.industry,
            contactPerson: client.contactPerson,
        });
        setEditingClientId(client.id);
        setIsNewClientDialogOpen(true);
    };

    const budgetPercentage = project ? (project.spent / project.budget) * 100 : 0;
    const remainingBudget = project ? project.budget - project.spent : 0;
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const pendingExpenses = expenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0);

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
                        {!projectRole.canEdit && (
                            <Badge className="bg-gray-100 text-gray-800 flex items-center gap-1">
                                <Lock className="h-3 w-3" />
                                View Only
                            </Badge>
                        )}
                    </div>
                    <p className="text-gray-500">{project.code} • {projectRole.role}</p>
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

                {/* ================================================================
                    OVERVIEW TAB
                    ================================================================ */}
                <TabsContent value="overview" className="space-y-4">
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
                </TabsContent>

                {/* ================================================================
                    TASKS TAB
                    ================================================================ */}
                <TabsContent value="tasks" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold">Project Tasks</h3>
                        {projectRole.canEdit && (
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
                        )}
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
                                                    disabled={!projectRole.canEdit}
                                                >
                                                    <option value="todo">To Do</option>
                                                    <option value="in-progress">In Progress</option>
                                                    <option value="review">Review</option>
                                                    <option value="completed">Completed</option>
                                                </select>
                                                {projectRole.canDelete && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteTask(task.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-600" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>

                {/* ================================================================
                    TEAM TAB
                    ================================================================ */}
                <TabsContent value="team" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold">Project Team</h3>
                        {projectRole.canEdit && (
                            <Dialog open={isNewTeamDialogOpen} onOpenChange={setIsNewTeamDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-blue-600 hover:bg-blue-700">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Team Member
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md bg-white">
                                    <DialogHeader>
                                        <DialogTitle>{editingTeamId ? 'Edit' : 'Add'} Team Member</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                            <Input
                                                placeholder="Full name"
                                                value={newTeamMember.name}
                                                onChange={e => setNewTeamMember({ ...newTeamMember, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                            <Input
                                                type="email"
                                                placeholder="email@example.com"
                                                value={newTeamMember.email}
                                                onChange={e => setNewTeamMember({ ...newTeamMember, email: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                            <Input
                                                placeholder="(555) 123-4567"
                                                value={newTeamMember.phone}
                                                onChange={e => setNewTeamMember({ ...newTeamMember, phone: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                            <Input
                                                placeholder="e.g., Developer, Designer"
                                                value={newTeamMember.role}
                                                onChange={e => setNewTeamMember({ ...newTeamMember, role: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                            <Input
                                                placeholder="e.g., Engineering, Design"
                                                value={newTeamMember.department}
                                                onChange={e => setNewTeamMember({ ...newTeamMember, department: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
                                            <Input
                                                type="date"
                                                value={newTeamMember.joinDate}
                                                onChange={e => setNewTeamMember({ ...newTeamMember, joinDate: e.target.value })}
                                            />
                                        </div>
                                        <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleAddTeamMember}>
                                            {editingTeamId ? 'Update' : 'Add'} Member
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>

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
                                                <div className="flex items-start justify-between mb-3 gap-2">
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                            <span className="text-sm font-bold text-blue-600">
                                                                {member.name.split(' ').map(n => n[0]).join('')}
                                                            </span>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-medium text-gray-900 truncate">{member.name}</p>
                                                            <p className="text-sm text-gray-600 truncate">{member.role}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 flex-shrink-0">
                                                        <select
                                                            value={member.status}
                                                            onChange={e => handleUpdateTeamStatus(member.id, e.target.value as 'active' | 'inactive' | 'on-leave')}
                                                            className="text-sm px-2 py-1 border border-gray-300 rounded"
                                                            disabled={!projectRole.canEdit}
                                                        >
                                                            <option value="active">Active</option>
                                                            <option value="inactive">Inactive</option>
                                                            <option value="on-leave">On Leave</option>
                                                        </select>
                                                        {projectRole.canEdit && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0"
                                                                onClick={() => handleEditTeamMember(member)}
                                                                title="Edit"
                                                            >
                                                                <Edit className="h-4 w-4 text-blue-600" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                                        <a href={`mailto:${member.email}`} className="text-blue-600 hover:underline truncate">
                                                            {member.email}
                                                        </a>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
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

                {/* ================================================================
                    CLIENTS TAB
                    ================================================================ */}
                <TabsContent value="clients" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold">Project Clients</h3>
                        {projectRole.canEdit && (
                            <Dialog open={isNewClientDialogOpen} onOpenChange={setIsNewClientDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-blue-600 hover:bg-blue-700">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Client
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-2xl bg-white max-h-96 overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>{editingClientId ? 'Edit' : 'Add'} Client</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                                                <Input
                                                    placeholder="Company name"
                                                    value={newClient.name}
                                                    onChange={e => setNewClient({ ...newClient, name: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                                                <Input
                                                    placeholder="Contact name"
                                                    value={newClient.contactPerson}
                                                    onChange={e => setNewClient({ ...newClient, contactPerson: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                                <Input
                                                    type="email"
                                                    placeholder="email@company.com"
                                                    value={newClient.email}
                                                    onChange={e => setNewClient({ ...newClient, email: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                                <Input
                                                    placeholder="(555) 123-4567"
                                                    value={newClient.phone}
                                                    onChange={e => setNewClient({ ...newClient, phone: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                                                <Input
                                                    placeholder="e.g., Technology"
                                                    value={newClient.industry}
                                                    onChange={e => setNewClient({ ...newClient, industry: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                                                <Input
                                                    placeholder="www.example.com"
                                                    value={newClient.website}
                                                    onChange={e => setNewClient({ ...newClient, website: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                            <Input
                                                placeholder="Street address"
                                                value={newClient.address}
                                                onChange={e => setNewClient({ ...newClient, address: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                                <Input
                                                    placeholder="City"
                                                    value={newClient.city}
                                                    onChange={e => setNewClient({ ...newClient, city: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                                <Input
                                                    placeholder="State/Province"
                                                    value={newClient.state}
                                                    onChange={e => setNewClient({ ...newClient, state: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleAddClient}>
                                            {editingClientId ? 'Update' : 'Add'} Client
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Project Clients</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {clients.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No clients added yet.</p>
                                ) : (
                                    clients.map(client => (
                                        <div key={client.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                                            <div className="flex items-start justify-between mb-3 gap-2">
                                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                                    <Building2 className="h-8 w-8 text-blue-600 flex-shrink-0 mt-1" />
                                                    <div className="min-w-0">
                                                        <h3 className="font-semibold text-lg text-gray-900 truncate">{client.name}</h3>
                                                        <Badge className="mt-2 bg-green-100 text-green-800">Active</Badge>
                                                    </div>
                                                </div>
                                                {projectRole.canEdit && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                        onClick={() => handleEditClient(client)}
                                                        title="Edit"
                                                    >
                                                        <Edit className="h-4 w-4 text-blue-600" />
                                                    </Button>
                                                )}
                                            </div>

                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div>
                                                    <p className="text-sm text-gray-600">Contact Person</p>
                                                    <p className="text-gray-900 font-medium">{client.contactPerson}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">Industry</p>
                                                    <p className="text-gray-900 font-medium">{client.industry}</p>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4 text-gray-400" />
                                                    <a href={`mailto:${client.email}`} className="text-blue-600 hover:underline truncate">
                                                        {client.email}
                                                    </a>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4 text-gray-400" />
                                                    <span className="text-gray-700">{client.phone}</span>
                                                </div>

                                                <div className="col-span-2 flex items-start gap-2">
                                                    <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                                                    <div className="text-gray-700">
                                                        <p>{client.address}</p>
                                                        <p>{client.city}, {client.state}</p>
                                                    </div>
                                                </div>

                                                <div className="col-span-2">
                                                    <p className="text-sm text-gray-600">Website</p>
                                                    <a href={`https://${client.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                        {client.website}
                                                    </a>
                                                </div>
                                            </div>

                                            <div className="border-t pt-3 mt-3 grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs text-gray-600">Projects</p>
                                                    <p className="text-2xl font-bold">{client.projectCount}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-600">Total Revenue</p>
                                                    <p className="text-2xl font-bold">${(client.totalRevenue / 1000).toFixed(0)}K</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ================================================================
                    EXPENSES TAB
                    ================================================================ */}
                <TabsContent value="expenses" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold">Project Expenses</h3>
                        <Dialog open={isNewExpenseDialogOpen} onOpenChange={setIsNewExpenseDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-blue-600 hover:bg-blue-700">
                                    <Plus className="h-4 w-4 mr-2" />
                                    {projectRole.canEdit ? 'Add Expense' : 'Add Expense'}
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
                                                {projectRole.canApprove && expense.status === 'pending' && (
                                                    <>
                                                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleApproveExpense(expense.id)}>
                                                            <CheckCircle className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="sm" variant="outline" onClick={() => handleRejectExpense(expense.id)}>
                                                            ✕
                                                        </Button>
                                                    </>
                                                )}
                                                {projectRole.canDelete && (
                                                    <Button variant="ghost" size="sm" onClick={() => handleDeleteExpense(expense.id)}>
                                                        <Trash2 className="h-4 w-4 text-red-600" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>

                {/* ================================================================
                    CHARTER TAB
                    ================================================================ */}
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
