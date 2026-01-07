import React, { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { DataInitializationProvider } from '@/contexts/DataInitializationContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ErrorProvider } from '@/contexts/ErrorContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AppInitializer } from '@/components/AppInitializer';
import { AppRouter } from '@/router';
import { queryClient } from '@/lib/queryClient';
import { usePageLoadMetrics, initWebVitalsMonitoring } from '@/lib/performanceMonitoring';
import { SpeedInsights } from '@vercel/speed-insights/react';
import toast from 'react-hot-toast';

function App() {
    // Track app-level performance metrics
    usePageLoadMetrics('App');

    // Initialize Web Vitals monitoring
    useEffect(() => {
        initWebVitalsMonitoring();
    }, []);

    // Handle initialization errors
    const handleInitializationError = (error: Error) => {
        console.error('Initialization error:', error);
        toast.error('Failed to initialize app. Please refresh the page.');
    };

    return (
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider>
                    <ErrorProvider>
                        <AuthProvider>
                            <DataInitializationProvider>
                                <AppInitializer 
                                    onError={handleInitializationError}
                                >
                                    <>
                                        <AppRouter />

                                        {/* Toast notifications */}
                                        <Toaster
                                            position="top-right"
                                            toastOptions={{
                                                duration: 5000,
                                                style: {
                                                    background: 'var(--color-surface)',
                                                    color: 'var(--color-text)',
                                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                                    borderRadius: '8px',
                                                    padding: '12px 16px',
                                                },
                                                success: {
                                                    iconTheme: {
                                                        primary: 'var(--color-primary)',
                                                        secondary: 'var(--color-surface)',
                                                    },
                                                },
                                                error: {
                                                    iconTheme: {
                                                        primary: 'var(--color-primary)',
                                                        secondary: 'var(--color-surface)',
                                                    },
                                                },
                                            }}
                                        />

                                        {/* React Query DevTools - only in development */}
                                        {process.env.NODE_ENV === 'development' && (
                                            <ReactQueryDevtools initialIsOpen={false} />
                                        )}
                                        
                                        {/* Vercel Speed Insights */}
                                        <SpeedInsights />
                                    </>
                                </AppInitializer>
                            </DataInitializationProvider>
                        </AuthProvider>
                    </ErrorProvider>
                </ThemeProvider>
            </QueryClientProvider>
        </ErrorBoundary>
    );
}

export default App;
