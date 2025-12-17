/**
 * Expense Summary Component
 * Displays approval status and summary for expenses
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { DollarSign, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { ExpenseData } from '../../hooks/useProjectData';
import { formatCurrency, BAHT_SYMBOL } from '../../utils/currency';

interface ExpenseSummaryProps {
  expenses: ExpenseData[];
  loading?: boolean;
}

export const ExpenseSummary: React.FC<ExpenseSummaryProps> = ({ expenses, loading = false }) => {
  // Calculate statistics
  const totalAmount = expenses.reduce((sum, e) => sum + parseFloat(e.amount as any || 0), 0);
  const approvedAmount = expenses
    .filter(e => e.status === 'approved')
    .reduce((sum, e) => sum + parseFloat(e.amount as any || 0), 0);
  const pendingAmount = expenses
    .filter(e => e.status === 'pending')
    .reduce((sum, e) => sum + parseFloat(e.amount as any || 0), 0);
  const rejectedAmount = expenses
    .filter(e => e.status === 'rejected')
    .reduce((sum, e) => sum + parseFloat(e.amount as any || 0), 0);

  const approvedCount = expenses.filter(e => e.status === 'approved').length;
  const pendingCount = expenses.filter(e => e.status === 'pending').length;
  const rejectedCount = expenses.filter(e => e.status === 'rejected').length;

  // Category breakdown
  const categoryBreakdown = expenses.reduce((acc, e) => {
    const category = e.category || 'other';
    if (!acc[category]) {
      acc[category] = { count: 0, amount: 0 };
    }
    acc[category].count += 1;
    acc[category].amount += parseFloat(e.amount as any || 0);
    return acc;
  }, {} as Record<string, { count: number; amount: number }>);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="h-20 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Amount */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
                <p className="text-xs text-gray-500 mt-1">{expenses.length} entries</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        {/* Approved Amount */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(approvedAmount)}</p>
                <p className="text-xs text-gray-500 mt-1">{approvedCount} entries</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        {/* Pending Amount */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(pendingAmount)}</p>
                <p className="text-xs text-gray-500 mt-1">{pendingCount} entries</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        {/* Approval Rate */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approval Rate</p>
                <p className="text-2xl font-bold text-purple-600">
                  {expenses.length > 0 ? Math.round((approvedCount / expenses.length) * 100) : 0}%
                </p>
                <p className="text-xs text-gray-500 mt-1">{approvedCount}/{expenses.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Approval Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Approval Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Approved */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className="bg-green-100 text-green-800">
                  ✓ Approved
                </Badge>
                <span className="text-sm font-medium">{approvedCount} entries</span>
              </div>
              <p className="text-sm font-medium text-gray-900">{formatCurrency(approvedAmount)}</p>
            </div>

            {/* Pending */}
            {pendingCount > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className="bg-yellow-100 text-yellow-800">
                    ⏳ Pending
                  </Badge>
                  <span className="text-sm font-medium">{pendingCount} entries</span>
                </div>
                <p className="text-sm font-medium text-gray-900">{formatCurrency(pendingAmount)}</p>
              </div>
            )}

            {/* Rejected */}
            {rejectedCount > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className="bg-red-100 text-red-800">
                    ✗ Rejected
                  </Badge>
                  <span className="text-sm font-medium">{rejectedCount} entries</span>
                </div>
                <p className="text-sm font-medium text-gray-900">{formatCurrency(rejectedAmount)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      {Object.keys(categoryBreakdown).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(categoryBreakdown).map(([category, data]) => (
                <div key={category} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 capitalize">{category}</p>
                    <p className="text-xs text-gray-500">{data.count} items</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{formatCurrency(data.amount)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExpenseSummary;
