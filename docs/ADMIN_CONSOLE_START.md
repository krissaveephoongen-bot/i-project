# Admin Console - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Create Configuration File (1 minute)

Create `src/config/admin-config.ts`:

```typescript
export const adminConfig = {
  MAX_ATTEMPTS: 5,
  LOG_ATTEMPTS: true,
  NOTIFY_ON_FAILED_ATTEMPTS: true,
};

export const validateAdminPIN = (pin: string): boolean => {
  // Default PIN: 123456
  // Change this to your PIN
  return pin === '123456';
};
```

### Step 2: Start Development Server (1 minute)

```bash
npm install
npm start
```

Expected output:
```
VITE v5.4.21 ready in XXX ms
➜ Local: http://localhost:3001/
```

### Step 3: Login (1 minute)

1. Open http://localhost:3001
2. Go to login page
3. Login with admin credentials
4. You should have `admin` or `superadmin` role

### Step 4: Access Admin Console (1 minute)

1. Navigate to http://localhost:3001/admin/console
2. PIN modal should appear
3. Enter PIN: `123456`
4. Click submit button

### Step 5: Verify Success (1 minute)

You should see:
- ✅ PIN modal closes
- ✅ Admin dashboard loads
- ✅ Green "Admin Console Secured" banner
- ✅ System metrics displayed
- ✅ Tab navigation visible (Overview, Health, Logs, Settings)

## ✅ Success Checklist

- [ ] Development server running on port 3001
- [ ] No errors in terminal
- [ ] No errors in browser console (F12)
- [ ] Login succeeds
- [ ] Admin console accessible at /admin/console
- [ ] PIN modal appears
- [ ] PIN verification succeeds
- [ ] Dashboard loads without errors

## 🔧 Troubleshooting

### Issue: PIN Modal Won't Close

**Check**:
```typescript
// Make sure PIN in config matches what you entered
// Default: '123456'
```

### Issue: Dashboard Shows "Loading..."

**Check**:
1. Backend API running on port 5000?
2. API endpoints exist?
   - GET /api/admin/metrics
   - GET /api/admin/health
   - GET /api/admin/logs

### Issue: "Unknown Error" Message

**Debug**:
1. Open Browser DevTools (F12)
2. Go to Console tab
3. Look for red errors
4. Go to Network tab
5. Check API requests (should be green 200)

### Issue: Build Fails

**Try**:
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npm run build
```

## 📚 Documentation

Full documentation available in:
- `ADMIN_CONSOLE_SETUP.md` - Detailed setup
- `ADMIN_CONSOLE_QUICK_FIX.md` - Troubleshooting
- `ADMIN_CONSOLE_VERIFICATION.md` - Complete checklist
- `ADMIN_CONSOLE_IMPLEMENTATION_SUMMARY.md` - Overview

## 🎯 Features Walkthrough

### Overview Tab
- See system metrics
- View user and project counts
- Check database size and uptime
- Monitor task completion rate

### Health Tab
- Check service status (database, API, storage, cache)
- Run database maintenance
- Clear application cache

### Logs Tab
- View system event logs
- Filter by log level (info, warning, error)
- See who performed what actions

### Settings Tab
- View system configuration
- See security settings (read-only)
- Check session and auto-backup status

## ⚙️ Customization

### Change PIN

Edit `src/config/admin-config.ts`:
```typescript
export const validateAdminPIN = (pin: string): boolean => {
  return pin === 'YOUR_NEW_PIN'; // Change here
};
```

Then restart server:
```bash
npm start
```

### Change Session Duration

Edit `src/contexts/AdminPINContext.tsx`:
```typescript
// Line 13 - change duration (in milliseconds)
const PIN_SESSION_DURATION = 30 * 60 * 1000; // 30 minutes
```

### Disable PIN Modal for Testing

Temporarily edit `src/pages/AdminConsole.tsx`:
```typescript
// Line 63 - change to false for testing
const [showPINModal, setShowPINModal] = useState(false); // For testing only!
```

## 🔐 Security Notes

1. **Change Default PIN Immediately**
   ```typescript
   return pin === 'YOUR_6_DIGIT_PIN'; // Change '123456'
   ```

2. **Enable Logging**
   ```typescript
   LOG_ATTEMPTS: true, // Keep enabled
   NOTIFY_ON_FAILED_ATTEMPTS: true, // Keep enabled
   ```

3. **Session Duration**
   - Default: 1 hour (3600000ms)
   - Good for: Balance between security and usability
   - Can increase for trusted environments

4. **Failed Attempts**
   - Max 5 attempts before lockout
   - Auto-unlock after closing modal
   - Log attempts for audit trail

## 🧪 Testing PIN Flow

### Test Correct PIN
```
1. Navigate to /admin/console
2. Enter: 123456
3. Click Submit
✓ Should load dashboard
```

### Test Wrong PIN
```
1. Navigate to /admin/console
2. Enter: 000000
3. Click Submit
✓ Should show error message
✓ Attempt counter shows 1/5
✓ PIN field clears
```

### Test Lockout
```
1. Enter wrong PIN 5 times
✓ Lockout message appears
✓ Modal auto-closes after 2 seconds
✓ Redirected to previous page
```

### Test Session Expiry
```
1. Verify PIN (PIN valid)
2. Wait 1 hour OR modify PIN_SESSION_DURATION
3. Try to refresh
✓ Session expired warning appears
✓ Must re-enter PIN
```

## 📊 Backend API Setup

Your backend needs these endpoints:

### GET /api/admin/metrics
```json
{
  "totalUsers": 150,
  "activeUsers": 120,
  "totalProjects": 25,
  "activeProjects": 18,
  "totalTasks": 450,
  "completedTasks": 300,
  "databaseSize": "512MB",
  "uptime": "45 days",
  "lastBackup": "2 hours ago"
}
```

### GET /api/admin/health
```json
{
  "database": "healthy",
  "api": "healthy",
  "storage": "warning",
  "cache": "healthy"
}
```

### GET /api/admin/logs?limit=50
```json
[
  {
    "id": "log-1",
    "timestamp": "2024-01-15T10:30:00Z",
    "level": "info",
    "message": "User login",
    "user": "admin@example.com",
    "action": "login"
  }
]
```

## 🚀 Production Deployment

### Before Deploying

1. Change PIN from `123456`
2. Set production API URL in `.env`
3. Enable HTTPS
4. Set up logging/monitoring
5. Test all features
6. Run verification checklist

### Build for Production
```bash
npm run build
# Creates optimized dist/ folder
```

### Environment Variables
```bash
# .env (production)
REACT_APP_API_URL=https://your-domain.com/api
NODE_ENV=production
```

### Deploy
```bash
# Upload dist/ folder to server
# Configure web server to serve SPA
# Update API endpoints on backend
```

## 📞 Need Help?

### Common Issues

1. **PIN won't work**
   - Check PIN in config matches entered PIN
   - Restart dev server after changing PIN

2. **Dashboard blank**
   - Check backend API is running
   - Verify API endpoints return correct format
   - Check Network tab for failed requests

3. **Slow performance**
   - Check browser extensions disabled
   - Clear browser cache
   - Test on different browser
   - Check API response times

4. **Session issues**
   - Clear browser sessionStorage
   - Try incognito/private window
   - Check browser clock is synchronized

### Debug Mode

Enable detailed logging:
```javascript
// Paste in browser console (F12)
localStorage.setItem('DEBUG_ADMIN_CONSOLE', 'true');
localStorage.setItem('DEBUG_API_CALLS', 'true');
location.reload();
```

Then check console for detailed logs.

### Get More Help

- Read detailed docs: `ADMIN_CONSOLE_SETUP.md`
- Check troubleshooting: `ADMIN_CONSOLE_QUICK_FIX.md`
- Review implementation: `ADMIN_CONSOLE_IMPLEMENTATION_SUMMARY.md`
- Run verification: `ADMIN_CONSOLE_VERIFICATION.md`

## 🎓 Learning Path

1. **Getting Started** (this file)
   - Basic setup and testing
   - PIN flow walkthrough
   - Quick troubleshooting

2. **Advanced Setup** (`ADMIN_CONSOLE_SETUP.md`)
   - Component architecture
   - Session management details
   - API integration
   - Customization options

3. **Troubleshooting** (`ADMIN_CONSOLE_QUICK_FIX.md`)
   - Common issues and fixes
   - Debug techniques
   - Performance optimization

4. **Verification** (`ADMIN_CONSOLE_VERIFICATION.md`)
   - Complete test checklist
   - Browser compatibility
   - Performance metrics
   - Security review

5. **Implementation Details** (`ADMIN_CONSOLE_IMPLEMENTATION_SUMMARY.md`)
   - Architecture overview
   - File structure
   - Code organization
   - Deployment guide

## ✨ Key Features

🔐 **Secure PIN Entry**
- 6-digit numeric PIN
- Failed attempt tracking
- Automatic lockout mechanism

📊 **System Monitoring**
- Real-time metrics
- Service health status
- Performance monitoring

🔄 **Session Management**
- 1-hour session duration
- Automatic expiration
- Re-verification warning

🎨 **Professional UI**
- Gradient design
- Smooth animations
- Dark mode support
- Thai language support

## 🏁 Ready?

You're all set! Start with Step 1 above and you'll have Admin Console running in 5 minutes.

Questions? Check the documentation or review implementation files.

---

**Quick Start Version**: 1.0  
**Last Updated**: December 2024  
**Ready to Deploy**: ✅ Yes
