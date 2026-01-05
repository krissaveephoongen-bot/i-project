import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Plus,
    X,
    Edit2,
    Trash2,
    ChevronDown,
    ChevronUp,
    DollarSign,
    Calendar,
    Check,
} from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';
import ErrorState from '@/components/ErrorState';
import LoadingState from '@/components/LoadingState';
import EmptyState from '@/components/EmptyState';
import { parseApiError } from '@/lib/error-handler';

interface BillingPhase {
    id: string;
    project_id: string;
    phase_number: number;
    description: string;
    amount: number;
    percentage_of_total: number;
    currency: string;
    planned_delivery_date: string;
    actual_delivery_date?: string;
    planned_payment_date: string;
    actual_payment_date?: string;
    status: 'pending' | 'in-progress' | 'delivered' | 'invoiced' | 'paid' | 'overdue' | 'cancelled';
    deliverables?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

interface BillingSummary {
    project_id: string;
    project_code: string;
    project_name: string;
    total_contract_value: number;
    total_phases: number;
    total_billing_amount: number;
    pending_amount: number;
    invoiced_amount: number;
    paid_amount: number;
    overdue_amount: number;
    delivered_phases: number;
    paid_phases: number;
    total_paid_invoices: number;
    total_balance_due: number;
}

interface ProjectBillingProps {
    projectId: string;
    projectName?: string;
    contractAmount?: number;
}

const statusColors: Record<string, string> = {
    pending: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
    'in-progress': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    delivered: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    invoiced: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
    paid: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    overdue: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
    cancelled: 'bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-gray-100',
};

export default function ProjectBilling({
    projectId,
    projectName = 'Project',
    contractAmount = 0,
}: ProjectBillingProps) {
    const [phases, setPhases] = useState<BillingPhase[]>([]);
    const [summary, setSummary] = useState<BillingSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPhase, setEditingPhase] = useState<BillingPhase | null>(null);
    const [expandedPhase, setExpandedPhase] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        phase_number: '',
        description: '',
        amount: '',
        percentage_of_total: '',
        currency: 'THB',
        planned_delivery_date: '',
        actual_delivery_date: '',
        planned_payment_date: '',
        actual_payment_date: '',
        status: 'pending',
        deliverables: '',
        notes: '',
    });

    // Fetch data
    useEffect(() => {
        fetchPhases();
        fetchSummary();
    }, [projectId]);

    const fetchPhases = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
            const response = await fetch(
                `${apiUrl}/projects/${projectId}/billing-phases`,
                { credentials: 'include' }
            );

            if (!response.ok) throw new Error('Failed to fetch phases');

            const data = await response.json();
            setPhases(Array.isArray(data.data) ? data.data : []);
        } catch (err) {
            console.error('Error fetching phases:', err);
            setError(parseApiError(err));
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSummary = async () => {
        try {
            setError(null);
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
            const response = await fetch(
                `${apiUrl}/projects/${projectId}/billing-summary`,
                { credentials: 'include' }
            );

            if (!response.ok) throw new Error('Failed to fetch summary');

            const data = await response.json();
            setSummary(data.data);
        } catch (err) {
            console.error('Error fetching summary:', err);
            setError(parseApiError(err));
        }
    };

    const handleCreateOrUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

            const payload = {
                phase_number: parseInt(formData.phase_number),
                description: formData.description,
                amount: parseFloat(formData.amount),
                percentage_of_total: formData.percentage_of_total ? parseFloat(formData.percentage_of_total) : null,
                currency: formData.currency,
                planned_delivery_date: formData.planned_delivery_date || null,
                actual_delivery_date: formData.actual_delivery_date || null,
                planned_payment_date: formData.planned_payment_date || null,
                actual_payment_date: formData.actual_payment_date || null,
                status: formData.status,
                deliverables: formData.deliverables || null,
                notes: formData.notes || null,
            };

            if (editingPhase) {
                // Update phase
                const response = await fetch(
                    `${apiUrl}/billing-phases/${editingPhase.id}`,
                    {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify(payload),
                    }
                );

                if (!response.ok) throw new Error('Failed to update phase');
            } else {
                // Create phase
                const response = await fetch(
                    `${apiUrl}/projects/${projectId}/billing-phases`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify(payload),
                    }
                );

                if (!response.ok) throw new Error('Failed to create phase');
            }

            setIsModalOpen(false);
            setEditingPhase(null);
            setFormData({
                phase_number: '',
                description: '',
                amount: '',
                percentage_of_total: '',
                currency: 'THB',
                planned_delivery_date: '',
                actual_delivery_date: '',
                planned_payment_date: '',
                actual_payment_date: '',
                status: 'pending',
                deliverables: '',
                notes: '',
            });

            fetchPhases();
            fetchSummary();
        } catch (error) {
            console.error('Error saving phase:', error);
        }
    };

    const handleDelete = async (phaseId: string) => {
        if (!window.confirm('Are you sure you want to delete this billing phase?')) return;

        try {
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

            const response = await fetch(`${apiUrl}/billing-phases/${phaseId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) throw new Error('Failed to delete phase');

            fetchPhases();
            fetchSummary();
        } catch (error) {
            console.error('Error deleting phase:', error);
        }
    };

    const handleEdit = (phase: BillingPhase) => {
        setEditingPhase(phase);
        setFormData({
            phase_number: phase.phase_number.toString(),
            description: phase.description,
            amount: phase.amount.toString(),
            percentage_of_total: phase.percentage_of_total?.toString() || '',
            currency: phase.currency,
            planned_delivery_date: phase.planned_delivery_date
                ? new Date(phase.planned_delivery_date).toISOString().split('T')[0]
                : '',
            actual_delivery_date: phase.actual_delivery_date
                ? new Date(phase.actual_delivery_date).toISOString().split('T')[0]
                : '',
            planned_payment_date: phase.planned_payment_date
                ? new Date(phase.planned_payment_date).toISOString().split('T')[0]
                : '',
            actual_payment_date: phase.actual_payment_date
                ? new Date(phase.actual_payment_date).toISOString().split('T')[0]
                : '',
            status: phase.status,
            deliverables: phase.deliverables || '',
            notes: phase.notes || '',
        });
        setIsModalOpen(true);
    };

    const formatDate = (date: string | undefined) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const calculateAutoPercentage = (amount: string) => {
        if (!amount || !contractAmount) return '';
        return ((parseFloat(amount) / contractAmount) * 100).toFixed(2);
    };

    if (isLoading) {
        return <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />;
    }

    if (error && !isLoading) {
        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Billing - {projectName}</h2>
                <ErrorState 
                    error={error}
                    onRetry={() => {
                        setError(null);
                        fetchPhases();
                        fetchSummary();
                    }}
                />
            </div>
        );
    }

    if (isLoading && phases.length === 0) {
        return <LoadingState />;
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
                                    Total Phases
                                </p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {summary.total_phases}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-green-200 dark:border-green-800">
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-sm text-green-600 dark:text-green-400">
                                    Paid Amount
                                </p>
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {formatCurrency(summary.paid_amount || 0)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-yellow-200 dark:border-yellow-800">
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                                    Invoiced
                                </p>
                                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                    {formatCurrency(summary.invoiced_amount || 0)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-orange-200 dark:border-orange-800">
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-sm text-orange-600 dark:text-orange-400">
                                    Balance Due
                                </p>
                                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                    {formatCurrency(summary.total_balance_due || 0)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-red-200 dark:border-red-800">
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-sm text-red-600 dark:text-red-400">
                                    Overdue
                                </p>
                                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                    {formatCurrency(summary.overdue_amount || 0)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Billing Phases Table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle>Billing Phases - {projectName}</CardTitle>
                    <Button onClick={() => setIsModalOpen(true)} className="gap-2">
                        <Plus className="h-4 w-4" />
                        New Phase
                    </Button>
                </CardHeader>

                <CardContent>
                    {phases.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            No billing phases created yet
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {phases.map((phase) => (
                                <div
                                    key={phase.id}
                                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <div
                                        className="flex items-center justify-between cursor-pointer"
                                        onClick={() =>
                                            setExpandedPhase(
                                                expandedPhase === phase.id ? null : phase.id
                                            )
                                        }
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <div className="text-sm font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded">
                                                    Phase {phase.phase_number}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                                        {phase.description}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {formatCurrency(phase.amount)} (
                                                        {phase.percentage_of_total?.toFixed(1)}%)
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 ml-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[phase.status]}`}
                                            >
                                                {phase.status}
                                            </span>
                                            <button
                                                onClick={(e) => e.stopPropagation()}
                                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                            >
                                                {expandedPhase === phase.id ? (
                                                    <ChevronUp className="h-4 w-4" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    {expandedPhase === phase.id && (
                                        <div className="mt-4 space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                                            {/* Timeline */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                        📦 Planned Delivery
                                                    </p>
                                                    <p className="text-gray-900 dark:text-white">
                                                        {formatDate(phase.planned_delivery_date)}
                                                    </p>
                                                    {phase.actual_delivery_date && (
                                                        <>
                                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-2">
                                                                ✓ Actual Delivery
                                                            </p>
                                                            <p className="text-green-600 dark:text-green-400">
                                                                {formatDate(phase.actual_delivery_date)}
                                                            </p>
                                                        </>
                                                    )}
                                                </div>

                                                <div>
                                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                        💰 Planned Payment
                                                    </p>
                                                    <p className="text-gray-900 dark:text-white">
                                                        {formatDate(phase.planned_payment_date)}
                                                    </p>
                                                    {phase.actual_payment_date && (
                                                        <>
                                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-2">
                                                                ✓ Actual Payment
                                                            </p>
                                                            <p className="text-green-600 dark:text-green-400">
                                                                {formatDate(phase.actual_payment_date)}
                                                            </p>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {phase.deliverables && (
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                        Deliverables
                                                    </p>
                                                    <p className="text-gray-900 dark:text-white">
                                                        {phase.deliverables}
                                                    </p>
                                                </div>
                                            )}

                                            {phase.notes && (
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                        Notes
                                                    </p>
                                                    <p className="text-gray-900 dark:text-white">
                                                        {phase.notes}
                                                    </p>
                                                </div>
                                            )}

                                            <div className="flex gap-2 pt-4">
                                                <button
                                                    onClick={() => handleEdit(phase)}
                                                    className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
                                                >
                                                    <Edit2 className="h-4 w-4 inline mr-1" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(phase.id)}
                                                    className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm"
                                                >
                                                    <Trash2 className="h-4 w-4 inline mr-1" />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <CardTitle>
                                {editingPhase ? 'Edit Billing Phase' : 'Create New Billing Phase'}
                            </CardTitle>
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setEditingPhase(null);
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
                                            Phase Number
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.phase_number}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    phase_number: e.target.value,
                                                })
                                            }
                                            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">
                                            Currency
                                        </label>
                                        <select
                                            value={formData.currency}
                                            onChange={(e) =>
                                                setFormData({ ...formData, currency: e.target.value })
                                            }
                                            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="THB">THB</option>
                                            <option value="USD">USD</option>
                                            <option value="EUR">EUR</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700">
                                        Description
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.description}
                                        onChange={(e) =>
                                            setFormData({ ...formData, description: e.target.value })
                                        }
                                        className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">
                                            Amount
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.amount}
                                            onChange={(e) => {
                                                const amount = e.target.value;
                                                setFormData({
                                                    ...formData,
                                                    amount,
                                                    percentage_of_total: calculateAutoPercentage(amount),
                                                });
                                            }}
                                            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">
                                            % of Total
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="100"
                                            value={formData.percentage_of_total}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    percentage_of_total: e.target.value,
                                                })
                                            }
                                            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">
                                            Planned Delivery Date
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.planned_delivery_date}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    planned_delivery_date: e.target.value,
                                                })
                                            }
                                            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">
                                            Actual Delivery Date
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.actual_delivery_date}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    actual_delivery_date: e.target.value,
                                                })
                                            }
                                            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">
                                            Planned Payment Date
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.planned_payment_date}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    planned_payment_date: e.target.value,
                                                })
                                            }
                                            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">
                                            Actual Payment Date
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.actual_payment_date}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    actual_payment_date: e.target.value,
                                                })
                                            }
                                            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700">
                                        Status
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) =>
                                            setFormData({ ...formData, status: e.target.value })
                                        }
                                        className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="invoiced">Invoiced</option>
                                        <option value="paid">Paid</option>
                                        <option value="overdue">Overdue</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700">
                                        Deliverables
                                    </label>
                                    <textarea
                                        value={formData.deliverables}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                deliverables: e.target.value,
                                            })
                                        }
                                        rows={2}
                                        className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700">
                                        Notes
                                    </label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) =>
                                            setFormData({ ...formData, notes: e.target.value })
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
                                        {editingPhase ? 'Update Phase' : 'Create Phase'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            setEditingPhase(null);
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
