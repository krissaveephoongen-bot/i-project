# Error Handling - Quick Reference

## 🎯 Choose Your Approach

### Option 1: Simple Hook (Most Common)
```typescript
import { useDataFetch } from '@/hooks/useDataFetch';

function MyPage() {
  const { data, loading, error, retry } = useDataFetch(
    async () => {
      const res = await fetch('/api/items');
      if (!res.ok) throw new Error('Failed');
      return res.json();
    }
  );

  if (error) return <ErrorState error={error} onRetry={retry} />;
  if (loading) return <LoadingState />;
  if (!data?.length) return <EmptyState title="No items" />;
  return <ItemsList items={data} />;
}
```

### Option 2: Wrapper Component
```typescript
function MyPage() {
  const { data, loading, error, retry } = useDataFetch(fetcher);

  return (
    <DataLoader
      loading={loading}
      error={error}
      data={data}
      onRetry={retry}
    >
      <ItemsList items={data} />
    </DataLoader>
  );
}
```

### Option 3: Manual State Management
```typescript
function MyPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/items');
        if (!res.ok) throw new Error('Failed');
        setData(await res.json());
      } catch (err) {
        setError(parseApiError(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (error) return <ErrorState error={error} onRetry={/* retry fn */} />;
  if (loading) return <LoadingState />;
  if (!data?.length) return <EmptyState title="No items" />;
  return <ItemsList items={data} />;
}
```

---

## 📦 Component Reference

### ErrorState
```typescript
<ErrorState 
  error={error}           // ApiError object (required)
  onRetry={retryFn}      // Function to call on retry (optional)
  title="Custom title"   // Override default title (optional)
  icon="⚠️"              // Custom icon (optional)
  showDetails={true}     // Show error details (optional)
/>
```

### DataLoader
```typescript
<DataLoader
  loading={loading}       // Boolean (required)
  error={error}          // ApiError | null (required)
  data={data}            // Data to check (required)
  onRetry={retryFn}      // Retry function (optional)
  isEmpty={false}        // Force empty state (optional)
  fallbackMessage="..."  // Custom empty message (optional)
  loadingComponent={<div>...</div>}  // Custom loader (optional)
  emptyComponent={<div>...</div>}    // Custom empty (optional)
>
  {/* Content when data exists */}
</DataLoader>
```

### LoadingState
```typescript
<LoadingState 
  message="Loading..."  // Custom message (optional)
  fullHeight={true}     // Full screen height (optional)
/>
```

### EmptyState
```typescript
<EmptyState
  icon="📭"                     // Emoji or React element (optional)
  title="No data"               // Title (required)
  description="Try again"       // Description (optional)
  action={{                     // Primary action (optional)
    label: "Create",
    onClick: () => { }
  }}
  secondaryAction={{            // Secondary action (optional)
    label: "Go Back",
    onClick: () => { }
  }}
/>
```

### Skeleton
```typescript
// Generic skeleton
<Skeleton count={5} height="1rem" />

// Table skeleton
<SkeletonTable rows={5} columns={4} />

// Card skeleton
<SkeletonCard count={3} />
```

---

## 🪝 Hook Reference

### useDataFetch
```typescript
const { data, loading, error, retry, refetch } = useDataFetch(
  async () => {
    // Your fetch logic
    return data;
  },
  [dependencies],  // Re-fetch when deps change
  {
    onError: (error) => console.error(error),
    onSuccess: (data) => console.log(data)
  }
);
```

**Returns:**
- `data` - Fetched data or null
- `loading` - Boolean, true while fetching
- `error` - ApiError object or null
- `retry()` - Function to retry fetch
- `refetch()` - Alias for retry

---

## 📊 Error Types & Status Codes

| Status | Type | Message | Retryable | Action |
|--------|------|---------|-----------|--------|
| 0 | Network | Connection error | Yes | Retry |
| 408 | Timeout | Request timeout | Yes | Retry |
| 400 | Client | Bad request | No | Check input |
| 401 | Auth | Authenticate | No | Login |
| 403 | Permission | Forbidden | No | Contact admin |
| 404 | Not found | Not found | No | Go back |
| 429 | Rate limit | Too many requests | Yes | Wait & retry |
| 500 | Server | Server error | Yes | Retry |
| 502-504 | Gateway | Service unavailable | Yes | Retry |

---

## 🧪 Quick Testing

### Test Network Error
```typescript
// Disable network in DevTools or:
// Mock fetch to fail
```

### Test Timeout
```typescript
// Simulated in API client with 10s timeout
// Uses 408 status code
```

### Test Retry
```typescript
// Click retry button in error state
// Should refetch data
```

### Test Empty State
```typescript
// Return empty array from API
// Should show empty state, not error
```

---

## 🚀 Common Patterns

### Paginated Data
```typescript
const { data: items, loading, error, retry } = useDataFetch(
  async () => {
    const res = await fetch(`/api/items?page=${page}`);
    return res.json();
  },
  [page]  // Refetch when page changes
);
```

### Filtered Data
```typescript
const { data: items, loading, error, retry } = useDataFetch(
  async () => {
    const res = await fetch(`/api/items?status=${status}`);
    return res.json();
  },
  [status]  // Refetch when filter changes
);
```

### With Toast Notifications
```typescript
const { data, loading, error, retry } = useDataFetch(
  fetcher,
  [],
  {
    onError: (err) => toast.error(err.message),
    onSuccess: () => toast.success('Loaded!')
  }
);
```

### Refresh Button
```typescript
<button onClick={retry}>Refresh</button>
```

---

## ❌ Don't Do This

```typescript
// ❌ No error handling
const [data, setData] = useState(null);
useEffect(() => {
  fetch('/api/items').then(r => r.json()).then(setData);
}, []);

// ❌ Silent errors
const fetchData = async () => {
  try {
    const res = await fetch('/api/items');
    setData(await res.json());  // Might fail!
  } catch (err) {
    // Error ignored - user sees nothing
  }
};

// ❌ Unhandled promise rejection
async function loadData() {
  const res = await fetch('/api/items');  // No error handling!
  setData(await res.json());
}
```

---

## ✅ Do This Instead

```typescript
// ✅ Proper error handling
const { data, loading, error, retry } = useDataFetch(
  async () => {
    const res = await fetch('/api/items');
    if (!res.ok) throw new Error('Failed');
    return res.json();
  }
);

// ✅ Show error to user
if (error) {
  return (
    <ErrorState 
      error={error} 
      onRetry={retry}
    />
  );
}

// ✅ Show loading state
if (loading) return <LoadingState />;

// ✅ Show empty state
if (!data?.length) return <EmptyState title="No items" />;

// ✅ Show content
return <List items={data} />;
```

---

## 📞 Still Confused?

Check these files:
1. **Component code:** `src/components/ErrorState.tsx` (self-documented)
2. **Hook code:** `src/hooks/useDataFetch.ts` (clear examples)
3. **Real examples:** `src/pages/Activity.tsx` (complete implementation)
4. **Full audit:** `ERROR_HANDLING_AUDIT.md` (detailed analysis)
5. **Implementation guide:** `ERROR_HANDLING_IMPLEMENTATION_SUMMARY.md` (patterns)

---

## 🎓 Learning Path

1. **Start here:** This file
2. **See it working:** `src/pages/Activity.tsx`
3. **Deep dive:** Component source files
4. **Full context:** `ERROR_HANDLING_AUDIT.md`
5. **Advanced:** `ERROR_HANDLING_IMPLEMENTATION_SUMMARY.md`

---

**Last Updated:** 2025-01-05
**Status:** Ready for use ✅
