import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, parseISO, subMonths } from 'date-fns';
import { Calendar, Clock, Plus, Trash2, Edit, Check, X, Eye, CheckCircle, Download, BarChart3, TrendingUp, PieChart as PieChartIcon, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { useTimeEntries, useProjectBudget } from '../hooks/useTimeEntries';
import { timesheetService } from '@/services/timesheetService';
import { useAuthContext } from '@/contexts/AuthContext';
import { TimeEntry } from '../types/database';
import ScrollContainer from '../components/layout/ScrollContainer';

interface TimeEntryFormData {
    date: string;
    workType: 'project' | 'office' | 'other';
    projectId?: number;
    taskId?: number;
    startTime: string;
    endTime: string;
    hours: number;
    description: string;
}

interface MonthStats {
    month: string;
    year: number;
    workingDays: number;
    loggedDays: number;
    missingDays: number;
    totalHours: number;
    totalMandays: number;
}

interface ApprovalItem {
    id: string;
    userName: string;
    submittedDate: string;
    status: 'pending' | 'approved' | 'rejected';
    comment?: string;
    rejectionReason?: string;
    totalHours: number;
    entries: Array<{
        date: string;
        task: string;
        project: string;
        hours: number;
        description: string;
    }>;
}

 

const WORK_TYPES = [
    { id: 'project', label: 'Project Work' },
    { id: 'office', label: 'Office Work' },
    { id: 'other', label: 'Other' },
];

// Helper function to calculate hours between two time strings
const calculateHours = (startTime: string, endTime: string): number => {
    if (!startTime || !endTime) return 0;

    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);

    const startDate = new Date();
    startDate.setHours(startHours || 0, startMinutes || 0, 0, 0);

    let endDate = new Date();
    endDate.setHours(endHours || 0, endMinutes || 0, 0, 0);

    // Handle overnight entries (end time is next day)
    if (endDate < startDate) {
        endDate.setDate(endDate.getDate() + 1);
    }

    const diffMs = endDate.getTime() - startDate.getTime();
    return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100; // Round to 2 decimal places
};

// Helper function to calculate stats for a month
const calculateMonthStats = (entries: TimeEntry[], monthDate: Date): MonthStats => {
    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(monthDate),
        end: endOfMonth(monthDate),
    });

    const workingDays = daysInMonth.filter(d => !isWeekend(d)).length;

    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);

    const entriesByDate = new Set(
        entries
            .filter(e => {
                const entryDate = parseISO(e.date);
                return entryDate >= monthStart && entryDate <= monthEnd;
            })
            .map(e => e.date)
    );

    const loggedDays = entriesByDate.size;
    const totalHours = entries
        .filter(e => {
            const entryDate = parseISO(e.date);
            return entryDate >= monthStart && entryDate <= monthEnd;
        })
        .reduce((sum, e) => sum + (e.hours || 0), 0);

    return {
        month: format(monthDate, 'MMMM'),
        year: monthDate.getFullYear(),
        workingDays,
        loggedDays,
        missingDays: workingDays - loggedDays,
        totalHours,
        totalMandays: totalHours / 8,
    };
};

export default function Timesheet() {
    const today = new Date();
    const { user } = useAuthContext();
    const { data: _dbStatus } = useQuery({
        queryKey: ['db-status'],
        queryFn: async () => timesheetService.getDbStatus(),
        refetchInterval: 60000,
    });

    // Tabs state
    const [activeTab, setActiveTab] = useState<'log' | 'approvals' | 'reports'>('log');

    // ===== LOG TIME TAB =====
    const {
        entries: timesheetEntries,
        projectList,
        taskList,
        selectedProjectId,
        setSelectedProjectId,
        addEntry,
        updateEntry,
        deleteEntry,
    } = useTimeEntries(1, today);

    const [isLogTimeOpen, setIsLogTimeOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingEntryId, setEditingEntryId] = useState<number | null>(null);

    const [formData, setFormData] = useState<TimeEntryFormData>({
        date: format(new Date(), 'yyyy-MM-dd'),
        workType: 'project',
        projectId: undefined,
        taskId: undefined,
        startTime: '',
        endTime: '',
        hours: 0,
        description: '',
    });

    useProjectBudget(selectedProjectId || 0);

    // Log Time handlers
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleWorkTypeChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            workType: value as 'project' | 'office' | 'other',
            projectId: value === 'project' ? prev.projectId : undefined,
            taskId: undefined,
        }));

        if (value !== 'project') {
            setSelectedProjectId(null);
        }
    };

    const handleProjectChange = (value: string) => {
        const projectId = parseInt(value, 10);
        setFormData(prev => ({
            ...prev,
            projectId,
            taskId: undefined,
        }));
        setSelectedProjectId(projectId);
    };

    const handleTaskChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            taskId: parseInt(value, 10) || undefined,
        }));
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'startTime' | 'endTime') => {
        const { value } = e.target;
        setFormData(prev => {
            const newData = {
                ...prev,
                [field]: value,
            };

            if (newData.startTime && newData.endTime) {
                const hours = calculateHours(newData.startTime, newData.endTime);
                newData.hours = hours;
            }

            return newData;
        });
    };

    const resetForm = () => {
        setFormData({
            date: format(new Date(), 'yyyy-MM-dd'),
            workType: 'project',
            projectId: undefined,
            taskId: undefined,
            startTime: '',
            endTime: '',
            hours: 0,
            description: '',
        });
        setSelectedProjectId(null);
        setIsEditing(false);
        setEditingEntryId(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.date || !formData.workType) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (formData.workType === 'project' && !formData.projectId) {
            toast.error('Please select a project');
            return;
        }

        if (!formData.startTime || !formData.endTime) {
            toast.error('Please enter both start and end times');
            return;
        }

        try {
            if (isEditing && editingEntryId) {
              await updateEntry.mutateAsync({
                    id: editingEntryId,
                    updates: {
                        date: formData.date,
                        workType: formData.workType,
                        projectId: formData.projectId,
                        taskId: formData.taskId,
                        startTime: formData.startTime,
                        endTime: formData.endTime,
                        description: formData.description,
                    } as any,
                });
                toast.success('Time entry updated successfully');
            } else {
                await addEntry.mutateAsync({
                    date: formData.date,
                    workType: formData.workType,
                    projectId: formData.projectId,
                    taskId: formData.taskId,
                    startTime: formData.startTime,
                    endTime: formData.endTime,
                    description: formData.description,
                } as any);
                toast.success('Time entry added successfully');
            }

            resetForm();
            setIsLogTimeOpen(false);
        } catch (error) {
            console.error('Error saving time entry:', error);
            toast.error('Failed to save time entry');
        }
    };

    const handleEditEntry = (entry: TimeEntry) => {
        setFormData({
            date: entry.date,
            workType: entry.work_type as 'project' | 'office' | 'other',
            projectId: entry.project_id || undefined,
            taskId: entry.task_id || undefined,
            startTime: entry.start_time,
            endTime: entry.end_time,
            hours: entry.hours,
            description: entry.description || '',
        });

        if (entry.project_id) {
            setSelectedProjectId(entry.project_id);
        }

        setEditingEntryId(entry.id);
        setIsEditing(true);
        setIsLogTimeOpen(true);
    };

    const handleDeleteEntry = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this entry?')) {
            try {
                await deleteEntry.mutateAsync(id);
                toast.success('Entry deleted successfully');
            } catch (error) {
                console.error('Error deleting entry:', error);
                toast.error('Failed to delete entry');
            }
        }
    };

    // Map database TimeEntry to timesheet TimeEntry type
    const mapToTimesheetEntry = (entry: any): TimeEntry => {
        // Map status from database format to timesheet format
        const statusMap = {
            'pending': 'pending',
            'approved': 'approved',
            'rejected': 'rejected'
        } as const;

        return {
            id: entry.id.toString(),
            userId: entry.user_id.toString(),
            projectId: entry.project_id?.toString() || '',
            taskId: entry.task_id?.toString(),
            date: entry.date,
            startTime: entry.start_time,
            endTime: entry.end_time,
            hours: entry.hours,
            description: entry.description || '',
            type: 'regular', // Default to 'regular' as work_type in DB might not match exactly
            status: statusMap[entry.status as keyof typeof statusMap] || 'pending',
            projectName: entry.project_name,
            taskName: entry.task_title
        };
    };

    // Calculate stats for current and previous months
    const mappedEntries = timesheetEntries.map(mapToTimesheetEntry);
    const currentMonthStats = calculateMonthStats(mappedEntries, today);
    const previousMonthStats = calculateMonthStats(mappedEntries, subMonths(today, 1));

    // ===== APPROVALS TAB =====
    const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
    const [selectedApproval, setSelectedApproval] = useState<ApprovalItem | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [approvalFilter, setApprovalFilter] = useState<'pending' | 'all'>('pending');

    // Fetch approvals from database
    const { data: approvalsData, isLoading: isLoadingApprovals, refetch: refetchApprovals } = useQuery({
        queryKey: ['time-entries-approvals', approvalFilter],
        queryFn: async () => {
            return timesheetService.getPendingApprovals();
        },
        enabled: activeTab === 'approvals',
    });

    useEffect(() => {
        if (approvalsData) {
            setApprovals(approvalsData);
        }
    }, [approvalsData]);

    const handleApprove = async (approvalId: string) => {
        try {
            await timesheetService.approveTimeEntry(approvalId, String(user?.id));
            toast.success('Timesheet approved successfully');
            refetchApprovals();
        } catch (error) {
            console.error('Error approving timesheet:', error);
            toast.error('Failed to approve timesheet');
        }
    };

    const handleReject = async () => {
        if (!selectedApproval) return;
        try {
            await timesheetService.rejectTimeEntry(selectedApproval.id, String(user?.id), rejectReason);
            toast.success('Timesheet rejected');
            setShowRejectModal(false);
            setRejectReason('');
            refetchApprovals();
        } catch (error) {
            console.error('Error rejecting timesheet:', error);
            toast.error('Failed to reject timesheet');
        }
    };

    const pendingCount = approvals.filter(a => a.status === 'pending').length;
    const approvedCount = approvals.filter(a => a.status === 'approved').length;
    const approvalsLoading = isLoadingApprovals;

    // ===== REPORTS TAB =====
    const [period, setPeriod] = useState('month');
    const [year, setYear] = useState(new Date().getFullYear());
    const [week, setWeek] = useState(getCurrentWeek());
    const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');

    // Fetch reports data from database
    const { data: reportStats, isLoading: reportsLoading, error: reportError, refetch: refetchReports } = useQuery({
        queryKey: ['time-entries-reports', period, year, week],
        queryFn: async () => {
            return timesheetService.getReportsSummary({ period, year, week });
        },
        enabled: activeTab === 'reports',
    });

    const handleExport = async () => {
        if (!reportStats) return;

        try {
            const csvContent = [
                ['Project', 'Hours', 'Percentage', 'Tasks'],
                ...reportStats.projectBreakdown.map((p: any) => [p.projectName, p.hours.toString(), `${p.percentage}%`, p.taskCount.toString()])
            ].map((row: any[]) => row.map((cell: any) => `"${cell}"`).join(',')).join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `timesheet-report-${year}.${exportFormat}`;
            link.click();
            window.URL.revokeObjectURL(url);

            toast.success('Report exported successfully');
        } catch (error) {
            console.error('Error exporting report:', error);
            toast.error('Failed to export report');
        }
    };

    function getCurrentWeek(): number {
        const d = new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    }

    return (
        <ScrollContainer>
            <div className="space-y-6">
                {/* Tabs */}
                <div className="flex gap-2 border-b border-gray-200 items-center">
                <button
                    onClick={() => setActiveTab('log')}
                    className={`px-4 py-3 font-medium text-sm border-b-2 ${activeTab === 'log'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                >
                    ⏱️ Log Time
                </button>
                <button
                    onClick={() => setActiveTab('approvals')}
                    className={`px-4 py-3 font-medium text-sm border-b-2 ${activeTab === 'approvals'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                >
                    ✅ Approvals
                </button>
                <button
                    onClick={() => setActiveTab('reports')}
                    className={`px-4 py-3 font-medium text-sm border-b-2 ${activeTab === 'reports'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                >
                    📊 Reports
                </button>
            </div>

            {/* ===== LOG TIME TAB ===== */}
            {activeTab === 'log' && (
                <div className="space-y-6">
                    {/* Quick Stats */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center">
                                    <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                                    <p className="text-3xl font-bold text-blue-600">{currentMonthStats.totalHours}h</p>
                                    <p className="text-sm text-gray-600">{currentMonthStats.month} Hours</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center">
                                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                    <p className="text-3xl font-bold text-green-600">{currentMonthStats.loggedDays}/{currentMonthStats.workingDays}</p>
                                    <p className="text-sm text-gray-600">Days Logged</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center">
                                    <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                                    <p className="text-3xl font-bold text-orange-600">{currentMonthStats.totalMandays.toFixed(1)}</p>
                                    <p className="text-sm text-gray-600">Man Days</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center">
                                    <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                                    <p className="text-3xl font-bold text-red-600">{currentMonthStats.missingDays}</p>
                                    <p className="text-sm text-gray-600">Missing Days</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Log Time</h2>
                            <p className="text-gray-600 mt-1">Track your work hours</p>
                        </div>
                        <Button
                            onClick={() => {
                                resetForm();
                                setIsLogTimeOpen(true);
                            }}
                            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                        >
                            <Plus className="h-5 w-5" />
                            Log Time
                        </Button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Current Month Card */}
                        <Card className="border border-gray-200 shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="bg-blue-50 p-3 rounded-lg">
                                        <Calendar className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{currentMonthStats.month}</h3>
                                        <p className="text-sm text-gray-600">Current Month</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-700">Working Days</span>
                                        <span className="text-xl font-bold text-gray-900">{currentMonthStats.workingDays} days</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-700">Logged Days</span>
                                        <span className="text-xl font-bold text-green-600">{currentMonthStats.loggedDays} days</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-700">Missing Days</span>
                                        <span className="text-xl font-bold text-red-600">{currentMonthStats.missingDays} days</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-700">Total Hours</span>
                                        <span className="text-xl font-bold text-gray-900">{currentMonthStats.totalHours.toFixed(1)} hrs</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-700">Total Mandays</span>
                                        <span className="text-xl font-bold text-gray-900">{currentMonthStats.totalMandays.toFixed(2)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Previous Month Card */}
                        <Card className="border border-gray-200 shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="bg-gray-100 p-3 rounded-lg">
                                        <Calendar className="h-6 w-6 text-gray-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{previousMonthStats.month}</h3>
                                        <p className="text-sm text-gray-600">Previous Month</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-700">Working Days</span>
                                        <span className="text-xl font-bold text-gray-900">{previousMonthStats.workingDays} days</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-700">Logged Days</span>
                                        <span className="text-xl font-bold text-green-600">{previousMonthStats.loggedDays} days</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-700">Missing Days</span>
                                        <span className="text-xl font-bold text-red-600">{previousMonthStats.missingDays} days</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-700">Total Hours</span>
                                        <span className="text-xl font-bold text-gray-900">{previousMonthStats.totalHours.toFixed(1)} hrs</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-700">Total Mandays</span>
                                        <span className="text-xl font-bold text-gray-900">{previousMonthStats.totalMandays.toFixed(2)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Time Entries List */}
                    <Card className="border border-gray-200 shadow-sm">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Time Entries</h3>
                            {timesheetEntries.length === 0 ? (
                                <div className="text-center py-12">
                                    <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">No time entries yet. Click "Log Time" to get started.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {timesheetEntries.map((entry: any) => (
                                        <div key={entry.id} className="flex items-center justify-between gap-2 p-4 border border-gray-100 rounded-lg hover:bg-gray-50">
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-gray-900 truncate">{entry.task}</div>
                                                <div className="text-sm text-gray-600 mt-1 truncate">{entry.project}</div>
                                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 overflow-x-auto">
                                                    <span className="flex-shrink-0">{entry.date}</span>
                                                    <span className="flex-shrink-0">{entry.start_time} - {entry.end_time}</span>
                                                    <span className="font-medium flex-shrink-0">{entry.hours}h</span>
                                                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${entry.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                        entry.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {entry.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 flex-shrink-0">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => handleEditEntry(entry)}
                                                    className="gap-2 h-8 w-8 p-0"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleDeleteEntry(entry.id)}
                                                    className="gap-2 h-8 w-8 p-0"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Log Time Modal */}
                    <Dialog open={isLogTimeOpen} onOpenChange={setIsLogTimeOpen}>
                        <DialogContent className="max-w-2xl bg-white">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold">{isEditing ? 'Edit' : 'Log'} Time</DialogTitle>
                            </DialogHeader>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">Date</label>
                                    <div className="relative">
                                        <Input
                                            type="date"
                                            name="date"
                                            value={formData.date}
                                            onChange={handleInputChange}
                                            className="px-4 py-2 border border-gray-200 rounded-lg"
                                        />
                                        <Calendar className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                                    </div>
                                </div>

                                {/* Work Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">Work Type</label>
                                    <Select value={formData.workType} onValueChange={handleWorkTypeChange}>
                                        <SelectTrigger className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {WORK_TYPES.map((type) => (
                                                <SelectItem key={type.id} value={type.id}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Project */}
                                {formData.workType === 'project' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">
                                            Project <span className="text-red-600">*</span>
                                        </label>
                                        <Select value={formData.projectId?.toString() || ''} onValueChange={handleProjectChange}>
                                            <SelectTrigger className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2">
                                                <SelectValue placeholder="Select Project" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {projectList.length > 0 ? (
                                                    projectList.map((project: any) => (
                                                        <SelectItem key={project.id} value={project.id.toString()}>
                                                            {project.name}
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <div className="py-2 px-4 text-sm text-gray-500">
                                                        No projects available
                                                    </div>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {/* Task */}
                                {formData.projectId && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">Task</label>
                                        <Select value={formData.taskId?.toString() || ''} onValueChange={handleTaskChange}>
                                            <SelectTrigger className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2">
                                                <SelectValue placeholder="Select Task" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {taskList.length > 0 ? (
                                                    taskList.map((task: any) => (
                                                        <SelectItem key={task.id} value={task.id.toString()}>
                                                            {task.name}
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <div className="py-2 px-4 text-sm text-gray-500">
                                                        No tasks available
                                                    </div>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {/* Time Fields */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">Start Time</label>
                                        <Input
                                            type="time"
                                            name="startTime"
                                            value={formData.startTime}
                                            onChange={(e) => handleTimeChange(e, 'startTime')}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">End Time</label>
                                        <Input
                                            type="time"
                                            name="endTime"
                                            value={formData.endTime}
                                            onChange={(e) => handleTimeChange(e, 'endTime')}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                                        />
                                    </div>
                                </div>

                                {/* Hours */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">Hours</label>
                                    <Input
                                        type="number"
                                        name="hours"
                                        step="0.5"
                                        value={formData.hours || ''}
                                        readOnly
                                        placeholder="Auto-calculated from time"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={4}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter work description"
                                    />
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-4 pt-4">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => {
                                            setIsLogTimeOpen(false);
                                            resetForm();
                                        }}
                                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                                    >
                                        {isEditing ? 'Update' : 'Submit'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            )}

            {/* ===== APPROVALS TAB ===== */}
            {activeTab === 'approvals' && (
                <div className="space-y-6">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Timesheet Approvals</h2>
                        <p className="text-gray-600 mt-1">Review and approve employee timesheets</p>
                    </div>

                    {/* Stats */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center">
                                    <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                                    <p className="text-3xl font-bold text-orange-600">{pendingCount}</p>
                                    <p className="text-sm text-gray-600">Pending Review</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center">
                                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                    <p className="text-3xl font-bold text-green-600">{approvedCount}</p>
                                    <p className="text-sm text-gray-600">Approved</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-blue-600">{approvals.length}</p>
                                    <p className="text-sm text-gray-600">Total</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2 border-b border-gray-200">
                        <button
                            onClick={() => setApprovalFilter('pending')}
                            className={`px-4 py-2 font-medium text-sm border-b-2 ${approvalFilter === 'pending'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Pending ({pendingCount})
                        </button>
                        <button
                            onClick={() => setApprovalFilter('all')}
                            className={`px-4 py-2 font-medium text-sm border-b-2 ${approvalFilter === 'all'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            All ({approvals.length})
                        </button>
                    </div>

                    {/* Approvals List */}
                    <div className="space-y-4">
                        {approvalsLoading ? (
                            <Card>
                                <CardContent className="py-12">
                                    <div className="text-center text-gray-500">Loading approvals...</div>
                                </CardContent>
                            </Card>
                        ) : approvals.length === 0 ? (
                            <Card>
                                <CardContent className="py-12">
                                    <div className="text-center">
                                        <CheckCircle className="h-12 w-12 text-green-300 mx-auto mb-4" />
                                        <p className="text-gray-600">All timesheets have been processed</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            approvals.map(approval => (
                                <Card key={approval.id} className="overflow-hidden">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-lg text-gray-900 truncate">{approval.userName}</h3>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Submitted: {new Date(approval.submittedDate).toLocaleDateString()}
                                                </p>
                                                {approval.comment && (
                                                    <p className="text-sm text-gray-700 mt-2 p-2 bg-gray-50 rounded line-clamp-2">
                                                        💬 {approval.comment}
                                                    </p>
                                                )}
                                                <div className="mt-3">
                                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${approval.status === 'pending'
                                                        ? 'bg-orange-100 text-orange-800'
                                                        : approval.status === 'approved'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {approval.status}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 flex-shrink-0 flex-wrap justify-end">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => {
                                                        setSelectedApproval(approval);
                                                        setShowDetailModal(true);
                                                    }}
                                                    className="gap-2 h-8 w-8 p-0"
                                                    title="View Details"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                {approval.status === 'pending' && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            className="bg-green-600 hover:bg-green-700 h-8 w-8 p-0"
                                                            onClick={() => handleApprove(approval.id)}
                                                            disabled={approvalsLoading}
                                                            title="Approve"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => {
                                                                setSelectedApproval(approval);
                                                                setShowRejectModal(true);
                                                            }}
                                                            className="h-8 w-8 p-0"
                                                            title="Reject"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>

                    {/* Detail Modal */}
                    {selectedApproval && (
                        <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Timesheet Details - {selectedApproval.userName}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 max-h-96 overflow-y-auto">
                                    <div>
                                        <h4 className="font-semibold mb-2">Submission Info</h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-600">Submitted</p>
                                                <p className="font-medium">
                                                    {new Date(selectedApproval.submittedDate).toLocaleString()}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Status</p>
                                                <p className="font-medium capitalize">{selectedApproval.status}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {selectedApproval.comment && (
                                        <div>
                                            <h4 className="font-semibold mb-2">Comment</h4>
                                            <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded">
                                                {selectedApproval.comment}
                                            </p>
                                        </div>
                                    )}

                                    {selectedApproval.rejectionReason && (
                                        <div>
                                            <h4 className="font-semibold mb-2 text-red-600">Rejection Reason</h4>
                                            <p className="text-sm text-gray-700 bg-red-50 p-3 rounded">
                                                {selectedApproval.rejectionReason}
                                            </p>
                                        </div>
                                    )}

                                    <div>
                                        <h4 className="font-semibold mb-2">Entries</h4>
                                        <div className="space-y-2">
                                            {selectedApproval.entries.map((entry: any, i: number) => (
                                                <div key={i} className="p-2 bg-gray-50 rounded text-sm">
                                                    <p className="font-medium">{entry.task}</p>
                                                    <p className="text-gray-600">{entry.project}</p>
                                                    <p className="text-gray-500">{entry.date} - {entry.hours}h</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}

                    {/* Reject Reason Modal */}
                    <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Reject Timesheet</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Rejection Reason
                                    </label>
                                    <textarea
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        placeholder="Please provide a reason for rejection..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows={4}
                                        maxLength={500}
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => {
                                            setShowRejectModal(false);
                                            setRejectReason('');
                                        }}
                                        disabled={approvalsLoading}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleReject}
                                        variant="destructive"
                                        disabled={approvalsLoading || !rejectReason.trim()}
                                        className="flex-1"
                                    >
                                        {approvalsLoading ? 'Processing...' : 'Reject'}
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            )}

            {/* ===== REPORTS TAB ===== */}
            {activeTab === 'reports' && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Timesheet Reports</h2>
                            <p className="text-gray-600 mt-1">Analytics and insights for your timesheet data</p>
                        </div>
                        <div className="flex gap-2">
                            <Select value={exportFormat} onValueChange={(value: 'csv' | 'pdf') => setExportFormat(value)}>
                                <SelectTrigger className="w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="csv">CSV</SelectItem>
                                    <SelectItem value="pdf">PDF</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button onClick={handleExport} disabled={reportsLoading} className="gap-2">
                                <Download className="h-4 w-4" />
                                Export
                            </Button>
                        </div>
                    </div>

                    {/* Filters */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">Period</label>
                                    <Select value={period} onValueChange={setPeriod}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="week">Week</SelectItem>
                                            <SelectItem value="month">Month</SelectItem>
                                            <SelectItem value="quarter">Quarter</SelectItem>
                                            <SelectItem value="year">Year</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">Year</label>
                                    <Input
                                        type="number"
                                        value={year}
                                        onChange={(e) => setYear(parseInt(e.target.value))}
                                        min={2020}
                                        max={new Date().getFullYear() + 1}
                                    />
                                </div>

                                {period === 'week' && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1 block">Week</label>
                                        <Input
                                            type="number"
                                            value={week}
                                            onChange={(e) => setWeek(parseInt(e.target.value))}
                                            min={1}
                                            max={52}
                                        />
                                    </div>
                                )}

                                <div className="flex items-end">
                                    <Button
                                        onClick={() => refetchReports()}
                                        disabled={reportsLoading}
                                        variant="secondary"
                                        className="w-full"
                                    >
                                        {reportsLoading ? 'Loading...' : 'Refresh'}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Error Alert */}
                    {reportError && (
                        <div className="flex items-center gap-3 bg-red-50 border border-red-200 p-4 rounded-lg">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                            <p className="text-sm text-red-800">{reportError.message || 'Failed to load reports'}</p>
                        </div>
                    )}

                    {reportsLoading && !reportStats ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : reportStats ? (
                        <>
                            {/* Main Stats */}
                            <div className="grid gap-4 md:grid-cols-4">
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-center">
                                            <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                                            <p className="text-3xl font-bold text-blue-600">{reportStats.totalHours}h</p>
                                            <p className="text-sm text-gray-600">Total Hours</p>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-center">
                                            <BarChart3 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                            <p className="text-3xl font-bold text-green-600">{reportStats.daysWorked}d</p>
                                            <p className="text-sm text-gray-600">Days Worked</p>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-center">
                                            <p className="text-3xl font-bold text-orange-600">{reportStats.averageHoursPerDay.toFixed(1)}h</p>
                                            <p className="text-sm text-gray-600">Avg/Day</p>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-center">
                                            <p className="text-3xl font-bold text-purple-600">{reportStats.overtimeHours}h</p>
                                            <p className="text-sm text-gray-600">Overtime</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Project Breakdown */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <PieChartIcon className="h-5 w-5" />
                                        Project Time Breakdown
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {reportStats.projectBreakdown.map((project: any) => (
                                            <div key={project.projectId}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-medium text-gray-900">{project.projectName}</h4>
                                                    <span className="text-sm font-semibold text-gray-600">
                                                        {project.hours}h ({project.percentage}%)
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-blue-600 h-2 rounded-full transition-all"
                                                        style={{ width: `${project.percentage}%` }}
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">{project.taskCount} tasks</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Type Breakdown */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Time Type Breakdown</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {reportStats.typeBreakdown.map((type: any) => (
                                            <div key={type.type} className="text-center p-4 bg-gray-50 rounded-lg">
                                                <p className="text-2xl font-bold text-blue-600">{type.hours}h</p>
                                                <p className="text-sm text-gray-600 capitalize">{type.type}</p>
                                                <p className="text-xs text-gray-500 mt-1">{type.percentage}%</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        <Card>
                            <CardContent className="py-12">
                                <div className="text-center text-gray-500">
                                    No data available for the selected period
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
            </div>
        </ScrollContainer>
    );
}
