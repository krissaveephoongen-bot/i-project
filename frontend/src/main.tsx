import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

// Set up global error tracker
(window as any).__errorTracker = (errorInfo: any) => {
  // Send to analytics or error tracking service in production
  if (import.meta.env.PROD) {
    // Example: Send to Sentry, LogRocket, or similar
    console.log('Tracking error:', errorInfo);
  }
};

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // Prevent default browser behavior
  event.preventDefault();
});

// Handle global errors
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

// Create root element
const container = document.getElementById('root');
if (!container) throw new Error('Failed to find the root element');
const root = createRoot(container);

// Render the app with error boundary
root.render(
  <StrictMode>
    <ErrorBoundary logError={true}>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
