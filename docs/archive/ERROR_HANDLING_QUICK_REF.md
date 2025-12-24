# Error Handling Quick Reference

## 🚀 Quick Start

### Using useFetch Hook (Recommended)
```typescript
import { useFetch } from '@/hooks/useFetch';
import { DataFetchError, DataFetchLoading } from '@/components/error/DataFetchError';

function MyComponent() {
  const { data, error, loading, retry } = useFetch('/api/endpoint');

  if (loading) return <DataFetchLoading />;
  if (error) return <DataFetchError error={error} onRetry={retry} />;
  return <div>{/* render data */}</div>;
}
```

### Using useMutate Hook (Forms)
```typescript
import { useMutate } from '@/hooks/useFetch';

function CreateForm() {
  const { error, loading, mutate } = useMutate('/api/users');

  const handleSubmit = async (formData) => {
    try {
      await mutate(formData);
    } catch (error) {
      // Error already handled by useMutate
    }
  };
}
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `src/lib/fetch-wrapper.ts` | Fetch with timeout & retries |
| `src/lib/error-handler.ts` | Error parsing & utilities |
| `src/hooks/useFetch.ts` | React hooks for data fetching |
| `src/components/ErrorBoundary.tsx` | Error boundary for React errors |
| `src/components/error/DataFetchError.tsx` | Error UI components |
| `src/hooks/use-api-error.ts` | Error context integration |
| `ERROR_HANDLING_GUIDE.md` | Full documentation |

## ⚙️ Configuration

**Default Settings:**
- Timeout: 30 seconds
- Retries: 3 attempts
- Retry Delay: 1 second (exponential backoff: 1s → 2s → 4s)

**Custom Configuration:**
```typescript
const { data, error, loading } = useFetch('/api/data', {
  timeout: 60000,      // 60 seconds
  retries: 5,          // 5 retries
  retryDelay: 2000,    // 2 seconds initial
});
```

## 🎯 Common Patterns

### Pattern 1: List with Error Handling
```typescript
const { data, error, loading, retry } = useFetch('/api/items');

if (loading) return <DataFetchLoading />;
if (error) return <DataFetchError error={error} onRetry={retry} />;
return <ItemList items={data} />;
```

### Pattern 2: Form Submission
```typescript
const { mutate, loading, error } = useMutate('/api/submit');

const onSubmit = async (formData) => {
  try {
    const result = await mutate(formData);
    // Success handling
  } catch (error) {
    // Error already shown in UI
  }
};
```

### Pattern 3: Paginated List
```typescript
const { data, hasMore, nextPage, retry } = usePaginatedFetch('/api/items', 10);

return (
  <>
    <ItemList items={data} />
    {hasMore && <button onClick={nextPage}>Load More</button>}
  </>
);
```

### Pattern 4: Conditional Fetch
```typescript
const { data, error, loading } = useFetch(
  userId ? `/api/users/${userId}` : null,
  { skip: !userId }
);
```

## 🛡️ Error Types Handled

| Error Type | Status | Retryable | Action |
|-----------|--------|-----------|--------|
| Network Error | 0 | ✅ Yes | Check connection |
| Timeout | 408 | ✅ Yes | Retry with backoff |
| Bad Request | 400 | ❌ No | Fix input |
| Unauthorized | 401 | ❌ No | Redirect to login |
| Forbidden | 403 | ❌ No | Contact admin |
| Not Found | 404 | ❌ No | Refresh page |
| Rate Limited | 429 | ✅ Yes | Wait & retry |
| Server Error | 5xx | ✅ Yes | Retry with backoff |

## 💡 Usage Tips

### ✅ DO:
- Use `useFetch` for GET requests
- Use `useMutate` for POST/PUT/DELETE
- Show `DataFetchError` for errors
- Provide retry buttons
- Handle network errors specifically

### ❌ DON'T:
- Ignore fetch errors
- Show technical error messages
- Retry without backoff
- Forget cleanup on unmount
- Parse JSON without try-catch

## 🧪 Testing

```typescript
// Test network error
global.fetch = jest.fn().mockRejectedValue(new TypeError('Network error'));

// Test timeout
global.fetch = jest.fn().mockImplementation(
  () => new Promise((_, reject) =>
    setTimeout(() => reject(new DOMException('AbortError')), 100)
  )
);

// Test server error
global.fetch = jest.fn().mockResolvedValue({
  ok: false,
  status: 500,
  json: () => Promise.resolve({ message: 'Server error' }),
});
```

## 🔍 Debugging

### Enable error details in development
```typescript
const { data, error } = useFetch('/api/data');
console.log('Full error:', error);
// {
//   status: 500,
//   message: 'Server error. Please try again later.',
//   code: 'HTTP_500',
//   isRetryable: true,
//   details: { /* server details */ }
// }
```

### View error details in UI (dev only)
```typescript
<DataFetchError
  error={error}
  onRetry={retry}
  showDetails={process.env.NODE_ENV === 'development'}
/>
```

## 📞 Support

For issues or questions:
1. Check `ERROR_HANDLING_GUIDE.md` for full documentation
2. Review examples in `src/components/error/ExampleUsage.tsx`
3. Check console logs for error details
4. Verify network connection (network errors)
5. Check server status (5xx errors)

## 🔗 Related Documentation

- [Full Error Handling Guide](./ERROR_HANDLING_GUIDE.md)
- [React Error Boundary Docs](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Web API AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
- [HTTP Status Codes](https://httpwg.org/specs/rfc7231.html#status.codes)
