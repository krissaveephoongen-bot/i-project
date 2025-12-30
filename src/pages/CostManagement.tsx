import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, Check, X, DollarSign, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { buildApiUrl } from '@/lib/api-config';
// // import { costService } from '@/services/costService'; // Uncomment when API integration is needed // Uncomment when needed
import { useAuth } from '@/contexts/AuthContext';
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

interface Expense {
    id: string;
    projectId: string;
    projectName: string;
    category: string;
    description: string;
    amount: number;
    date: string;
    submittedBy: string;
    status: 'pending' | 'approved' | 'rejected';
    invoiceNumber?: string;
}



const CATEGORIES = [
    'Labor',
    'Software',
    'Hardware',
    'Services',
    'Travel',
    'Training',
    'Office',
    'Other'
];



const COLORS = [
    '#3B82F6', // blue-500
    '#10B981', // emerald-500
    '#F59E0B', // amber-500
    '#8B5CF6', // violet-500
    '#EC4899', // pink-500
    '#06B6D4', // cyan-500
    '#F97316', // orange-500
    '#64748B'  // slate-500
];

// Remove hardcoded initial data - will fetch from API

export default function CostManagement() {
    const { currentUser } = useAuth();
    const userEmail = currentUser?.email || 'user@example.com';

    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [newCost, setNewCost] = useState<Omit<Expense, 'id'>>(() => {
        return {
            projectId: '1',
            projectName: 'Default Project',
            category: CATEGORIES[0] || 'Other',
            description: '',
            amount: 0,
            date: new Date().toISOString().split('T')[0] || '',
            submittedBy: userEmail,
            status: 'pending' as const
        };
    });

    useEffect(() => {
        const fetchCosts = async () => {
            try {
                setIsLoading(true);
                const token = localStorage.getItem('accessToken');
                const response = await fetch(buildApiUrl('/prisma/costs'), {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch costs');
                }

                const result = await response.json();

                // Transform API response to match Expense interface
                const transformedExpenses: Expense[] = result.data.map((cost: any) => ({
                    id: cost.id,
                    projectId: cost.projectId,
                    projectName: cost.project?.name || 'Unknown Project',
                    category: cost.category,
                    description: cost.description,
                    amount: cost.amount,
                    date: new Date(cost.date).toISOString().split('T')[0],
                    submittedBy: cost.submitted?.email || cost.submittedBy,
                    status: cost.status === 'approved' ? 'approved' : cost.status === 'rejected' ? 'rejected' : 'pending',
                    invoiceNumber: cost.invoiceNumber
                }));

                setExpenses(transformedExpenses);
                setError(null);
            } catch (err) {
                console.error('Error fetching costs:', err);
                const errorMsg = 'ไม่สามารถโหลดข้อมูลค่าใช้จ่ายได้';
                setError(errorMsg);
                toast.error(errorMsg);
                setExpenses([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCosts();
    }, []);

    const handleAddCost = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newCost.description || !newCost.amount || !newCost.category || !newCost.projectId) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(buildApiUrl('/prisma/costs'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    projectId: newCost.projectId,
                    description: newCost.description,
                    amount: newCost.amount,
                    category: newCost.category,
                    date: newCost.date,
                    submittedBy: userEmail,
                    invoiceNumber: newCost.invoiceNumber
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to add expense');
            }

            const result = await response.json();

            // Add new expense to list
            const newExpense: Expense = {
                id: result.data.id,
                projectId: result.data.projectId,
                projectName: result.data.project?.name || newCost.projectName,
                category: result.data.category,
                description: result.data.description,
                amount: result.data.amount,
                date: result.data.date ? new Date(result.data.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                submittedBy: userEmail,
                status: 'pending',
                invoiceNumber: result.data.invoiceNumber
            };

            setExpenses(prev => [...prev, newExpense]);
            setNewCost({
                projectId: '1',
                projectName: 'Default Project',
                category: CATEGORIES[0] || 'Other',
                description: '',
                amount: 0,
                date: new Date().toISOString().split('T')[0] || '',
                submittedBy: userEmail,
                status: 'pending' as const
            });
            setIsDialogOpen(false);

            toast.success('Expense added successfully');

        } catch (err) {
            console.error('Error adding cost:', err);
            const errorMsg = err instanceof Error ? err.message : 'Failed to add expense. Please try again.';
            toast.error(errorMsg);
        }
    };

    const handleApproveExpense = async (expenseId: string) => {
        try {
            const token = localStorage.getItem('accessToken');
            const currentUser = localStorage.getItem('currentUserId');

            const response = await fetch(buildApiUrl(`/prisma/costs/${expenseId}/approve`), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    approvedBy: currentUser,
                    approvalStatus: 'approved'
                })
            });

            if (!response.ok) {
                throw new Error('Failed to approve expense');
            }

            setExpenses(prev =>
                prev.map(expense =>
                    expense.id === expenseId ? { ...expense, status: 'approved' as const } : expense
                )
            );
            toast.success('Expense approved');
        } catch (err) {
            console.error('Error approving expense:', err);
            toast.error('Failed to approve expense');
        }
    };

    const handleRejectExpense = async (expenseId: string) => {
        try {
            const token = localStorage.getItem('accessToken');
            const currentUser = localStorage.getItem('currentUserId');

            const response = await fetch(buildApiUrl(`/prisma/costs/${expenseId}/approve`), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    approvedBy: currentUser,
                    approvalStatus: 'rejected'
                })
            });

            if (!response.ok) {
                throw new Error('Failed to reject expense');
            }

            setExpenses(prev =>
                prev.map(expense =>
                    expense.id === expenseId ? { ...expense, status: 'rejected' as const } : expense
                )
            );
            toast.success('Expense rejected');
        } catch (err) {
            console.error('Error rejecting expense:', err);
            toast.error('Failed to reject expense');
        }
    };

    const filteredExpenses = useMemo(() => {
        return expenses.filter((expense) => {
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch =
                expense.description.toLowerCase().includes(searchLower) ||
                expense.category.toLowerCase().includes(searchLower);
            const matchesStatus = statusFilter === 'all' || expense.status === statusFilter;
            const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;

            return matchesSearch && matchesStatus && matchesCategory;
        });
    }, [expenses, searchQuery, statusFilter, categoryFilter]);

    const summary = useMemo(() => {
        const totalBudget = 200000;
        const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const pendingExpenses = expenses.filter(exp => exp.status === 'pending');
        const pendingApproval = pendingExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        const pendingCount = pendingExpenses.length;
        const remainingBudget = totalBudget - totalSpent;

        const categories = [...new Set(expenses.map(exp => exp.category))];
        const byCategory = categories.map(category => {
            const categoryExpenses = expenses.filter(exp => exp.category === category);
            const amount = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
            return {
                category,
                amount,
                percentage: Math.round((amount / (totalSpent || 1)) * 100)
            };
        });

        return {
            totalBudget,
            totalSpent,
            pendingApproval,
            pendingCount,
            remainingBudget,
            byCategory
        };
    }, [expenses]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'rejected':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'pending':
            default:
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                        <div>
                            <h2 className="text-lg font-semibold text-red-900 dark:text-red-200">Error Loading Cost Management</h2>
                            <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Cost Management</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Expense
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Add New Expense</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddCost} className="space-y-4">
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="description" className="text-right">
                                        Description
                                    </Label>
                                    <Input
                                        id="description"
                                        value={newCost.description}
                                        onChange={(e) => setNewCost({ ...newCost, description: e.target.value })}
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="amount" className="text-right">
                                        Amount
                                    </Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        value={newCost.amount || ''}
                                        onChange={(e) => setNewCost({ ...newCost, amount: Number(e.target.value) })}
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="category" className="text-right">
                                        Category
                                    </Label>
                                    <Select
                                        value={newCost.category}
                                        onValueChange={(value) => setNewCost({ ...newCost, category: value })}
                                    >
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CATEGORIES.map((category) => (
                                                <SelectItem key={category} value={category}>
                                                    {category}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="secondary" onClick={() => setIsDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">Save</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Budget</p>
                                <p className="text-xl font-bold">{formatCurrency(summary.totalBudget)}</p>
                            </div>
                            <div className="p-2 rounded-full bg-blue-100">
                                <DollarSign className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Spent</p>
                                <p className="text-xl font-bold">{formatCurrency(summary.totalSpent)}</p>
                                <p className="text-xs text-gray-500">
                                    {Math.round((summary.totalSpent / summary.totalBudget) * 100)}% of budget
                                </p>
                            </div>
                            <div className="p-2 rounded-full bg-green-100">
                                <DollarSign className="h-5 w-5 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Pending Approval</p>
                                <p className="text-xl font-bold">{formatCurrency(summary.pendingApproval)}</p>
                                <p className="text-xs text-gray-500">{summary.pendingCount} expenses</p>
                            </div>
                            <div className="p-2 rounded-full bg-amber-100">
                                <AlertCircle className="h-5 w-5 text-amber-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Remaining Budget</p>
                                <p className="text-xl font-bold">{formatCurrency(summary.remainingBudget)}</p>
                                <p className="text-xs text-gray-500">
                                    {Math.round((summary.remainingBudget / summary.totalBudget) * 100)}% remaining
                                </p>
                            </div>
                            <div className="p-2 rounded-full bg-emerald-100">
                                <DollarSign className="h-5 w-5 text-emerald-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Expenses List */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardContent className="p-0">
                            <div className="p-4 border-b">
                                <h2 className="text-lg font-semibold">Expense List</h2>
                            </div>

                            <div className="p-4 border-b">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                        <Input
                                            type="search"
                                            placeholder="Search expenses..."
                                            className="pl-9"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Filter by status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Status</SelectItem>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="approved">Approved</SelectItem>
                                                <SelectItem value="rejected">Rejected</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Filter by category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Categories</SelectItem>
                                                {CATEGORIES.map((category) => (
                                                    <SelectItem key={category} value={category}>
                                                        {category}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <th className="px-6 py-3">Description</th>
                                            <th className="px-6 py-3">Category</th>
                                            <th className="px-6 py-3 text-right">Amount</th>
                                            <th className="px-6 py-3">Status</th>
                                            <th className="px-6 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredExpenses.map((expense) => (
                                            <tr key={expense.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{expense.description}</div>
                                                    <div className="text-xs text-gray-500">{expense.date}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                        {expense.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                                    {formatCurrency(expense.amount)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(expense.status)}`}>
                                                        {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    {expense.status === 'pending' && (
                                                        <div className="flex justify-end space-x-2">
                                                            <Button
                                                                variant="secondary"
                                                                size="sm"
                                                                className="h-8"
                                                                onClick={() => handleApproveExpense(expense.id)}
                                                            >
                                                                <Check className="h-4 w-4 mr-1" />
                                                                Approve
                                                            </Button>
                                                            <Button
                                                                variant="secondary"
                                                                size="sm"
                                                                className="h-8"
                                                                onClick={() => handleRejectExpense(expense.id)}
                                                            >
                                                                <X className="h-4 w-4 mr-1" />
                                                                Reject
                                                            </Button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredExpenses.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                                                    No expenses found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Cost by Category Chart */}
                <div className="lg:col-span-1">
                    <Card>
                        <CardContent className="p-4">
                            <h2 className="text-lg font-semibold mb-4">Cost by Category</h2>
                            <div className="mb-4">
                                <p className="text-sm text-gray-500 mb-1">Over Budget Items</p>
                                <div className="flex items-center">
                                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                                    <p className="text-2xl font-bold text-red-600">{filteredExpenses.filter(e => e.status === 'pending').length}</p>
                                </div>
                            </div>
                            <div className="h-64">
                                <Doughnut
                                    data={{
                                        labels: summary.byCategory.map(item => item.category),
                                        datasets: [{
                                            data: summary.byCategory.map(item => item.amount),
                                            backgroundColor: COLORS,
                                            borderWidth: 0
                                        }]
                                    }}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: 'right',
                                                labels: {
                                                    boxWidth: 10,
                                                    padding: 15
                                                }
                                            }
                                        },
                                        cutout: '70%'
                                    }}
                                />
                            </div>
                            <div className="mt-4 space-y-2">
                                {summary.byCategory.map((item, index) => (
                                    <div key={item.category} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div
                                                className="w-3 h-3 rounded-full mr-2"
                                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                            />
                                            <span className="text-sm">{item.category}</span>
                                        </div>
                                        <span className="text-sm font-medium">
                                            {formatCurrency(item.amount)} ({item.percentage}%)
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6">
                                <h3 className="text-lg font-semibold mb-4">Recent Expenses</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="text-left text-sm text-gray-500">
                                                <th className="pb-3 font-medium">Project</th>
                                                <th className="pb-3 font-medium">Category</th>
                                                <th className="pb-3 font-medium text-right">Date</th>
                                                <th className="pb-3 font-medium text-right">Amount</th>
                                                <th className="pb-3 font-medium text-right">Status</th>
                                                <th className="pb-3 font-medium text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredExpenses.map((cost: Expense) => (
                                                <tr
                                                    key={cost.id}
                                                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                                >
                                                    <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{cost.projectName}</td>
                                                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{cost.category}</td>
                                                    <td className="py-3 px-4 text-right text-gray-900 dark:text-white font-medium">
                                                        {new Date(cost.date).toLocaleDateString()}
                                                    </td>
                                                    <td className="py-3 px-4 text-right text-gray-900 dark:text-white font-medium">
                                                        {formatCurrency(cost.amount)}
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(cost.status)}`}>
                                                            {cost.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        {cost.status === 'pending' && (
                                                            <div className="flex gap-2 justify-end">
                                                                <Button
                                                                    variant="secondary"
                                                                    size="sm"
                                                                    className="h-8 px-2 text-green-600 hover:bg-green-50"
                                                                    onClick={() => handleApproveExpense(cost.id)}
                                                                >
                                                                    <Check className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="secondary"
                                                                    size="sm"
                                                                    className="h-8 px-2 text-red-600 hover:bg-red-50"
                                                                    onClick={() => handleRejectExpense(cost.id)}
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
