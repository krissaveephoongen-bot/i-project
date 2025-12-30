import { useState, useMemo, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Plus, Search, Users, DollarSign, Check, TrendingUp, Trash2, Calendar, FileText, BarChart3, X, Gauge, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { timesheetService } from '@/services/timesheetService';
import { teamService, type TeamMember } from '@/services/teamService';
import { customerService, type Customer } from '@/services/customerService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../utils/currency';
import SCurveChart from '../components/charts/SCurveChart';
import SCurveStatusCards from '../components/charts/SCurveStatusCards';
import ScrollContainer from '../components/layout/ScrollContainer';

interface ProjectCharter {
    projectObjective: string;
    businessCase: string;
    successCriteria: string;
    scope: string;
    constraints: string;
    assumptions: string;
    risks: string;
}

interface Project {
    id: string;
    code: string;
    name: string;
    description: string;
    status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'critical';
    start_date: string;
    end_date: string;
    budget: number;
    spent?: number;
    contract_amount?: number;
    progress: number;
    actual_progress?: number;
    planned_progress?: number;
    customer: string;
    project_manager: string;
    team_members: string;
    department?: string;
    risk_level?: string;
    project_type?: string;
    duration_days?: number;
    remaining_days?: number;
    created_at: string;
    updated_at: string;
    is_deleted?: boolean;
    charter?: ProjectCharter;
}

interface ErrorState {
    message: string;
    code?: string;
    severity: 'error' | 'warning' | 'info';
    timestamp: Date;
    retryable: boolean;
}

// Fetch customers from API
const useCustomers = () => {
    return useQuery<Customer[]>({
        queryKey: ['customers'],
        queryFn: async (): Promise<Customer[]> => {
            const response = await customerService.getCustomers();
            if (!response.success) {
                throw new Error((response as any).message || 'Failed to fetch customers');
            }
            return response.data || [];
        },
    });
};

// Fetch team members from API
const useTeamMembers = () => {
    return useQuery<TeamMember[]>({
        queryKey: ['team-members'],
        queryFn: async (): Promise<TeamMember[]> => {
            const response = await teamService.getTeamMembers('all');
            if (!response.success) {
                throw new Error((response as any).message || 'Failed to fetch team members');
            }
            return response.data || [];
        },
    });
};

// Fetch projects from API
const useProjects = () => {
    return useQuery<Project[]>({
        queryKey: ['projects'],
        queryFn: async (): Promise<Project[]> => {
            try {
                const response = await fetch('/api/projects');
                if (!response.ok) {
                    throw new Error('Failed to fetch projects');
                }
                const data = await response.json();
                return (data.data || []) as Project[];
            } catch (error) {
                console.error('Error fetching projects:', error);
                toast.error('Failed to load projects');
                return [];
            }
        },
    });
};

const Projects: React.FC = () => {
    const { data: customers = [], isLoading: isLoadingCustomers, isError: isCustomersError, error: customersError } = useCustomers();
    const { data: teamMembers, isLoading: isLoadingTeamMembers, isError: isTeamMembersError, error: teamMembersError } = useTeamMembers();
    const { data: projects = [], refetch: refetchProjects } = useProjects();
    const navigate = useNavigate();

    // Check database status periodically
    useQuery({
        queryKey: ['db-status'],
        queryFn: async () => timesheetService.getDbStatus(),
        refetchInterval: 60000,
    });

    // Handle team members error
    useEffect(() => {
        if (isTeamMembersError && teamMembersError) {
            let message = 'Failed to load team members';
            if (teamMembersError.message.includes('fetch') || teamMembersError.message.includes('network')) {
                message = 'Network error: Unable to connect to server. Please check your connection.';
            } else if (teamMembersError.message.includes('404')) {
                message = 'Team members service not found. Please contact support.';
            } else if (teamMembersError.message.includes('500') || teamMembersError.message.includes('server')) {
                message = 'Server error: Please try again later.';
            }
            toast.error(message);
        }
    }, [isTeamMembersError, teamMembersError]);

    // Handle customers error
    useEffect(() => {
        if (isCustomersError && customersError) {
            let message = 'Failed to load customers';
            if (customersError.message.includes('fetch') || customersError.message.includes('network')) {
                message = 'Network error: Unable to connect to server. Please check your connection.';
            } else if (customersError.message.includes('404')) {
                message = 'Customers service not found. Please contact support.';
            } else if (customersError.message.includes('500') || customersError.message.includes('server')) {
                message = 'Server error: Please try again later.';
            }
            toast.error(message);
        }
    }, [isCustomersError, customersError]);

    const [, setError] = useState<ErrorState | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
    const [isCharterDialogOpen, setIsCharterDialogOpen] = useState(false);
    const [selectedProjectForCharter, setSelectedProjectForCharter] = useState<string | null>(null);
    const [isProjectInfoDialogOpen, setIsProjectInfoDialogOpen] = useState(false);
    const [selectedProjectForInfo, setSelectedProjectForInfo] = useState<string | null>(null);
    const [sCurveData, setSCurveData] = useState<any>(null);
    const [sCurveLoading, setSCurveLoading] = useState(false);

    const [newProject, setNewProject] = useState({
        name: '',
        code: '',
        description: '',
        customerId: '',
        projectManagerId: '',
        teamMemberIds: [] as string[],
        startDate: '',
        endDate: '',
        budget: 0,
        priority: 'medium' as Project['priority'],
    });

    const [charter, setCharter] = useState<ProjectCharter>({
        projectObjective: '',
        businessCase: '',
        successCriteria: '',
        scope: '',
        constraints: '',
        assumptions: '',
        risks: '',
    });

    // Error handling utility functions
    const handleError = (message: string, code?: string, retryable = true) => {
        const newError: ErrorState = {
            message,
            code,
            severity: 'error',
            timestamp: new Date(),
            retryable,
        };
        setError(newError);
        console.error(`[${code || 'ERROR'}]`, message);
        toast.error(message);
    };

    const handleWarning = (message: string) => {
        console.warn('[WARNING]', message);
        toast.error(message);
    };

    const clearError = () => {
        setError(null);
    };

    // retryLastAction removed (not used)

    const filteredProjects = projects.filter((project) => {
        const matchesSearch =
            project.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.customer?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: Project['status']) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'active': return 'bg-blue-100 text-blue-800';
            case 'planning': return 'bg-yellow-100 text-yellow-800';
            case 'on-hold': return 'bg-orange-100 text-orange-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority: Project['priority']) => {
        switch (priority) {
            case 'critical': return 'bg-red-100 text-red-800';
            case 'high': return 'bg-orange-100 text-orange-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleCreateProject = async () => {
        try {
            clearError();

            // Validation checks
            if (!newProject.name?.trim()) {
                handleWarning('Project name is required');
                return;
            }

            if (!newProject.code?.trim()) {
                handleWarning('Project code is required');
                return;
            }

            if (newProject.code.length < 3) {
                handleWarning('Project code must be at least 3 characters');
                return;
            }

            if (!newProject.projectManagerId) {
                handleWarning('Please select a project manager');
                return;
            }

            if (newProject.teamMemberIds.length === 0) {
                handleWarning('Please select at least one team member');
                return;
            }

            // Check for duplicate code
            if (projects.some((p: Project) => p.code.toUpperCase() === newProject.code.toUpperCase())) {
                handleWarning('A project with this code already exists');
                return;
            }

            // Date validation
            if (newProject.startDate && newProject.endDate) {
                const start = new Date(newProject.startDate);
                const end = new Date(newProject.endDate);
                if (start > end) {
                    handleWarning('Start date must be before end date');
                    return;
                }
            }

            // Budget validation
            if (newProject.budget < 0) {
                handleWarning('Budget cannot be negative');
                return;
            }

            const selectedPM = (teamMembers || []).find((m: any) => m.id === newProject.projectManagerId);
            const selectedCustomer = customers.find(c => c.id === newProject.customerId);
            const selectedTeamMembers = (teamMembers || []).filter((m: any) => newProject.teamMemberIds.includes(m.id));

            if (!selectedPM) {
                handleError('Selected project manager not found', 'PM_NOT_FOUND', false);
                return;
            }

            if (selectedTeamMembers.length !== newProject.teamMemberIds.length) {
                handleError('Some selected team members not found', 'MEMBER_NOT_FOUND', false);
                return;
            }

            // Create project via API
            const projectData = {
                name: newProject.name.trim(),
                code: newProject.code.toUpperCase(),
                description: newProject.description.trim(),
                customer: selectedCustomer?.name || 'Unassigned Client',
                project_manager: selectedPM.name,
                team_members: selectedTeamMembers.map((m: TeamMember) => m.name).join(','),
                start_date: newProject.startDate,
                end_date: newProject.endDate,
                budget: newProject.budget,
                priority: newProject.priority,
                status: 'planning',
                progress: 0,
                actual_progress: 0,
                planned_progress: 0,
            };

            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(projectData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create project');
            }

            const result = await response.json();
            toast.success(`Project "${result.data.name}" created successfully`);

            // Refetch projects to update the list
            refetchProjects();
            resetForm();
            setIsNewProjectDialogOpen(false);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to create project';
            handleError(errorMsg, 'CREATE_PROJECT_ERROR', true);
        }
    };

    const handleSaveCharter = async () => {
        try {
            clearError();

            if (!selectedProjectForCharter) {
                handleError('No project selected for charter', 'NO_PROJECT_SELECTED', false);
                return;
            }

            // Validate required fields
            if (!charter.projectObjective?.trim()) {
                handleWarning('Project Objective is required');
                return;
            }

            if (!charter.businessCase?.trim()) {
                handleWarning('Business Case is required');
                return;
            }

            if (!charter.successCriteria?.trim()) {
                handleWarning('Success Criteria is required');
                return;
            }

            // Validate minimum content length
            if (charter.projectObjective.trim().length < 10) {
                handleWarning('Project Objective must be at least 10 characters');
                return;
            }

            if (charter.businessCase.trim().length < 10) {
                handleWarning('Business Case must be at least 10 characters');
                return;
            }

            // Find the project
            const project = projects.find((p: Project) => p.id === selectedProjectForCharter);
            if (!project) {
                handleError('Project not found', 'PROJECT_NOT_FOUND', false);
                return;
            }

            // Save charter to database via API
            const response = await fetch(`/api/projects/${selectedProjectForCharter}/charter`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(charter),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save charter');
            }

            setIsCharterDialogOpen(false);
            setSelectedProjectForCharter(null);
            refetchProjects();
            toast.success(`Charter saved for project "${project.name}"`);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to save charter';
            handleError(errorMsg, 'SAVE_CHARTER_ERROR', true);
        }
    };

    const handleOpenCharter = (projectId: string) => {
        const project = projects.find((p: Project) => p.id === projectId);
        setSelectedProjectForCharter(projectId);
        if (project?.charter) {
            setCharter(project.charter);
        } else {
            setCharter({
                projectObjective: '',
                businessCase: '',
                successCriteria: '',
                scope: '',
                constraints: '',
                assumptions: '',
                risks: '',
            });
        }
        setIsCharterDialogOpen(true);
    };

    const resetForm = () => {
        setNewProject({
            name: '',
            code: '',
            description: '',
            customerId: '',
            projectManagerId: '',
            teamMemberIds: [],
            startDate: '',
            endDate: '',
            budget: 0,
            priority: 'medium',
        });
    };

    const handleViewProject = (projectId: string) => {
        navigate(`/projects/${projectId}`);
    };

    const handleDeleteProject = async (projectId: string) => {
        try {
            const project = projects.find((p: Project) => p.id === projectId);
            if (!project) {
                handleError('Project not found', 'PROJECT_NOT_FOUND', false);
                return;
            }

            if (window.confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
                try {
                    // Create AbortController for timeout
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 10000);

                    // Call DELETE API endpoint with proper base URL
                    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/projects/${projectId}`;
                    const response = await fetch(url, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        signal: controller.signal,
                    });

                    clearTimeout(timeoutId);

                    if (!response.ok) {
                        let errorMsg = 'Failed to delete project';
                        try {
                            const errorData = await response.json();
                            errorMsg = errorData.message || errorMsg;
                        } catch {
                            errorMsg = `Server error: ${response.status}`;
                        }
                        throw new Error(errorMsg);
                    }

                    // Refetch projects to update the list
                    refetchProjects();
                    toast.success(`Project "${project.name}" deleted successfully`);
                } catch (err) {
                    let errorMsg = 'Failed to delete project';
                    if (err instanceof DOMException && err.name === 'AbortError') {
                        errorMsg = 'Request timeout - try again';
                    } else if (err instanceof Error) {
                        errorMsg = err.message;
                    }
                    handleError(errorMsg, 'DELETE_PROJECT_ERROR', true);
                    console.error('Delete project error:', err);
                }
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to delete project';
            handleError(errorMsg, 'DELETE_PROJECT_ERROR', true);
            console.error('Delete project error:', err);
        }
    };

    const handleOpenProjectInfo = async (projectId: string) => {
        try {
            // Validate project exists
            const project = projects.find((p: Project) => p.id === projectId);
            if (!project) {
                handleError('Project not found', 'PROJECT_NOT_FOUND', false);
                return;
            }

            setSCurveLoading(true);
            setSelectedProjectForInfo(projectId);
            setIsProjectInfoDialogOpen(true);

            // Fetch S-Curve data
            try {
                const response = await fetch(`/api/projects/${projectId}/scurve`);
                if (response.ok) {
                    const data = await response.json();
                    setSCurveData(data.data);
                } else {
                    setSCurveData(null);
                }
            } catch (err) {
                console.error('Error fetching S-Curve data:', err);
                setSCurveData(null);
            } finally {
                setSCurveLoading(false);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to load project information';
            handleError(errorMsg, 'LOAD_PROJECT_INFO_ERROR', true);
        }
    };

    const handleCloseProjectInfo = () => {
        setIsProjectInfoDialogOpen(false);
        setSelectedProjectForInfo(null);
        setSCurveData(null);
    };

    // Calculate portfolio statistics
    const stats = useMemo(() => {
        const totalProjects = projects.length;
        const activeProjects = projects.filter(p => p.status === 'active').length;
        const completedProjects = projects.filter(p => p.status === 'completed').length;
        const atRiskProjects = projects.filter(p => {
            const progress = p.progress || 0;
            const endDate = p.end_date ? new Date(p.end_date).getTime() : Date.now();
            const startDate = p.start_date ? new Date(p.start_date).getTime() : Date.now();
            const daysRemaining = endDate - new Date().getTime();
            const daysTotal = endDate - startDate;
            const progressPercent = daysTotal > 0 ? (daysTotal - daysRemaining) / daysTotal : 0;
            return progress < progressPercent * 100 && p.status !== 'completed';
        }).length;

        const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
        const totalSpent = projects.reduce((sum, p) => sum + (p.spent || 0), 0);
        const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

        const averageProgress = totalProjects > 0
            ? Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / totalProjects)
            : 0;

        return {
            totalProjects,
            activeProjects,
            completedProjects,
            atRisk: atRiskProjects,
            budgetUtilization: Math.round(budgetUtilization),
            totalBudget,
            totalSpent,
            averageProgress,
        };
    }, [projects]);

    return (
        <ScrollContainer>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Projects</h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage all your projects in one place</p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => refetchProjects()}
                                className="gap-2"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Refresh
                            </Button>
                            <Dialog open={isNewProjectDialogOpen} onOpenChange={setIsNewProjectDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                                        <Plus className="h-4 w-4" />
                                        New Project
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>Create New Project</DialogTitle>
                                    </DialogHeader>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Project Name *
                                                </label>
                                                <Input
                                                    placeholder="e.g., Website Redesign"
                                                    value={newProject.name}
                                                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Project Code *
                                                </label>
                                                <Input
                                                    placeholder="e.g., WEB-001"
                                                    value={newProject.code}
                                                    onChange={(e) => setNewProject({ ...newProject, code: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Description
                                            </label>
                                            <textarea
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                                                rows={3}
                                                placeholder="Project description"
                                                value={newProject.description}
                                                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Customer *
                                                </label>
                                                <Select value={newProject.customerId} onValueChange={(customerId) => setNewProject({ ...newProject, customerId })}>
                                                    <SelectTrigger className="bg-white">
                                                        <SelectValue placeholder="Select customer" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-white">
                                                        {isLoadingCustomers ? (
                                                            <div className="p-2 text-sm text-gray-500">Loading customers...</div>
                                                        ) : customers.length === 0 ? (
                                                            <div className="p-2 text-sm text-gray-500">No customers found</div>
                                                        ) : (
                                                            customers.map((customer) => (
                                                                <SelectItem key={customer.id} value={customer.id}>
                                                                    {customer.name}
                                                                </SelectItem>
                                                            ))
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Project Manager *
                                                </label>
                                                <Select value={newProject.projectManagerId} onValueChange={(pmId) => setNewProject({ ...newProject, projectManagerId: pmId })}>
                                                    <SelectTrigger className="bg-white">
                                                        <SelectValue placeholder="Select PM" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-white">
                                                        {isLoadingTeamMembers ? (
                                                            <div className="p-2 text-sm text-gray-500">Loading team members...</div>
                                                        ) : teamMembers && teamMembers.length === 0 ? (
                                                            <div className="p-2 text-sm text-gray-500">No team members found</div>
                                                        ) : (
                                                            teamMembers?.map((member) => (
                                                                <SelectItem key={member.id} value={member.id}>
                                                                    {member.name}
                                                                </SelectItem>
                                                            ))
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Team Members *
                                            </label>
                                            <div className="border border-gray-300 rounded-lg p-3 space-y-2 bg-gray-50 max-h-48 overflow-y-auto">
                                                {isLoadingTeamMembers ? (
                                                    <p className="text-sm text-gray-500">Loading team members...</p>
                                                ) : teamMembers && teamMembers.length === 0 ? (
                                                    <p className="text-sm text-gray-500">No team members available</p>
                                                ) : (
                                                    teamMembers?.map((member) => (
                                                        <label key={member.id} className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={newProject.teamMemberIds.includes(member.id)}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setNewProject({
                                                                            ...newProject,
                                                                            teamMemberIds: [...newProject.teamMemberIds, member.id],
                                                                        });
                                                                    } else {
                                                                        setNewProject({
                                                                            ...newProject,
                                                                            teamMemberIds: newProject.teamMemberIds.filter((id) => id !== member.id),
                                                                        });
                                                                    }
                                                                }}
                                                            />
                                                            <span className="text-sm text-gray-700">{member.name}</span>
                                                        </label>
                                                    ))
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Start Date
                                                </label>
                                                <Input
                                                    type="date"
                                                    value={newProject.startDate}
                                                    onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    End Date
                                                </label>
                                                <Input
                                                    type="date"
                                                    value={newProject.endDate}
                                                    onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Budget
                                                </label>
                                                <Input
                                                    type="number"
                                                    placeholder="0.00"
                                                    value={newProject.budget || ''}
                                                    onChange={(e) => setNewProject({ ...newProject, budget: parseFloat(e.target.value) || 0 })}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Priority
                                                </label>
                                                <Select value={newProject.priority} onValueChange={(priority) => setNewProject({ ...newProject, priority: priority as any })}>
                                                    <SelectTrigger className="bg-white">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-white">
                                                        <SelectItem value="low">Low</SelectItem>
                                                        <SelectItem value="medium">Medium</SelectItem>
                                                        <SelectItem value="high">High</SelectItem>
                                                        <SelectItem value="critical">Critical</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 pt-4">
                                            <Button
                                                variant="secondary"
                                                className="flex-1"
                                                onClick={() => {
                                                    setIsNewProjectDialogOpen(false);
                                                    resetForm();
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                                                onClick={handleCreateProject}
                                            >
                                                Create Project
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Total Projects */}
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Total Projects</p>
                                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-400 mt-1">{stats.totalProjects}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{stats.activeProjects} active</p>
                                </div>
                                <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                                    <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Completed Projects */}
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Completed</p>
                                    <p className="text-2xl font-bold text-green-900 dark:text-green-400 mt-1">{stats.completedProjects}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{Math.round((stats.completedProjects / stats.totalProjects) * 100) || 0}% of total</p>
                                </div>
                                <div className="h-10 w-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                                    <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Budget Utilization */}
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Budget Utilization</p>
                                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-400 mt-1">{stats.budgetUtilization}%</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{formatCurrency(stats.totalSpent)}</p>
                                </div>
                                <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                                    <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Avg Progress */}
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Avg. Progress</p>
                                    <p className="text-2xl font-bold text-orange-900 dark:text-orange-400 mt-1">{stats.averageProgress}%</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Overall portfolio</p>
                                </div>
                                <div className="h-10 w-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                                    <Gauge className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* At Risk */}
                    <Card className={`hover:shadow-lg transition-shadow border-l-4 ${stats.atRisk > 0 ? 'border-red-500' : 'border-green-500'}`}>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">At Risk</p>
                                    <p className={`text-2xl font-bold mt-1 ${stats.atRisk > 0 ? 'text-red-900 dark:text-red-400' : 'text-green-900 dark:text-green-400'}`}>
                                        {stats.atRisk}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                        {stats.atRisk > 0 ? 'Needs attention' : 'All on track'}
                                    </p>
                                </div>
                                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${stats.atRisk > 0 ? 'bg-red-100 dark:bg-red-900' : 'bg-green-100 dark:bg-green-900'}`}>
                                    {stats.atRisk > 0 ? (
                                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                    ) : (
                                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search projects..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-40 bg-white border border-gray-200">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="planning">Planning</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="on-hold">On Hold</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredProjects.map((project: any) => {
                        // Calculate if project is at risk
                        const progress = project.progress || 0;
                        const endDate = project.end_date ? new Date(project.end_date).getTime() : Date.now();
                        const startDate = project.start_date ? new Date(project.start_date).getTime() : Date.now();
                        const daysRemaining = endDate - new Date().getTime();
                        const daysTotal = endDate - startDate;
                        const progressPercent = daysTotal > 0 ? (daysTotal - daysRemaining) / daysTotal : 0;
                        const isAtRisk = progress < progressPercent * 100 && project.status !== 'completed';

                        const budgetUtilization = (project.budget || 0) > 0 ? ((project.spent || 0) / (project.budget || 0)) * 100 : 0;

                        return (
                            <Card
                                key={project.id}
                                className={`hover:shadow-lg transition-all cursor-pointer ${isAtRisk ? 'border-l-4 border-red-500' : ''}`}
                                onClick={() => handleViewProject(project.id)}
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate">{project.name}</h3>
                                                <Badge className={`${getStatusColor(project.status)} flex-shrink-0`}>
                                                    {project.status.replace('-', ' ')}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{project.code}</p>
                                        </div>
                                        <div className="flex gap-1 flex-shrink-0">
                                            <Button
                                                variant="text"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOpenProjectInfo(project.id);
                                                }}
                                                title="View Project Information"
                                            >
                                                <BarChart3 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="text"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOpenCharter(project.id);
                                                }}
                                                title="Edit Project Charter"
                                            >
                                                <FileText className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="text"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteProject(project.id);
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{project.description}</p>

                                    {/* Risk Alert */}
                                    {isAtRisk && (
                                        <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                                            <span className="text-xs font-medium text-red-700 dark:text-red-400">Project at risk</span>
                                        </div>
                                    )}

                                    {/* Client Info */}
                                    <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        <span className="text-sm font-medium text-blue-900 dark:text-blue-400">{project.customer || 'No client'}</span>
                                    </div>

                                    {/* Project Manager */}
                                    <div className="flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                        <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                        <span className="text-sm font-medium text-purple-900 dark:text-purple-400">{project.project_manager || 'No manager'}</span>
                                    </div>

                                    {/* Progress */}
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Progress</span>
                                            <span className="text-xs text-gray-600 dark:text-gray-400">{project.progress}%</span>
                                        </div>
                                        <Progress value={project.progress} className="h-2" />
                                    </div>

                                    {/* Budget Utilization */}
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <div className="flex items-center gap-1">
                                                <DollarSign className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                                                <span className="text-xs text-gray-600 dark:text-gray-400">Budget</span>
                                            </div>
                                            <span className="text-xs font-medium text-gray-900 dark:text-gray-200">
                                                {Math.round(budgetUtilization)}% ({formatCurrency(project.spent || 0)} / {formatCurrency(project.budget || 0)})
                                            </span>
                                        </div>
                                        <Progress value={Math.min(budgetUtilization, 100)} className="h-2" />
                                    </div>

                                    {/* Timeline */}
                                    <div className="flex justify-between items-center pt-2 border-t dark:border-gray-700">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                                            <span className="text-xs text-gray-600 dark:text-gray-400">Timeline</span>
                                        </div>
                                        <span className="text-xs text-gray-600 dark:text-gray-400">
                                            {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'N/A'} - {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>

                                    {/* Team Members Count */}
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-1">
                                            <Users className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                                            <span className="text-xs text-gray-600 dark:text-gray-400">{(project.team_members || '').split(',').filter((m: string) => m.trim()).length} members</span>
                                        </div>
                                        <Badge className={getPriorityColor(project.priority)}>
                                            {project.priority}
                                        </Badge>
                                    </div>

                                    {/* Charter Status */}
                                    {project.charter && (
                                        <div className="flex items-center gap-1 p-2 bg-green-50 dark:bg-green-900/20 rounded text-xs text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                                            <FileText className="h-3 w-3" />
                                            Project Charter Created
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {filteredProjects.length === 0 && (
                    <Card className="p-8 text-center">
                        <p className="text-gray-500">No projects found</p>
                    </Card>
                )}

                {/* Project Charter Dialog */}
                <Dialog open={isCharterDialogOpen} onOpenChange={setIsCharterDialogOpen}>
                    <DialogContent className="sm:max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Project Charter</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Project Objective *
                                </label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                                    rows={3}
                                    placeholder="Clear, concise statement of project goals"
                                    value={charter.projectObjective}
                                    onChange={(e) => setCharter({ ...charter, projectObjective: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Business Case *
                                </label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                                    rows={3}
                                    placeholder="Justification and business value"
                                    value={charter.businessCase}
                                    onChange={(e) => setCharter({ ...charter, businessCase: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Success Criteria *
                                </label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                                    rows={3}
                                    placeholder="Measurable criteria for project success"
                                    value={charter.successCriteria}
                                    onChange={(e) => setCharter({ ...charter, successCriteria: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Scope
                                </label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                                    rows={2}
                                    placeholder="What is included and excluded"
                                    value={charter.scope}
                                    onChange={(e) => setCharter({ ...charter, scope: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Constraints
                                </label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                                    rows={2}
                                    placeholder="Budget, timeline, resource constraints"
                                    value={charter.constraints}
                                    onChange={(e) => setCharter({ ...charter, constraints: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Assumptions
                                </label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                                    rows={2}
                                    placeholder="Project assumptions"
                                    value={charter.assumptions}
                                    onChange={(e) => setCharter({ ...charter, assumptions: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Risks
                                </label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                                    rows={2}
                                    placeholder="Identified risks and mitigation strategies"
                                    value={charter.risks}
                                    onChange={(e) => setCharter({ ...charter, risks: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="secondary"
                                    className="flex-1"
                                    onClick={() => setIsCharterDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                                    onClick={handleSaveCharter}
                                >
                                    Save Charter
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Project Information Modal */}
                <Dialog open={isProjectInfoDialogOpen} onOpenChange={(open) => {
                    if (!open) handleCloseProjectInfo();
                }}>
                    <DialogContent className="sm:max-w-4xl bg-white max-h-[90vh] overflow-y-auto">
                        <DialogHeader className="flex flex-row items-center justify-between pr-2">
                            <DialogTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-blue-600" />
                                Project Information & Progress
                            </DialogTitle>
                            <Button
                                variant="text"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={handleCloseProjectInfo}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </DialogHeader>

                        {(() => {
                            if (!selectedProjectForInfo) return null;

                            const project = projects.find((p: Project) => p.id === selectedProjectForInfo);
                            if (!project) {
                                console.warn('Project not found with ID:', selectedProjectForInfo);
                                return null;
                            }

                            return (
                                <div className="space-y-6">
                                    {/* Project Details */}
                                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="text-xs text-gray-600 font-medium">Project Name</p>
                                            <p className="text-sm font-semibold text-gray-900">{project?.name || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 font-medium">Project Code</p>
                                            <p className="text-sm font-semibold text-gray-900">{project.code}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 font-medium">Client</p>
                                            <p className="text-sm font-semibold text-gray-900">{project.customer}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 font-medium">Project Manager</p>
                                            <p className="text-sm font-semibold text-gray-900">{project.project_manager}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 font-medium">Status</p>
                                            <Badge className={getStatusColor(project.status || 'planning')}>
                                                {project.status.replace('-', ' ')}
                                            </Badge>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 font-medium">Budget</p>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {formatCurrency(project.spent || 0)} / {formatCurrency(project.budget || 0)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* S-Curve Section */}
                                    {sCurveData ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="h-5 w-5 text-blue-600" />
                                                <h3 className="text-lg font-semibold text-gray-900">Project Progress Tracking (S-Curve)</h3>
                                            </div>

                                            {/* Status Cards */}
                                            <SCurveStatusCards
                                                plannedPercentage={sCurveData.plannedPercentage}
                                                actualPercentage={sCurveData.actualPercentage}
                                                variance={sCurveData.variance}
                                                completedTasks={sCurveData.completedTasks}
                                                totalTasks={sCurveData.totalTasks}
                                                status={sCurveData.summary.performanceStatus}
                                            />

                                            {/* S-Curve Chart */}
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle>Progress Over Time</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    {sCurveData?.data && (
                                                        <SCurveChart
                                                            data={sCurveData.data}
                                                            projectName={sCurveData.projectName}
                                                        />
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </div>
                                    ) : sCurveLoading ? (
                                        <div className="flex items-center justify-center py-8">
                                            <p className="text-gray-500">Loading S-Curve data...</p>
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                            <p className="text-sm text-yellow-800">S-Curve data not available for this project yet. Create tasks to see progress tracking.</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </DialogContent>
                </Dialog>
            </div>
        </ScrollContainer>
    );
};

export default Projects;
