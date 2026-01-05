# Batch Update Script for Critical Pages

This script provides the exact changes needed for each critical page.

## Pattern for All Pages

```typescript
// 1. Add imports (at the top after existing imports)
import ErrorState from '@/components/ErrorState';
import LoadingState from '@/components/LoadingState';
import EmptyState from '@/components/EmptyState';
import { parseApiError } from '@/lib/error-handler';
import { RefreshCw } from 'lucide-react'; // If not already imported

// 2. Add error state (with existing state)
const [error, setError] = useState<any>(null);

// 3. Wrap fetch logic (replace try-catch)
try {
  setError(null);
  setLoading(true);
  // ... fetch code ...
} catch (err) {
  setError(parseApiError(err));
  console.error('Error:', err);
} finally {
  setLoading(false);
}

// 4. Add render conditions (at start of return)
if (error && !loading) {
  return (
    <div className="p-6">
      <ErrorState 
        error={error}
        onRetry={() => { 
          setError(null); 
          // call fetch function 
        }}
      />
    </div>
  );
}

if (loading) {
  return <LoadingState message="Loading..." />;
}

if (!data || (Array.isArray(data) && data.length === 0)) {
  return (
    <EmptyState 
      icon="📊"
      title="No data available"
      description="There's no data to display right now"
      action={{
        label: "Refresh",
        onClick: () => { /* reload */ }
      }}
    />
  );
}

// 5. Return normal render
return (/* ... component ... */);
```

---

## Quick Update Checklist

For each critical page, follow these steps:

### Step 1: Add Imports
- [ ] Copy imports block above
- [ ] Paste after existing imports
- [ ] Update RefreshCw if already imported

### Step 2: Add State
- [ ] Find `const [loading, setLoading] = useState(true);`
- [ ] Add below: `const [error, setError] = useState<any>(null);`

### Step 3: Update Fetch
- [ ] Find data fetching logic
- [ ] Add `setError(null);` at start
- [ ] Wrap in try-catch-finally
- [ ] Use `parseApiError(err)` in catch

### Step 4: Add Render Conditions
- [ ] At start of render, add error check
- [ ] Add loading check
- [ ] Add empty data check
- [ ] Show appropriate component

### Step 5: Test
- [ ] Test normal load
- [ ] Test error state
- [ ] Test loading state
- [ ] Test empty state
- [ ] Test retry button

---

## Page-by-Page Changes

### 1. Search.tsx
**Status:** ✅ DONE

### 2. Settings.tsx
**Priority:** HIGH - User preferences
**Changes:**
- Add error state
- Add loading state during load/save
- Show save errors to user
- Add retry for failed saves

### 3. Reports.tsx
**Priority:** HIGH - Data heavy
**Changes:**
- Add error state
- Add loading skeleton
- Add empty state for no data
- Add retry button

### 4. Timesheet.tsx
**Priority:** HIGH - Time tracking
**Changes:**
- Add error state
- Add loading state
- Add empty state
- Add retry button

### 5. Projects.tsx
**Priority:** MEDIUM - Already partial
**Changes:**
- Already has some error handling
- Enhance with ErrorState component
- Add empty state
- Standardize pattern

### 6. Expenses.tsx
**Priority:** MEDIUM - Already partial
**Changes:**
- Already has some error handling
- Enhance with ErrorState component
- Add empty state
- Standardize pattern

### 7. AllUsers.tsx
**Priority:** MEDIUM - User listing
**Changes:**
- Add error state
- Add loading state
- Add empty state
- Add retry button

### 8. ResourceManagement.tsx
**Priority:** MEDIUM - Resource allocation
**Changes:**
- Add error state
- Add loading state
- Add empty state
- Add retry button

---

## Estimated Time per Page

- **Search:** Already done ✅
- **Settings:** 15-20 minutes
- **Reports:** 15-20 minutes
- **Timesheet:** 15-20 minutes
- **Projects:** 10 minutes (partial update)
- **Expenses:** 10 minutes (partial update)
- **AllUsers:** 10-15 minutes
- **ResourceManagement:** 10-15 minutes

**Total:** ~2-2.5 hours for 8 critical pages

---

## Common Issues

### Issue: Component not showing after error
**Solution:** Make sure `if (error)` check is BEFORE the render, not after

### Issue: Infinite loading state
**Solution:** Make sure `setLoading(false)` is in finally block

### Issue: Retry button doesn't work
**Solution:** Make sure retry function calls the original fetch function

### Issue: Empty state always shows
**Solution:** Check your empty state condition - should be `!data?.length` not just `!data`

---

## Testing Strategy

For each page:

1. **Normal Load Test**
   - Page loads data successfully
   - Data displays correctly
   - No error messages

2. **Error Test**
   - Disconnect network (DevTools > Network > Offline)
   - Try to load page
   - Should show error message
   - Retry button should work
   - Reconnect network and retry

3. **Empty Data Test**
   - Mock API to return empty array
   - Page should show empty state
   - Not an error message

4. **Loading Test**
   - Slow down network (DevTools > Network > Slow 3G)
   - Should show loading spinner
   - After load, data displays

---

## Commit Message for Batch 1

```
feat: add error handling to critical pages (8 pages)

- Update Search, Settings, Reports, Timesheet
- Update Projects, Expenses, AllUsers, ResourceManagement
- Add ErrorState component display
- Add LoadingState display
- Add EmptyState display
- Standardize error handling pattern
- Add retry mechanisms on all pages
- Improve user feedback on errors

All pages now have:
- Network error detection
- Timeout handling
- Loading indicators
- Empty state messages
- Retry buttons
- Consistent error patterns
```

---

## After Batch 1 Completion

- [ ] All 8 critical pages updated
- [ ] All manual tests passed
- [ ] All pages commit pushed
- [ ] Begin Batch 2 (secondary pages)
- [ ] Deploy to staging
- [ ] Test in staging environment

---

**Status:** Ready to execute
**Batch 1 Estimated Time:** 2-2.5 hours
**Target:** Complete same session
