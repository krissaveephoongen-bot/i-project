'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2, Calendar, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import Header from '@/app/components/Header';
import { useAuth } from '@/app/components/AuthProvider';
import PageTransition from '@/app/components/PageTransition';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { Button } from '@/app/components/ui/Button';
import { Badge } from '@/app/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import {
    toastCreateSuccess,
    toastUpdateSuccess,
    toastDeleteSuccess,
    toastError,
    toastValidationError,
    toastNetworkError,
    toastSuccess
} from '@/lib/toast-utils';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/app/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/app/components/ui/Dialog';
import { Input } from '@/app/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/Select';
import { Textarea } from '@/app/components/ui/textarea';

interface TimesheetEntry {
    id: string;
    userId: string;
    projectId: string;
    taskId?: string;
    date: string;
    hours: number;
    description?: string;
    status: 'draft' | 'submitted' | 'approved' | 'rejected';
    project?: { name: string };
    task?: { title: string };
}

interface Project {
    id: string;
    name: string;
}

export default function TimesheetPage() {
    const { user } = useAuth();

    // State
    const [entries, setEntries] = useState<TimesheetEntry[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        projectId: '',
        taskId: '',
        date: new Date().toISOString().split('T')[0],
        hours: '',
        description: ''
    });

    // Fetch Data
    const fetchData = async () => {
        try {
            if (!user?.id) return;
            if (!loading) setRefreshing(true);
            setError(null);

            const [entriesRes, projectsRes] = await Promise.all([
                fetch(`/api/timesheet/entries?userId=${user.id}`, { cache: 'no-store' }),
                fetch('/api/timesheet/projects', { cache: 'no-store' })
            ]);

            if (!entriesRes.ok) throw new Error('Failed to fetch timesheet entries');
            if (!projectsRes.ok) throw new Error('Failed to fetch projects');

            const entriesData = await entriesRes.json();
            const projectsData = await projectsRes.json();

            setEntries(Array.isArray(entriesData) ? entriesData : []);
            setProjects(Array.isArray(projectsData) ? projectsData : []);
        } catch (e: any) {
            console.error('Fetch error:', e);
            setError(e?.message || 'Failed to load timesheet data');
            toastNetworkError();
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user?.id]);

    // Computed Data
    const totalHours = useMemo(() => {
        return entries.reduce((sum, e) => sum + Number(e.hours || 0), 0);
    }, [entries]);

    const statusSummary = useMemo(() => {
        return {
            draft: entries.filter(e => e.status === 'draft').length,
            submitted: entries.filter(e => e.status === 'submitted').length,
            approved: entries.filter(e => e.status === 'approved').length,
            rejected: entries.filter(e => e.status === 'rejected').length,
        };
    }, [entries]);

    // Handlers
    const handleAdd = () => {
        setEditingId(null);
        setFormData({
            projectId: '',
            taskId: '',
            date: new Date().toISOString().split('T')[0],
            hours: '',
            description: ''
        });
        setModalOpen(true);
    };

    const handleEdit = (entry: TimesheetEntry) => {
        setEditingId(entry.id);
        setFormData({
            projectId: entry.projectId,
            taskId: entry.taskId || '',
            date: entry.date,
            hours: String(entry.hours),
            description: entry.description || ''
        });
        setModalOpen(true);
    };

    const handleSave = async () => {
        try {
            if (!formData.projectId || !formData.date || !formData.hours) {
                toastValidationError();
                return;
            }

            const payload = {
                userId: user?.id,
                projectId: formData.projectId,
                taskId: formData.taskId || undefined,
                date: formData.date,
                hours: Number(formData.hours),
                description: formData.description
            };

            const url = editingId
                ? `/api/timesheet/entries/${editingId}`
                : '/api/timesheet/entries';

            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload)
            });

            if (!res.ok) throw new Error('Failed to save entry');

            if (editingId) {
                toastUpdateSuccess('Entry');
            } else {
                toastCreateSuccess('Entry');
            }
            await fetchData();
            setModalOpen(false);
        } catch (e: any) {
            console.error('Save error:', e);
            toastError('save', e?.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            const res = await fetch(`/api/timesheet/entries/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');

            toastDeleteSuccess('Entry');
            await fetchData();
        } catch (e: any) {
            console.error('Delete error:', e);
            toastError('delete', e?.message);
        }
    };

    const handleSubmit = async () => {
        try {
            const draftEntries = entries.filter(e => e.status === 'draft');
            if (draftEntries.length === 0) {
                toastValidationError(undefined, 'No draft entries to submit');
                return;
            }

            const res = await fetch('/api/timesheet/submission', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user?.id })
            });

            if (!res.ok) throw new Error('Failed to submit');

            toastSuccess('Timesheet submitted for approval');
            await fetchData();
        } catch (e: any) {
            console.error('Submit error:', e);
            toastError('submit', e?.message);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50/50 p-8 pt-24 space-y-6">
                <Skeleton className="h-24 w-full rounded-2xl" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
                </div>
                <Skeleton className="h-96 w-full rounded-2xl" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-6 p-4">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <div className="text-center max-w-md space-y-2">
                    <h3 className="text-xl font-bold text-slate-900">Error Loading Timesheet</h3>
                    <p className="text-slate-500">{error}</p>
                </div>
                <Button onClick={fetchData} className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <PageTransition className="min-h-screen bg-slate-50/50">
            <Header
                title="Timesheet"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/' },
                    { label: 'Timesheet' }
                ]}
            />

            <div className="pt-24 px-8 pb-12 max-w-[1400px] mx-auto space-y-8">

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Total Hours</CardTitle>
                            <Clock className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalHours.toFixed(1)} hrs</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Draft</CardTitle>
                            <Calendar className="h-4 w-4 text-slate-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-700">{statusSummary.draft}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Submitted</CardTitle>
                            <Calendar className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{statusSummary.submitted}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Approved</CardTitle>
                            <Calendar className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{statusSummary.approved}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">My Timesheet</h1>
                        <p className="text-slate-500 mt-1">Track and manage your work hours</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={fetchData}
                            disabled={refreshing}
                            variant="outline"
                            className="gap-2"
                        >
                            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Button
                            onClick={handleAdd}
                            className="gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add Entry
                        </Button>
                        {statusSummary.draft > 0 && (
                            <Button
                                onClick={handleSubmit}
                                className="gap-2 bg-green-600 hover:bg-green-700"
                            >
                                Submit Timesheet
                            </Button>
                        )}
                    </div>
                </div>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        {entries.length === 0 ? (
                            <div className="p-12 text-center">
                                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500">No timesheet entries yet</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Project</TableHead>
                                            <TableHead>Task</TableHead>
                                            <TableHead>Hours</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="w-24">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {entries.map((entry) => (
                                            <TableRow key={entry.id}>
                                                <TableCell className="font-medium">{entry.date}</TableCell>
                                                <TableCell>{entry.project?.name || '-'}</TableCell>
                                                <TableCell>{entry.task?.title || '-'}</TableCell>
                                                <TableCell>{entry.hours}</TableCell>
                                                <TableCell className="max-w-xs truncate">{entry.description}</TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            entry.status === 'approved' ? 'default' :
                                                                entry.status === 'submitted' ? 'secondary' :
                                                                    entry.status === 'rejected' ? 'destructive' :
                                                                        'outline'
                                                        }
                                                    >
                                                        {entry.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        {entry.status === 'draft' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleEdit(entry)}
                                                                    className="p-1 hover:bg-slate-100 rounded"
                                                                >
                                                                    <Edit2 className="w-4 h-4 text-blue-500" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(entry.id)}
                                                                    className="p-1 hover:bg-slate-100 rounded"
                                                                >
                                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Modal */}
                <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingId ? 'Edit Entry' : 'Add Timesheet Entry'}</DialogTitle>
                            <DialogDescription>Record your work hours</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Project *</label>
                                <Select value={formData.projectId} onValueChange={(v) => setFormData({ ...formData, projectId: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select project" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {projects.map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Date *</label>
                                <Input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Hours *</label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    max="24"
                                    placeholder="8"
                                    value={formData.hours}
                                    onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Description</label>
                                <Textarea
                                    placeholder="What did you work on?"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                            <Button onClick={handleSave}>Save</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </PageTransition>
    );
}
