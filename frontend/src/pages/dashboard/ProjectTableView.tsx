import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectChart } from '@/components/charts/ProjectChart';
import {
    ChevronUp,
    ChevronDown,
    AlertCircle,
    CheckCircle,
    // Clock,
    AlertTriangle,
} from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';

interface Project {
    id: string;
    code: string;
    name: string;
    contract_amount: number;
    start_date: string;
    end_date: string;
    project_manager: string;
    planned_progress: number;
    actual_progress: number;
    risk_level: 'low' | 'medium' | 'high' | 'critical';
    status: string;
    duration_days?: number;
    remaining_days?: number;
    daysExecuted?: number;
}

interface ProjectManagerCount {
    manager: string;
    count: number;
}

interface RiskStatusCount {
    risk_level: string;
    count: number;
}

export default function ProjectTableView() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
    const [managerStats, setManagerStats] = useState<ProjectManagerCount[]>([]);
    const [riskStats, setRiskStats] = useState<RiskStatusCount[]>([]);

    // Fetch projects data
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setIsLoading(true);
                const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

                const response = await fetch(`${apiUrl}/projects`, {
                    credentials: 'include',
                });

                if (!response.ok) throw new Error('Failed to fetch projects');

                const data = await response.json();
                const projectList = Array.isArray(data.data) ? data.data : data;

                // Calculate duration and remaining days
                const enrichedProjects = projectList.map((p: any) => {
                    const start = new Date(p.start_date);
                    const end = new Date(p.end_date);
                    const today = new Date();

                    const totalDays = Math.ceil(
                        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
                    );
                    const daysExecuted = Math.ceil(
                        (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
                    );
                    const remainingDays = Math.max(0, totalDays - daysExecuted);

                    return {
                        ...p,
                        duration_days: totalDays,
                        remaining_days: remainingDays,
                        daysExecuted: Math.max(0, daysExecuted),
                    };
                });

                setProjects(enrichedProjects);

                // Calculate manager stats
                const managerMap = new Map<string, number>();
                enrichedProjects.forEach((p: any) => {
                    if (p.project_manager) {
                        managerMap.set(
                            p.project_manager,
                            (managerMap.get(p.project_manager) || 0) + 1
                        );
                    }
                });
                setManagerStats(
                    Array.from(managerMap.entries()).map(([manager, count]) => ({
                        manager,
                        count,
                    }))
                );

                // Calculate risk stats
                const riskMap = new Map<string, number>();
                enrichedProjects.forEach((p: any) => {
                    const riskLevel = p.risk_level || 'medium';
                    riskMap.set(riskLevel, (riskMap.get(riskLevel) || 0) + 1);
                });
                setRiskStats(
                    Array.from(riskMap.entries()).map(([risk_level, count]) => ({
                        risk_level,
                        count,
                    }))
                );
            } catch (error) {
                console.error('Error fetching projects:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProjects();
    }, []);

    const getRiskColor = (risk: string) => {
        const colors: Record<string, string> = {
            low: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
            medium: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
            high: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
            critical: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
        };
        return colors[risk] || colors.medium;
    };

    const getRiskIcon = (risk: string) => {
        switch (risk) {
            case 'low':
                return <CheckCircle className="h-4 w-4" />;
            case 'critical':
                return <AlertTriangle className="h-4 w-4" />;
            default:
                return <AlertCircle className="h-4 w-4" />;
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    // Sorting logic
    const sortedProjects = [...projects].sort((a, b) => {
        const key = sortConfig.key as keyof Project;
        const aVal = a[key];
        const bVal = b[key];

        if (typeof aVal === 'number' && typeof bVal === 'number') {
            return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }

        const aStr = String(aVal || '').toLowerCase();
        const bStr = String(bVal || '').toLowerCase();
        return sortConfig.direction === 'asc'
            ? aStr.localeCompare(bStr)
            : bStr.localeCompare(aStr);
    });

    const handleSort = (key: string) => {
        setSortConfig({
            key,
            direction:
                sortConfig.key === key && sortConfig.direction === 'asc'
                    ? 'desc'
                    : 'asc',
        });
    };

    const SortIcon = ({ column }: { column: string }) => {
        if (sortConfig.key !== column) {
            return <div className="w-4 h-4" />;
        }
        return sortConfig.direction === 'asc' ? (
            <ChevronUp className="w-4 h-4" />
        ) : (
            <ChevronDown className="w-4 h-4" />
        );
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
        );
    }

    // Prepare chart data for Project Manager
    const pmChartData = managerStats.map((stat) => ({
        name: stat.manager,
        value: stat.count,
    }));

    // Prepare chart data for Risk Status
    const riskChartData = riskStats.map((stat) => ({
        name: stat.risk_level && stat.risk_level.length > 0
            ? stat.risk_level.charAt(0).toUpperCase() + stat.risk_level.slice(1)
            : 'Unknown',
        value: stat.count,
    }));

    return (
        <div className="space-y-6">
            {/* Project Table */}
            <Card className="overflow-hidden">
                <CardHeader>
                    <CardTitle>Project Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                                        <button
                                            onClick={() => handleSort('code')}
                                            className="flex items-center gap-2 hover:text-gray-900 dark:hover:text-white"
                                        >
                                            Project Code
                                            <SortIcon column="code" />
                                        </button>
                                    </th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                                        <button
                                            onClick={() => handleSort('name')}
                                            className="flex items-center gap-2 hover:text-gray-900 dark:hover:text-white"
                                        >
                                            Project Name
                                            <SortIcon column="name" />
                                        </button>
                                    </th>
                                    <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                                        <button
                                            onClick={() => handleSort('contract_amount')}
                                            className="flex items-center gap-2 ml-auto hover:text-gray-900 dark:hover:text-white"
                                        >
                                            Contract Value
                                            <SortIcon column="contract_amount" />
                                        </button>
                                    </th>
                                    <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                                        Start Date
                                    </th>
                                    <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                                        End Date
                                    </th>
                                    <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                                        Executed (Days)
                                    </th>
                                    <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                                        Remaining (Days)
                                    </th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                                        Project Manager
                                    </th>
                                    <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                                        Plan %
                                    </th>
                                    <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                                        Actual %
                                    </th>
                                    <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                                        Risk Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedProjects.map((project, index) => (
                                    <tr
                                        key={project.id}
                                        className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">
                                            {index + 1}
                                        </td>
                                        <td className="py-3 px-4 text-gray-900 dark:text-white">
                                            {project.code}
                                        </td>
                                        <td className="py-3 px-4 text-gray-900 dark:text-white max-w-xs truncate">
                                            {project.name}
                                        </td>
                                        <td className="py-3 px-4 text-right text-gray-900 dark:text-white font-medium">
                                            {formatCurrency(project.contract_amount || 0)}
                                        </td>
                                        <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300">
                                            {formatDate(project.start_date)}
                                        </td>
                                        <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300">
                                            {formatDate(project.end_date)}
                                        </td>
                                        <td className="py-3 px-4 text-center text-gray-900 dark:text-white font-medium">
                                            {project.duration_days || 0}
                                        </td>
                                        <td className="py-3 px-4 text-center text-gray-900 dark:text-white font-medium">
                                            {project.remaining_days || 0}
                                        </td>
                                        <td className="py-3 px-4 text-gray-900 dark:text-white">
                                            {project.project_manager || '-'}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-500"
                                                        style={{
                                                            width: `${Math.min(100, project.planned_progress || 0)}%`,
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 w-8">
                                                    {Math.round(project.planned_progress || 0)}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-green-500"
                                                        style={{
                                                            width: `${Math.min(100, project.actual_progress || 0)}%`,
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 w-8">
                                                    {Math.round(project.actual_progress || 0)}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <div
                                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getRiskColor(
                                                    project.risk_level || 'medium'
                                                )}`}
                                            >
                                                {getRiskIcon(project.risk_level || 'medium')}
                                                {project.risk_level && project.risk_level.length > 0
                                                    ? project.risk_level.charAt(0).toUpperCase() + project.risk_level.slice(1)
                                                    : 'Unknown'}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {sortedProjects.length === 0 && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            No projects found
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Charts Row */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Project Manager Chart */}
                <ProjectChart
                    title="Project Manager Assigned"
                    type="bar"
                    data={pmChartData}
                    height={300}
                />

                {/* Risk Status Chart */}
                <ProjectChart
                    title="Risk Project Status Count"
                    type="pie"
                    data={riskChartData}
                />
            </div>
        </div>
    );
}
