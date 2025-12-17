# Admin Console Setup and Configuration Guide

## Overview
The Admin Console is a protected administrative interface that requires PIN verification to access system monitoring and management features.

## Architecture

### Components Structure
```
src/
├── pages/
│   └── AdminConsole.tsx           # Main admin console page
├── components/
│   ├── AdminConsoleWrapper.tsx    # Wrapper with lazy loading
│   ├── AdminPINModal.tsx          # PIN verification modal
│   └── ProtectedAdminRoute.tsx    # Route protection component
├── contexts/
│   └── AdminPINContext.tsx        # PIN state management
├── config/
│   └── admin-config.ts            # Admin configuration
└── router/
    └── index.tsx                  # Route definitions

admin-console/
├── index.html                     # Static HTML entry
├── app.jsx                        # React app (standalone)
├── login.html                     # Legacy login page
└── [other supporting files]
```

## How It Works

### 1. Authentication Flow
1. User navigates to `/admin/console`
2. `ProtectedAdminRoute` checks:
   - User is authenticated
   - User has admin/superadmin role
   - PIN is verified
3. If PIN not verified, `AdminPINModal` appears
4. User enters 6-digit PIN
5. PIN is validated via `validateAdminPIN()` function
6. On success, session is stored in sessionStorage

### 2. PIN Verification Session
- **Duration**: 1 hour (3600000ms)
- **Storage**: sessionStorage (cleared on browser close)
- **Keys**:
  - `adminPINVerified`: true/false
  - `adminPINVerifiedAt`: ISO timestamp

### 3. Session Expiration
- Session automatically expires after 1 hour
- User must re-enter PIN to continue
- Warning modal shows before session expires
- Clear button ends session immediately

## Setup Instructions

### Step 1: Verify Configuration Files
Ensure `src/config/admin-config.ts` exists and contains:
```typescript
export const adminConfig = {
  MAX_ATTEMPTS: 5,
  LOG_ATTEMPTS: true,
  NOTIFY_ON_FAILED_ATTEMPTS: true,
};

export const validateAdminPIN = (pin: string): boolean => {
  return pin === '123456'; // Update with your PIN
};
```

### Step 2: Check Route Configuration
The router in `src/router/index.tsx` includes:
```typescript
{
  path: '/admin/console',
  element: <AdminConsoleWrapper />,
}
```

### Step 3: Vite Configuration
The `vite.config.ts` should have these proxies:
```typescript
proxy: {
  '/api': {
    target: 'http://localhost:5000',
    changeOrigin: true,
    secure: false,
  },
  '/admin': {
    target: 'http://localhost:5000',
    changeOrigin: true,
    secure: false,
  },
}
```

### Step 4: Environment Variables
Create `.env` file with:
```
REACT_APP_API_URL=http://localhost:5000/api
NODE_ENV=development
```

## API Endpoints Required

The Admin Console expects these API endpoints:

```
GET /api/admin/metrics
GET /api/admin/health
GET /api/admin/logs?limit=50
POST /api/admin/maintenance/database
POST /api/admin/cache/clear
```

Response format for metrics:
```typescript
{
  totalUsers: number;
  activeUsers: number;
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  completedTasks: number;
  databaseSize: string;
  uptime: string;
  lastBackup: string;
}
```

Response format for health:
```typescript
{
  database: 'healthy' | 'warning' | 'critical';
  api: 'healthy' | 'warning' | 'critical';
  storage: 'healthy' | 'warning' | 'critical';
  cache: 'healthy' | 'warning' | 'critical';
}
```

## Running the Application

### Development Mode
```bash
npm start
# Server runs on http://localhost:3001
# API proxies to http://localhost:5000
```

### Build for Production
```bash
npm run build
```

### Start Production Build
```bash
npm run preview
```

## Accessing Admin Console

1. **Login First**
   - Navigate to login page
   - Enter credentials
   - Admin/superadmin role required

2. **Navigate to Admin Console**
   - Go to `/admin/console`
   - PIN modal appears
   - Enter 6-digit PIN (default: 123456)
   - PIN verification succeeds
   - Admin Console loads with metrics

3. **Features Available**
   - **Overview**: System metrics and performance
   - **Health**: Service health status
   - **Logs**: System event logs
   - **Settings**: System configuration

## Customization

### Change PIN
Edit `src/config/admin-config.ts`:
```typescript
export const validateAdminPIN = (pin: string): boolean => {
  return pin === 'YOUR_PIN_HERE';
};
```

### Modify Session Duration
Edit `src/contexts/AdminPINContext.tsx`:
```typescript
const PIN_SESSION_DURATION = 60 * 60 * 1000; // Change duration here
```

### Update Max Attempts
Edit `src/config/admin-config.ts`:
```typescript
export const adminConfig = {
  MAX_ATTEMPTS: 5, // Change maximum attempts
  LOG_ATTEMPTS: true,
  NOTIFY_ON_FAILED_ATTEMPTS: true,
};
```

## Troubleshooting

### Issue: "Unknown Error" on Admin Console
**Solution:**
1. Check browser console for errors
2. Verify API endpoints are running
3. Check network requests in DevTools
4. Ensure API responses match expected format

### Issue: PIN Modal Won't Close
**Solution:**
1. Check if PIN validation is failing
2. Verify PIN in config matches entered PIN
3. Check console for validation errors

### Issue: API Calls Failing
**Solution:**
1. Verify backend API is running on port 5000
2. Check Vite proxy configuration
3. Ensure API endpoints exist on backend
4. Check CORS headers on backend

### Issue: Session Expires Immediately
**Solution:**
1. Check sessionStorage is enabled
2. Verify PIN_SESSION_DURATION is set correctly
3. Check browser's time sync

## Security Best Practices

1. **PIN Management**
   - Use a strong 6-digit PIN
   - Change PIN regularly
   - Never share PIN
   - Log PIN access attempts

2. **Session Management**
   - Set appropriate session duration
   - Implement session warnings
   - Clear session on logout
   - Monitor failed attempts

3. **API Security**
   - Use HTTPS in production
   - Implement rate limiting
   - Validate all admin requests
   - Log all admin actions

4. **Access Control**
   - Only admin/superadmin can access
   - Require PIN verification
   - Monitor access logs
   - Set up alerts for failed attempts

## Files Modified

### Core Files
- `src/pages/AdminConsole.tsx` - Main admin console component
- `src/components/AdminConsoleWrapper.tsx` - Lazy loading wrapper
- `src/components/AdminPINModal.tsx` - PIN verification UI
- `src/components/ProtectedAdminRoute.tsx` - Route protection
- `src/contexts/AdminPINContext.tsx` - State management
- `src/config/admin-config.ts` - Configuration
- `src/router/index.tsx` - Route definitions
- `vite.config.ts` - Vite configuration
- `admin-console/app.jsx` - Legacy standalone app

## Testing

### Manual Testing Steps

1. **PIN Verification**
   - Navigate to `/admin/console`
   - Verify PIN modal appears
   - Enter correct PIN
   - Verify access granted

2. **Failed Attempts**
   - Navigate to `/admin/console`
   - Enter wrong PIN
   - Verify error message
   - Try 5 times to verify lockout

3. **Session Expiration**
   - Login with PIN
   - Wait for session to expire
   - Verify warning modal
   - Try to refresh page
   - Verify redirect to PIN entry

4. **API Calls**
   - Monitor network tab
   - Verify all endpoints are called
   - Check response data
   - Verify metrics display

## Support and Maintenance

For issues or questions:
1. Check browser console for errors
2. Review Vite dev server logs
3. Check backend API logs
4. Verify configuration files
5. Test with different browsers

## Next Steps

1. Customize PIN and configuration
2. Set up backend API endpoints
3. Configure logging and monitoring
4. Test all features thoroughly
5. Deploy to production

---

**Last Updated**: 2024
**Version**: 1.0
