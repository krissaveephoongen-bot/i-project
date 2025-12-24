import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, User, Calendar, Briefcase, Trash2, Edit2 } from 'lucide-react';

interface Resource {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
    assigned_projects: number;
    availability_percentage: number;
    status: 'available' | 'busy' | 'unavailable';
}

export default function ResourceManagement() {
    const [resources, setResources] = useState<Resource[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchResources = async () => {
            try {
                setIsLoading(true);
                const token = localStorage.getItem('accessToken');
                const response = await fetch('/api/resources', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch resources');
                }

                const result = await response.json();

                // Transform API response to match Resource interface
                const transformedResources: Resource[] = result.resources.map((resource: any) => ({
                    id: resource.id,
                    name: resource.name,
                    email: resource.email,
                    role: resource.position || 'Team Member',
                    department: resource.department || 'Unknown',
                    assigned_projects: resource.projectsAssigned || 0,
                    availability_percentage: calculateAvailability(resource.utilization),
                    status: getStatus(resource.projectsAssigned, resource.utilization)
                }));

                setResources(transformedResources);
            } catch (error) {
                console.error('Error fetching resources:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchResources();
    }, []);

    const calculateAvailability = (utilization: string): number => {
        const util = parseFloat(utilization) || 0;
        return Math.max(0, 100 - util);
    };

    const getStatus = (projects: number, utilization: string): 'available' | 'busy' | 'unavailable' => {
        const util = parseFloat(utilization) || 0;
        if (util >= 90) return 'unavailable';
        if (util >= 70) return 'busy';
        return 'available';
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            available: 'bg-green-100 text-green-800',
            busy: 'bg-yellow-100 text-yellow-800',
            unavailable: 'bg-red-100 text-red-800',
        };
        return colors[status] || colors.available;
    };

    const getAvailabilityColor = (percentage: number) => {
        if (percentage >= 80) return 'text-green-600';
        if (percentage >= 50) return 'text-yellow-600';
        return 'text-red-600';
    };

    const filteredResources = resources.filter(
        (resource) =>
            resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resource.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Resource Management</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your team and resource allocation</p>
                </div>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Resource
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex gap-4">
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                        <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                            <option>All Departments</option>
                            <option>Engineering</option>
                            <option>Management</option>
                            <option>Quality Assurance</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Resources Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredResources.map((resource) => (
                    <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                                        {resource.name.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <CardTitle className="text-base truncate">{resource.name}</CardTitle>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{resource.email}</p>
                                    </div>
                                </div>
                                <span
                                    className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(resource.status)}`}
                                >
                                    {resource.status}
                                </span>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {/* Role */}
                            <div className="flex items-center gap-2">
                                <Briefcase className="h-4 w-4 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Role</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{resource.role}</p>
                                </div>
                            </div>

                            {/* Department */}
                            <div className="flex items-center gap-2">
                                <Briefcase className="h-4 w-4 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Department</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{resource.department}</p>
                                </div>
                            </div>

                            {/* Availability */}
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Availability</p>
                                    <p className={`text-xs font-semibold ${getAvailabilityColor(resource.availability_percentage)}`}>
                                        {resource.availability_percentage}%
                                    </p>
                                </div>
                                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                                        style={{ width: `${resource.availability_percentage}%` }}
                                    />
                                </div>
                            </div>

                            {/* Projects Count */}
                            <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                                <span className="text-xs text-gray-500 dark:text-gray-400">Assigned Projects</span>
                                <span className="text-lg font-bold text-blue-600">{resource.assigned_projects}</span>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-2">
                                <Button variant="outline" size="sm" className="flex-1 gap-2">
                                    <Edit2 className="h-3.5 w-3.5" />
                                    Edit
                                </Button>
                                <Button variant="outline" size="sm" className="flex-1 gap-2 text-red-600 hover:text-red-700">
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Delete
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredResources.length === 0 && (
                <Card>
                    <CardContent className="py-8 text-center">
                        <User className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No resources found</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
