import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';
import { AlertTriangle, Home, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();

  const isRouteError = isRouteErrorResponse(error);
  const status = isRouteError ? error.status : 'Unknown Error';
  const message = isRouteError ? error.statusText : 'An unexpected error occurred';
  const details = isRouteError ? error.data : null;

  const getErrorDetails = () => {
    if (status === 404) {
      return {
        title: 'Page Not Found',
        description: 'The page you are looking for does not exist.',
        icon: '🔍',
      };
    }
    if (status === 401) {
      return {
        title: 'Unauthorized',
        description: 'You do not have permission to access this page.',
        icon: '🔐',
      };
    }
    if (status === 403) {
      return {
        title: 'Forbidden',
        description: 'Access to this resource is forbidden.',
        icon: '🚫',
      };
    }
    if (status === 500) {
      return {
        title: 'Server Error',
        description: 'Something went wrong on the server.',
        icon: '⚠️',
      };
    }
    return {
      title: 'Error',
      description: message || 'An unexpected error occurred.',
      icon: '⚠️',
    };
  };

  const errorDetails = getErrorDetails();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-slate-800">
          {/* Error Icon */}
          <div className="text-6xl text-center mb-6">{errorDetails.icon}</div>

          {/* Status Code */}
          <div className="text-center mb-6">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
              {status}
            </h1>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {errorDetails.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {errorDetails.description}
            </p>
          </div>

          {/* Error Details (if available) */}
          {details && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg p-4 mb-6"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-700 dark:text-red-300">
                  <p className="font-semibold mb-1">Error Details:</p>
                  <p className="font-mono text-xs">{JSON.stringify(details)}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="w-full gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Go Back
            </Button>
            <Button
              onClick={() => navigate('/')}
              className="w-full gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          </div>

          {/* Footer Info */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6"
          >
            If this problem persists, please contact support.
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
