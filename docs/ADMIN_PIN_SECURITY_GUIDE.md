# Admin PIN Security Guide

## Overview
The Admin Console requires PIN verification before access. This guide explains how the system works, how to manage PINs, and best practices for security.

## Current PIN Configuration

### Default PIN (Testing Only)
- **PIN**: `123456`
- **Status**: ⚠️ MUST BE CHANGED for production
- **Location**: `/src/config/admin-config.ts`

## PIN Management Flow

### 1. First Access to Admin Console
```
User clicks "Admin Console" menu → Redirected to /admin/console
↓
PIN Modal appears (full screen overlay)
↓
User enters 6-digit PIN
↓
System validates PIN against configured PIN
↓
If correct → Session created (1 hour duration)
If incorrect → Error message, attempt counter increments
After 3 failed attempts → Access locked
```

### 2. Session Management
- **Session Duration**: 1 hour
- **Session Storage**: Browser's `sessionStorage`
- **Keys Used**:
  - `adminPINVerified`: Boolean flag
  - `adminPINVerifiedAt`: Timestamp

### 3. PIN Change Process
Navigate to: **Menu > Administration > PIN Management** (`/admin/pin-management`)

**Requirements**:
1. ✅ User must be authenticated with admin role
2. ✅ Verify current PIN (for security)
3. ✅ Enter new PIN (6 digits)
4. ✅ Confirm new PIN
5. ✅ Optional: Add reason for change

**Features**:
- Generate random 6-digit PIN
- Show/Hide PIN toggle
- Real-time validation
- PIN change history with timestamps
- Change reason logging
- Security settings management

## Permission Model

### Routes & Access Control
| Route | Required Role | Requires PIN | Description |
|-------|--------------|--------------|-------------|
| `/admin/console` | `admin` or `superadmin` | ✅ Yes | Main Admin Console dashboard |
| `/admin/pin-management` | `admin` or `superadmin` | ❌ No | PIN management page |
| `/backoffice/*` | `admin` | ❌ No | Backoffice pages |

### Access Denied Scenarios
User will be redirected to `/menu` if:
1. Not authenticated (redirect to `/login`)
2. Not admin role
3. Trying to access `/admin/console` without PIN verification

## Security Features

### 1. PIN Protection
- 6-digit numeric PIN
- Case-sensitive storage
- Cannot reuse same PIN
- Must verify current PIN to change

### 2. Session Security
- Sessions stored in `sessionStorage` (cleared on browser close)
- 1-hour automatic expiration
- Manual logout clears session immediately
- Expired sessions trigger re-verification

### 3. Attempt Limiting
- **Max Attempts**: 3
- **Lockout Duration**: 15 minutes
- **Logging**: Attempt tracking (if enabled)
- **Notifications**: Failed attempt alerts (if enabled)

### 4. Audit Trail
- PIN change history
- Changed by: User information
- Changed at: Timestamp
- Reason: Optional note

## Configuration Settings

### Location
`/src/config/admin-config.ts`

### Available Settings
```typescript
adminConfig = {
  PIN: '123456',                          // Current PIN
  MAX_ATTEMPTS: 3,                        // Failed attempt limit
  LOCKOUT_DURATION: 15 * 60 * 1000,      // Lockout time (ms)
  ENABLE_PIN_PROTECTION: true,            // Enable/disable PIN
  PIN_ENTRY_TIMEOUT: 300,                 // Timeout seconds
  LOG_ATTEMPTS: true,                     // Log attempts
  NOTIFY_ON_FAILED_ATTEMPTS: true,       // Send notifications
  ADMIN_EMAIL: 'admin@example.com',      // Notification email
  REQUIRE_2FA: false,                     // 2FA requirement
  SESSION_TIMEOUT: 60,                    // Session minutes
  ENABLE_AUDIT_LOG: true,                 // Audit logging
  RATE_LIMIT: {
    enabled: true,
    maxRequests: 5,
    windowMs: 60 * 1000,
  }
}
```

## Context Usage

### AdminPINContext
Provides PIN verification state management.

**Hook**: `useAdminPIN()`

**Available Methods**:
```typescript
const {
  isPINVerified,        // Boolean: Is PIN verified?
  verifyPIN,           // Function: Mark as verified
  clearPINVerification, // Function: Clear verification
  lastVerifiedAt,      // Date: Last verification time
  isSessionExpired,    // Function: Check expiration
} = useAdminPIN();
```

**Example Usage**:
```tsx
import { useAdminPIN } from '@/contexts/AdminPINContext';

export default function MyComponent() {
  const { isPINVerified, verifyPIN, clearPINVerification } = useAdminPIN();
  
  const handleSuccessfulPINEntry = () => {
    verifyPIN(); // Mark as verified
  };
  
  const handleLogout = () => {
    clearPINVerification(); // Clear verification
  };
  
  if (!isPINVerified) {
    return <div>PIN verification required</div>;
  }
  
  return <div>Admin Console Content</div>;
}
```

## User Experience Flow

### 1. Entering Admin Console
```
[Menu] → Click "Admin Console"
  ↓
[PIN Modal - Full Screen Overlay]
  - Shows security warning
  - PIN input field (6 digits)
  - Shows/Hide toggle
  - Attempt counter
  - Security info box
  ↓
User enters PIN and clicks "Login"
  ↓
[Success]
  - Modal closes
  - Admin Console loads
  - Green security status badge shows
  - Session starts (1 hour)
```

### 2. Session Management
```
[Admin Console Active]
  - User can view/manage system
  - "End Session" button available
  - Green status badge shows "PIN verified"
  ↓
[After 1 hour]
  - Session expires automatically
  - User redirected to PIN re-verification
  - Must enter PIN again
  ↓
[Manual Logout]
  - Click "End Session" button
  - Session cleared immediately
  - Redirect to Menu
  - Toast notification shown
```

### 3. Managing PIN
```
[Menu] → Administration > PIN Management
  ↓
[PIN Management Page]
  - Shows current PIN (masked)
  - Change PIN section
  - Settings panel
  - Change history table
  ↓
Enter current PIN (verification)
Enter new PIN (6 digits)
Confirm new PIN
Optional: Add reason
  ↓
Click "Change PIN"
  ↓
[Success]
  - PIN updated
  - Entry added to history
  - Toast notification
  - Current PIN display updated
```

## Best Practices

### 1. PIN Policies
✅ DO:
- Change PIN regularly (monthly)
- Use random PIN generator
- Store PIN securely (password manager)
- Keep PIN confidential
- Use different PIN for each environment (dev, staging, prod)

❌ DON'T:
- Use sequential numbers (123456, 000000)
- Use birthdates or simple patterns
- Share PIN with multiple people
- Use same PIN for different systems
- Write PIN down in plain text

### 2. Security
✅ DO:
- Monitor failed attempts
- Review PIN change history
- Use 2FA if enabled
- Logout when not in use
- Check session expiration

❌ DON'T:
- Leave Admin Console unattended
- Use public/shared computers
- Enable unnecessary permissions
- Disable PIN protection

### 3. Operational
✅ DO:
- Document PIN changes
- Notify team of PIN updates
- Set audit logging
- Monitor access logs
- Implement rate limiting

❌ DON'T:
- Disable PIN protection
- Set very simple PINs
- Ignore failed attempts
- Extend session duration unnecessarily

## Troubleshooting

### Session Expired While Using Console
**Solution**: Click "Verify PIN Again" button when prompted, or navigate back to Admin Console and enter PIN again.

### Locked Out (3 Failed Attempts)
**Solution**: Wait 15 minutes for lockout to expire, or contact system administrator.

### Forgot PIN
**Steps**:
1. Go to PIN Management page (`/admin/pin-management`)
2. Request PIN reset (requires authentication)
3. New PIN will be sent to admin email
4. Update PIN after receiving reset

### PIN Not Saving
**Check**:
1. Browser's sessionStorage is enabled
2. No JavaScript errors in console
3. Sufficient disk space
4. Try clearing browser cache
5. Use modern browser (Chrome, Firefox, Safari, Edge)

## Development Notes

### Testing
**Test PIN**: `123456`
**Test Credentials**: Use admin account for login

### Browser Storage
- Stored in: `sessionStorage` (cleared on browser close)
- Not stored in: `localStorage` (for security)
- Not stored in: Cookies (for security)

### Session Duration
- Default: 1 hour
- Can be changed in `admin-config.ts`
- Configurable per environment

## Advanced Topics

### Custom PIN Validation
To implement custom validation, modify in `AdminPINContext`:
```typescript
export const validateAdminPIN = (enteredPIN: string): boolean => {
  const correctPIN = getAdminPIN();
  return enteredPIN === correctPIN;
};
```

### Extending Session Duration
Modify in `admin-config.ts`:
```typescript
PIN_SESSION_DURATION = 2 * 60 * 60 * 1000; // 2 hours
```

### Integration with 2FA
Enable 2FA requirement in `admin-config.ts`:
```typescript
REQUIRE_2FA: true, // Requires 2FA setup
```

## Support

For issues or questions:
1. Check this documentation
2. Review logs in Admin Console > Logs tab
3. Contact system administrator
4. Submit bug report with details

---

**Last Updated**: 2024-01-15
**Status**: Production Ready
**Version**: 1.0
