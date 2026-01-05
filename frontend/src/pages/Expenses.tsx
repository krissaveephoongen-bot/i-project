import { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { DollarSign, Plus, Edit2, Trash2, Check, X, Download, TrendingUp } from 'lucide-react';
import { formatCurrency, parseCurrency } from '@/utils/formatCurrency';
import { toast } from 'react-hot-toast';
import { format, startOfMonth, endOfMonth, formatISO } from 'date-fns';
import ScrollContainer from '../components/layout/ScrollContainer';
import { API_BASE_URL, API_TIMEOUT } from '@/lib/api-config';
import ErrorState from '@/components/ErrorState';
import LoadingState from '@/components/LoadingState';
import EmptyState from '@/components/EmptyState';
import { parseApiError } from '@/lib/error-handler';

interface Expense {
    id: string;
    date: string;
    project_id?: string;
    project?: string;
    category: 'travel' | 'food' | 'accommodation' | 'equipment' | 'software' | 'service' | 'other';
    amount: number;
    description: string;
    user_id?: string;
    user_name?: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at?: string;
    updated_at?: string;
}

interface Project {
    id: string;
    code?: string;
    name: string;
    projectManager?: string;
}

interface ExpenseStats {
    total_expenses: number;
    pending_amount: number;
    approved_amount: number;
    pending_count: number;
    approved_count: number;
    rejected_count: number;
    category_breakdown: Record<string, number>;
}

const CATEGORIES = [
    { value: 'travel', label: 'Travel' },
    { value: 'food', label: 'Food & Dining' },
    { value: 'accommodation', label: 'Accommodation' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'software', label: 'Software' },
    { value: 'service', label: 'Services' },
    { value: 'other', label: 'Other' },
];

export default function Expenses() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [stats, setStats] = useState<ExpenseStats>({
        total_expenses: 0,
        pending_amount: 0,
        approved_amount: 0,
        pending_count: 0,
        approved_count: 0,
        rejected_count: 0,
        category_breakdown: {},
    });
    const [loading, setLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditingId, setIsEditingId] = useState<string | null>(null);
    // Current month is used for filtering but not in the current implementation
    const [currentMonth] = useState(new Date());
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filterProject, setFilterProject] = useState<string>('all');

    const resetForm = () => {
        setNewExpense({
            date: new Date().toISOString().split('T')[0] as string,
            project_id: '',
            project: '',
            category: 'other',
            amount: 0,
            description: '',
        });
    };

    const getCategoryLabel = (category: string): string => {
        return CATEGORIES.find(c => c.value === category)?.label || category;
    };

    const [newExpense, setNewExpense] = useState<Omit<Expense, 'id' | 'status' | 'created_at' | 'updated_at' | 'user_id' | 'user_name'>>({
        date: new Date().toISOString().split('T')[0] as string,
        project_id: '',
        project: '',
        category: 'other',
        amount: 0,
        description: '',
    });

    // Fetch projects
    useEffect(() => {
        fetchProjects();
    }, []);

    // Fetch expenses when month or filters change
    useEffect(() => {
        fetchExpenses();
    }, [currentMonth, filterStatus, filterCategory]);

    const fetchProjects = async () => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
            
            const response = await fetch(`${API_BASE_URL}/projects`, {
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Ensure data is an array before setting it
            if (Array.isArray(data)) {
                setProjects(data);
            } else if (data && typeof data === 'object' && Array.isArray(data.data)) {
                // Handle case where projects are nested in a data property
                setProjects(data.data);
            } else if (data && typeof data === 'object' && Array.isArray(data.projects)) {
                // Handle case where projects are nested in a projects property
                setProjects(data.projects);
            } else {
                console.warn('Unexpected projects data format:', data);
                setProjects([]);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
            toast.error('Failed to load projects. Please try again later.');
            setProjects([]);
        }
    };

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const monthStart = startOfMonth(currentMonth);
            const monthEnd = endOfMonth(currentMonth);

            const params = new URLSearchParams({
                startDate: formatISO(monthStart),
                endDate: formatISO(monthEnd),
            });

            if (filterStatus !== 'all') {
                params.append('status', filterStatus);
            }

            if (filterCategory !== 'all') {
                params.append('category', filterCategory);
            }

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
            
            const response = await fetch(`${API_BASE_URL}/expenses?${params.toString()}`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            
            if (response.ok) {
                const data = await response.json();
                const expensesList = data || [];
                setExpenses(expensesList);
                calculateStats(expensesList);
            } else {
                setExpenses([]);
            }
        } catch (error) {
            console.error('Error fetching expenses:', error);
            if (error instanceof Error && error.name !== 'AbortError') {
                toast.error('Error fetching expenses');
            }
            setExpenses([]);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (expensesList: Expense[]) => {
        const stats: ExpenseStats = {
            total_expenses: expensesList.length,
            pending_amount: 0,
            approved_amount: 0,
            pending_count: 0,
            approved_count: 0,
            rejected_count: 0,
            category_breakdown: {},
        };

        expensesList.forEach(exp => {
            // Status breakdown
            if (exp.status === 'pending') {
                stats.pending_amount += exp.amount;
                stats.pending_count++;
            } else if (exp.status === 'approved') {
                stats.approved_amount += exp.amount;
                stats.approved_count++;
            } else if (exp.status === 'rejected') {
                stats.rejected_count++;
            }

            // Category breakdown
            if (!stats.category_breakdown[exp.category]) {
                stats.category_breakdown[exp.category] = 0;
            }
            stats.category_breakdown[exp.category] += exp.amount;
        });

        setStats(stats);
    };

    const handleSaveExpense = async (expense: Omit<Expense, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'user_name'>) => {
        if (!expense) return;
        try {
            setLoading(true);

            const payload = {
                date: expense.date,
                project_id: expense.project_id || null,
                category: expense.category,
                amount: expense.amount,
                description: expense.description,
                status: 'pending',
            };

            const url = isEditingId
                ? `${API_BASE_URL}/expenses/${isEditingId}`
                : `${API_BASE_URL}/expenses`;

            const method = isEditingId ? 'PUT' : 'POST';

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (response.ok) {
                toast.success(isEditingId ? 'Expense updated' : 'Expense added');
                setIsDialogOpen(false);
                setIsEditingId(null);
                resetForm();
                fetchExpenses();
            } else {
                toast.error('Failed to save expense');
            }
        } catch (error) {
            console.error('Error saving expense:', error);
            if (error instanceof Error && error.name !== 'AbortError') {
                toast.error('Error saving expense');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAddExpense = async () => {
        if (!newExpense.description || newExpense.amount <= 0) {
            toast.error('Please fill in all required fields');
            return;
        }

        const expense: Omit<Expense, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'user_name'> = {
            date: newExpense.date,
            project_id: newExpense.project_id,
            project: projects.find(p => p.id === newExpense.project_id)?.name || '',
            category: newExpense.category as 'travel' | 'food' | 'accommodation' | 'equipment' | 'software' | 'service' | 'other',
            amount: Number(newExpense.amount),
            description: newExpense.description,
            status: 'pending'
        };

        await handleSaveExpense(expense);
    };

    const handleEditExpense = (expense: Expense) => {
        setIsEditingId(expense.id);
        setNewExpense({
            date: expense.date,
            project_id: expense.project_id || '',
            category: expense.category,
            amount: expense.amount,
            description: expense.description,
        });
        setIsDialogOpen(true);
    };

    const handleDeleteExpense = async (id: string) => {
        if (!confirm('Are you sure you want to delete this expense?')) return;

        try {
            setLoading(true);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

            const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
                method: 'DELETE',
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (response.ok) {
                toast.success('Expense deleted');
                fetchExpenses();
            } else {
                toast.error('Failed to delete expense');
            }
        } catch (error) {
            console.error('Error deleting expense:', error);
            if (error instanceof Error && error.name !== 'AbortError') {
                toast.error('Error deleting expense');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleApproveExpense = async (id: string) => {
        try {
            setLoading(true);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

            const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'approved' }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (response.ok) {
                toast.success('Expense approved');
                fetchExpenses();
            } else {
                toast.error('Failed to approve expense');
            }
        } catch (error) {
            console.error('Error approving expense:', error);
            if (error instanceof Error && error.name !== 'AbortError') {
                toast.error('Error approving expense');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRejectExpense = async (id: string) => {
        try {
            setLoading(true);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

            const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'rejected' }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (response.ok) {
                toast.success('Expense rejected');
                fetchExpenses();
            } else {
                toast.error('Failed to reject expense');
            }
        } catch (error) {
            console.error('Error rejecting expense:', error);
            if (error instanceof Error && error.name !== 'AbortError') {
                toast.error('Error rejecting expense');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        try {
            const csvContent = [
                ['Date', 'Project', 'Category', 'Amount', 'Description', 'Status'],
                ...expenses.map(e => [
                    e.date,
                    e.project || '',
                    e.category,
                    e.amount.toFixed(2),
                    e.description,
                    e.status,
                ]),
            ];

            const csv = csvContent.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `expenses_${format(currentMonth, 'yyyy-MM')}.csv`;
            a.click();

            toast.success('Expenses exported');
        } catch (error) {
            console.error('Error exporting expenses:', error);
            toast.error('Error exporting expenses');
        }
    };

    return (
        <ScrollContainer>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expenses</h1>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => {
                                setIsEditingId(null);
                                resetForm();
                            }}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Expense
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>{isEditingId ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                    <Input
                                        type="date"
                                        value={newExpense.date}
                                        onChange={(e) => setNewExpense(prev => ({ ...prev, date: e.target.value }))}
                                    />
                                </div>

                                <div>
                                     <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                                     <Select value={newExpense.project_id || 'none'} onValueChange={(val) => setNewExpense(prev => ({ ...prev, project_id: val === 'none' ? '' : val }))}>
                                         <SelectTrigger>
                                             <SelectValue placeholder="Select project (optional)" />
                                         </SelectTrigger>
                                         <SelectContent>
                                             <SelectItem value="none">None</SelectItem>
                                             {Array.isArray(projects) && projects.length > 0 ? (
                                                 projects.map(project => (
                                                     <SelectItem key={project.id} value={project.id}>
                                                         <div className="flex items-center gap-2">
                                                             {project.code && <span className="font-bold text-blue-600">[{project.code}]</span>}
                                                             <span>{project.name}</span>
                                                             {project.projectManager && <span className="text-gray-500 text-xs">({project.projectManager})</span>}
                                                         </div>
                                                     </SelectItem>
                                                 ))
                                             ) : (
                                                 <SelectItem value="no-projects" disabled>
                                                     No projects available
                                                 </SelectItem>
                                             )}
                                         </SelectContent>
                                     </Select>
                                 </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <Select value={newExpense.category} onValueChange={(val: any) => setNewExpense(prev => ({ ...prev, category: val }))}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CATEGORIES.map(cat => (
                                                <SelectItem key={cat.value} value={cat.value}>
                                                    {cat.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={newExpense.amount}
                                        onChange={(e) => setNewExpense(prev => ({ ...prev, amount: parseCurrency(e.target.value) }))}
                                        placeholder="0.00"
                                        onBlur={(e) => {
                                            const value = parseCurrency(e.target.value);
                                            setNewExpense(prev => ({ ...prev, amount: value }));
                                        }}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        value={newExpense.description}
                                        onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Enter expense description"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                        rows={3}
                                    />
                                </div>

                                <div className="flex justify-end space-x-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setIsDialogOpen(false);
                                            setIsEditingId(null);
                                            resetForm();
                                        }}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button onClick={handleAddExpense} disabled={loading}>
                                        {loading ? 'Saving...' : isEditingId ? 'Update' : 'Add'} Expense
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.total_expenses)}</p>
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
                                <p className="text-2xl font-bold text-orange-900">{formatCurrency(stats.pending_amount)}</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-orange-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Approved</p>
                                <p className="text-2xl font-bold text-green-900">{formatCurrency(stats.approved_amount)}</p>
                            </div>
                            <Check className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pending Count</p>
                                <p className="text-2xl font-bold text-red-900">{stats.pending_count}</p>
                            </div>
                            <X className="h-8 w-8 text-red-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Select value={filterStatus} onValueChange={(val: any) => setFilterStatus(val)}>
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={filterCategory} onValueChange={setFilterCategory}>
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {CATEGORIES.map(cat => (
                                    <SelectItem key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={filterProject} onValueChange={setFilterProject}>
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Projects</SelectItem>
                                {projects.map(project => (
                                    <SelectItem key={project.id} value={project.id}>
                                        <div className="flex items-center gap-2">
                                            {project.code && <span className="text-xs font-bold text-blue-600">[{project.code}]</span>}
                                            {project.name.length > 20 ? project.name.substring(0, 20) + '...' : project.name}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Expenses List */}
            <Tabs defaultValue="list">
                <TabsList>
                    <TabsTrigger value="list">List View</TabsTrigger>
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                </TabsList>

                <TabsContent value="list">
                    <Card>
                        <CardHeader>
                            <CardTitle>Expenses for {format(currentMonth, 'MMMM yyyy')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="text-center py-8 text-gray-500">Loading...</div>
                            ) : expenses.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">No expenses found</div>
                            ) : (
                                <div className="space-y-4">
                                    {expenses.map((expense) => (
                                        <div
                                            key={expense.id}
                                            className={`flex items-center justify-between p-4 border rounded-lg ${expense.status === 'approved' ? 'border-green-200 bg-green-50' :
                                                expense.status === 'rejected' ? 'border-red-200 bg-red-50' :
                                                    'border-gray-200'
                                                }`}
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-4">
                                                    <div className="text-sm font-medium text-gray-900">{expense.description}</div>
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {getCategoryLabel(expense.category)}
                                                    </span>
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${expense.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                        expense.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {expense.status}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-600 mt-1">
                                                    {expense.project && <span>{expense.project}</span>}
                                                    <span className="mx-2">•</span>
                                                    <span>{expense.date}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-gray-900">{formatCurrency(expense.amount)}</p>
                                                </div>
                                                <div className="flex space-x-2">
                                                    {expense.status === 'pending' && (
                                                        <>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleApproveExpense(expense.id)}
                                                                disabled={loading}
                                                            >
                                                                <Check className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleRejectExpense(expense.id)}
                                                                disabled={loading}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleEditExpense(expense)}
                                                        disabled={loading}
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDeleteExpense(expense.id)}
                                                        disabled={loading}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="summary" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Category Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {Object.entries(stats.category_breakdown).map(([category, amount]) => (
                                        <div key={category} className="flex items-center justify-between p-3 border rounded">
                                            <span className="text-sm font-medium">{getCategoryLabel(category)}</span>
                                            <span className="text-lg font-bold">{formatCurrency(amount)}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Project-wise Expenses</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {expenses.length === 0 ? (
                                        <p className="text-sm text-gray-500 text-center py-4">No expenses to display</p>
                                    ) : (
                                        (() => {
                                            const projectExpenses: Record<string, number> = {};
                                            expenses.forEach(exp => {
                                                const projectName = exp.project || 'Unassigned';
                                                projectExpenses[projectName] = (projectExpenses[projectName] || 0) + exp.amount;
                                            });
                                            return Object.entries(projectExpenses).map(([project, amount]) => (
                                                <div key={project} className="flex items-center justify-between p-3 border rounded">
                                                    <span className="text-sm font-medium truncate" title={project}>{project}</span>
                                                    <span className="text-lg font-bold">{formatCurrency(amount)}</span>
                                                </div>
                                            ));
                                        })()
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
            </div>
        </ScrollContainer>
    );
}
