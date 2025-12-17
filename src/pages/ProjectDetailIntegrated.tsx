import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    ArrowLeft,
    DollarSign,
    AlertCircle,
    FileText,
    TrendingUp,
    Users,
    Calendar,
    CheckCircle,
    AlertTriangle,
    Clock,
    Plus,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import ProjectBilling from './ProjectBilling';
import ProjectIssueLog from './ProjectIssueLog';
import ScrollContainer from '@/components/layout/ScrollContainer';

interface ProjectDetail {
    id: string;
    name: string;
    code: string;
    description: string;
    status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'critical';
    startDate: string;
    endDate: string;
    budget: number;
    spent: number;
    progress: number;
    clientName: string;
    projectManager: string;
    teamMembers: string[];
    tasksCount: number;
    completedTasks: number;
}

const ProjectDetailIntegrated: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const [project, setProject] = useState<ProjectDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        // Load project data
        const mockProject: ProjectDetail = {
            id: projectId || '1',
            name: 'Enterprise Portal Development',
            code: 'PROJ-001',
            description: 'A comprehensive enterprise portal system with real-time analytics and reporting',
            status: 'active',
            priority: 'high',
            startDate: '2024-01-15',
            endDate: '2024-06-30',
            budget: 500000,
            spent: 250000,
            progress: 65,
            clientName: 'TechCorp Solutions',
            projectManager: 'John Doe',
            teamMembers: ['John Doe', 'Jane Smith', 'Alice Brown', 'Bob Wilson'],
            tasksCount: 45,
            completedTasks: 28,
        };
        setProject(mockProject);
        setIsLoading(false);
    }, [projectId]);

    if (isLoading) {
        return (
            <ScrollContainer>
                <div className="flex items-center justify-center h-96">
                    <p className="text-gray-500">Loading project details...</p>
                </div>
            </ScrollContainer>
        );
    }

    if (!project) {
        return (
            <ScrollContainer>
                <div className="space-y-4">
                    <Button variant="outline" onClick={() => navigate('/projects')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Projects
                    </Button>
                    <Card>
                        <CardContent className="p-8 text-center text-gray-500">
                            Project not found
                        </CardContent>
                    </Card>
                </div>
            </ScrollContainer>
        );
    }

    const budgetUtilization = (project.spent / project.budget) * 100;
    const taskCompletion = (project.completedTasks / project.tasksCount) * 100;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'active':
                return 'bg-blue-100 text-blue-800';
            case 'planning':
                return 'bg-yellow-100 text-yellow-800';
            case 'on-hold':
                return 'bg-orange-100 text-orange-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical':
                return 'bg-red-100 text-red-800';
            case 'high':
                return 'bg-orange-100 text-orange-800';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'low':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <ScrollContainer>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <Button
                            variant="outline"
                            onClick={() => navigate('/projects')}
                            className="mb-4"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Projects
                        </Button>

                        <div className="flex items-start gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                                    <Badge className={getStatusColor(project.status)}>
                                        {project.status}
                                    </Badge>
                                    <Badge className={getPriorityColor(project.priority)}>
                                        {project.priority}
                                    </Badge>
                                </div>
                                <p className="text-gray-600">{project.code}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-white">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">Progress</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{project.progress}%</p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">Budget Used</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                        {Math.round(budgetUtilization)}%
                                    </p>
                                </div>
                                <DollarSign className="h-8 w-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">Tasks Completed</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                        {project.completedTasks}/{project.tasksCount}
                                    </p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">Team Size</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                        {project.teamMembers.length}
                                    </p>
                                </div>
                                <Users className="h-8 w-8 text-purple-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Card className="bg-white">
                    <CardHeader className="border-b">
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="bg-white">
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="billing" className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4" />
                                    Billing
                                </TabsTrigger>
                                <TabsTrigger value="issues" className="flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    Issues
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </CardHeader>

                    <CardContent className="p-6">
                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                {/* Project Description */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                        Project Description
                                    </h3>
                                    <p className="text-gray-600">{project.description}</p>
                                </div>

                                {/* Project Details Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Timeline */}
                                    <Card className="bg-gray-50">
                                        <CardHeader>
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <Calendar className="h-5 w-5 text-blue-600" />
                                                Timeline
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div>
                                                <p className="text-sm text-gray-600 font-medium">Start Date</p>
                                                <p className="text-gray-900 font-semibold">
                                                    {new Date(project.startDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 font-medium">End Date</p>
                                                <p className="text-gray-900 font-semibold">
                                                    {new Date(project.endDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 font-medium">Days Remaining</p>
                                                <p className="text-gray-900 font-semibold">
                                                    {Math.ceil(
                                                        (new Date(project.endDate).getTime() - new Date().getTime()) /
                                                        (1000 * 60 * 60 * 24)
                                                    )}{' '}
                                                    days
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Budget Details */}
                                    <Card className="bg-gray-50">
                                        <CardHeader>
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <DollarSign className="h-5 w-5 text-green-600" />
                                                Budget
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div>
                                                <p className="text-sm text-gray-600 font-medium">Total Budget</p>
                                                <p className="text-gray-900 font-semibold">
                                                    ฿{project.budget.toLocaleString()}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 font-medium">Amount Spent</p>
                                                <p className="text-gray-900 font-semibold">
                                                    ฿{project.spent.toLocaleString()}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 font-medium mb-2">Budget Utilization</p>
                                                <Progress value={budgetUtilization} className="h-2" />
                                                <p className="text-xs text-gray-600 mt-1">
                                                    {Math.round(budgetUtilization)}% used
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Team & Client */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Client Info */}
                                    <Card className="bg-gray-50">
                                        <CardHeader>
                                            <CardTitle className="text-base">Client Information</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div>
                                                <p className="text-sm text-gray-600 font-medium">Client Name</p>
                                                <p className="text-gray-900 font-semibold">{project.clientName}</p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Project Manager */}
                                    <Card className="bg-gray-50">
                                        <CardHeader>
                                            <CardTitle className="text-base">Project Manager</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div>
                                                <p className="text-sm text-gray-600 font-medium">Name</p>
                                                <p className="text-gray-900 font-semibold">{project.projectManager}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Team Members */}
                                <Card className="bg-gray-50">
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Users className="h-5 w-5 text-purple-600" />
                                            Team Members ({project.teamMembers.length})
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-2">
                                            {project.teamMembers.map((member, index) => (
                                                <Badge key={index} variant="secondary" className="bg-white border">
                                                    {member}
                                                </Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Progress Tracking */}
                                <Card className="bg-gray-50">
                                    <CardHeader>
                                        <CardTitle className="text-base">Progress Tracking</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <p className="text-sm font-medium text-gray-700">Overall Progress</p>
                                                <p className="text-sm font-semibold text-gray-900">{project.progress}%</p>
                                            </div>
                                            <Progress value={project.progress} className="h-2" />
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <p className="text-sm font-medium text-gray-700">Task Completion</p>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {Math.round(taskCompletion)}%
                                                </p>
                                            </div>
                                            <Progress value={taskCompletion} className="h-2" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Billing Tab */}
                        {activeTab === 'billing' && (
                            <div className="bg-white">
                                <ProjectBilling
                                    projectId={projectId || ''}
                                    projectName={project.name}
                                    contractAmount={project.budget}
                                />
                            </div>
                        )}

                        {/* Issues Tab */}
                        {activeTab === 'issues' && (
                            <div className="bg-white">
                                <ProjectIssueLog projectId={projectId || ''} projectName={project.name} />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </ScrollContainer>
    );
};

export default ProjectDetailIntegrated;
