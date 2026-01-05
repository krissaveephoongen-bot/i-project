import React, { useState } from 'react';
import { Button } from './ui/button';
import { CheckSquare, Trash2, AlertCircle } from 'lucide-react';

interface BulkActionsProps {
  selectedCount: number;
  onBulkUpdate: (field: string, value: any) => Promise<void>;
  onBulkDelete: () => Promise<void>;
  isLoading?: boolean;
  onClearSelection: () => void;
}

export function BulkActions({
  selectedCount,
  onBulkUpdate,
  onBulkDelete,
  isLoading = false,
  onClearSelection,
}: BulkActionsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (selectedCount === 0) return null;

  const handleStatusUpdate = async (status: string) => {
    setIsProcessing(true);
    try {
      await onBulkUpdate('status', status);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePriorityUpdate = async (priority: string) => {
    setIsProcessing(true);
    try {
      await onBulkUpdate('priority', priority);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    setIsProcessing(true);
    try {
      await onBulkDelete();
      setShowDeleteConfirm(false);
      onClearSelection();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 right-6 max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-40">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <p className="font-medium text-gray-900 dark:text-white">
              {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onClearSelection}
            disabled={isProcessing}
          >
            Clear
          </Button>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* Status Actions */}
          <div className="flex gap-1 border-l border-gray-300 dark:border-gray-600 pl-2 ml-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusUpdate('todo')}
              disabled={isProcessing}
              className="text-xs"
            >
              Mark To Do
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusUpdate('in_progress')}
              disabled={isProcessing}
              className="text-xs"
            >
              In Progress
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusUpdate('done')}
              disabled={isProcessing}
              className="text-xs"
            >
              Mark Done
            </Button>
          </div>

          {/* Priority Actions */}
          <div className="flex gap-1 border-l border-gray-300 dark:border-gray-600 pl-2 ml-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePriorityUpdate('low')}
              disabled={isProcessing}
              className="text-xs"
            >
              Low
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePriorityUpdate('medium')}
              disabled={isProcessing}
              className="text-xs"
            >
              Medium
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePriorityUpdate('high')}
              disabled={isProcessing}
              className="text-xs"
            >
              High
            </Button>
          </div>

          {/* Delete Action */}
          <div className="flex-1" />
          {showDeleteConfirm ? (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2 rounded">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span className="text-sm text-red-700 dark:text-red-300">
                Delete {selectedCount} item{selectedCount !== 1 ? 's' : ''}?
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="text-red-600 hover:text-red-700 dark:text-red-400 text-xs h-7"
                onClick={handleBulkDelete}
                disabled={isProcessing}
              >
                Confirm
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-xs h-7"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="text-red-600 hover:text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isProcessing}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
