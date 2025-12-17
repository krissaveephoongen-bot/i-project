# Admin Console Quick Fix Guide

## Issue: "Unknown Error" After PIN Entry

This guide fixes the common "Unknown Error" that appears after entering the PIN in the admin console.

## Root Causes and Solutions

### 1. Missing or Invalid API Endpoints
**Symptom**: Error after PIN verification
**Fix**:
```
Ensure backend API is running and has these endpoints:
- GET /api/admin/metrics
- GET /api/admin/health  
- GET /api/admin/logs?limit=50
```

**Test**:
```bash
curl http://localhost:5000/api/admin/metrics
```

If these fail, implement the endpoints or use mock data.

### 2. JavaScript Errors in Browser
**Symptom**: Console shows errors, page won't load
**Fix**:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for red errors
4. Check Network tab for failed requests

**Common errors**:
- `Cannot read property 'data' of undefined` → API returning wrong format
- `Failed to fetch` → API not running or CORS issue
- `Timeout` → API taking too long

### 3. Vite Configuration Issues
**Symptom**: API requests return 404 or CORS errors
**Fix**:
Check `vite.config.ts` has:
```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
      secure: false,
    },
  },
}
```

Restart Vite dev server:
```bash
npm start
```

### 4. SessionStorage Not Working
**Symptom**: PIN verification doesn't persist, modal keeps appearing
**Fix**:
1. Clear browser cache/cookies
2. Use incognito/private window
3. Check browser sessionStorage:
   - Open DevTools
   - Application tab
   - Session Storage
   - Verify `adminPINVerified` exists

### 5. React Fragment Not Closed
**Symptom**: App crashes on startup
**Fix**:
File `src/pages/Settings.tsx` has JSX syntax error. Already fixed by removing duplicate TabsContent sections.

Verify fix:
```bash
npm start
```

If error persists, run:
```bash
npm run build 2>&1 | grep -i error
```

## Quick Verification Checklist

- [ ] Backend API running on port 5000
- [ ] Vite dev server running on port 3001
- [ ] No errors in browser console (F12)
- [ ] Network requests show 200 status
- [ ] PIN validation passes
- [ ] sessionStorage shows verification
- [ ] Admin metrics API returns data

## Quick Test

1. **Start Backend**
```bash
# If using Node.js backend
npm run dev:server
# Or your backend start command
```

2. **Start Frontend**
```bash
npm start
# Should open http://localhost:3001
```

3. **Test Admin Console**
```
1. Login with admin account
2. Navigate to /admin/console
3. PIN modal appears → ✓
4. Enter PIN (default: 123456) → ✓
5. Dashboard loads with metrics → ✓
```

4. **Verify Network Requests**
   - Open DevTools (F12)
   - Go to Network tab
   - Filter: "admin"
   - Check these requests succeed:
     - /api/admin/metrics (200)
     - /api/admin/health (200)
     - /api/admin/logs (200)

## Common Fixes to Try First

### Fix 1: Clear All Caches
```bash
# Clear npm cache
npm cache clean --force

# Clear node_modules
rm -rf node_modules
npm install

# Clear browser cache
# DevTools → Application → Clear site data
```

### Fix 2: Hard Restart Dev Server
```bash
# Stop current server (Ctrl+C)
# Wait 5 seconds
npm start
```

### Fix 3: Check Configuration
```typescript
// src/config/admin-config.ts should exist with:
export const validateAdminPIN = (pin: string): boolean => {
  return pin === '123456'; // Or your PIN
};

export const adminConfig = {
  MAX_ATTEMPTS: 5,
  LOG_ATTEMPTS: true,
  NOTIFY_ON_FAILED_ATTEMPTS: true,
};
```

### Fix 4: Verify File Existence
```bash
# Check these files exist:
ls -la src/pages/AdminConsole.tsx
ls -la src/components/AdminPINModal.tsx
ls -la src/components/ProtectedAdminRoute.tsx
ls -la src/contexts/AdminPINContext.tsx
ls -la src/config/admin-config.ts
```

## Enable Debug Mode

Add to browser console:
```javascript
// Enable logging
localStorage.setItem('DEBUG_ADMIN_CONSOLE', 'true');
localStorage.setItem('DEBUG_API_CALLS', 'true');

// Reload page
location.reload();
```

Check console for detailed logs.

## If All Else Fails

### Reset Admin Console to Defaults
```bash
# Backup current config
cp src/config/admin-config.ts src/config/admin-config.ts.backup

# Create new config with defaults
cat > src/config/admin-config.ts << 'EOF'
export const adminConfig = {
  MAX_ATTEMPTS: 5,
  LOG_ATTEMPTS: true,
  NOTIFY_ON_FAILED_ATTEMPTS: false,
};

export const validateAdminPIN = (pin: string): boolean => {
  // Default PIN for testing
  return pin === '000000';
};
EOF

# Restart server
npm start
```

### Force Rebuild
```bash
# Clean build
rm -rf dist
npm run build

# Preview build
npm run preview
```

## Getting Help

When contacting support, provide:
1. Error message from console
2. Network tab screenshot
3. Browser/OS version
4. Steps to reproduce
5. Output of `npm list` (first 20 lines)

## Success Indicators

✓ PIN modal appears after navigating to /admin/console  
✓ PIN verification succeeds with correct PIN  
✓ Admin dashboard loads without errors  
✓ Metrics display actual data  
✓ Refresh button works  
✓ Session expires after 1 hour  
✓ End Session button works  

## Performance Tips

- Keep API responses under 1MB
- Paginate large log results
- Cache metrics data for 30 seconds
- Use virtual scrolling for logs table
- Implement request debouncing

## Security Reminders

- [ ] Change default PIN (123456)
- [ ] Enable audit logging in config
- [ ] Set up failed attempt notifications
- [ ] Monitor admin access logs
- [ ] Implement rate limiting on PIN endpoint

---

**Last Updated**: 2024
**Questions?** Check browser console for detailed error messages
