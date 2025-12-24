/**
 * Data Fetch Error Component
 * Displays user-friendly error message with recovery options
 */

import React from 'react';
import { ApiError } from '@/lib/error-handler';
import { getErrorRecoveryAction, formatErrorDisplay } from '@/lib/error-handler';
import { AlertTriangle, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface DataFetchErrorProps {
  error: ApiError;
  onRetry?: () => void;
  onDismiss?: () => void;
  showDetails?: boolean;
  compact?: boolean;
}

export function DataFetchError({
  error,
  onRetry,
  onDismiss,
  showDetails = false,
  compact = false,
}: DataFetchErrorProps) {
  const message = formatErrorDisplay(error);
  const recoveryAction = getErrorRecoveryAction(error);
  const isNetworkError = error.isNetworkError || error.code === 'NETWORK_ERROR';
  const isTimeoutError = error.isTimeoutError || error.code === 'TIMEOUT_ERROR';

  if (compact) {
    return (
      <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-red-900 dark:text-red-200">{message}</p>
          <p className="text-xs text-red-700 dark:text-red-300 mt-1">{recoveryAction}</p>
          {onRetry && (
            <Button
              onClick={onRetry}
              size="sm"
              variant="ghost"
              className="mt-2 h-7 px-2 text-xs text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Try Again
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className="p-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
            {isNetworkError || isTimeoutError ? (
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-red-900 dark:text-red-200 mb-1">
            {isNetworkError
              ? 'Network Connection Error'
              : isTimeoutError
              ? 'Request Timeout'
              : 'Failed to Load Data'}
          </h3>

          <p className="text-sm text-red-700 dark:text-red-300 mb-2">{message}</p>

          <p className="text-sm text-red-600 dark:text-red-400 mb-4">{recoveryAction}</p>

          {showDetails && error.details && (
            <details className="mb-4">
              <summary className="cursor-pointer text-xs font-semibold text-red-600 dark:text-red-400 hover:underline">
                Error details
              </summary>
              <pre className="mt-2 p-3 bg-red-100 dark:bg-red-900/30 rounded text-xs text-red-900 dark:text-red-200 overflow-auto max-h-40">
                {JSON.stringify(error.details, null, 2)}
              </pre>
            </details>
          )}

          <div className="flex gap-2">
            {onRetry && (
              <Button
                onClick={onRetry}
                variant="default"
                size="sm"
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            )}
            {onDismiss && (
              <Button onClick={onDismiss} variant="outline" size="sm">
                Dismiss
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

/**
 * Loading Skeleton
 */
export function DataFetchLoading({
  message = 'Loading...',
  compact = false,
}: {
  message?: string;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 p-4 text-gray-600 dark:text-gray-400">
        <div className="animate-spin h-4 w-4 border-2 border-gray-300 dark:border-gray-600 border-t-gray-600 dark:border-t-gray-300 rounded-full" />
        <span className="text-sm">{message}</span>
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-4">
        <div className="animate-spin h-6 w-6 border-2 border-gray-300 dark:border-gray-600 border-t-gray-600 dark:border-t-gray-300 rounded-full" />
        <p className="text-gray-600 dark:text-gray-400">{message}</p>
      </div>
    </Card>
  );
}
