# Login & Password Reset Testing Checklist

## Pre-Testing Requirements

- [ ] Backend server running (`npm run dev` or `node server/index.js`)
- [ ] PostgreSQL/Neon database connected
- [ ] Frontend running on `http://localhost:3000`
- [ ] Test user exists in database: `admin@example.com` / `password123`
- [ ] Browser DevTools available (F12)
- [ ] Terminal/command line ready

## Login Functionality Testing

### Basic UI Tests

#### Login Page Load
- [ ] Navigate to `http://localhost:3000/login`
- [ ] Page title shows "Sign in to your account"
- [ ] Email input field is visible
- [ ] Password input field is visible
- [ ] "Sign in" button is visible
- [ ] "Remember me" checkbox is visible
- [ ] "Forgot your password?" link is visible
- [ ] "Create a new account" link is visible

#### Form Validation

##### Valid Credentials Test
- [ ] Enter email: `admin@example.com`
- [ ] Enter password: `password123`
- [ ] Click "Sign in"
- [ ] Loading state appears
- [ ] Redirects to dashboard
- [ ] User name appears in header
- [ ] Can access protected pages
- [ ] No error messages

##### Invalid Email Format
- [ ] Enter email: `notanemail`
- [ ] Tab out of field
- [ ] Error appears: "Invalid email address"
- [ ] Sign in button is disabled
- [ ] Correct email format
- [ ] Error disappears
- [ ] Button becomes enabled

##### Empty Email
- [ ] Leave email empty
- [ ] Tab to password field
- [ ] No immediate error (depends on validation)
- [ ] Click Sign in
- [ ] Error message appears

##### Short Password
- [ ] Enter email: `admin@example.com`
- [ ] Enter password: `abc`
- [ ] Tab out
- [ ] Error appears: "Password must be at least 6 characters"
- [ ] Sign in button disabled

##### Empty Password
- [ ] Enter email: `admin@example.com`
- [ ] Leave password empty
- [ ] Click Sign in
- [ ] Error message appears

#### Error Handling

##### Wrong Password
- [ ] Enter email: `admin@example.com`
- [ ] Enter password: `wrongpassword`
- [ ] Click Sign in
- [ ] Error message appears: "Invalid email or password"
- [ ] Stay on login page
- [ ] Email field preserved
- [ ] Password field cleared

##### Non-existent User
- [ ] Enter email: `nonexistent@example.com`
- [ ] Enter password: `password123`
- [ ] Click Sign in
- [ ] Error message: "Invalid email or password"
- [ ] Stay on login page

##### Inactive User Account
- [ ] Set user status to 'inactive' in database
- [ ] Try to login with that user
- [ ] Error message: "User account is inactive"
- [ ] Cannot login

#### Remember Me Feature
- [ ] Login and check "Remember me"
- [ ] Close browser
- [ ] Reopen browser
- [ ] Navigate to app
- [ ] Should still be logged in (optional feature)

#### Session Management
- [ ] Login successfully
- [ ] Navigate to multiple pages
- [ ] Refresh page
- [ ] Still logged in
- [ ] Close and reopen browser
- [ ] Still logged in (token persisted)

### Logout Tests

- [ ] Login successfully
- [ ] Click user menu (top-right)
- [ ] Click "Logout"
- [ ] Redirect to login page
- [ ] Cannot access dashboard without login
- [ ] Token removed from localStorage

## Password Reset Testing (Admin Direct Reset)

### UI Tests

#### Password Reset Modal
- [ ] Navigate to Project Manager Users page
- [ ] Find a manager in the list
- [ ] Click key icon in Actions column
- [ ] Password reset modal opens
- [ ] Modal title shows manager name
- [ ] Password input field visible
- [ ] Confirm password field visible
- [ ] "Set Password" button visible

#### Password Input Validation
- [ ] Enter password: `abc`
- [ ] Tab out
- [ ] Error: "Password must be at least 8 characters"
- [ ] Set Password button disabled
- [ ] Enter valid password: `NewPass123!`
- [ ] Error clears
- [ ] Button becomes enabled

#### Password Confirmation
- [ ] Enter password: `NewPass123!`
- [ ] Enter confirm: `Different123`
- [ ] Click Set Password
- [ ] Error: "Passwords do not match"
- [ ] Correct confirm password
- [ ] Error clears
- [ ] Can submit

#### Successful Password Reset
- [ ] Enter new password: `NewPass123!`
- [ ] Confirm password
- [ ] Click "Set Password"
- [ ] Loading state appears
- [ ] Password displays in success box
- [ ] Copy button visible
- [ ] "Close" button visible
- [ ] Cannot edit password anymore

#### Copy to Clipboard
- [ ] After successful reset, see password display
- [ ] Click copy icon
- [ ] Message: "Password copied to clipboard"
- [ ] Paste password somewhere to verify it worked

#### Modal Closure
- [ ] Click "Close" button
- [ ] Modal closes
- [ ] Redirect or return to managers list

### API Tests

#### Direct API Call - Valid Reset
```bash
curl -X POST http://localhost:5000/api/prisma/users/{USER_ID}/admin-reset-password \
  -H "Content-Type: application/json" \
  -d '{"newPassword":"NewPass123!"}'
```
- [ ] Returns 200 status
- [ ] Response includes "Password updated successfully"
- [ ] User object in response
- [ ] No token field exposed

#### API Call - Missing Password
```bash
curl -X POST http://localhost:5000/api/prisma/users/{USER_ID}/admin-reset-password \
  -H "Content-Type: application/json" \
  -d '{}'
```
- [ ] Returns 400 status
- [ ] Error message: "Missing newPassword"

#### API Call - Non-existent User
```bash
curl -X POST http://localhost:5000/api/prisma/users/invalid-id/admin-reset-password \
  -H "Content-Type: application/json" \
  -d '{"newPassword":"NewPass123!"}'
```
- [ ] Returns 404 status
- [ ] Error message: "User not found"

### Integration Tests

#### Reset and Login
- [ ] Use admin panel to reset password
- [ ] Note the new password
- [ ] Logout
- [ ] Login with old password
- [ ] Should fail
- [ ] Login with new password
- [ ] Should succeed

#### Multiple Resets
- [ ] Reset password for same user twice
- [ ] First reset works
- [ ] Second reset works
- [ ] Can login with latest password

#### Reset Different Users
- [ ] Reset password for user A
- [ ] Reset password for user B
- [ ] Login as user A with new password
- [ ] Should work
- [ ] Login as user B with new password
- [ ] Should work
- [ ] User A cannot login with user B's password

## Automated Testing

### Run E2E Tests
```bash
npx playwright test tests/e2e/auth.spec.ts
```
- [ ] All tests pass
- [ ] Valid login test passes
- [ ] Invalid credentials test passes
- [ ] Dashboard loads after login
- [ ] Proper error messages shown

### Run Custom Test Script
```bash
node scripts/test-login.js
```
- [ ] Valid Login test passes
- [ ] Invalid Email test passes
- [ ] Wrong Password test passes
- [ ] Missing Email test passes
- [ ] Missing Password test passes

### Run Password Reset Test
```bash
node scripts/test-password-reset.js
```
- [ ] Script runs without errors
- [ ] Shows proper error for non-existent user
- [ ] Instructions are clear

## Security Tests

### Password Security
- [ ] Password is hashed in database (bcryptjs)
- [ ] Password never appears in logs
- [ ] Password cleared from form after submit
- [ ] Password cleared when modal closes

### Session Security
- [ ] Token stored in localStorage
- [ ] Token sent in Authorization header
- [ ] Token expires appropriately (if configured)
- [ ] Expired token redirects to login

### Authorization
- [ ] Only admin can reset passwords
- [ ] Cannot reset own password through this endpoint
- [ ] Cannot reset password for users with higher role

## Browser Compatibility

- [ ] Chrome/Edge - Latest version
- [ ] Firefox - Latest version
- [ ] Safari - Latest version (if available)

## Performance Tests

### Login Performance
- [ ] Login completes within 2 seconds
- [ ] No console errors
- [ ] No memory leaks on repeated logins

### Password Reset Performance
- [ ] Password reset completes within 1 second
- [ ] No unnecessary API calls
- [ ] Modal opens immediately

## Accessibility Tests

- [ ] Form labels are visible
- [ ] Can navigate with Tab key
- [ ] Password field is masked
- [ ] Error messages are clear
- [ ] Focus states visible
- [ ] No ARIA violations

## Database Verification

### Test User Verification
```sql
SELECT id, name, email, role, status FROM users WHERE email = 'admin@example.com';
```
- [ ] User exists
- [ ] Status is 'active'
- [ ] Role is 'admin'

### Password Hash Verification
```javascript
const bcrypt = require('bcryptjs');
const hash = '$2a$12$...'; // from database
bcrypt.compareSync('password123', hash); // should return true
```
- [ ] Password hash is valid format
- [ ] Hash matches the password

## Documentation Tests

- [ ] LOGIN_TESTING_GUIDE.md is accurate
- [ ] Examples in docs work as written
- [ ] API endpoints documented correctly
- [ ] Test credentials in docs are correct

## Bug Report Template (if issues found)

```markdown
## Bug Report
- **Component**: Login / Password Reset
- **Severity**: (Critical / High / Medium / Low)
- **Browser**: 
- **OS**: 
- **Steps to Reproduce**:
  1. 
  2. 
  3. 
- **Expected Result**: 
- **Actual Result**: 
- **Screenshots**: 
- **Error Message**: 
- **Console Errors**: 
```

## Sign-Off

- **Tester Name**: ________________
- **Date**: ________________
- **Status**: ☐ All Passed  ☐ Issues Found
- **Issues Count**: ____
- **Signed Off**: ☐ Yes ☐ No

## Notes

_Use this space for additional observations, test results, or recommendations._

---
