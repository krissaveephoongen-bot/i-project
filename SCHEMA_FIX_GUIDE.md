# Schema Fix & Authentication Overhaul

This document outlines the fixes applied to address schema inconsistencies and implement proper JWT-based authentication.

## Issues Fixed

### 1. Duplicate Foreign Key Constraints ✅
**Problem**: Multiple tables had redundant FK constraints with mixed naming conventions
- `documents`, `comments`, `expenses`, `tasks`, `risks`, `time_entries` had both snake_case and camelCase versions
- This caused schema bloat and potential constraint conflicts

**Solution**:
- Removed all snake_case duplicates
- Standardized all FK constraint names to snake_case
- Migration: `20260211_fix_schema/migration.sql`

### 2. Column Naming Inconsistency ✅
**Problem**:
- `sales_pipelines`, `sales_stages`, `sales_deals` used camelCase columns (`createdAt`, `updatedAt`)
- Rest of the schema used snake_case (`created_at`, `updated_at`)
- `milestones` had duplicate `name` columns
- `users` table checked multiple variations of status fields

**Solution**:
- Standardized all timestamp columns to `created_at`, `updated_at`
- Updated Prisma schema to map correctly
- Removed duplicate columns from milestones
- Applied consistency across entire schema

### 3. Broken Authentication ✅
**Problem**:
- Login endpoint returned `user.id` as "token"
- Verify endpoint treated authorization header value as user ID lookup
- No actual JWT validation or token management
- No session tracking

**Solution**: Implemented proper JWT-based authentication
- Created `auth_tokens` table for token management
- Created `sessions` table for session tracking
- Tokens now have: expiry, revocation status, creation timestamps
- Proper access/refresh token separation

### 4. New Authentication Tables ✅

#### `auth_tokens` Table
```sql
CREATE TABLE public.auth_tokens (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES public.users(id),
  token text NOT NULL UNIQUE,
  token_type text NOT NULL ('access' | 'refresh'),
  expires_at timestamp NOT NULL,
  revoked_at timestamp,
  revoked_reason text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);
```

#### `sessions` Table
```sql
CREATE TABLE public.sessions (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES public.users(id),
  ip_address inet,
  user_agent text,
  last_activity timestamp DEFAULT now(),
  expires_at timestamp NOT NULL,
  created_at timestamp DEFAULT now()
);
```

## New API Endpoints

### `POST /api/auth/login`
**Request**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response** (Success):
```json
{
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "User Name",
    "role": "admin",
    ...
  },
  "tokens": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 86400
  },
  "sessionId": "session-uuid",
  "message": "Login successful"
}
```

### `GET /api/auth/verify`
**Request**:
```
Authorization: Bearer <accessToken>
```

**Response** (Success):
```json
{
  "valid": true,
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "User Name",
    "role": "admin",
    ...
  },
  "message": "Token is valid"
}
```

### `POST /api/auth/logout`
**Request**:
```
Authorization: Bearer <accessToken>
```

**Response**:
```json
{
  "message": "Logout successful"
}
```

### `POST /api/auth/refresh`
**Request**:
```
Authorization: Bearer <refreshToken>
```

**Response**:
```json
{
  "accessToken": "eyJhbGc...",
  "expiresIn": 86400,
  "message": "Token refreshed successfully"
}
```

## Implementation Guide

### Backend (Next.js API Routes)

#### 1. Using Auth Middleware
```typescript
import { verifyAuth } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  const { user, response } = await verifyAuth(request);
  if (!user) return response;
  
  // User is authenticated
  console.log(user.id, user.role);
}
```

#### 2. Using Role Checking
```typescript
import { verifyAuth, isManagerOrAdmin } from '@/lib/auth-middleware';

export async function POST(request: NextRequest) {
  const { user, response } = await verifyAuth(request);
  if (!user) return response;
  
  if (!isManagerOrAdmin(user.role)) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    );
  }
  
  // Proceed with operation
}
```

### Frontend (React Components)

#### 1. Initialize API Client
```typescript
// In your AuthProvider/Context
import { initializeApiClient } from '@/lib/api-client';
import { useAuthToken } from '@/hooks/useAuthToken';

function AuthProvider({ children }) {
  const auth = useAuthToken();
  
  useEffect(() => {
    initializeApiClient(
      () => auth.getAccessToken(),
      () => auth.refreshAccessToken()
    );
  }, [auth]);
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}
```

#### 2. Making Authenticated Requests
```typescript
import { api } from '@/lib/api-client';

function MyComponent() {
  useEffect(() => {
    // Automatically includes auth header and handles token refresh
    api.get('/api/projects').then(result => {
      if (result.ok) {
        console.log(result.data);
      } else {
        console.error(result.error);
      }
    });
  }, []);
}
```

#### 3. Using Auth Hook
```typescript
import { useAuthToken } from '@/hooks/useAuthToken';

function LoginForm() {
  const auth = useAuthToken();
  
  const handleLogin = async (email, password) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    if (response.ok) {
      auth.setTokens({
        accessToken: data.tokens.accessToken,
        refreshToken: data.tokens.refreshToken
      });
    }
  };
  
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleLogin(email, password);
    }}>
      {/* form fields */}
    </form>
  );
}
```

## Migration Steps

### 1. Apply Database Migration
```bash
cd next-app
npx prisma migrate deploy
# or
npm run db:migrate
```

### 2. Update Environment Variables
```env
# .env.local
JWT_SECRET=your-super-secret-key-change-in-production
```

### 3. Regenerate Prisma Client
```bash
npx prisma generate
```

### 4. Test Authentication Flow
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Verify token
curl -X GET http://localhost:3000/api/auth/verify \
  -H "Authorization: Bearer <token>"

# Logout
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer <token>"
```

## Breaking Changes

⚠️ **Clients must be updated to use new auth flow**:

1. **Old**: Login returned `token: user.id`
   **New**: Login returns `tokens: { accessToken, refreshToken }`

2. **Old**: Token was just a user ID string
   **New**: Token is a JWT with expiry and signature

3. **Old**: No token management
   **New**: Tokens stored in `auth_tokens` table with expiry/revocation

4. **Old**: No session tracking
   **New**: Each login creates a session with IP/user-agent

## Column Mapping Reference

### Users Table
| Old (if used) | New (Standard) | Type |
|---|---|---|
| isActive | is_active | boolean |
| isDeleted | is_deleted | boolean |
| failedLoginAttempts | failed_login_attempts | integer |
| lastLogin | last_login | timestamp |
| lockedUntil | locked_until | timestamp |

### Sales Tables
| Old | New | Type |
|---|---|---|
| createdAt | created_at | timestamp |
| updatedAt | updated_at | timestamp |
| pipelineId | pipeline_id | text |
| stageId | stage_id | text |
| ownerId | owner_id | text |
| clientId | client_id | text |

## Security Improvements

1. ✅ JWT signatures prevent token tampering
2. ✅ Token expiry (24 hours access, 7 days refresh)
3. ✅ Token revocation support (logout)
4. ✅ Session tracking with IP/user-agent
5. ✅ Activity logging for all auth events
6. ✅ Account lockout after 5 failed attempts
7. ✅ Password validation via bcrypt

## Testing Checklist

- [ ] Database migration runs successfully
- [ ] Login creates auth_tokens and sessions
- [ ] Verify endpoint validates JWT signature
- [ ] Refresh endpoint generates new access token
- [ ] Logout revokes tokens
- [ ] Failed logins increment counter
- [ ] Account locks after 5 attempts
- [ ] Expired tokens are rejected
- [ ] Revoked tokens are rejected
- [ ] User status changes affect authentication
- [ ] Activity log records auth events

## Troubleshooting

### "Token verification failed"
- Check JWT_SECRET is set correctly
- Verify token hasn't expired
- Check token hasn't been revoked in DB

### "Invalid authorization header format"
- Use format: `Authorization: Bearer <token>`
- Not: `Authorization: <token>` or `Bearer<token>`

### Database constraint errors
- Run migration to fix duplicate constraints
- Check column naming is consistent

### Token refresh returns 401
- Verify refresh token hasn't expired (7 days)
- Check refresh token exists in auth_tokens table
- Confirm user account is still active
