import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    CheckCircle,
    Plus,
    X,
    Edit2,
    Trash2,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';

interface ProjectIssue {
    id: string;
    project_id: string;
    code: string;
    title: string;
    description: string;
    category: string;
    status: 'open' | 'in-progress' | 'resolved' | 'closed' | 'on-hold' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'critical';
    assigned_to: string;
    reported_by: string;
    reported_date: string;
    resolved_date?: string;
    due_date?: string;
    impact_on_schedule: boolean;
    impact_on_budget: boolean;
    estimated_cost: number;
    root_cause: string;
    resolution_notes: string;
    created_at: string;
    updated_at: string;
}

interface IssueSummary {
    total_issues: number;
    open_issues: number;
    in_progress_issues: number;
    resolved_issues: number;
    closed_issues: number;
    critical_issues: number;
    high_priority_issues: number;
    schedule_impact_count: number;
    budget_impact_count: number;
    total_issue_cost: number;
}

interface ProjectIssueLogProps {
    projectId: string;
    projectName?: string;
}

const statusColors: Record<string, string> = {
    open: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
    'in-progress':
        'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    resolved: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    closed: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    'on-hold': 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
    cancelled:
        'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
};

const priorityColors: Record<string, string> = {
    low: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    medium:
        'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    high: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
    critical: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
};

const categoryIcons: Record<string, React.ReactNode> = {
    technical: '🔧',
    schedule: '📅',
    budget: '💰',
    resource: '👥',
    quality: '✓',
    communication: '💬',
    other: '📋',
};

export default function ProjectIssueLog({
    projectId,
    projectName = 'Project',
}: ProjectIssueLogProps) {
    const [issues, setIssues] = useState<ProjectIssue[]>([]);
    const [summary, setSummary] = useState<IssueSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingIssue, setEditingIssue] = useState<ProjectIssue | null>(null);
    const [expandedIssue, setExpandedIssue] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterPriority, setFilterPriority] = useState<string>('all');

    // Form state
    const [formData, setFormData] = useState({
        code: '',
        title: '',
        description: '',
        category: 'technical',
        priority: 'medium',
        assigned_to: '',
        reported_by: '',
        impact_on_schedule: false,
        impact_on_budget: false,
        estimated_cost: '',
        root_cause: '',
        due_date: '',
    });

    // Fetch issues
    useEffect(() => {
        fetchIssues();
        fetchSummary();
    }, [projectId]);

    const fetchIssues = async () => {
        try {
            setIsLoading(true);
            const apiUrl =
                process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
            const response = await fetch(
                `${apiUrl}/projects/${projectId}/issues`,
                { credentials: 'include' }
            );

            if (!response.ok) throw new Error('Failed to fetch issues');

            const data = await response.json();
            setIssues(Array.isArray(data.data) ? data.data : []);
        } catch (error) {
            console.error('Error fetching issues:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSummary = async () => {
        try {
            const apiUrl =
                process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
            const response = await fetch(
                `${apiUrl}/projects/${projectId}/issues/summary`,
                { credentials: 'include' }
            );

            if (!response.ok) throw new Error('Failed to fetch summary');

            const data = await response.json();
            setSummary(data.data);
        } catch (error) {
            console.error('Error fetching summary:', error);
        }
    };

    const handleCreateOrUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const apiUrl =
                process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

            if (editingIssue) {
                // Update issue
                const response = await fetch(`${apiUrl}/issues/${editingIssue.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        ...formData,
                        estimated_cost: formData.estimated_cost
                            ? parseFloat(formData.estimated_cost)
                            : null,
                    }),
                });

                if (!response.ok) throw new Error('Failed to update issue');
            } else {
                // Create issue
                const response = await fetch(
                    `${apiUrl}/projects/${projectId}/issues`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({
                            ...formData,
                            estimated_cost: formData.estimated_cost
                                ? parseFloat(formData.estimated_cost)
                                : null,
                        }),
                    }
                );

                if (!response.ok) throw new Error('Failed to create issue');
            }

            setIsModalOpen(false);
            setEditingIssue(null);
            setFormData({
                code: '',
                title: '',
                description: '',
                category: 'technical',
                priority: 'medium',
                assigned_to: '',
                reported_by: '',
                impact_on_schedule: false,
                impact_on_budget: false,
                estimated_cost: '',
                root_cause: '',
                due_date: '',
            });

            fetchIssues();
            fetchSummary();
        } catch (error) {
            console.error('Error saving issue:', error);
        }
    };

    const handleStatusChange = async (issueId: string, newStatus: string) => {
        try {
            const apiUrl =
                process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

            const response = await fetch(`${apiUrl}/issues/${issueId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) throw new Error('Failed to update status');

            fetchIssues();
            fetchSummary();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleDelete = async (issueId: string) => {
        if (!window.confirm('Are you sure you want to delete this issue?')) return;

        try {
            const apiUrl =
                process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

            const response = await fetch(`${apiUrl}/issues/${issueId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) throw new Error('Failed to delete issue');

            fetchIssues();
            fetchSummary();
        } catch (error) {
            console.error('Error deleting issue:', error);
        }
    };

    const handleEdit = (issue: ProjectIssue) => {
        setEditingIssue(issue);
        setFormData({
            code: issue.code,
            title: issue.title,
            description: issue.description,
            category: issue.category,
            priority: issue.priority,
            assigned_to: issue.assigned_to || '',
            reported_by: issue.reported_by || '',
            impact_on_schedule: issue.impact_on_schedule,
            impact_on_budget: issue.impact_on_budget,
            estimated_cost: issue.estimated_cost?.toString() || '',
            root_cause: issue.root_cause || '',
            due_date: issue.due_date
                ? new Date(issue.due_date).toISOString().split('T')[0]
                : '',
        });
        setIsModalOpen(true);
    };

    const filteredIssues = issues.filter((issue) => {
        if (filterStatus !== 'all' && issue.status !== filterStatus) return false;
        if (filterPriority !== 'all' && issue.priority !== filterPriority)
            return false;
        return true;
    });

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    if (isLoading) {
        return <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />;
    }

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            {summary && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Total Issues
                                </p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {summary.total_issues}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-red-200 dark:border-red-800">
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-sm text-red-600 dark:text-red-400">
                                    Open Issues
                                </p>
                                <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                                    {summary.open_issues}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-yellow-200 dark:border-yellow-800">
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                                    In Progress
                                </p>
                                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                                    {summary.in_progress_issues}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-orange-200 dark:border-orange-800">
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-sm text-orange-600 dark:text-orange-400">
                                    Critical
                                </p>
                                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                                    {summary.critical_issues}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-green-200 dark:border-green-800">
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-sm text-green-600 dark:text-green-400">
                                    Resolved
                                </p>
                                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                    {summary.resolved_issues}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Issues Table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle>Issue Log - {projectName}</CardTitle>
                    <Button onClick={() => setIsModalOpen(true)} className="gap-2">
                        <Plus className="h-4 w-4" />
                        New Issue
                    </Button>
                </CardHeader>

                <CardContent>
                    {/* Filters */}
                    <div className="mb-6 flex gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Status
                            </label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="mt-1 block w-32 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                            >
                                <option value="all">All Statuses</option>
                                <option value="open">Open</option>
                                <option value="in-progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Priority
                            </label>
                            <select
                                value={filterPriority}
                                onChange={(e) => setFilterPriority(e.target.value)}
                                className="mt-1 block w-32 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                            >
                                <option value="all">All Priorities</option>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>
                    </div>

                    {/* Issues List */}
                    <div className="space-y-3">
                        {filteredIssues.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                No issues found
                            </div>
                        ) : (
                            filteredIssues.map((issue) => (
                                <div
                                    key={issue.id}
                                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <div
                                        className="flex items-start justify-between cursor-pointer"
                                        onClick={() =>
                                            setExpandedIssue(
                                                expandedIssue === issue.id ? null : issue.id
                                            )
                                        }
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <span className="text-lg">
                                                    {categoryIcons[issue.category]}
                                                </span>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                                        {issue.code} - {issue.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {issue.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 ml-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[issue.status]}`}
                                            >
                                                {issue.status}
                                            </span>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${priorityColors[issue.priority]}`}
                                            >
                                                {issue.priority}
                                            </span>
                                            <button
                                                onClick={(e) => e.stopPropagation()}
                                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                            >
                                                {expandedIssue === issue.id ? (
                                                    <ChevronUp className="h-4 w-4" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    {expandedIssue === issue.id && (
                                        <div className="mt-4 space-y-3 border-t border-gray-200 dark:border-gray-700 pt-4">
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="text-gray-600 dark:text-gray-400">
                                                        Assigned To
                                                    </p>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {issue.assigned_to || '-'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600 dark:text-gray-400">
                                                        Reported By
                                                    </p>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {issue.reported_by || '-'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600 dark:text-gray-400">
                                                        Reported Date
                                                    </p>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {formatDate(issue.reported_date)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600 dark:text-gray-400">
                                                        Due Date
                                                    </p>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {issue.due_date ? formatDate(issue.due_date) : '-'}
                                                    </p>
                                                </div>
                                            </div>

                                            {issue.root_cause && (
                                                <div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        Root Cause
                                                    </p>
                                                    <p className="text-gray-900 dark:text-white">
                                                        {issue.root_cause}
                                                    </p>
                                                </div>
                                            )}

                                            {issue.resolution_notes && (
                                                <div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        Resolution Notes
                                                    </p>
                                                    <p className="text-gray-900 dark:text-white">
                                                        {issue.resolution_notes}
                                                    </p>
                                                </div>
                                            )}

                                            <div className="flex gap-2 flex-wrap">
                                                {issue.impact_on_schedule && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs rounded">
                                                        📅 Schedule Impact
                                                    </span>
                                                )}
                                                {issue.impact_on_budget && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-xs rounded">
                                                        💰 Budget Impact: ${issue.estimated_cost || 0}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex gap-2 pt-4">
                                                <select
                                                    value={issue.status}
                                                    onChange={(e) =>
                                                        handleStatusChange(issue.id, e.target.value)
                                                    }
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                                                >
                                                    <option value="open">Open</option>
                                                    <option value="in-progress">In Progress</option>
                                                    <option value="on-hold">On Hold</option>
                                                    <option value="resolved">Resolved</option>
                                                    <option value="closed">Closed</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                                <button
                                                    onClick={() => handleEdit(issue)}
                                                    className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(issue.id)}
                                                    className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <CardTitle>
                                {editingIssue ? 'Edit Issue' : 'Create New Issue'}
                            </CardTitle>
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setEditingIssue(null);
                                }}
                                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={handleCreateOrUpdate} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">
                                            Issue Code
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.code}
                                            onChange={(e) =>
                                                setFormData({ ...formData, code: e.target.value })
                                            }
                                            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">
                                            Category
                                        </label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) =>
                                                setFormData({ ...formData, category: e.target.value })
                                            }
                                            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="technical">Technical</option>
                                            <option value="schedule">Schedule</option>
                                            <option value="budget">Budget</option>
                                            <option value="resource">Resource</option>
                                            <option value="quality">Quality</option>
                                            <option value="communication">Communication</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) =>
                                            setFormData({ ...formData, title: e.target.value })
                                        }
                                        className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) =>
                                            setFormData({ ...formData, description: e.target.value })
                                        }
                                        rows={3}
                                        className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">
                                            Priority
                                        </label>
                                        <select
                                            value={formData.priority}
                                            onChange={(e) =>
                                                setFormData({ ...formData, priority: e.target.value })
                                            }
                                            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                            <option value="critical">Critical</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">
                                            Due Date
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.due_date}
                                            onChange={(e) =>
                                                setFormData({ ...formData, due_date: e.target.value })
                                            }
                                            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">
                                            Assigned To
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.assigned_to}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    assigned_to: e.target.value,
                                                })
                                            }
                                            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">
                                            Reported By
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.reported_by}
                                            onChange={(e) =>
                                                setFormData({ ...formData, reported_by: e.target.value })
                                            }
                                            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                            <input
                                                type="checkbox"
                                                checked={formData.impact_on_schedule}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        impact_on_schedule: e.target.checked,
                                                    })
                                                }
                                            />
                                            Impact on Schedule
                                        </label>
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                            <input
                                                type="checkbox"
                                                checked={formData.impact_on_budget}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        impact_on_budget: e.target.checked,
                                                    })
                                                }
                                            />
                                            Impact on Budget
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700">
                                        Estimated Cost
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.estimated_cost}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                estimated_cost: e.target.value,
                                            })
                                        }
                                        className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700">
                                        Root Cause
                                    </label>
                                    <textarea
                                        value={formData.root_cause}
                                        onChange={(e) =>
                                            setFormData({ ...formData, root_cause: e.target.value })
                                        }
                                        rows={2}
                                        className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div className="flex gap-2 pt-6">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-lg transition-colors"
                                    >
                                        {editingIssue ? 'Update Issue' : 'Create Issue'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            setEditingIssue(null);
                                        }}
                                        className="flex-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium py-2 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
