# Error Handling Testing Guide

## Overview

This guide explains how to manually test the error handling system that was implemented across all critical pages.

---

## Error Scenarios to Test

### 1. Network Error (Connection Failed)
**How to simulate:**
- Disconnect internet connection
- Use browser DevTools to throttle network
- Block network requests in DevTools

**Expected behavior:**
- ErrorState component displays
- Shows network error message
- "Retry" button is visible and functional
- Retry successfully recovers when connection restored

**Pages to test:**
- Reports.tsx
- Dashboard.tsx
- Activity.tsx
- Timesheet.tsx
- Projects.tsx
- AllUsers.tsx
- Expenses.tsx
- ResourceManagement.tsx

---

### 2. Server Error (5xx)
**How to simulate:**
- Use browser DevTools to mock server errors (500, 503, etc.)
- Set backend to return error status codes
- Use Postman to test API endpoints

**Expected behavior:**
- ErrorState displays with server error message
- Suggests checking server status
- Offers retry button
- Shows detailed error information if available

**Test URLs:**
- `/reports` - Generate Report (should show error)
- `/dashboard` - Load dashboard (should show error)
- `/activity` - Load activity log
- `/projects` - Load projects list

---

### 3. Timeout Error (408)
**How to simulate:**
- Use DevTools to set request timeout to very low (< 1 second)
- Add network latency in DevTools

**Expected behavior:**
- Shows timeout error message
- Suggests checking internet speed
- Provides retry with increased timeout option

---

### 4. Empty State
**How to simulate:**
- API returns empty array/null data
- No data matches filters
- First load with no existing data

**Expected behavior:**
- EmptyState component displays
- Shows contextual empty message
- Provides actionable next steps (e.g., "Create first item")
- Not shown as an error - treated as valid state

---

### 5. Successful Retry
**How to simulate:**
- Trigger error (disconnect network)
- Fix the issue (reconnect)
- Click retry button

**Expected behavior:**
- Error state clears
- Data successfully loads
- No error message displayed
- UI updates with fresh data

---

## Manual Testing Steps

### For Reports.tsx
1. Navigate to `/reports`
2. Click "Generate Report" button
3. **With internet off:** Should show error
4. **Turn internet on:** Click retry - should load
5. Verify error state displays correctly

### For Dashboard.tsx
1. Navigate to `/dashboard`
2. Disconnect internet
3. Refresh page
4. Should show ErrorState with retry
5. Reconnect internet and retry

### For Activity.tsx
1. Navigate to `/activity`
2. Should load successfully
3. Disconnect internet
4. Refresh page
5. Should show error with retry option

### For Timesheet.tsx
1. Navigate to `/timesheet`
2. Disconnect internet
3. Try to load time entries
4. Should show error state

---

## Automated Test Script

To test error handling programmatically in browser console:

```javascript
// Test 1: Check if ErrorState component exists
console.log('ErrorState available:', !!window.__ErrorState);

// Test 2: Simulate network error
fetch('http://localhost:3001/api/invalid-endpoint')
  .catch(err => console.log('Network error caught:', err));

// Test 3: Check error parser
const testError = new Error('Test error message');
console.log('Parsed error:', window.__parseApiError?.(testError));
```

---

## Verification Checklist

- [ ] All pages load without TypeScript errors
- [ ] ErrorState components render correctly
- [ ] Error messages are clear and helpful
- [ ] Retry buttons appear and function
- [ ] Loading states appear during API calls
- [ ] Empty states display when data is empty
- [ ] No console errors or warnings
- [ ] Error states persist until retry is clicked
- [ ] Retry successfully clears error state
- [ ] Network errors handled gracefully

---

## Error Messages to Look For

The system should display messages like:

1. **Network Error:**
   - "Unable to connect to the server"
   - "Check your internet connection"
   - "Try again" button

2. **Server Error:**
   - "Server error occurred"
   - "Please contact support"
   - "Try again" button

3. **Timeout:**
   - "Request timed out"
   - "Please check your internet speed"
   - "Try again" button

4. **Empty Data:**
   - "No items found"
   - "Create your first item" (contextual action)
   - No error styling

---

## Browser DevTools Tips

### Throttle Network
1. Open DevTools (F12)
2. Go to Network tab
3. Find "Throttling" dropdown (usually says "No throttling")
4. Select "Slow 3G" or "Fast 3G"

### Block Requests
1. Open DevTools
2. Go to Network tab
3. Right-click request → Block request URL
4. Try loading page again

### Mock Server Errors
1. Use Network tab to block requests
2. Or use a proxy tool like Charles/Fiddler
3. Or modify backend to return errors

---

## Success Criteria

- ✅ All error states display correctly
- ✅ Retry buttons work and recover from errors
- ✅ Error messages are user-friendly
- ✅ No data loss when errors occur
- ✅ Loading states prevent user confusion
- ✅ Empty states are clearly distinguished from errors
- ✅ All pages follow consistent error handling pattern

---

## Deployment Test Plan

**Before production deployment:**

1. **Local Testing** (Development)
   - Test each error scenario locally
   - Verify error messages are clear
   - Confirm retry functionality works

2. **Staging Testing** (Pre-production)
   - Test with real backend
   - Verify error recovery
   - Check error logging

3. **Production Monitoring**
   - Monitor error rates after deployment
   - Check error logs in monitoring tools
   - Gather user feedback on error messages

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Error state stuck | Clear browser cache, check retry button |
| No error message | Check console for logged errors |
| Retry doesn't work | Verify network is restored, clear cache |
| Wrong error message | Check parseApiError implementation |
| Page shows loading forever | Check network tab in DevTools |

---

## Documentation

For implementation details, see:
- `ERROR_HANDLING_QUICK_REFERENCE.md` - Quick setup guide
- `ERROR_HANDLING_IMPLEMENTATION_SUMMARY.md` - Full implementation details
- `ERROR_HANDLING_DEPLOYMENT_READY.md` - Deployment checklist
- `AGENTS.md` - Error handling patterns and standards

---

**Last Updated:** January 5, 2026
