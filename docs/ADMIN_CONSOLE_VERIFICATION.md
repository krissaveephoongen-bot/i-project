# Admin Console Verification Checklist

## Pre-Launch Verification

### ✅ File Structure Verification

- [ ] `src/pages/AdminConsole.tsx` exists
- [ ] `src/components/AdminConsoleWrapper.tsx` exists
- [ ] `src/components/AdminPINModal.tsx` exists
- [ ] `src/components/ProtectedAdminRoute.tsx` exists
- [ ] `src/contexts/AdminPINContext.tsx` exists
- [ ] `src/config/admin-config.ts` exists (if using)
- [ ] `src/router/index.tsx` includes admin route
- [ ] `vite.config.ts` has admin proxy configured
- [ ] `.env` file has required variables

### ✅ Code Quality Verification

```bash
# Run build to check for TypeScript errors
npm run build
```

- [ ] No TypeScript errors in `npm run build`
- [ ] No ESLint warnings
- [ ] Admin files have no syntax errors
- [ ] Router imports resolve correctly

### ✅ Configuration Verification

**File: `src/config/admin-config.ts`**
```typescript
// Should contain:
export const adminConfig = {
  MAX_ATTEMPTS: 5,
  LOG_ATTEMPTS: true,
  NOTIFY_ON_FAILED_ATTEMPTS: true,
};

export const validateAdminPIN = (pin: string): boolean => {
  return pin === '123456';
};
```

- [ ] Config file exists
- [ ] PIN validation function exists
- [ ] adminConfig object is exported
- [ ] MAX_ATTEMPTS is set
- [ ] LOG_ATTEMPTS is configured

### ✅ Route Verification

**File: `src/router/index.tsx`**
```typescript
// Should have in backoffice routes:
{
  path: '/admin/console',
  element: <AdminConsoleWrapper />,
}
```

- [ ] AdminConsole is imported
- [ ] AdminConsoleWrapper is imported
- [ ] Route path is `/admin/console`
- [ ] Route is protected with admin role check
- [ ] Lazy loading is configured

### ✅ Vite Configuration Verification

**File: `vite.config.ts`**
```typescript
server: {
  proxy: {
    '/api': { ... },
    '/admin': {
      target: 'http://localhost:5000',
      changeOrigin: true,
      secure: false,
    },
  },
}
```

- [ ] `/admin` proxy is configured
- [ ] `/api` proxy is configured
- [ ] Both point to correct backend URL
- [ ] Port 3000 is configured
- [ ] Host is set to `true`

### ✅ Environment Variables Verification

**File: `.env`**
```
REACT_APP_API_URL=http://localhost:5000/api
NODE_ENV=development
```

- [ ] `.env` file exists
- [ ] `REACT_APP_API_URL` is set correctly
- [ ] `NODE_ENV` is set
- [ ] No hardcoded URLs in components

## Runtime Verification

### ✅ Development Server

```bash
npm start
```

- [ ] Dev server starts without errors
- [ ] Vite shows "ready in XXX ms"
- [ ] Browser opens to http://localhost:3001
- [ ] No errors in terminal
- [ ] HMR is working (changes reflect immediately)

### ✅ Authentication Flow

1. Navigate to http://localhost:3001
2. Go to Login page
3. Login with admin account credentials

- [ ] Login succeeds
- [ ] Redirected to dashboard
- [ ] User role shows admin/superadmin
- [ ] Token is stored in localStorage/sessionStorage

### ✅ Admin Console Access

1. Navigate to http://localhost:3001/admin/console

- [ ] Page loads without errors
- [ ] PIN modal appears
- [ ] Modal shows title "Admin Console"
- [ ] PIN input field is focused
- [ ] Submit button is disabled (before PIN entered)

### ✅ PIN Verification

1. In PIN modal, enter `123456` (default)
2. Click submit button

- [ ] Request is sent to server (check Network tab)
- [ ] PIN is validated
- [ ] Modal closes on success
- [ ] Admin console dashboard appears
- [ ] No console errors

### ✅ Admin Console Dashboard

Check that dashboard shows:

- [ ] Header with "Admin Console" title
- [ ] Refresh and End Session buttons
- [ ] Green "Admin Console Secured" banner
- [ ] Tab navigation (Overview, Health, Logs, Settings)
- [ ] Metrics cards (Users, Projects, Tasks, Database)
- [ ] System Performance section

### ✅ Data Loading

- [ ] Metrics load and display real numbers
- [ ] No loading spinner after 3 seconds
- [ ] Data refreshes when Refresh button clicked
- [ ] No 404 errors for API endpoints

### ✅ Tab Functionality

**Overview Tab**
- [ ] Metrics display correctly
- [ ] Numbers are not NaN
- [ ] All 4 metric cards visible

**Health Tab**
- [ ] Service status cards appear
- [ ] Status shows healthy/warning/critical
- [ ] Icons display correctly
- [ ] Maintenance buttons clickable

**Logs Tab**
- [ ] Logs table appears
- [ ] Scrollable if many logs
- [ ] Timestamps formatted correctly
- [ ] No errors in log display

**Settings Tab**
- [ ] Settings form displays
- [ ] Read-only fields disabled
- [ ] Configuration values visible
- [ ] No form submission (disabled)

### ✅ Session Management

1. After PIN verification, session is active
2. Wait 1 hour OR modify PIN_SESSION_DURATION to 10 seconds for testing

- [ ] Session indicator shows active
- [ ] Admin console remains accessible
- [ ] Refresh button works throughout session
- [ ] After timeout, new PIN required
- [ ] Session warning appears before expiry

### ✅ Logout/End Session

1. Click "End Session" button

- [ ] Button click is responsive
- [ ] Modal closes
- [ ] Redirected to menu/dashboard
- [ ] PIN verification cleared
- [ ] Toast notification shows success

### ✅ Error Handling

**Test with wrong PIN**
1. Navigate to /admin/console
2. Enter `000000`
3. Click submit

- [ ] Error message appears
- [ ] Attempt counter shows (1/5)
- [ ] PIN input clears
- [ ] Modal stays open

**Test lockout**
1. Enter wrong PIN 5 times

- [ ] Lockout message appears
- [ ] "Sign Out All" button disabled
- [ ] Modal closes after 2 seconds
- [ ] Redirected to previous page

## API Integration Verification

### ✅ Backend Endpoints

Verify these endpoints exist on your backend:

```bash
# GET request to metrics
curl -X GET http://localhost:5000/api/admin/metrics \
  -H "Authorization: Bearer TOKEN"

# Expected response:
{
  "totalUsers": 10,
  "activeUsers": 8,
  "totalProjects": 5,
  "activeProjects": 3,
  "totalTasks": 50,
  "completedTasks": 30,
  "databaseSize": "256MB",
  "uptime": "45 days",
  "lastBackup": "2 hours ago"
}
```

- [ ] `/api/admin/metrics` returns 200
- [ ] `/api/admin/health` returns 200
- [ ] `/api/admin/logs?limit=50` returns 200
- [ ] All responses have correct format
- [ ] Response times are < 2 seconds

### ✅ Network Requests

Open Browser DevTools (F12) → Network tab

1. Navigate to /admin/console
2. Enter PIN and verify
3. Check Network tab

Should see requests:
- [ ] `POST /api/auth/verify` (or similar)
- [ ] `GET /api/admin/metrics` (200)
- [ ] `GET /api/admin/health` (200)
- [ ] `GET /api/admin/logs` (200)

All requests should show:
- [ ] Status: 200 (success)
- [ ] No CORS errors
- [ ] Response size reasonable
- [ ] Timing < 1 second each

### ✅ Error Responses

If API returns error:
- [ ] User sees error message
- [ ] No crashes or console errors
- [ ] Toast notification shows error
- [ ] Retry is possible

## Browser Compatibility

Test on multiple browsers:

- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge

For each browser verify:
- [ ] PIN modal appears
- [ ] PIN validation works
- [ ] Dashboard displays
- [ ] All tabs functional
- [ ] Responsive on mobile

## Performance Verification

### ✅ Load Times

```bash
# Use Lighthouse or DevTools
1. Open DevTools
2. Audits tab
3. Run Lighthouse
```

- [ ] First Contentful Paint < 3s
- [ ] Time to Interactive < 5s
- [ ] Largest Contentful Paint < 3s
- [ ] Cumulative Layout Shift < 0.1

### ✅ Memory Usage

- [ ] No memory leaks on navigation
- [ ] Session Storage not exceeding 10MB
- [ ] No excessive re-renders
- [ ] React DevTools shows no warnings

### ✅ Bundle Size

```bash
npm run build
```

- [ ] Build completes successfully
- [ ] No large chunk warnings
- [ ] Total bundle < 500KB (gzipped)
- [ ] Admin console code is chunked

## Security Verification

- [ ] PIN not stored in localStorage
- [ ] Tokens use secure httpOnly flag
- [ ] No hardcoded secrets in code
- [ ] HTTPS required in production
- [ ] CORS properly configured
- [ ] Rate limiting on PIN endpoint
- [ ] Failed attempts logged
- [ ] Session timeout enforced

## Production Readiness

Before deploying to production:

- [ ] All tests passing
- [ ] No console errors
- [ ] No console warnings
- [ ] Build completes without warnings
- [ ] Environment variables configured
- [ ] Backend security hardened
- [ ] Rate limiting enabled
- [ ] Logging enabled
- [ ] Monitoring set up
- [ ] Backup systems tested

## Rollout Plan

1. Deploy to staging environment
2. Run full verification checklist
3. Security audit
4. Load testing
5. Deploy to production
6. Monitor for errors
7. Set up alerts

## Rollback Plan

If issues occur:
1. Revert to previous version
2. Check error logs
3. Fix issues
4. Re-test on staging
5. Deploy again

## Success Criteria

All items checked ✓ means:
- ✅ Admin console is fully functional
- ✅ PIN verification working
- ✅ All tabs and features accessible
- ✅ No errors in console
- ✅ API integration complete
- ✅ Session management working
- ✅ Ready for production

## Sign-Off

- [ ] Developer: Verified all items
- [ ] QA: All tests passed
- [ ] Product: Feature accepted
- [ ] Security: Security review passed
- [ ] DevOps: Deployment ready

---

**Verification Date**: _______________  
**Verified By**: _______________  
**Status**: 🟢 Ready / 🟡 In Progress / 🔴 Issues Found
