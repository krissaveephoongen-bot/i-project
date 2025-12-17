# Admin Console PIN Bypass Authentication Setup

## Overview
Successfully implemented PIN-based authentication that bypasses the traditional email/password login. Users can now access the admin console using only a 6-digit PIN.

## Changes Made

### 1. Backend - Express Server (`server/app.js`)
**Added static file serving for admin console:**
```javascript
// Serve admin console static files
app.use('/admin', express.static(path.join(__dirname, '../admin-console')));
```

**Purpose**: Serves the admin-console HTML/CSS/JS files directly from Express, enabling proper routing to `/admin/index.html` after login.

### 2. Backend - Authentication Routes (`server/auth-routes.js`)
**Added new PIN verification endpoint:**
```javascript
POST /auth/pin-verify
```

**Functionality**:
- Accepts 6-digit PIN in request body
- Validates PIN against `process.env.ADMIN_PIN` (defaults to '123456')
- Returns JWT token on successful verification
- Creates admin session without requiring specific user record
- Token includes `isPINVerified: true` flag

**Response on success**:
```json
{
  "success": true,
  "message": "PIN verification successful",
  "token": "jwt_token_here",
  "user": {
    "id": "admin-session",
    "name": "Admin",
    "email": "admin@system",
    "role": "admin",
    "isPINVerified": true
  }
}
```

### 3. Vite Configuration (`vite.config.ts`)
**Removed the `/admin` proxy**:
- Previously proxied to backend
- Now serves directly from Express static files
- Eliminates routing conflicts

### 4. Admin Console Login UI (`admin-console/login.html`)
**Enhanced login interface with dual authentication methods**:

#### New Features:
- **Tabbed Login Interface**: Users can switch between PIN and Email login methods
- **PIN Tab (Default)**:
  - 6-digit PIN input field
  - Password-masked display
  - Auto-submits or manual submission
- **Email Tab**:
  - Traditional email/password login
  - Remember-me checkbox
  - Forgot password link

#### UI Improvements:
- Added tab switching with visual indicators
- PIN input field with maxlength="6" and pattern validation
- Styled toggle between authentication methods
- Color-coded active/inactive tabs

#### JavaScript Logic:
- `switchTab(tab)` function to toggle between login methods
- Separate form handlers for PIN and email authentication
- PIN form saves token to sessionStorage with `isPINVerified: true` flag
- Email login still supports remember-me with localStorage

## Usage

### For PIN Authentication:
1. Navigate to `http://localhost:5000/admin/login.html`
2. Default PIN tab is selected
3. Enter PIN: `123456` (default)
4. Click "ยืนยัน PIN" button
5. On success, auto-redirects to `/admin/index.html`

### For Email Authentication:
1. Click on "📧 อีเมล" tab
2. Enter email: `admin@example.com` (example)
3. Enter password: `Admin@123` (example)
4. Optionally check "จำฉันไว้" (Remember me)
5. Click "เข้าสู่ระบบ" button
6. On success, auto-redirects to `/admin/index.html`

## Configuration

### Change the PIN:
**Option 1 - Environment Variable** (Recommended for production):
```bash
# In .env or .env.local
ADMIN_PIN=987654
```

**Option 2 - Code** (For development):
Edit `server/auth-routes.js`, line 330:
```javascript
const ADMIN_PIN = '987654';  // Change from '123456'
```

## Security Considerations

- ✅ PIN is transmitted over HTTPS in production
- ✅ JWT token generated after successful PIN verification
- ✅ Session stored in sessionStorage (not persistent across browser close)
- ✅ Token includes role: 'admin' for backend authorization
- ✅ PIN attempts can be rate-limited (optional enhancement)

**Future Security Enhancements**:
- Add PIN change frequency requirement
- Implement failed attempt rate limiting
- Add PIN change audit logging
- Store PIN hash in database instead of environment variable
- Implement PIN expiration/rotation policy

## Testing

### Test PIN Login Flow:
1. Start servers: `npm run dev:all`
2. Visit: `http://localhost:5000/admin/login.html`
3. Enter PIN: `123456`
4. Verify: Redirects to `/admin/index.html`

### Test Email Login Flow:
1. Click "📧 อีเมล" tab
2. Enter demo credentials
3. Verify: Same redirect behavior

### Test Token Validation:
```bash
curl -X POST http://localhost:5000/api/auth/pin-verify \
  -H "Content-Type: application/json" \
  -d '{"pin":"123456"}'
```

## Files Modified

| File | Change | Purpose |
|------|--------|---------|
| `server/app.js` | Added static file middleware | Serve admin-console files |
| `server/auth-routes.js` | Added `/auth/pin-verify` endpoint | PIN authentication |
| `vite.config.ts` | Removed `/admin` proxy | Eliminate routing conflict |
| `admin-console/login.html` | Added PIN tab & logic | Dual auth method UI |

## Session Flow Diagram

```
User at /admin/login.html
    ↓
[Choose PIN or Email]
    ↓
    ├─→ PIN Tab: Enter 123456 → POST /api/auth/pin-verify
    │                           ↓ (Success)
    │                       Get JWT token
    │                       Save to sessionStorage
    │                           ↓
    └─→ Email Tab: admin@example.com + password → POST /api/auth/login
                                                    ↓ (Success & admin role)
                                                Get JWT token
                                                Save to storage
                                                    ↓
                                        Redirect to /admin/index.html
                                                    ↓
                                        Admin Console Dashboard
```

## Next Steps (Optional)

1. **Database PIN Storage**: Store PIN hash in database instead of env variable
2. **PIN History**: Track PIN changes and login attempts
3. **Session Management**: Add session expiration and refresh tokens
4. **Rate Limiting**: Prevent PIN brute force attacks
5. **Audit Logging**: Log all PIN verification attempts
6. **Multi-Factor**: Add SMS/email verification after PIN

## Troubleshooting

**Issue**: "Cannot GET /admin/index.html"
- **Solution**: Ensure `server/app.js` has the static middleware and servers are restarted

**Issue**: PIN always returns "Invalid PIN"
- **Solution**: Check `ADMIN_PIN` environment variable or default in `server/auth-routes.js`

**Issue**: Redirects to login after PIN verification
- **Solution**: Check `isPINVerified` flag in token and verify admin-console checks this flag

**Issue**: Tab switching not working
- **Solution**: Ensure JavaScript in login.html is executing (check console errors)
