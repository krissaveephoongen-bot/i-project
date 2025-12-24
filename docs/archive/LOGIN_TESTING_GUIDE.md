# Login Testing Guide

## Overview
This guide provides step-by-step instructions to test the login functionality of the project management system.

## Prerequisites

1. **Server Running**: Backend server must be running
   ```bash
   npm run dev
   # or
   node server/index.js
   ```

2. **Database Connection**: PostgreSQL/Neon database must be accessible
3. **Test User Account**: Ensure test user exists in database

## Test User Credentials

### Default Test User
```
Email:    admin@example.com
Password: password123
Role:     admin
```

### Alternative Test User (if needed)
```
Email:    admin@test.com
Password: password123
Role:     admin
```

## Quick Start - Manual Testing

### Step 1: Navigate to Login Page
1. Open browser: `http://localhost:3000/login`
2. Verify login form is displayed with:
   - Email input field
   - Password input field
   - "Sign in" button
   - "Remember me" checkbox
   - "Forgot your password?" link
   - "Create a new account" link

### Step 2: Test Valid Login
1. Enter email: `admin@example.com`
2. Enter password: `password123`
3. Click "Sign in" button
4. **Expected Result**: 
   - Redirect to `/dashboard`
   - Page displays "Welcome" message
   - User profile shows in top-right corner
   - Can see sidebar and main content

### Step 3: Test Invalid Credentials
1. Enter email: `invalid@example.com`
2. Enter password: `wrongpassword`
3. Click "Sign in" button
4. **Expected Result**:
   - Error message displayed
   - Stay on login page
   - Form fields preserved

### Step 4: Test Invalid Email Format
1. Enter email: `notanemail`
2. Enter password: `password123`
3. Try to submit
4. **Expected Result**:
   - Frontend validation error: "Invalid email address"
   - Submit button disabled

### Step 5: Test Short Password
1. Enter email: `admin@example.com`
2. Enter password: `abc`
3. Try to submit
4. **Expected Result**:
   - Frontend validation error: "Password must be at least 6 characters"
   - Submit button disabled

### Step 6: Test "Remember Me"
1. Enter credentials
2. Check "Remember me" checkbox
3. Click "Sign in"
4. After login, navigate to another page
5. Refresh browser
6. **Expected Result**: Still logged in (if session token persisted)

### Step 7: Test Logout
1. Login successfully
2. Click user menu (top-right corner)
3. Click "Logout"
4. **Expected Result**:
   - Redirect to `/login`
   - Session cleared
   - Cannot access protected pages

## Automated Testing

### Run E2E Tests with Playwright
```bash
# Install dependencies if not already installed
npm install --save-dev @playwright/test

# Run all e2e tests
npx playwright test

# Run only auth tests
npx playwright test tests/e2e/auth.spec.ts

# Run in UI mode
npx playwright test --ui

# Run with specific browser
npx playwright test --headed
```

### Test File Location
`tests/e2e/auth.spec.ts` - Contains login tests

## API Testing

### Test Login Endpoint Directly

#### Request
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

#### Success Response (200)
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Test Admin",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

#### Error Response (401)
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### Test With Token
```bash
# Use token from login response
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Get current user profile
curl -X GET http://localhost:5000/auth/profile \
  -H "Authorization: Bearer $TOKEN"

# Verify token
curl -X POST http://localhost:5000/auth/verify \
  -H "Authorization: Bearer $TOKEN"
```

## Database Setup for Testing

### Check if Test User Exists
```sql
SELECT id, name, email, role, status FROM users WHERE email = 'admin@example.com';
```

### Create Test User
```sql
-- Hash password first using bcryptjs
-- For password 'password123', use hash: $2a$12$...

INSERT INTO users (name, email, password, role, status)
VALUES (
  'Test Admin',
  'admin@example.com',
  '$2a$12$O9jHW7tOZ.XkI1t9Q8Xk9OzpZ5zKGmKVK2xC5K5K5K5K5', -- hashed password123
  'admin',
  'active'
);
```

### Generate Password Hash
```javascript
// Run in Node.js
const bcrypt = require('bcryptjs');

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash(password, salt);
  console.log('Hash:', hash);
}

hashPassword('password123');
```

## Troubleshooting

### "Invalid email or password" but credentials are correct
**Cause**: Password hash mismatch
**Solution**: 
1. Verify password hash in database
2. Re-hash password using bcryptjs with 12 salt rounds
3. Update user record

### Login button stays disabled
**Cause**: Form validation errors
**Solution**:
1. Check browser console for validation errors
2. Ensure email format is valid
3. Ensure password is at least 6 characters

### Token not being stored
**Cause**: localStorage issues or CORS
**Solution**:
1. Check browser console for CORS errors
2. Verify API response includes token
3. Check localStorage is enabled
4. Check browser privacy/incognito mode

### Redirect loop
**Cause**: Protected route issues
**Solution**:
1. Clear localStorage: `localStorage.clear()`
2. Clear browser cache
3. Check AuthContext implementation
4. Verify route protection configuration

### "User account is inactive"
**Cause**: User status is not 'active'
**Solution**:
```sql
UPDATE users SET status = 'active' WHERE email = 'admin@example.com';
```

## Common Test Cases

### Test Case 1: Valid Login
| Step | Action | Expected |
|------|--------|----------|
| 1 | Enter valid email | Field accepts input |
| 2 | Enter valid password | Field accepts input (masked) |
| 3 | Click Sign in | Loading state shown |
| 4 | Wait for response | Redirect to dashboard |
| 5 | Verify dashboard | User name visible in header |

### Test Case 2: Invalid Email
| Step | Action | Expected |
|------|--------|----------|
| 1 | Enter invalid email | "Invalid email address" error |
| 2 | Submit button | Disabled/grayed out |
| 3 | Correct email | Error disappears, button enabled |

### Test Case 3: Session Persistence
| Step | Action | Expected |
|------|--------|----------|
| 1 | Login | Session created |
| 2 | Navigate to other page | Can access page |
| 3 | Refresh browser | Still logged in |
| 4 | Close and reopen browser | Still logged in (with token) |

## Performance Testing

### Load Time
```bash
# Measure page load time
curl -w "Time Total: %{time_total}s\n" -o /dev/null -s http://localhost:3000/login
```

### Login Response Time
```bash
# Measure API response time
curl -w "Time Total: %{time_total}s\n" -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

## Security Testing

### Test Password Reset
1. Click "Forgot your password?"
2. Enter email address
3. Verify email validation
4. Check for redirect or confirmation message

### Test Inactive User
1. Set user status to 'inactive'
2. Try to login
3. **Expected**: "User account is inactive" error

### Test Token Expiration
1. Login and get token
2. Wait for token expiration (if configured)
3. Try to access protected resource
4. **Expected**: 401 Unauthorized error

## Browser DevTools

### Check Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Login
4. Look for POST to `/auth/login`
5. Verify response has token

### Check Storage
1. Open DevTools
2. Go to Application > Storage
3. Check localStorage for 'authToken'
4. Token should be present after login

### Check Console
1. Monitor for errors
2. Look for API response logs
3. Check for warning messages

## File Locations

```
Frontend:
- src/pages/auth/Login.tsx (Login page component)
- src/services/authService.ts (API calls)
- src/contexts/AuthContext.tsx (Auth state management)

Backend:
- server/auth-routes.js (Login endpoint)
- server/middleware/auth-middleware.js (Auth validation)

Tests:
- tests/e2e/auth.spec.ts (Playwright tests)
- tests/e2e/test-setup.ts (Test configuration)
```

## Next Steps

- [ ] Test login with valid credentials
- [ ] Test with invalid credentials
- [ ] Test form validation
- [ ] Test token storage
- [ ] Test logout functionality
- [ ] Run E2E tests
- [ ] Test with different browsers
- [ ] Test API endpoint directly
- [ ] Test session persistence
- [ ] Test error scenarios
