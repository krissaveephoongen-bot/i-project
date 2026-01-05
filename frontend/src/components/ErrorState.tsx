import React from 'react';
import { AlertTriangle, RefreshCw, ChevronDown } from 'lucide-react';
import { ApiError } from '@/lib/error-handler';
import { Button } from './ui/button';

interface ErrorStateProps {
  error: ApiError;
  onRetry?: () => void;
  showDetails?: boolean;
  title?: string;
  icon?: React.ReactNode;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  onRetry,
  showDetails = false,
  title,
  icon,
}) => {
  const [showDetails_, setShowDetails] = React.useState(showDetails);

  const getErrorIcon = () => {
    if (icon) return icon;
    
    switch (error.status) {
      case 404:
        return '🔍';
      case 403:
        return '🔐';
      case 500:
      case 502:
      case 503:
        return '⚠️';
      case 0:
        return '🌐';
      default:
        return '❌';
    }
  };

  const getErrorTitle = () => {
    if (title) return title;
    
    switch (error.status) {
      case 404:
        return 'Not Found';
      case 403:
        return 'Access Denied';
      case 401:
        return 'Authentication Failed';
      case 500:
        return 'Server Error';
      case 502:
      case 503:
        return 'Service Unavailable';
      case 408:
        return 'Request Timeout';
      case 0:
        return 'Network Error';
      default:
        return 'Error';
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          {/* Icon */}
          <div className="text-5xl text-center mb-4">{getErrorIcon()}</div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2 text-center">
            {getErrorTitle()}
          </h3>

          {/* Status Code */}
          {error.status !== 0 && (
            <p className="text-sm text-red-600 dark:text-red-400 text-center mb-3">
              Error {error.status}
            </p>
          )}

          {/* Message */}
          <p className="text-sm text-red-700 dark:text-red-400 mb-4 text-center">
            {error.message}
          </p>

          {/* Details (if available) */}
          {error.details && (
            <div className="mb-4">
              <button
                onClick={() => setShowDetails_(!showDetails_)}
                className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 mx-auto mb-2"
              >
                <span>Details</span>
                <ChevronDown
                  className="h-3 w-3 transition-transform"
                  style={{ transform: showDetails_ ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </button>

              {showDetails_ && (
                <div className="bg-red-100 dark:bg-red-900/30 rounded p-3 text-xs text-red-800 dark:text-red-300 font-mono break-all max-h-40 overflow-y-auto">
                  {typeof error.details === 'string'
                    ? error.details
                    : JSON.stringify(error.details, null, 2)}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2">
            {onRetry && (
              <Button
                onClick={onRetry}
                variant="outline"
                className="w-full gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            )}

            {error.isRetryable && (
              <p className="text-xs text-red-600 dark:text-red-400 text-center">
                This error might be temporary. Please try again.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorState;
