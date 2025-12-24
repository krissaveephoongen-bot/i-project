# Error Handling & Error Boundary Implementation Guide

## Overview

This project has comprehensive error handling and error boundary implementation to prevent and gracefully handle fetch data errors and React component errors.

## Components

### 1. Enhanced Error Boundary (`src/components/ErrorBoundary.tsx`)

**Features:**
- Catches React rendering errors automatically
- Displays user-friendly error UI
- Tracks error counts and auto-recovers after multiple errors
- Supports custom error handlers
- Logs errors with component stack traces
- Development mode shows detailed error information
- Generates error IDs for support tracking

**Usage:**
```tsx
import ErrorBoundary from '@/components/ErrorBoundary';

<ErrorBoundary
  onError={(error, errorInfo) => {
    // Custom error handling
    console.error('Custom error:', error);
  }}
  logError={true}
>
  <YourComponent />
</ErrorBoundary>

// Or with wrapper HOC
import { withErrorBoundary } from '@/components/ErrorBoundary';

const ProtectedComponent = withErrorBoundary(YourComponent);
```

### 2. Fetch Wrapper (`src/lib/fetch-wrapper.ts`)

**Features:**
- Automatic timeout handling (default: 30 seconds)
- Exponential backoff retry logic (default: 3 retries)
- Network error detection
- Timeout error detection (AbortError)
- Batch fetch support
- Request/Response interceptors ready

**Functions:**
- `fetchWithErrorHandling()` - Main fetch wrapper with timeout & retries
- `apiRequest()` - Simplified API request with automatic JSON parsing
- `batchFetch()` - Fetch multiple URLs with error handling
- `retryWithBackoff()` - Generic retry function with exponential backoff

**Usage:**
```typescript
import { fetchWithErrorHandling, apiRequest } from '@/lib/fetch-wrapper';

// Basic fetch with timeout and retries
const response = await fetchWithErrorHandling('/api/users', {
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
  onRetry: (attempt, error) => {
    console.log(`Retry attempt ${attempt}:`, error);
  },
});

// API request with automatic JSON parsing
const data = await apiRequest('/api/users', {
  method: 'GET',
  timeout: 30000,
  retries: 2,
});

// Batch fetch
const results = await batchFetch(
  [
    { url: '/api/users' },
    { url: '/api/projects' },
  ],
  { continueOnError: true }
);
```

### 3. Error Handler (`src/lib/error-handler.ts`)

**Features:**
- Unified error parsing (fetch, axios, custom errors)
- HTTP status code mapping
- Network error detection
- Timeout error detection
- Retry-ability determination
- Error severity classification
- Recovery action suggestions

**Functions:**
- `parseApiError()` - Parse any error into ApiError format
- `getDefaultErrorMessage()` - Get user-friendly message for HTTP status
- `getErrorSeverity()` - Classify error as error/warning/info
- `formatErrorDisplay()` - Format for UI display
- `getErrorRecoveryAction()` - Get recovery suggestion
- `shouldDisplayError()` - Determine if error should show to user
- `tryCatch()` - Safe wrapper for async functions

**ApiError Interface:**
```typescript
interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: any;
  isNetworkError?: boolean;
  isTimeoutError?: boolean;
  isRetryable?: boolean;
}
```

**Usage:**
```typescript
import {
  parseApiError,
  getErrorRecoveryAction,
  formatErrorDisplay,
} from '@/lib/error-handler';

try {
  const data = await fetchSomeData();
} catch (error) {
  const apiError = parseApiError(error);
  console.log(apiError.message); // User-friendly message
  console.log(getErrorRecoveryAction(apiError)); // Recovery suggestion
  console.log(formatErrorDisplay(apiError)); // For UI display
}
```

### 4. useFetch Hook (`src/hooks/useFetch.ts`)

**Features:**
- Automatic data fetching with error handling
- Loading states
- Retry functionality
- Configurable timeout and retries
- Supports skip/conditional fetching
- Success and error callbacks
- Memory leak prevention (unsubscribe on unmount)

**Hooks:**
- `useFetch()` - For GET requests
- `useMutate()` - For POST/mutation requests
- `usePaginatedFetch()` - For paginated data fetching

**Usage:**
```typescript
import { useFetch, useMutate, usePaginatedFetch } from '@/hooks/useFetch';

// Basic fetch
function UserList() {
  const { data, error, loading, retry } = useFetch('/api/users', {
    timeout: 30000,
    retries: 3,
    onSuccess: (data) => {
      console.log('Data loaded:', data);
    },
    onError: (error) => {
      console.log('Error:', error);
    },
  });

  if (loading) return <div>Loading...</div>;
  if (error) {
    return (
      <div>
        <p>Error: {error.message}</p>
        <button onClick={retry}>Retry</button>
      </div>
    );
  }

  return <ul>{data?.map((user) => <li key={user.id}>{user.name}</li>)}</ul>;
}

// Mutation (POST/PUT/DELETE)
function CreateUser() {
  const { data, error, loading, mutate } = useMutate('/api/users');

  const handleCreate = async (userData) => {
    try {
      const newUser = await mutate(userData);
      console.log('Created:', newUser);
    } catch (error) {
      console.error('Failed to create:', error);
    }
  };

  return <form onSubmit={(e) => handleCreate(e.currentTarget.value)} />;
}

// Pagination
function PaginatedUserList() {
  const { data, error, loading, hasMore, nextPage, reset } = usePaginatedFetch(
    '/api/users',
    10 // page size
  );

  return (
    <div>
      {data?.map((user) => <div key={user.id}>{user.name}</div>)}
      {hasMore && !loading && <button onClick={nextPage}>Load More</button>}
    </div>
  );
}
```

### 5. useApiError Hook (`src/hooks/use-api-error.ts`)

**Features:**
- Standardized error handling
- Integration with ErrorContext for global error management
- Logging support
- Error severity classification

**Usage:**
```typescript
import { useApiError } from '@/hooks/use-api-error';

function MyComponent() {
  const { handleError } = useApiError();

  const loadData = async () => {
    try {
      const response = await fetch('/api/data');
      return await response.json();
    } catch (error) {
      const apiError = handleError(error, 'loadData');
      // Error is now tracked and displayed to user
    }
  };
}
```

### 6. Data Fetch Error Component (`src/components/error/DataFetchError.tsx`)

**Features:**
- User-friendly error display
- Recovery suggestions
- Retry button
- Compact and expanded modes
- Network/Timeout specific UI
- Detailed error view in development

**Usage:**
```typescript
import { DataFetchError, DataFetchLoading } from '@/components/error/DataFetchError';

function MyList() {
  const { data, error, loading, retry } = useFetch('/api/items');

  if (loading) return <DataFetchLoading message="Loading items..." />;

  if (error) {
    return (
      <DataFetchError
        error={error}
        onRetry={retry}
        showDetails={process.env.NODE_ENV === 'development'}
      />
    );
  }

  return <div>{data?.map((item) => <div key={item.id}>{item.name}</div>)}</div>;
}
```

## Error Handling Patterns

### Pattern 1: Hook-based (Recommended)
```typescript
function MyComponent() {
  const { data, error, loading, retry } = useFetch('/api/data');

  if (error) return <DataFetchError error={error} onRetry={retry} />;
  if (loading) return <DataFetchLoading />;
  return <div>{/* render data */}</div>;
}
```

### Pattern 2: Manual Error Handling
```typescript
function MyComponent() {
  const [data, setData] = useState(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(false);
  const { handleError } = useApiError();

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetchWithErrorHandling('/api/data');
      const result = await parseJsonResponse(response);
      setData(result);
      setError(null);
    } catch (err) {
      const apiError = handleError(err, 'loadData');
      setError(apiError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (error) return <DataFetchError error={error} onRetry={loadData} />;
  if (loading) return <DataFetchLoading />;
  return <div>{/* render data */}</div>;
}
```

### Pattern 3: React Query Integration
```typescript
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/fetch-wrapper';
import { parseApiError } from '@/lib/error-handler';

function MyComponent() {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['data'],
    queryFn: () => apiRequest('/api/data'),
    retry: 3,
  });

  const apiError = error ? parseApiError(error) : null;

  if (apiError) return <DataFetchError error={apiError} onRetry={() => refetch()} />;
  if (isLoading) return <DataFetchLoading />;
  return <div>{/* render data */}</div>;
}
```

## Error Recovery Strategies

### 1. Network Errors
- Retry with exponential backoff
- Check internet connection
- Show offline message
- Auto-retry when back online

### 2. Timeout Errors
- Increase timeout on retry
- Show timeout message
- Suggest manual retry

### 3. Server Errors (5xx)
- Retry with backoff
- Show server error message
- Contact support if persistent

### 4. Rate Limiting (429)
- Implement exponential backoff
- Retry-After header support
- Show rate limit message

### 5. Authentication Errors (401)
- Redirect to login
- Refresh token if available
- Don't show to user (handled by auth)

### 6. Permission Errors (403)
- Show permission denied message
- Suggest contacting admin
- Don't retry

## Global Error Handling Setup

The app is configured with:

1. **Root Error Boundary** (`src/main.tsx`)
   - Wraps entire app
   - Catches all rendering errors
   - Shows error UI

2. **Global Error Listeners** (`src/main.tsx`)
   - `window.error` event listener
   - `unhandledrejection` event listener
   - Sends to error tracking service

3. **Error Context** (`src/contexts/ErrorContext.tsx`)
   - Global error state management
   - Toast notifications
   - Error tracking

## Best Practices

### Do:
- ✅ Always wrap API calls with try-catch or use hooks
- ✅ Use `useFetch` for GET requests
- ✅ Use `useMutate` for POST/PUT/DELETE
- ✅ Show user-friendly error messages
- ✅ Provide retry options
- ✅ Log errors for debugging
- ✅ Handle network errors specifically
- ✅ Cleanup on component unmount
- ✅ Use Error Boundary for component errors

### Don't:
- ❌ Ignore fetch errors
- ❌ Show technical error messages to users
- ❌ Retry without backoff
- ❌ Retry non-idempotent operations infinitely
- ❌ Leave loading states hanging
- ❌ Parse JSON without try-catch
- ❌ Use setTimeout for retries without cleanup

## Testing Error Scenarios

```typescript
// Test network error
fetch = jest.fn().mockRejectedValue(new TypeError('Network error'));

// Test timeout
fetch = jest.fn().mockImplementation(
  () => new Promise((_, reject) =>
    setTimeout(() => reject(new DOMException('AbortError')), 100)
  )
);

// Test server error
fetch = jest.fn().mockResolvedValue({
  ok: false,
  status: 500,
  json: () => Promise.resolve({ message: 'Server error' }),
});
```

## Configuration

Default timeout: **30 seconds**
Default retries: **3 attempts**
Default retry delay: **1 second** (exponential backoff: 1s, 2s, 4s)

To customize globally, modify `DEFAULT_CONFIG` in `src/lib/fetch-wrapper.ts`:

```typescript
const DEFAULT_CONFIG: FetchConfig = {
  timeout: 30000, // milliseconds
  retries: 3, // number of retries
  retryDelay: 1000, // initial delay in ms
};
```

## Monitoring & Analytics

To integrate with error tracking services (Sentry, LogRocket, etc.):

1. Modify the error tracker in `src/main.tsx`:
```typescript
(window as any).__errorTracker = (errorInfo: any) => {
  if (import.meta.env.PROD) {
    // Send to your service
    Sentry.captureException(errorInfo.error);
  }
};
```

2. Use error hooks to capture user interactions:
```typescript
const { handleError } = useApiError();
// Errors are automatically logged with context
```

## Troubleshooting

### Problem: Errors not caught by Error Boundary
- Error Boundary only catches rendering errors, not event handlers
- Use try-catch in event handlers and API calls
- Use hooks for data fetching

### Problem: Fetch not retrying
- Check if error is retryable (network, timeout, 5xx)
- Check retry count hasn't been exceeded
- Check console for error details

### Problem: Blank page on error
- Error Boundary caught an error but fallback didn't render
- Check for errors in ErrorBoundary render
- Check console for rendering errors

### Problem: Memory leaks
- Ensure useFetch cleanup runs on unmount
- Cancel pending requests on unmount
- Check for async operations without cleanup

## Related Files

- `src/components/ErrorBoundary.tsx` - Error boundary component
- `src/lib/fetch-wrapper.ts` - Fetch with timeout/retries
- `src/lib/error-handler.ts` - Error parsing and utilities
- `src/hooks/useFetch.ts` - Fetch hooks
- `src/hooks/use-api-error.ts` - Error handling hook
- `src/components/error/DataFetchError.tsx` - Error UI component
- `src/contexts/ErrorContext.tsx` - Global error state
- `src/main.tsx` - Root setup with error boundary
