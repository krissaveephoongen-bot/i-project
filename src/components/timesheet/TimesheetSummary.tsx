/**
 * Timesheet Summary Component
 * Displays approval status and summary statistics for timesheet entries
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Clock, CheckCircle, AlertCircle, Users } from 'lucide-react';
import { TimeEntryData } from '../../hooks/useProjectData';
import { formatCurrency, BAHT_SYMBOL } from '../../utils/currency';

interface TimesheetSummaryProps {
  entries: TimeEntryData[];
  loading?: boolean;
}

export const TimesheetSummary: React.FC<TimesheetSummaryProps> = ({ entries, loading = false }) => {
  // Calculate statistics
  const totalHours = entries.reduce((sum, e) => sum + parseFloat(e.hours as any || 0), 0);
  const approvedHours = entries
    .filter(e => e.status === 'approved')
    .reduce((sum, e) => sum + parseFloat(e.hours as any || 0), 0);
  const pendingHours = entries
    .filter(e => e.status === 'pending')
    .reduce((sum, e) => sum + parseFloat(e.hours as any || 0), 0);

  const approvedCount = entries.filter(e => e.status === 'approved').length;
  const pendingCount = entries.filter(e => e.status === 'pending').length;
  const rejectedCount = entries.filter(e => e.status === 'rejected').length;

  // Estimate cost (assuming hourly rate)
  const hourlyRate = 500; // ฿500/hour
  const totalCost = totalHours * hourlyRate;
  const approvedCost = approvedHours * hourlyRate;

  // Status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
        {/* Total Hours */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold text-gray-900">{totalHours.toFixed(1)}h</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        {/* Approved Hours */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{approvedHours.toFixed(1)}h</p>
                <p className="text-xs text-gray-500 mt-1">{approvedCount} entries</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        {/* Pending Hours */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingHours.toFixed(1)}h</p>
                <p className="text-xs text-gray-500 mt-1">{pendingCount} entries</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        {/* Estimated Cost */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Est. Cost</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalCost)}</p>
                <p className="text-xs text-gray-500 mt-1">{BAHT_SYMBOL}500/hour</p>
              </div>
              <Users className="h-8 w-8 text-purple-500 opacity-20" />
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
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{approvedHours.toFixed(1)} hours</p>
                <p className="text-xs text-gray-500">{formatCurrency(approvedCost)}</p>
              </div>
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
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{pendingHours.toFixed(1)} hours</p>
                  <p className="text-xs text-gray-500">{formatCurrency(pendingHours * hourlyRate)}</p>
                </div>
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
              </div>
            )}

            {/* Approval Rate */}
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-2">Approval Rate</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${entries.length > 0 ? (approvedCount / entries.length) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {entries.length > 0 ? Math.round((approvedCount / entries.length) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimesheetSummary;
