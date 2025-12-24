import React, { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ErrorProvider } from '@/contexts/ErrorContext';
import { AdminPINProvider } from '@/contexts/AdminPINContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AppRouter } from '@/router';
import { queryClient } from '@/lib/queryClient';
import { usePageLoadMetrics, initWebVitalsMonitoring } from '@/lib/performanceMonitoring';

function App() {
    // Track app-level performance metrics
    usePageLoadMetrics('App');

    // Initialize Web Vitals monitoring
    useEffect(() => {
        initWebVitalsMonitoring();
    }, []);

    return (
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider defaultTheme="light" storageKey="project-management-theme">
                    <ErrorProvider>
                        <AuthProvider>
                            <AdminPINProvider>
                                <>
                                    <AppRouter />

                                    {/* Toast notifications */}
                                    <Toaster
                                        position="top-right"
                                        toastOptions={{
                                            duration: 5000,
                                            style: {
                                                background: 'white',
                                                color: '#1e293b',
                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                                borderRadius: '8px',
                                                padding: '12px 16px',
                                            },
                                            success: {
                                                iconTheme: {
                                                    primary: '#22c55e',
                                                    secondary: 'white',
                                                },
                                            },
                                            error: {
                                                iconTheme: {
                                                    primary: '#ef4444',
                                                    secondary: 'white',
                                                },
                                            },
                                        }}
                                    />

                                    {/* React Query DevTools - only in development */}
                                    {process.env.NODE_ENV === 'development' && (
                                        <ReactQueryDevtools initialIsOpen={false} />
                                    )}
                                </>
                            </AdminPINProvider>
                        </AuthProvider>
                    </ErrorProvider>
                </ThemeProvider>
            </QueryClientProvider>
        </ErrorBoundary>
    );
}

export default App;
