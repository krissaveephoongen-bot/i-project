/**
 * Project Create Form Component
 * Form for creating new projects with white background
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

export interface ProjectFormData {
    code: string;
    name: string;
    description: string;
    status: 'planning' | 'active' | 'review' | 'completed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    dueDate?: string;
    endDate?: string;
    budget?: string;
    client?: string;
    teamSize?: number;
    projectManager?: string;
}

interface ProjectCreateFormProps {
    onSubmit: (data: ProjectFormData) => Promise<void>;
    onCancel?: () => void;
    isLoading?: boolean;
    initialData?: Partial<ProjectFormData>;
}

export function ProjectCreateForm({
    onSubmit,
    onCancel,
    isLoading = false,
    initialData,
}: ProjectCreateFormProps) {
    const [formData, setFormData] = useState<ProjectFormData>({
        code: initialData?.code || '',
        name: initialData?.name || '',
        description: initialData?.description || '',
        status: (initialData?.status as any) || 'planning',
        priority: (initialData?.priority as any) || 'medium',
        dueDate: initialData?.dueDate || '',
        budget: initialData?.budget || '',
        client: initialData?.client || '',
        teamSize: initialData?.teamSize || 1,
        projectManager: initialData?.projectManager || '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [projectManagers, setProjectManagers] = useState<Array<{ id: string; name: string; email: string }>>([]);
    const [isLoadingManagers, setIsLoadingManagers] = useState(true);
    const [managerError, setManagerError] = useState<string | null>(null);
    
    // Ensure onCancel is properly typed
    const handleCancel = onCancel || (() => {});

    useEffect(() => {
        fetchProjectManagers();
    }, []);

    const fetchProjectManagers = async () => {
        setIsLoadingManagers(true);
        setManagerError(null);
        
        try {
            // Use the api client instead of direct fetch
            const response = await api.get('/users/managers');
            const managers = response.data || [];
            
            if (managers.length === 0) {
                setManagerError('No project managers found. Please add managers first.');
            } else {
                setProjectManagers(managers.map((m: any) => ({
                    id: m.id,
                    name: m.name || 'Unnamed Manager',
                    email: m.email
                })));
            }
        } catch (error) {
            console.error('Failed to fetch project managers:', error);
            setManagerError('Failed to load project managers. Please try again later.');
            setProjectManagers([]);
        } finally {
            setIsLoadingManagers(false);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.code.trim()) {
            newErrors.code = 'Project code is required';
        }

        if (formData.code.trim().length < 2) {
            newErrors.code = 'Project code must be at least 2 characters';
        }

        if (!/^[A-Z0-9\-]+$/.test(formData.code.trim())) {
            newErrors.code = 'Project code must contain only uppercase letters, numbers, and hyphens';
        }

        if (!formData.name.trim()) {
            newErrors.name = 'Project name is required';
        }

        if (formData.name.trim().length < 3) {
            newErrors.name = 'Project name must be at least 3 characters';
        }

        if (!formData.projectManager || formData.projectManager.trim() === '') {
            newErrors.projectManager = 'Project Manager is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the errors below');
            return;
        }

        setSubmitting(true);
        try {
            await onSubmit(formData);
            setFormData({
                code: '',
                name: '',
                description: '',
                status: 'planning',
                priority: 'medium',
                dueDate: '',
                budget: '',
                client: '',
                teamSize: 1,
                projectManager: '',
            });
            toast.success('Project created successfully!');
        } catch (error) {
            console.error('Error creating project:', error);
            toast.error('Failed to create project');
        } finally {
            setSubmitting(false);
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Clear error for this field
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    return (
        <div className="w-full bg-white rounded-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Project Code */}
                <div className="space-y-2">
                    <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                        Project Code *
                    </label>
                    <Input
                        id="code"
                        name="code"
                        placeholder="e.g., PROJ-001, APP-002"
                        value={formData.code}
                        onChange={handleInputChange}
                        maxLength={20}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.code ? 'border-red-500' : 'border-gray-300'
                            }`}
                        disabled={submitting || isLoading}
                    />
                    <p className="text-xs text-gray-500">Use uppercase letters, numbers, and hyphens (e.g., PROJ-001)</p>
                    {errors.code && <p className="text-sm text-red-600">{errors.code}</p>}
                </div>

                {/* Project Name */}
                <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Project Name *
                    </label>
                    <Input
                        id="name"
                        name="name"
                        placeholder="Enter project name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'
                            }`}
                        disabled={submitting || isLoading}
                    />
                    {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        placeholder="Enter project description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={submitting || isLoading}
                    />
                </div>

                {/* Grid for smaller fields */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Status */}
                    <div className="space-y-2">
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                            Status
                        </label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={submitting || isLoading}
                        >
                            <option value="planning">Planning</option>
                            <option value="active">Active</option>
                            <option value="review">Review</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>

                    {/* Priority */}
                    <div className="space-y-2">
                        <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                            Priority
                        </label>
                        <select
                            id="priority"
                            name="priority"
                            value={formData.priority}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={submitting || isLoading}
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </div>
                </div>

                {/* Due Date */}
                <div className="space-y-2">
                    <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                        Due Date
                    </label>
                    <Input
                        id="dueDate"
                        name="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={submitting || isLoading}
                    />
                </div>

                {/* Budget & Client */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Budget */}
                    <div className="space-y-2">
                        <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
                            Budget
                        </label>
                        <Input
                            id="budget"
                            name="budget"
                            placeholder="e.g., 50000"
                            value={formData.budget}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={submitting || isLoading}
                        />
                    </div>

                    {/* Client */}
                    <div className="space-y-2">
                        <label htmlFor="client" className="block text-sm font-medium text-gray-700">
                            Client
                        </label>
                        <Input
                            id="client"
                            name="client"
                            placeholder="Enter client name"
                            value={formData.client}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={submitting || isLoading}
                        />
                    </div>
                </div>

                {/* Team Size */}
                <div className="space-y-2">
                    <label htmlFor="teamSize" className="block text-sm font-medium text-gray-700">
                        Team Size
                    </label>
                    <Input
                        id="teamSize"
                        name="teamSize"
                        type="number"
                        min="1"
                        max="100"
                        value={formData.teamSize || 1}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={submitting || isLoading}
                    />
                </div>

                {/* Project Manager */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label htmlFor="projectManager" className="block text-sm font-medium text-gray-700">
                            Assign Project Manager *
                        </label>
                        <button
                            type="button"
                            onClick={fetchProjectManagers}
                            className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
                            disabled={isLoadingManagers || submitting}
                            title="Refresh project managers list"
                        >
                            {isLoadingManagers ? 'Refreshing...' : 'Refresh List'}
                        </button>
                    </div>
                    
                    {isLoadingManagers ? (
                        <div className="flex items-center space-x-2 text-gray-500">
                            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                            <span>Loading project managers...</span>
                        </div>
                    ) : managerError ? (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                            {managerError}
                            <button
                                onClick={fetchProjectManagers}
                                className="ml-2 text-blue-600 hover:underline"
                                disabled={isLoadingManagers}
                            >
                                Retry
                            </button>
                        </div>
                    ) : (
                        <>
                            <select
                                id="projectManager"
                                name="projectManager"
                                value={formData.projectManager || ''}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.projectManager ? 'border-red-500' : 'border-gray-300'
                                }`}
                                disabled={submitting || isLoading || projectManagers.length === 0}
                            >
                                <option value="">-- Select a Project Manager --</option>
                                {projectManagers.map((pm) => (
                                    <option key={pm.id} value={pm.id}>
                                        {pm.name} ({pm.email})
                                    </option>
                                ))}
                            </select>
                            {projectManagers.length === 0 && !managerError && (
                                <p className="text-sm text-yellow-600">
                                    No project managers available. Please add managers first.
                                </p>
                            )}
                        </>
                    )}
                    
                    {errors.projectManager && (
                        <p className="text-sm text-red-600">{errors.projectManager}</p>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                    <Button
                        type="submit"
                        disabled={submitting || isLoading}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {submitting || isLoading ? (
                            <>
                                <span className="animate-spin mr-2">⏳</span>
                                Creating...
                            </>
                        ) : (
                            <>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Project
                            </>
                        )}
                    </Button>
                    {onCancel && (
                        <Button
                            type="button"
                            onClick={handleCancel}
                            disabled={submitting || isLoading}
                            variant="secondary"
                        >
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                        </Button>
                    )}
                </div>
            </form>
        </div>
    );
}
