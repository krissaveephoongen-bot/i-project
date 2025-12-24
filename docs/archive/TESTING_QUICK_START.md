# Testing Quick Start

## 5-Minute Login Test

### Prerequisites
```bash
# Make sure server is running
npm run dev

# In another terminal, app should be at http://localhost:3000
```

### Test Steps

1. **Open Login Page**
   ```
   http://localhost:3000/login
   ```

2. **Valid Login Test**
   ```
   Email:    admin@example.com
   Password: password123
   Click:    Sign in
   Result:   Should redirect to dashboard
   ```

3. **Invalid Login Test**
   ```
   Email:    wrong@example.com
   Password: wrongpassword
   Click:    Sign in
   Result:   Error message should appear
   ```

4. **Logout Test**
   ```
   Click:    User menu (top-right)
   Click:    Logout
   Result:   Redirect to login page
   ```

## 5-Minute Password Reset Test

### Prerequisites
- Logged in as admin
- Have access to Project Manager Users page

### Test Steps

1. **Navigate to Page**
   ```
   http://localhost:3000/project-manager-users
   ```

2. **Find a Manager**
   - Look at the list of project managers
   - Find one in the table

3. **Click Reset Button**
   - Find the key icon (🔑) in the Actions column
   - Click it

4. **Set Password**
   ```
   New Password:     NewPass123!
   Confirm Password: NewPass123!
   Click:            Set Password
   ```

5. **Copy Password**
   - Password displays
   - Click copy icon
   - Password copied to clipboard

## API Testing (Command Line)

### Test Login Endpoint

```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

**Expected Output** (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123...",
    "name": "Test Admin",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

### Test Password Reset Endpoint

```bash
# Replace USER_ID with actual user ID
curl -X POST http://localhost:5000/api/prisma/users/{USER_ID}/admin-reset-password \
  -H "Content-Type: application/json" \
  -d '{"newPassword":"NewPass123!"}'
```

**Expected Output** (200 OK):
```json
{
  "message": "Password updated successfully",
  "user": {
    "id": "123...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

## Automated Tests

### Run All Login Tests
```bash
npx playwright test tests/e2e/auth.spec.ts
```

### Run Login Script Tests
```bash
node scripts/test-login.js
```

### Run Password Reset Script Tests
```bash
node scripts/test-password-reset.js
```

## Troubleshooting

### Login Not Working
1. Check if user exists in database
   ```sql
   SELECT * FROM users WHERE email = 'admin@example.com';
   ```

2. Check server is running
   ```bash
   curl http://localhost:5000/health
   ```

3. Check browser console for errors (F12)

### Password Reset Not Working
1. Verify you're on `/project-manager-users` page
2. Check you're logged in as admin
3. Verify the user exists in database
4. Check server console for errors

### "Invalid email or password" Error
- Verify email in database matches exactly
- Reset password for user using SQL:
  ```sql
  UPDATE users 
  SET password = '$2a$12$...' 
  WHERE email = 'admin@example.com';
  ```

## Database Queries

### Check Test User
```sql
SELECT id, name, email, role, status 
FROM users 
WHERE email = 'admin@example.com';
```

### Check All Users
```sql
SELECT id, name, email, role, status 
FROM users 
LIMIT 10;
```

### Hash Password (Node.js)
```bash
node -e "
const bcrypt = require('bcryptjs');
bcrypt.hash('password123', 12).then(hash => console.log(hash));
"
```

## Quick Reference

| Task | Command/URL |
|------|-------------|
| Login Page | http://localhost:3000/login |
| Managers Page | http://localhost:3000/project-manager-users |
| Login API | POST http://localhost:5000/auth/login |
| Reset Password API | POST http://localhost:5000/api/prisma/users/{id}/admin-reset-password |
| Test Credentials | admin@example.com / password123 |
| Run Tests | npx playwright test |
| Test Login Script | node scripts/test-login.js |

## Key Files

```
Frontend:
- src/pages/auth/Login.tsx              (Login UI)
- src/pages/ProjectManagerUsers.tsx     (Reset password modal)

Backend:
- server/auth-routes.js                 (Login endpoint)
- server/routes/prisma-user-routes.js   (Reset password endpoint)

Tests:
- tests/e2e/auth.spec.ts                (E2E tests)
- scripts/test-login.js                 (Login script tests)
- scripts/test-password-reset.js        (Reset password script tests)

Docs:
- LOGIN_TESTING_GUIDE.md                (Detailed guide)
- LOGIN_TEST_CHECKLIST.md               (Full checklist)
- TESTING_QUICK_START.md                (This file)
```

## Next Steps

1. ✓ Start server: `npm run dev`
2. ✓ Open login page
3. ✓ Test with valid credentials
4. ✓ Test with invalid credentials
5. ✓ Test logout
6. ✓ Test password reset
7. ✓ Run automated tests
8. ✓ Check all items in checklist

## Need Help?

- Check logs in server terminal
- Check browser console (F12)
- Review LOGIN_TESTING_GUIDE.md for details
- Check LOGIN_TEST_CHECKLIST.md for comprehensive testing
