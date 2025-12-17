# Admin Console PIN Protection - Complete Guide

## 🔐 Overview

The Admin Console is now protected with a 6-digit PIN that must be entered before accessing the admin dashboard. This adds an extra layer of security to prevent unauthorized access.

---

## 📍 Features

✅ **6-Digit PIN Protection** - Secure PIN-based authentication
✅ **Attempt Limiting** - Maximum 3 failed attempts before lockout
✅ **Admin-Only Access** - Only users with admin role can see the menu
✅ **Security Logging** - Optional logging of access attempts
✅ **Beautiful UI** - Modern, responsive PIN entry interface
✅ **Animated Modal** - Smooth animations and transitions
✅ **Dark Mode Support** - Works with dark and light themes

---

## 🔧 Configuration

### Default PIN
```
123456
```

⚠️ **IMPORTANT**: Change this PIN immediately in production!

### Configuration File

Edit `src/config/admin-config.ts` to change PIN and security settings:

```typescript
export const adminConfig = {
  // Change this PIN to your custom 6-digit PIN
  PIN: '123456',

  // Maximum PIN entry attempts
  MAX_ATTEMPTS: 3,

  // Lockout duration (15 minutes)
  LOCKOUT_DURATION: 15 * 60 * 1000,

  // Admin Console URL
  ADMIN_CONSOLE_URL: '/admin/index.html',

  // Enable/disable PIN protection
  ENABLE_PIN_PROTECTION: true,

  // PIN entry timeout (5 minutes)
  PIN_ENTRY_TIMEOUT: 300,

  // Log attempts for security audit
  LOG_ATTEMPTS: true,

  // Send email notifications on failed attempts
  NOTIFY_ON_FAILED_ATTEMPTS: true,

  // Admin email for notifications
  ADMIN_EMAIL: 'admin@example.com',

  // IP whitelist (optional)
  IP_WHITELIST: [] as string[],

  // Require 2FA
  REQUIRE_2FA: false,

  // Session timeout (minutes)
  SESSION_TIMEOUT: 60,

  // Enable audit logging
  ENABLE_AUDIT_LOG: true,

  // Rate limiting
  RATE_LIMIT: {
    enabled: true,
    maxRequests: 5,
    windowMs: 60 * 1000,
  },
};
```

---

## 🔑 How to Change the PIN

### Step 1: Open Configuration File
```
src/config/admin-config.ts
```

### Step 2: Find the PIN Setting
```typescript
PIN: '123456', // <- Change this
```

### Step 3: Enter New PIN
```typescript
PIN: '987654', // Your new 6-digit PIN
```

### Step 4: Save and Restart
- Save the file
- Restart your development server
- The new PIN will take effect immediately

---

## 🚀 How to Use

### For Admin Users

1. **Open Sidebar Menu**
   - Click the menu icon in the top-left corner
   - Or open on larger screens (always visible)

2. **Find Admin Console**
   - Look for "Admin Console" menu item with 🔐 icon (red)
   - Only visible to users with admin role

3. **Click Admin Console**
   - A PIN entry modal will appear
   - Enter the 6-digit PIN

4. **Enter PIN**
   - Type or paste the 6-digit PIN
   - PIN display updates in real-time

5. **Submit**
   - Click "เข้าสู่ระบบ" (Login) button
   - Or press Enter after entering 6 digits

6. **Access Granted**
   - Admin Console opens in a new tab
   - Full admin dashboard now available

---

## 🛡️ Security Features

### PIN Validation
- Validates 6-digit numeric PIN only
- Non-numeric characters automatically filtered
- Password field (asterisks) for security

### Attempt Limiting
- Maximum 3 failed attempts
- After 3 failures, modal locks for 15 minutes
- User must close modal and try again later

### Logging
- All access attempts can be logged (if enabled)
- Failed attempts logged with timestamp
- Success attempts also logged

### Notifications
- Optional email notifications on failed attempts
- Alerts to admin about suspicious activity
- Configurable notification settings

### Session Management
- Sessions timeout after inactivity (60 minutes default)
- User must re-enter PIN after timeout
- Secure session handling

---

## 📋 PIN Entry Rules

✅ **Valid PIN**
- Exactly 6 digits
- Numbers only (0-9)
- Example: `123456`

❌ **Invalid PIN**
- Less than 6 digits
- More than 6 digits
- Contains letters or special characters
- Spaces included

---

## 🔒 Best Practices

### PIN Selection
1. **Change Default PIN** immediately
2. **Use Strong PIN** - not sequential (123456)
3. **Use Random PIN** - mix of random numbers
4. **Avoid Common Patterns** - birthdays, anniversaries
5. **Keep PIN Secret** - don't share with others

### PIN Management
1. **Rotate PIN Regularly** - change every 3 months
2. **Use Different PINs** - different PIN for each admin
3. **Document PIN Securely** - in encrypted manager
4. **Audit Access** - review logs regularly
5. **Monitor Attempts** - watch for failed attempts

### Security Tips
1. **Enable Logging** - track all access attempts
2. **Enable Notifications** - get alerted on failures
3. **Monitor Lockouts** - check for brute force attacks
4. **Whitelist IPs** - restrict to known IP addresses
5. **Enable 2FA** - add second factor authentication

---

## 🚨 Common Issues & Solutions

### Issue: PIN Not Working
**Solution**: 
- Verify PIN is exactly 6 digits
- Check for typos in config file
- Ensure server is restarted
- Clear browser cache

### Issue: Locked Out After 3 Attempts
**Solution**:
- Wait 15 minutes for lockout to expire
- Refresh the page and try again
- Check if PIN was entered correctly
- Contact admin if locked out

### Issue: PIN Modal Not Appearing
**Solution**:
- User might not have admin role
- Check user role in database
- Verify `requiredRole: ['admin']` in menu config
- Clear browser localStorage

### Issue: Admin Console Opens Blank
**Solution**:
- Admin console HTML file exists at `/admin/index.html`
- Check file is in correct location
- Verify server is serving static files
- Check browser console for errors

---

## 📝 Environment Variables

For production, store PIN in environment variables:

```bash
# .env file
REACT_APP_ADMIN_PIN=987654
```

Update config file:
```typescript
export const getAdminPIN = (): string => {
  return process.env.REACT_APP_ADMIN_PIN || adminConfig.PIN;
};
```

---

## 🔍 Monitoring & Auditing

### View Access Logs
```typescript
// Browser console shows logs if LOG_ATTEMPTS is enabled
console.log('✅ Admin console accessed successfully');
console.warn('❌ Failed admin console access attempt');
```

### Check Failed Attempts
- Look for warning messages in browser console
- Review application logs if logging is enabled
- Check email for notifications (if enabled)

### Audit Trail
- Enable `ENABLE_AUDIT_LOG: true` for full audit trail
- Log file location: depends on your logging system
- Review logs regularly for security

---

## 🔗 File Structure

```
src/
├── components/
│   ├── AdminPINModal.tsx         [PIN Entry Modal]
│   └── layout/
│       └── Sidebar.tsx           [Updated with Admin Console]
├── config/
│   └── admin-config.ts           [Configuration]
└── ...
```

---

## 📚 Related Files

- `src/components/AdminPINModal.tsx` - PIN entry component
- `src/components/layout/Sidebar.tsx` - Updated sidebar menu
- `src/config/admin-config.ts` - Configuration file
- `admin-console/index.html` - Admin console page
- `admin-console/app.jsx` - Admin console app

---

## 🧪 Testing

### Test Correct PIN
1. Click Admin Console
2. Enter correct PIN (default: 123456)
3. Should open admin console in new tab

### Test Incorrect PIN
1. Click Admin Console
2. Enter wrong PIN
3. Should show error message
4. After 3 failures, should lock

### Test Lockout
1. Click Admin Console
2. Enter wrong PIN 3 times
3. Should show lockout message
4. Should auto-close after 2 seconds
5. Must wait 15 minutes to retry

---

## 🔐 Security Checklist

- [ ] Changed default PIN to custom value
- [ ] PIN is at least 6 digits, non-sequential
- [ ] Logging is enabled
- [ ] Notifications are enabled
- [ ] Admin email is configured
- [ ] User only has admin role if needed
- [ ] Database user role is correct
- [ ] Server is restarted after changes
- [ ] PIN is stored securely
- [ ] Access logs are reviewed regularly

---

## 🎯 PIN Recommendations

### Strong PIN Examples
- 🟢 837492
- 🟢 561839
- 🟢 924715
- 🟢 483619

### Weak PIN Examples
- 🔴 123456 (sequential)
- 🔴 000000 (all same)
- 🔴 111111 (all same)
- 🔴 654321 (reverse sequential)

---

## 📞 Support

### Forgot PIN?
1. Contact system administrator
2. They can change PIN in config file
3. Restart server
4. Use new PIN

### Suspicious Activity?
1. Check access logs
2. Review failed attempts
3. Consider changing PIN
4. Check user permissions
5. Enable IP whitelist

### Need More Security?
1. Enable 2FA (REQUIRE_2FA: true)
2. Add IP whitelist
3. Rotate PIN regularly
4. Monitor access logs
5. Set shorter session timeout

---

## 🎓 Summary

The Admin Console is now protected with:
- ✅ 6-digit PIN authentication
- ✅ Attempt limiting and lockout
- ✅ Security logging
- ✅ Email notifications
- ✅ Beautiful, responsive UI
- ✅ Admin-only access
- ✅ Fully configurable

**Get started by changing the default PIN to your custom 6-digit PIN in `src/config/admin-config.ts`**

---

**Version**: 1.0.0
**Status**: Production Ready
**Date**: December 2024
