# Authentication - Quick Start Guide

## TL;DR - What Changed?

| Before | After |
|--------|-------|
| `token = user.id` (UUID) | `token = JWT` (signed token) |
| No expiry | 24 hour access token |
| No revocation | Token revocation supported |
| No sessions | Sessions tracked with IP/agent |
| Insecure | Industry-standard JWT |

---

## 30-Second Setup

### 1. Run Migration
```bash
cd next-app
npx prisma migrate deploy
```

### 2. Set Environment Variable
```bash
# .env.local or .env
JWT_SECRET=change_this_to_something_secret_at_least_32_chars
```

### 3. Done!
Your app now has secure authentication.

---

## How to Use

### Backend: Protect a Route
```typescript
// app/api/my-route/route.ts
import { verifyAuth } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  const { user, response } = await verifyAuth(request);
  if (!user) return response;  // Returns 401 if not authenticated
  
  // Now you have user info
  console.log(user.id, user.role, user.email);
}
```

### Frontend: Login
```typescript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    email: 'user@example.com', 
    password: 'password' 
  })
});

const { tokens } = await response.json();
localStorage.setItem('authTokens', JSON.stringify(tokens));
```

### Frontend: Make Authenticated Requests
```typescript
import { api } from '@/lib/api-client';

// Token is automatically added to Authorization header
const result = await api.get('/api/projects');

if (result.ok) {
  console.log(result.data);
} else {
  console.error(result.error);
}
```

---

## API Endpoints

### Login
```
POST /api/auth/login
Body: { email, password }
Response: { user, tokens, sessionId }
Status: 200 (success) | 401 (invalid) | 423 (locked)
```

### Verify Token
```
GET /api/auth/verify
Header: Authorization: Bearer <token>
Response: { valid: true, user }
Status: 200 (valid) | 401 (invalid)
```

### Refresh Token
```
POST /api/auth/refresh
Header: Authorization: Bearer <refreshToken>
Response: { accessToken, expiresIn }
Status: 200 (success) | 401 (invalid)
```

### Logout
```
POST /api/auth/logout
Header: Authorization: Bearer <token>
Response: { message }
Status: 200 (success) | 401 (invalid)
```

---

## File Reference

### Core Auth Files
- `lib/auth-utils.ts` - JWT generation & validation
- `lib/auth-middleware.ts` - Route protection
- `lib/api-client.ts` - Auto token refresh on client
- `hooks/useAuthToken.ts` - React hook for tokens

### API Endpoints
- `app/api/auth/login/route.ts`
- `app/api/auth/verify/route.ts`
- `app/api/auth/logout/route.ts`
- `app/api/auth/refresh/route.ts`

### Documentation
- `SCHEMA_FIX_GUIDE.md` - Full guide
- `FIXES_APPLIED.md` - What was fixed
- `AUTH_QUICK_START.md` - This file

---

## Common Tasks

### Add Role-Based Access
```typescript
import { verifyAuth, isAdmin } from '@/lib/auth-middleware';

export async function POST(request: NextRequest) {
  const { user, response } = await verifyAuth(request);
  if (!user) return response;
  
  if (!isAdmin(user.role)) {
    return NextResponse.json(
      { error: 'Admin only' },
      { status: 403 }
    );
  }
  
  // Only admins reach here
}
```

### Refresh Token on 401
```typescript
// Automatic! The api client does this:
const result = await api.get('/api/data');
// If 401: tries to refresh token
// If refresh succeeds: retries request
// If refresh fails: clears tokens and returns error
```

### Get Current User
```typescript
import { useAuthToken } from '@/hooks/useAuthToken';

function MyComponent() {
  const auth = useAuthToken();
  const token = auth.getAccessToken();
  // Token is available!
}
```

### Handle Logout
```typescript
import { useAuthToken } from '@/hooks/useAuthToken';

function LogoutButton() {
  const auth = useAuthToken();
  
  const handleLogout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${auth.getAccessToken()}`
      }
    });
    
    auth.clearTokens();
    // Token cleared from localStorage
  };
}
```

---

## Security Notes

✅ **What's Secure**
- Tokens are cryptographically signed (HMAC-SHA256)
- Tokens have expiry (24 hours)
- Tokens can be revoked
- Passwords hashed with bcrypt
- Account lockout after 5 failed attempts

⚠️ **What You Should Do**
- Use HTTPS in production
- Set JWT_SECRET to something random and long
- Rotate JWT_SECRET periodically
- Store refresh tokens more securely than localStorage
- Consider adding 2FA for sensitive operations

❌ **What NOT to Do**
- Don't expose JWT_SECRET
- Don't store tokens in URL
- Don't use short JWT_SECRET
- Don't send sensitive data in JWT payload

---

## Troubleshooting

### "Invalid authorization header format"
```
Authorization: Bearer <token>  ✅ Correct
Authorization: <token>         ❌ Wrong
Bearer <token>                  ❌ Wrong
```

### "Token has been revoked"
The user logged out. Get a new token with login.

### "Account is temporarily locked"
User failed login 5 times. Wait 30 minutes or ask admin to reset.

### "Invalid or expired token"
Access token expired. Use refresh token to get new one.

### "User account is deactivated"
User is_active=false. Admin needs to reactivate.

---

## Database Tables

### auth_tokens
Stores all authentication tokens. 

```
id              UUID (primary key)
user_id         UUID (foreign key to users)
token           Text (the JWT)
token_type      'access' | 'refresh'
expires_at      Timestamp (when token expires)
revoked_at      Timestamp (NULL if not revoked)
created_at      Timestamp
```

### sessions
Tracks active user sessions.

```
id              UUID (primary key)
user_id         UUID (foreign key to users)
ip_address      inet (for security)
user_agent      Text (device info)
last_activity   Timestamp
expires_at      Timestamp
created_at      Timestamp
```

---

## Testing

### Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### Test Verify
```bash
# Replace TOKEN with actual token from login
curl -X GET http://localhost:3000/api/auth/verify \
  -H "Authorization: Bearer TOKEN"
```

### Test Refresh
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Authorization: Bearer REFRESH_TOKEN"
```

---

## Next Steps

1. ✅ Run migration: `npx prisma migrate deploy`
2. ✅ Set JWT_SECRET in environment
3. ✅ Test login endpoint
4. ✅ Update frontend to use new login response
5. ✅ Wrap app with AuthProvider + initializeApiClient
6. ✅ Update API calls to use `api` client
7. ✅ Test full login/logout flow

---

## Detailed Docs

See `SCHEMA_FIX_GUIDE.md` for:
- Complete implementation guide
- Migration steps
- Code examples
- Error codes
- Security improvements
- Testing checklist

---

## Support

**Issues?**
1. Check `SCHEMA_FIX_GUIDE.md` troubleshooting section
2. Check JWT_SECRET is set
3. Check migration ran successfully
4. Check auth_tokens table exists in database
5. Check Network tab in DevTools

**Still stuck?**
Check the example code in `app/api/examples/auth-flow.example.ts`
