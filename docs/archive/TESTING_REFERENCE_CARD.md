# Testing Reference Card

## ⚡ 5-Minute Quick Test

### Login Test
```
1. Open: http://localhost:3000/login
2. Email: admin@example.com
3. Password: password123
4. Expected: Redirect to dashboard ✓
```

### Password Reset Test
```
1. Go to: /project-manager-users
2. Click key icon (🔑)
3. Enter password: NewPass123!
4. Expected: Password displays ✓
```

## 🛠️ Commands Cheat Sheet

| Task | Command |
|------|---------|
| Start Server | `npm run dev` |
| Run Login Tests | `node scripts/test-login.js` |
| Run Reset Tests | `node scripts/test-password-reset.js` |
| Run E2E Tests | `npx playwright test` |
| Run UI Mode | `npx playwright test --ui` |

## 🔐 Test Credentials

```
Email:    admin@example.com
Password: password123
Role:     admin
```

## 📍 Key URLs

| Page | URL |
|------|-----|
| Login | http://localhost:3000/login |
| Dashboard | http://localhost:3000/dashboard |
| Managers | http://localhost:3000/project-manager-users |
| Forgot Password | http://localhost:3000/forgot-password |

## 🌐 API Endpoints

### Login
```bash
POST /auth/login
Body: {"email":"admin@example.com","password":"password123"}
```

### Reset Password
```bash
POST /api/prisma/users/{ID}/admin-reset-password
Body: {"newPassword":"NewPassword123!"}
```

## ✅ Test Checklist - Login

- [ ] Page loads
- [ ] Valid login works
- [ ] Invalid login shows error
- [ ] Form validation works
- [ ] Logout works
- [ ] Token stored
- [ ] Protected routes work

## ✅ Test Checklist - Password Reset

- [ ] Modal opens
- [ ] Form validates
- [ ] Password updates
- [ ] Copy button works
- [ ] User can login
- [ ] Old password fails

## 🐛 Common Issues

| Problem | Solution |
|---------|----------|
| "Invalid credentials" | Verify user in DB: `SELECT * FROM users WHERE email = 'admin@example.com'` |
| Login button disabled | Check email format and password length |
| Reset modal not opening | Ensure logged in as admin, on correct page |
| Token not stored | Check localStorage enabled, CORS settings |
| API returns 404 | Verify endpoint path, replace {ID} with real user ID |

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| TESTING_QUICK_START.md | 5-min reference |
| LOGIN_TESTING_GUIDE.md | Detailed guide |
| LOGIN_TEST_CHECKLIST.md | Full verification |
| TESTING_SUMMARY.md | Overview |

## 🔄 Typical Test Flow

```
1. Start server (npm run dev)
2. Open login page
3. Test valid login → should redirect
4. Test invalid login → should show error
5. Logout → should redirect to login
6. Test password reset → should display password
7. Login with new password → should work
8. Run automated tests → should all pass
9. Check all checklist items → ready to sign off
```

## 🚀 Performance Targets

| Operation | Target |
|-----------|--------|
| Login | < 2 seconds |
| Password Reset | < 1 second |
| Page Load | < 3 seconds |

## 🔒 Security Checks

- ✓ Password hashed (bcryptjs)
- ✓ Token in localStorage
- ✓ Admin only for reset
- ✓ Inactive users blocked
- ✓ No password in logs

## 📊 Test Results Template

```
Date: ____________
Tester: ____________

Login Tests:     ☐ Passed  ☐ Failed  Issues: _____
Reset Tests:     ☐ Passed  ☐ Failed  Issues: _____
API Tests:       ☐ Passed  ☐ Failed  Issues: _____
E2E Tests:       ☐ Passed  ☐ Failed  Issues: _____

Overall: ☐ Ready  ☐ Needs Fix
```

## 💾 Database Queries

### Check user exists
```sql
SELECT id, name, email, role FROM users WHERE email = 'admin@example.com';
```

### Check password hash
```sql
SELECT password FROM users WHERE email = 'admin@example.com';
```

### Update user status
```sql
UPDATE users SET status = 'active' WHERE email = 'admin@example.com';
```

## 🎯 Success Criteria

✅ Login Test Passed When:
- Valid credentials allow login
- Invalid credentials show error
- Form validation works
- Logout clears session
- Protected routes work

✅ Password Reset Passed When:
- Password updates successfully
- Copy button works
- User can login with new password
- Old password doesn't work

## 🔗 File Locations

```
Frontend:
- src/pages/auth/Login.tsx
- src/pages/ProjectManagerUsers.tsx

Backend:
- server/auth-routes.js
- server/routes/prisma-user-routes.js

Tests:
- tests/e2e/auth.spec.ts
- scripts/test-login.js
- scripts/test-password-reset.js
```

## 🆘 Need Help?

1. Check TESTING_QUICK_START.md for fast guide
2. Check LOGIN_TESTING_GUIDE.md for details
3. Check browser console (F12) for errors
4. Check server console for API errors
5. Review troubleshooting in full checklist

---

**Print this card for quick reference during testing!**
