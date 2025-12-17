/**
 * Timesheet List Component
 * Displays all timesheet entries in a table format
 */

import { useState } from 'react';
import { Edit2, Trash2, Check, X, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TimeEntry } from '@/types/timesheet';

interface TimesheetListProps {
  entries: TimeEntry[];
  loading: boolean;
  onEdit: (entry: TimeEntry) => void;
  onDelete: (id: string) => void;
  onApprove: (id: string) => void;
  onReject?: (id: string) => void;
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  submitted: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

const typeIcons = {
  regular: '📋',
  overtime: '⏰',
  leave: '🏖️',
  other: '📌',
};

export function TimesheetList({
  entries,
  loading,
  onEdit,
  onDelete,
  onApprove,
  onReject,
}: TimesheetListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex justify-center items-center space-x-2">
            <Clock className="h-5 w-5 animate-spin text-blue-600" />
            <p className="text-gray-600">Loading timesheet entries...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No timesheet entries found</p>
            <p className="text-gray-400 text-sm mt-2">Start by adding your first time entry</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className={`border rounded-lg overflow-hidden transition-all ${
            entry.status === 'approved'
              ? 'border-green-200 bg-green-50'
              : entry.status === 'rejected'
              ? 'border-red-200 bg-red-50'
              : 'border-gray-200 bg-white hover:border-blue-300'
          }`}
        >
          {/* Main Row */}
          <div className="p-4">
            <div className="flex items-center justify-between gap-4">
              {/* Left Section */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  {/* Type Icon */}
                  <span className="text-xl">
                    {typeIcons[entry.type as keyof typeof typeIcons]}
                  </span>

                  {/* Main Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {entry.projectName || entry.projectId}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          statusColors[entry.status as keyof typeof statusColors]
                        }`}
                      >
                        {entry.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {entry.taskName || 'No task assigned'}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>📅 {entry.date}</span>
                      <span>⏱️ {entry.startTime} - {entry.endTime}</span>
                      <span className="font-semibold text-blue-600">
                        {entry.hours.toFixed(2)}h
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {entry.description && (
                  <p className="text-sm text-gray-600 mt-3 ml-9">
                    {entry.description}
                  </p>
                )}
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-2">
                {entry.status === 'submitted' && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onApprove(entry.id)}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      title="Approve"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    {onReject && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onReject(entry.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Reject"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </>
                )}
                {entry.status === 'draft' && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(entry)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDelete(entry.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Expand Button */}
            {entry.notes && (
              <button
                onClick={() =>
                  setExpandedId(expandedId === entry.id ? null : entry.id)
                }
                className="text-xs text-blue-600 hover:text-blue-700 mt-2 ml-9"
              >
                {expandedId === entry.id ? '▼ Hide Notes' : '▶ Show Notes'}
              </button>
            )}
          </div>

          {/* Expanded Notes Section */}
          {expandedId === entry.id && entry.notes && (
            <div className="px-4 pb-4 ml-9 border-t border-gray-200 pt-3 bg-gray-50">
              <p className="text-sm text-gray-600">{entry.notes}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
