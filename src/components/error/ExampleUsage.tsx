/**
 * Example implementations of error handling patterns
 * Remove this file after using these patterns in your components
 */

import React, { useState } from 'react';
import { useFetch, useMutate, usePaginatedFetch } from '@/hooks/useFetch';
import { DataFetchError, DataFetchLoading } from './DataFetchError';
import { Button } from '@/components/ui/button';

// ============================================================================
// Example 1: Simple Data Fetching with useFetch
// ============================================================================

export function ExampleSimpleFetch() {
  const { data, error, loading, retry } = useFetch('/api/users', {
    timeout: 30000,
    retries: 3,
  });

  if (loading) return <DataFetchLoading message="Loading users..." />;
  if (error) return <DataFetchError error={error} onRetry={retry} />;

  return (
    <div>
      <h2>Users</h2>
      <ul>
        {data?.map((user: any) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}

// ============================================================================
// Example 2: Conditional Fetching with Skip
// ============================================================================

export function ExampleConditionalFetch({ userId }: { userId?: string }) {
  const url = userId ? `/api/users/${userId}` : null;
  const { data, error, loading, retry } = useFetch(url, {
    skip: !userId,
  });

  if (!userId) return <div>Select a user to view details</div>;
  if (loading) return <DataFetchLoading message="Loading user..." />;
  if (error) return <DataFetchError error={error} onRetry={retry} />;

  return (
    <div>
      <h2>{data?.name}</h2>
      <p>Email: {data?.email}</p>
    </div>
  );
}

// ============================================================================
// Example 3: Form Submission with Mutation
// ============================================================================

export function ExampleFormMutation() {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { error, loading, mutate } = useMutate('/api/users', {
    onSuccess: (data) => {
      setSuccessMessage(`Created user: ${data.name}`);
      setFormData({ name: '', email: '' });
      setTimeout(() => setSuccessMessage(null), 3000);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await mutate(formData);
    } catch (err) {
      // Error is handled by useMutate
      console.error('Form submission failed:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {successMessage && (
        <div className="p-4 bg-green-100 text-green-800 rounded">
          {successMessage}
        </div>
      )}

      {error && <DataFetchError error={error} compact />}

      <input
        type="text"
        placeholder="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />

      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />

      <Button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create User'}
      </Button>
    </form>
  );
}

// ============================================================================
// Example 4: Paginated Fetching
// ============================================================================

export function ExamplePaginatedFetch() {
  const { data, error, loading, hasMore, nextPage, retry } = usePaginatedFetch(
    '/api/users',
    10 // page size
  );

  if (error) return <DataFetchError error={error} onRetry={retry} />;

  return (
    <div>
      <h2>Users (Paginated)</h2>

      {loading && data.length === 0 && <DataFetchLoading />}

      <ul>
        {data.map((user: any) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>

      {loading && data.length > 0 && (
        <DataFetchLoading compact message="Loading more..." />
      )}

      {hasMore && !loading && (
        <Button onClick={nextPage}>Load More</Button>
      )}
    </div>
  );
}

// ============================================================================
// Example 5: Manual Error Handling without Hooks
// ============================================================================

export function ExampleManualErrorHandling() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/data');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'Unknown error',
        status: 500,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <DataFetchLoading />;
  if (error) return <DataFetchError error={error} onRetry={loadData} />;

  return (
    <div>
      {!data ? (
        <Button onClick={loadData}>Load Data</Button>
      ) : (
        <div>
          <p>{JSON.stringify(data, null, 2)}</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Example 6: Error Handling with Callbacks
// ============================================================================

export function ExampleWithCallbacks() {
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);

  const { data, error, loading, retry } = useFetch('/api/users', {
    onSuccess: (data) => {
      console.log('Successfully loaded:', data);
      setSuccessCount((prev) => prev + 1);
    },
    onError: (error) => {
      console.error('Error details:', error);
      setErrorCount((prev) => prev + 1);
    },
  });

  if (loading) return <DataFetchLoading />;
  if (error) return <DataFetchError error={error} onRetry={retry} />;

  return (
    <div>
      <p>Successful loads: {successCount}</p>
      <p>Failed attempts: {errorCount}</p>
      <ul>
        {data?.map((item: any) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}

// ============================================================================
// Example 7: Retry with Custom Configuration
// ============================================================================

export function ExampleCustomRetry() {
  const { data, error, loading, retry } = useFetch('/api/slow-endpoint', {
    timeout: 60000, // 60 seconds
    retries: 5, // 5 retry attempts
  });

  if (loading) return <DataFetchLoading message="Loading (with custom timeout)..." />;
  if (error) {
    return (
      <div className="space-y-4">
        <DataFetchError
          error={error}
          onRetry={retry}
          showDetails={true}
          compact={false}
        />
        <p className="text-sm text-gray-600">
          Custom retry configuration applied
        </p>
      </div>
    );
  }

  return <div>{JSON.stringify(data, null, 2)}</div>;
}
