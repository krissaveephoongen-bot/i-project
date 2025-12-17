/**
 * Expense Tracking Component
 * Submit expenses with approval workflow
 */

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle, XCircle, Eye } from 'lucide-react';
import { toast } from 'sonner';
import expenseService from '../../services/expenseService';
import './ExpenseTracking.css';

const EXPENSE_CATEGORIES = [
    'travel',
    'food',
    'accommodation',
    'equipment',
    'software',
    'service',
    'other'
];

function ExpenseTracking({ projectId, userRole = 'member' }) {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [filterStatus, setFilterStatus] = useState('');
    const [approvalNotes, setApprovalNotes] = useState('');

    const [formData, setFormData] = useState({
        amount: '',
        category: 'other',
        description: '',
        receiptUrl: '',
        expenseDate: new Date().toISOString().split('T')[0]
    });

    // Load expenses on mount
    useEffect(() => {
        loadExpenses();
    }, [projectId, filterStatus]);

    async function loadExpenses() {
        try {
            setLoading(true);
            const filters = {
                projectId,
                ...(filterStatus && { status: filterStatus })
            };
            const response = await expenseService.getExpenses(filters);
            setExpenses(response.expenses || []);
        } catch (error) {
            toast.error('Failed to load expenses');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    function handleInputChange(e) {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!formData.amount || !formData.category || !formData.expenseDate) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            await expenseService.submitExpense({
                ...formData,
                projectId,
                amount: parseFloat(formData.amount)
            });
            toast.success('Expense submitted successfully');
            setFormData({
                amount: '',
                category: 'other',
                description: '',
                receiptUrl: '',
                expenseDate: new Date().toISOString().split('T')[0]
            });
            setShowForm(false);
            await loadExpenses();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to submit expense');
        }
    }

    async function handleDeleteExpense(expenseId) {
        if (!window.confirm('Are you sure you want to delete this expense?')) {
            return;
        }

        try {
            await expenseService.deleteExpense(expenseId);
            toast.success('Expense deleted successfully');
            await loadExpenses();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to delete expense');
        }
    }

    async function handleApprove() {
        if (!selectedExpense) return;

        try {
            await expenseService.approveExpense(selectedExpense.id, approvalNotes);
            toast.success('Expense approved');
            setShowApprovalModal(false);
            setApprovalNotes('');
            await loadExpenses();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to approve expense');
        }
    }

    async function handleReject() {
        if (!selectedExpense) return;

        if (!approvalNotes.trim()) {
            toast.error('Rejection reason is required');
            return;
        }

        try {
            await expenseService.rejectExpense(selectedExpense.id, approvalNotes);
            toast.success('Expense rejected');
            setShowApprovalModal(false);
            setApprovalNotes('');
            await loadExpenses();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to reject expense');
        }
    }

    function openApprovalModal(expense) {
        setSelectedExpense(expense);
        setApprovalNotes('');
        setShowApprovalModal(true);
    }

    function getStatusColor(status) {
        const colors = {
            'pending': '#F59E0B',
            'approved': '#10B981',
            'rejected': '#EF4444'
        };
        return colors[status] || '#6B7280';
    }

    const isManager = userRole === 'manager' || userRole === 'admin';

    return (
        <div className="expense-tracking">
            <div className="expense-header">
                <h2>Expense Tracking</h2>
                <button
                    onClick={() => setShowForm(true)}
                    className="btn btn-primary"
                >
                    <Plus size={18} /> Submit Expense
                </button>
            </div>

            {/* Filter */}
            <div className="expense-filter">
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="filter-select"
                >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>

            {/* Expense Form */}
            {showForm && (
                <div className="expense-form-container">
                    <form onSubmit={handleSubmit} className="expense-form">
                        <h3>Submit New Expense</h3>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Amount (THB) *</label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleInputChange}
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Category *</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    required
                                >
                                    {EXPENSE_CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>
                                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Date *</label>
                                <input
                                    type="date"
                                    name="expenseDate"
                                    value={formData.expenseDate}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Receipt URL</label>
                                <input
                                    type="url"
                                    name="receiptUrl"
                                    value={formData.receiptUrl}
                                    onChange={handleInputChange}
                                    placeholder="https://..."
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Enter expense details"
                                rows="3"
                            />
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="btn btn-secondary"
                            >
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary">
                                Submit Expense
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Expenses List */}
            {loading ? (
                <div className="loading">Loading expenses...</div>
            ) : expenses.length === 0 ? (
                <div className="empty-state">
                    <Eye size={48} />
                    <p>No expenses yet. Submit your first expense!</p>
                </div>
            ) : (
                <div className="expenses-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Category</th>
                                <th>Amount</th>
                                <th>Description</th>
                                <th>Status</th>
                                <th>Submitted By</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.map(expense => (
                                <tr key={expense.id}>
                                    <td>{new Date(expense.expense_date).toLocaleDateString()}</td>
                                    <td className="category-cell">{expense.category}</td>
                                    <td className="amount-cell">
                                        ฿{parseFloat(expense.amount).toLocaleString('th-TH', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}
                                    </td>
                                    <td>{expense.description || '-'}</td>
                                    <td>
                                        <span
                                            className="badge-status"
                                            style={{ backgroundColor: getStatusColor(expense.status) }}
                                        >
                                            {expense.status}
                                        </span>
                                    </td>
                                    <td>{expense.submitted_by}</td>
                                    <td className="actions-cell">
                                        {isManager && expense.status === 'pending' && (
                                            <button
                                                onClick={() => openApprovalModal(expense)}
                                                className="btn-icon btn-info"
                                                title="Review"
                                            >
                                                <Eye size={16} />
                                            </button>
                                        )}
                                        {expense.status === 'pending' && (
                                            <button
                                                onClick={() => handleDeleteExpense(expense.id)}
                                                className="btn-icon btn-danger"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Approval Modal */}
            {showApprovalModal && selectedExpense && (
                <div className="modal-overlay" onClick={() => setShowApprovalModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Review Expense</h3>
                        <div className="expense-details">
                            <p>
                                <strong>Amount:</strong> ฿
                                {parseFloat(selectedExpense.amount).toLocaleString('th-TH', {
                                    minimumFractionDigits: 2
                                })}
                            </p>
                            <p>
                                <strong>Category:</strong> {selectedExpense.category}
                            </p>
                            <p>
                                <strong>Date:</strong> {new Date(selectedExpense.expense_date).toLocaleDateString()}
                            </p>
                            <p>
                                <strong>Description:</strong> {selectedExpense.description || '-'}
                            </p>
                        </div>

                        <div className="form-group">
                            <label>Notes</label>
                            <textarea
                                value={approvalNotes}
                                onChange={(e) => setApprovalNotes(e.target.value)}
                                placeholder="Enter approval or rejection notes"
                                rows="3"
                            />
                        </div>

                        <div className="modal-actions">
                            <button
                                type="button"
                                onClick={() => setShowApprovalModal(false)}
                                className="btn btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                className="btn btn-danger"
                            >
                                <XCircle size={16} /> Reject
                            </button>
                            <button
                                onClick={handleApprove}
                                className="btn btn-success"
                            >
                                <CheckCircle size={16} /> Approve
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ExpenseTracking;
