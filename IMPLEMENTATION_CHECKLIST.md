# Implementation Checklist - Authentication & Schema Fixes

Complete this checklist to fully implement the fixes.

---

## Phase 1: Database Setup ⚙️

### Migration
- [ ] Run database migration
  ```bash
  cd next-app
  npx prisma migrate deploy
  ```
- [ ] Verify migration succeeded (check logs)
- [ ] Confirm `auth_tokens` table created
- [ ] Confirm `sessions` table created
- [ ] Confirm no constraint errors

### Backup
- [ ] Backup production database
- [ ] Save backup file securely
- [ ] Document backup location

### Verification
- [ ] Query auth_tokens table: `SELECT COUNT(*) FROM auth_tokens;`
- [ ] Query sessions table: `SELECT COUNT(*) FROM sessions;`
- [ ] Verify constraints are cleaned up

---

## Phase 2: Environment Configuration 🔧

### Environment Variables
- [ ] Add to `.env.local` (development):
  ```
  JWT_SECRET=your-long-random-secret-at-least-32-chars
  ```
- [ ] Add to `.env.production` (production):
  ```
  JWT_SECRET=production-secret-should-be-different-and-secure
  ```
- [ ] Verify JWT_SECRET is not committed to git
- [ ] Add to .gitignore if not already there

### Prisma Client
- [ ] Regenerate Prisma client:
  ```bash
  npx prisma generate
  ```
- [ ] Verify no errors in generation

---

## Phase 3: Backend Integration 🔌

### Auth Utilities
- [ ] Verify `lib/auth-utils.ts` exists
- [ ] Verify `lib/auth-middleware.ts` exists
- [ ] Verify `lib/api-client.ts` exists
- [ ] Check imports work: `import { generateAccessToken } from '@/lib/auth-utils'`

### API Endpoints
- [ ] Test `POST /api/auth/login` with valid credentials
  ```bash
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"password"}'
  ```
  - [ ] Returns status 200
  - [ ] Response includes `tokens.accessToken`
  - [ ] Response includes `tokens.refreshToken`
  - [ ] Response includes `sessionId`

- [ ] Test `GET /api/auth/verify` with token
  ```bash
  curl -X GET http://localhost:3000/api/auth/verify \
    -H "Authorization: Bearer <accessToken>"
  ```
  - [ ] Returns status 200
  - [ ] Response includes `valid: true`
  - [ ] Response includes user object

- [ ] Test `POST /api/auth/refresh` with refresh token
  ```bash
  curl -X POST http://localhost:3000/api/auth/refresh \
    -H "Authorization: Bearer <refreshToken>"
  ```
  - [ ] Returns status 200
  - [ ] Response includes new `accessToken`

- [ ] Test `POST /api/auth/logout` with access token
  ```bash
  curl -X POST http://localhost:3000/api/auth/logout \
    -H "Authorization: Bearer <accessToken>"
  ```
  - [ ] Returns status 200
  - [ ] Token is revoked in database

### Middleware Testing
- [ ] Create test route with `verifyAuth`
- [ ] Test with valid token → returns user
- [ ] Test with invalid token → returns 401
- [ ] Test with expired token → returns 401
- [ ] Test without token → returns 401

### Role-Based Access
- [ ] Test with `isAdmin` function
- [ ] Test with `isManagerOrAdmin` function
- [ ] Test with `requireRole` function
- [ ] Verify admin-only routes reject non-admins

---

## Phase 4: Frontend Integration 🎨

### Auth Hook
- [ ] Verify `hooks/useAuthToken.ts` exists
- [ ] Test hook in a component:
  ```typescript
  const auth = useAuthToken();
  console.log(auth.isAuthenticated);
  ```
- [ ] Verify tokens load from localStorage on mount
- [ ] Verify tokens persist to localStorage

### API Client Setup
- [ ] Add to app root or AuthProvider:
  ```typescript
  import { initializeApiClient } from '@/lib/api-client';
  
  useEffect(() => {
    initializeApiClient(
      () => auth.getAccessToken(),
      () => auth.refreshAccessToken()
    );
  }, [auth]);
  ```

### API Client Testing
- [ ] Make authenticated request:
  ```typescript
  const result = await api.get('/api/projects');
  console.log(result.ok, result.data);
  ```
- [ ] Verify Authorization header is set
- [ ] Test 401 response triggers refresh
- [ ] Verify new token is used in retry

### Login Form
- [ ] Update login component to handle new response format
- [ ] Extract tokens from `response.tokens`
- [ ] Call `auth.setTokens()` with tokens
- [ ] Redirect to dashboard after successful login

### Logout
- [ ] Add logout button/link
- [ ] Call `/api/auth/logout` endpoint
- [ ] Call `auth.clearTokens()`
- [ ] Redirect to login page

---

## Phase 5: Existing Routes 📝

### Audit All API Routes
- [ ] List all routes that require authentication
- [ ] Add `verifyAuth` to each protected route
- [ ] Add role checking where needed
- [ ] Return proper error responses

### Update Existing Auth Checks
- [ ] Find any routes checking `req.headers.authorization` directly
- [ ] Replace with `verifyAuth()` call
- [ ] Remove custom token parsing
- [ ] Remove user ID lookups from token

### Token-based Features
- [ ] Find any features using user.id as token
- [ ] Replace with proper JWT token
- [ ] Update API contracts

---

## Phase 6: Testing 🧪

### Unit Tests
- [ ] Test JWT generation
- [ ] Test JWT verification
- [ ] Test token expiry
- [ ] Test token revocation

### Integration Tests
- [ ] Test complete login flow
- [ ] Test token refresh flow
- [ ] Test logout flow
- [ ] Test protected route access
- [ ] Test role-based access control

### E2E Tests
- [ ] Test login with browser
- [ ] Test token in cookies/storage
- [ ] Test navigation after login
- [ ] Test automatic logout on expiry
- [ ] Test token refresh automatically

### Security Tests
- [ ] Try invalid token → 401
- [ ] Try expired token → 401
- [ ] Try revoked token → 401
- [ ] Try no token → 401
- [ ] Try wrong format → 401
- [ ] Try wrong role → 403
- [ ] Try wrong user ID → 401

### Edge Cases
- [ ] Multiple login attempts → last one wins
- [ ] Logout then immediate access → 401
- [ ] Network failure during refresh → error handling
- [ ] Token expires mid-request → refresh and retry
- [ ] User deleted while logged in → 401 next request

---

## Phase 7: Documentation & Knowledge Transfer 📚

### Code Comments
- [ ] Add comments to auth-utils.ts
- [ ] Add comments to protected routes
- [ ] Document breaking changes in code

### Team Documentation
- [ ] Share SCHEMA_FIX_GUIDE.md with team
- [ ] Share AUTH_QUICK_START.md with team
- [ ] Share FIXES_APPLIED.md with team
- [ ] Explain breaking changes

### Migration Guide
- [ ] Create guide for frontend team
- [ ] Create guide for backend team
- [ ] Include examples and curl commands
- [ ] Include error codes and solutions

### API Documentation
- [ ] Update API docs with new endpoints
- [ ] Update request/response formats
- [ ] Update authentication requirements
- [ ] Update error codes

---

## Phase 8: Deployment 🚀

### Pre-Deployment
- [ ] All tests pass
- [ ] Code reviewed
- [ ] Database backed up
- [ ] Rollback plan documented

### Staging Deployment
- [ ] Deploy to staging environment
- [ ] Run full test suite
- [ ] Test login flow manually
- [ ] Test with real users if possible
- [ ] Monitor logs for errors

### Production Deployment
- [ ] Final database backup
- [ ] Deploy application code
- [ ] Run database migration
- [ ] Monitor auth logs
- [ ] Be ready to rollback

### Post-Deployment
- [ ] Verify login works
- [ ] Check auth logs
- [ ] Monitor for errors
- [ ] Verify sessions created
- [ ] Verify tokens stored
- [ ] Test logout flow
- [ ] Test token refresh

---

## Phase 9: Monitoring & Maintenance 📊

### Logging
- [ ] Monitor failed login attempts
- [ ] Monitor token errors
- [ ] Monitor database errors
- [ ] Check activity logs

### Cleanup
- [ ] Delete expired tokens (schedule job)
- [ ] Delete expired sessions (schedule job)
- [ ] Archive old activity logs
- [ ] Monitor database size

### Maintenance
- [ ] Rotate JWT_SECRET periodically
- [ ] Review security logs monthly
- [ ] Check for suspicious activity
- [ ] Update dependencies

---

## Phase 10: Cleanup 🧹

### Remove Old Code
- [ ] Remove old token parsing code
- [ ] Remove old verification code
- [ ] Remove old login endpoint (if parallel)
- [ ] Remove old auth logic

### Clean Database
- [ ] Remove test tokens/sessions
- [ ] Remove orphaned auth_tokens
- [ ] Verify data integrity

### Documentation
- [ ] Archive old documentation
- [ ] Update README
- [ ] Remove deprecated code comments

---

## Rollback Plan ⚠️

If critical issues occur:

### Database Rollback
```bash
# Undo migration
npx prisma migrate resolve --rolled-back 20260211_fix_schema

# Or revert to backup
# restore from backup file
```

### Code Rollback
```bash
# Revert auth files
git checkout HEAD~1 app/api/auth/
git checkout HEAD~1 lib/auth-*
git checkout HEAD~1 hooks/useAuthToken*
```

### Environment Reset
```bash
# Remove JWT_SECRET from environment
# Switch back to old auth logic
# Restart application
```

### Verification
- [ ] Old login endpoint works
- [ ] Old token format works
- [ ] No errors in logs
- [ ] Users can log in
- [ ] Application stable

---

## Sign-Off

- [ ] **Developer**: All phases completed
- [ ] **Code Review**: Changes approved
- [ ] **QA**: All tests passed
- [ ] **Deployment**: Approved for production
- [ ] **Product**: Feature validated

---

## Notes

**Estimated Time**: 1-2 days (depending on complexity)  
**Risk Level**: Medium (authentication changes)  
**Rollback Difficulty**: Low (migration is reversible)  
**Testing Required**: High (security critical)

---

## Quick Links

- 📖 [SCHEMA_FIX_GUIDE.md](./SCHEMA_FIX_GUIDE.md) - Complete guide
- ⚡ [AUTH_QUICK_START.md](./AUTH_QUICK_START.md) - Quick reference
- ✅ [FIXES_APPLIED.md](./FIXES_APPLIED.md) - What was fixed
- 📂 [Migration File](./next-app/prisma/migrations/20260211_fix_schema/migration.sql)
- 💻 [Example Code](./next-app/app/api/examples/auth-flow.example.ts)

---

**Status**: Ready for Implementation ✅
