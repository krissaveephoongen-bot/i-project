# Authentication & Authorization - Quick Reference

Bookmark this for quick lookups while implementing auth.

---

## Environment Variables

```env
# Required
JWT_SECRET=your-min-32-char-secret-key
DATABASE_URL=postgresql://user:password@host:5432/database
DIRECT_URL=postgresql://user:password@host:5432/database

# Optional
ADMIN_PIN=123456
JWT_EXPIRES_IN=24h
NODE_ENV=development
PORT=3000
```

---

## Key Files

| File | Purpose |
|------|---------|
| `server/auth-routes.js` | All auth endpoints |
| `server/middleware/auth-middleware.js` | JWT verification & roles |
| `server/middleware/permissions-middleware.js` | Permission checks |
| `src/services/authService.ts` | Frontend API client |
| `src/context/AuthContext.tsx` | Frontend state (create) |
| `AUTH_SYSTEM_DOCUMENTATION.md` | Full reference |
| `AUTH_IMPLEMENTATION_GUIDE.md` | Setup steps |
| `TESTING_AUTH_LIVE_CONNECTIONS.md` | Test procedures |

---

## API Endpoints

```bash
# Login
POST /auth/login
{ "email": "user@example.com", "password": "password123" }

# Verify Token
POST /auth/verify
Header: Authorization: Bearer <token>

# Get Profile
GET /auth/profile
Header: Authorization: Bearer <token>

# Update Profile
PUT /auth/profile
Header: Authorization: Bearer <token>
{ "name": "Updated Name", "department": "Engineering" }

# Change Password
PUT /auth/password
Header: Authorization: Bearer <token>
{ "currentPassword": "old", "newPassword": "new" }

# Logout
POST /auth/logout
Header: Authorization: Bearer <token>

# Admin PIN
POST /auth/pin-verify
{ "pin": "123456" }
```

---

## Middleware Usage

```javascript
// Single permission
router.post('/api/projects',
  authenticateToken,
  checkPermission('projects:create'),
  handler
);

// Multiple permissions (OR)
router.get('/api/reports',
  authenticateToken,
  checkAnyPermission(['reports:read', 'analytics:view']),
  handler
);

// Check role
router.delete('/api/users/:id',
  authenticateToken,
  requireAdmin,
  handler
);

// Project access
router.get('/api/projects/:id',
  authenticateToken,
  checkProjectAccess,
  handler
);
```

---

## User Roles

```
ADMIN     → Full access
MANAGER   → Project & cost management
MEMBER    → Project participation
VIEWER    → Read-only
```

---

## Common Permissions

```
users:create            - Create new user
users:delete            - Delete user
projects:create         - Create project
projects:manage-team    - Manage team members
costs:approve           - Approve expenses
admin:access            - Access admin panel
```

---

## Frontend Setup

```typescript
// 1. Wrap app with AuthProvider
<AuthProvider>
  <App />
</AuthProvider>

// 2. Use auth in components
const { user, login, logout } = useAuth();

// 3. Protect routes
<ProtectedRoute requiredRole="admin">
  <AdminPanel />
</ProtectedRoute>

// 4. Check permissions
if (user?.role === 'admin') {
  // Show admin UI
}
```

---

## Testing

```bash
# Run tests
npm run db:test

# Manual test
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password123"}'
```

---

## Common Tasks

### Add Protected Route

```javascript
const { authenticateToken, requireRole } = require('./middleware/auth-middleware');

router.get('/api/protected', 
  authenticateToken,
  requireRole('admin'),
  (req, res) => {
    res.json({ user: req.user });
  }
);
```

### Get Current User

```javascript
// In route handler
const userId = req.user.id;
const userRole = req.user.role;
const userName = req.user.name;
```

### Check Permissions

```javascript
const { hasPermission } = require('./middleware/permissions-middleware');

if (hasPermission('projects:create', user.role)) {
  // Allow creation
}
```

### Hash Password

```javascript
const { hashPassword } = require('./middleware/auth-middleware');
const hash = await hashPassword('password123');
```

---

## JWT Token

Structure:
```
header.payload.signature

Payload (decoded):
{
  "id": "user-uuid",
  "email": "user@example.com",
  "role": "admin",
  "name": "John Doe",
  "iat": 1702756800,
  "exp": 1702843200
}
```

Expiration: 24 hours
Location: `localStorage.authToken` (frontend)

---

## Error Codes

| Code | Meaning | Action |
|------|---------|--------|
| 401 | No token / Invalid token | Login again |
| 403 | Permission denied | Check role |
| 400 | Bad request | Validate input |
| 404 | Not found | Check URL |
| 500 | Server error | Check logs |

---

## Database Queries

```sql
-- Create test user
INSERT INTO users (name, email, password, role, status)
VALUES ('Test', 'test@example.com', '$2a$10...hash', 'admin', 'active');

-- Check users
SELECT id, name, email, role, status FROM users;

-- Update role
UPDATE users SET role = 'admin' WHERE email = 'user@example.com';

-- Deactivate user
UPDATE users SET status = 'inactive' WHERE email = 'user@example.com';

-- View activity
SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 10;
```

---

## Debugging

```bash
# Check if server running
curl http://localhost:3000/health

# Check database connection
npm run db:test

# View logs
npm run server 2>&1 | grep -i auth

# Test with token
export TOKEN="eyJ..."
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/auth/profile
```

---

## Security Checklist

- [ ] JWT_SECRET is 32+ characters
- [ ] Passwords are hashed (not plain text)
- [ ] HTTPS enabled in production
- [ ] CORS configured
- [ ] Rate limiting on login
- [ ] Tokens expire (24h)
- [ ] Sensitive data not logged
- [ ] No hardcoded secrets

---

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| "Invalid token" | Get new token via login |
| "No token" | Add Authorization header |
| "Permission denied" | Check user role in database |
| "DB connection failed" | Verify DATABASE_URL in .env |
| "Password too short" | Use 8+ characters |

---

## Performance Tips

- Use token caching on frontend
- Implement pagination for user lists
- Add database indexes on frequently filtered fields
- Cache permission checks in middleware
- Monitor login endpoint for slow responses

---

## Documentation Map

```
AUTH_SYSTEM_DOCUMENTATION.md
├── Architecture
├── Roles & Permissions
├── Authentication Flow
├── API Reference
├── Testing
└── Troubleshooting

AUTH_IMPLEMENTATION_GUIDE.md
├── Backend Setup
├── Frontend Setup
├── Protected Routes
├── Permission Integration
└── Testing

TESTING_AUTH_LIVE_CONNECTIONS.md
├── Manual Tests (11 scenarios)
├── Automated Tests
├── E2E Testing
└── Troubleshooting

AUTH_QUICK_REFERENCE.md (this file)
└── Quick lookup
```

---

## Next Steps

1. Read `AUTH_SYSTEM_DOCUMENTATION.md` (complete guide)
2. Follow `AUTH_IMPLEMENTATION_GUIDE.md` (step-by-step)
3. Use `TESTING_AUTH_LIVE_CONNECTIONS.md` (verify)
4. Refer to this file for quick answers

---

## Contact

For detailed information, see full documentation files.
For questions, check logs: `npm run server 2>&1`

---

Last Updated: December 2024
