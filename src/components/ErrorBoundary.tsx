import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary Component
 * Catches React errors and displays a user-friendly error message
 */
export class ErrorBoundary extends Component<Props, State> {
  public constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <Card className="w-full max-w-md p-8">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-error-100 dark:bg-error-900/20 rounded-lg">
                  <AlertTriangle className="h-8 w-8 text-error-600 dark:text-error-400" />
                </div>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
                Oops! Something went wrong
              </h1>

              <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                We encountered an unexpected error. Please try again or go back home.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs font-mono text-gray-700 dark:text-gray-300 break-words">
                    {this.state.error.toString()}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={this.handleReset}
                  className="flex-1 flex items-center justify-center gap-2"
                  variant="default"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>

                <Button
                  onClick={this.handleGoHome}
                  className="flex-1 flex items-center justify-center gap-2"
                  variant="outline"
                >
                  <Home className="h-4 w-4" />
                  Go Home
                </Button>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-4">
                If the problem persists, please contact support.
              </p>
            </Card>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

/**
 * Functional wrapper for easier use
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundaryComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

export default ErrorBoundary;
