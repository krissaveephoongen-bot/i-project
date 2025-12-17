# Authentication & Authorization System Documentation

## Overview

This document provides complete documentation for the authentication and authorization system, including setup, usage, testing, and best practices.

## Table of Contents

1. [Architecture](#architecture)
2. [User Roles & Permissions](#user-roles--permissions)
3. [Authentication Flow](#authentication-flow)
4. [Implementation Guide](#implementation-guide)
5. [API Reference](#api-reference)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## Architecture

### Components

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  ├── Login/Register Pages                               │
│  ├── Auth Context & Hooks                               │
│  └── Protected Route Wrappers                            │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP + JWT Token
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Backend (Express.js)                    │
│  ├── Auth Routes (/auth/*)                              │
│  ├── Auth Middleware (JWT Verification)                 │
│  ├── Role-Based Access Control                          │
│  └── Permission Validators                              │
└────────────────────┬────────────────────────────────────┘
                     │ SQL Queries
                     ▼
┌─────────────────────────────────────────────────────────┐
│           PostgreSQL Database (Neon/Prisma)             │
│  ├── users table                                        │
│  ├── role definitions                                   │
│  └── permission mappings                                │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Frontend**: React 18 + TypeScript + React Router v6
- **Backend**: Express.js + Node.js
- **Security**: JWT (JSON Web Tokens) + bcryptjs
- **Database**: PostgreSQL + Prisma ORM
- **Token Expiration**: 24 hours

---

## User Roles & Permissions

### Role Hierarchy

```
Admin (superuser)
├── Full system access
├── User management
├── Role assignment
└── System configuration

Manager
├── Project management
├── Team management
├── Cost approval
└── Report viewing

Member
├── Project participation
├── Task management
├── Report viewing
└── Own profile management

Viewer
└── Read-only access
    ├── View projects
    ├── View reports
    └── View own profile
```

### Role Definitions

#### 1. Admin
- **Code**: `admin`
- **Capabilities**:
  - Create/edit/delete projects
  - Manage all users
  - Assign roles and permissions
  - View all reports and data
  - Access admin console
  - Configure system settings
  - Manage project managers

#### 2. Manager
- **Code**: `manager`
- **Capabilities**:
  - Create/edit/delete projects
  - Manage team members on assigned projects
  - Approve costs/expenses
  - View project reports
  - Assign project managers
  - Edit project details

#### 3. Member
- **Code**: `member`
- **Capabilities**:
  - Participate in assigned projects
  - Create tasks
  - Log time/expenses
  - View project details
  - Update own profile
  - View assigned reports

#### 4. Viewer
- **Code**: `viewer`
- **Capabilities**:
  - View projects (read-only)
  - View reports (read-only)
  - View own profile
  - No modification permissions

### Permission Matrix

| Action | Admin | Manager | Member | Viewer |
|--------|-------|---------|--------|--------|
| Create Project | ✅ | ✅ | ❌ | ❌ |
| Edit Project | ✅ | ✅ | ❌ | ❌ |
| Delete Project | ✅ | ✅ | ❌ | ❌ |
| View Project | ✅ | ✅ | ✅ | ✅ |
| Manage Users | ✅ | ❌ | ❌ | ❌ |
| Assign Roles | ✅ | ❌ | ❌ | ❌ |
| Approve Costs | ✅ | ✅ | ❌ | ❌ |
| Submit Costs | ✅ | ✅ | ✅ | ❌ |
| View Reports | ✅ | ✅ | ✅ | ✅ |
| Access Admin Panel | ✅ | ❌ | ❌ | ❌ |
| Manage Project Managers | ✅ | ❌ | ❌ | ❌ |

---

## Authentication Flow

### Login Flow

```
1. User submits email + password
   ↓
2. Backend validates input (required fields)
   ↓
3. Query database for user by email
   ↓
4. Check user account status (active/inactive)
   ↓
5. Verify password using bcryptjs
   ↓
6. Generate JWT token (24h expiration)
   ↓
7. Log login activity
   ↓
8. Return token + user data to frontend
   ↓
9. Frontend stores token in localStorage
   ↓
10. Frontend redirects to dashboard
```

### Protected Route Access

```
User requests protected resource
   ↓
Frontend checks localStorage for token
   ↓
If no token → Redirect to login
   ↓
Include token in Authorization header
   ↓
Backend middleware verifies JWT signature
   ↓
If invalid/expired → 401/403 error
   ↓
If valid → Extract user data from token
   ↓
Check user role against required permissions
   ↓
If permission granted → Process request
   ↓
If denied → Return 403 error
```

### Token Structure

```javascript
{
  id: "user-uuid",           // User ID
  email: "user@example.com", // User email
  role: "manager",           // User role
  name: "John Doe",          // User name
  iat: 1702756800,           // Issued at
  exp: 1702843200            // Expires at (24h later)
}
```

---

## Implementation Guide

### Backend Setup

#### 1. Environment Variables

Create `.env` file with:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRES_IN=24h

# Admin PIN (for special access)
ADMIN_PIN=123456

# Database
DATABASE_URL=postgresql://user:password@host:port/database
DIRECT_URL=postgresql://user:password@host:port/database

# Server
NODE_ENV=development
PORT=3000
```

#### 2. Database Schema (User table)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'member',
  department VARCHAR(255),
  position VARCHAR(255),
  phone VARCHAR(20),
  status VARCHAR(50) DEFAULT 'active',
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
```

#### 3. Middleware Chain

```javascript
// Apply to protected routes
authenticateToken          // Verify JWT
  → requireRole('admin')   // Check role
  → handler              // Process request
```

#### 4. Implementing Protected Routes

```javascript
const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('./middleware/auth-middleware');

// Admin-only route
router.get(
  '/api/users',
  authenticateToken,
  requireRole('admin'),
  async (req, res) => {
    // Implementation
  }
);

// Manager or admin route
router.post(
  '/api/projects',
  authenticateToken,
  requireRole(['manager', 'admin']),
  async (req, res) => {
    // Implementation
  }
);

module.exports = router;
```

### Frontend Setup

#### 1. Auth Context Creation

```typescript
// src/context/AuthContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkPermission: (action: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

#### 2. Protected Route Wrapper

```typescript
// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: JSX.Element;
  requiredRole?: string | string[];
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(user?.role || '')) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
}
```

#### 3. Using Protected Routes

```typescript
// src/router/index.tsx
import { ProtectedRoute } from '../components/ProtectedRoute';
import ProjectManagerUsers from '../pages/ProjectManagerUsers';

const routes = [
  {
    path: '/project-manager-users',
    element: (
      <ProtectedRoute requiredRole="admin">
        <ProjectManagerUsers />
      </ProtectedRoute>
    )
  }
];
```

---

## API Reference

### Authentication Endpoints

#### 1. Login
- **Endpoint**: `POST /auth/login`
- **Description**: Authenticate user and receive JWT token
- **Auth Required**: No
- **Request**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword123"
  }
  ```
- **Response** (200):
  ```json
  {
    "success": true,
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "email": "user@example.com",
      "role": "manager"
    }
  }
  ```
- **Errors**:
  - 400: Missing email/password
  - 401: Invalid credentials or inactive user
  - 500: Server error

#### 2. Logout
- **Endpoint**: `POST /auth/logout`
- **Description**: Logout user (client removes token)
- **Auth Required**: Yes (JWT token)
- **Response** (200):
  ```json
  {
    "success": true,
    "message": "Logout successful"
  }
  ```

#### 3. Get Profile
- **Endpoint**: `GET /auth/profile`
- **Description**: Retrieve current user profile
- **Auth Required**: Yes
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "email": "user@example.com",
      "role": "manager",
      "department": "Engineering",
      "position": "Senior Manager",
      "phone": "+1-555-0123",
      "status": "active",
      "created_at": "2024-01-15T10:30:00Z"
    }
  }
  ```

#### 4. Update Profile
- **Endpoint**: `PUT /auth/profile`
- **Description**: Update user profile information
- **Auth Required**: Yes
- **Request**:
  ```json
  {
    "name": "John Doe Updated",
    "department": "Engineering",
    "phone": "+1-555-0123"
  }
  ```
- **Response** (200):
  ```json
  {
    "success": true,
    "message": "Profile updated successfully",
    "data": { /* updated user object */ }
  }
  ```

#### 5. Change Password
- **Endpoint**: `PUT /auth/password`
- **Description**: Change user password
- **Auth Required**: Yes
- **Request**:
  ```json
  {
    "currentPassword": "oldpassword123",
    "newPassword": "newpassword456"
  }
  ```
- **Response** (200):
  ```json
  {
    "success": true,
    "message": "Password changed successfully"
  }
  ```
- **Validation**:
  - New password must be at least 8 characters
  - Current password must be correct

#### 6. Verify Token
- **Endpoint**: `POST /auth/verify`
- **Description**: Verify token validity (for initial page load)
- **Auth Required**: Yes
- **Response** (200):
  ```json
  {
    "success": true,
    "message": "Token is valid",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "role": "manager",
      "name": "John Doe"
    }
  }
  ```

#### 7. PIN Verification (Admin)
- **Endpoint**: `POST /auth/pin-verify`
- **Description**: Authenticate using admin PIN (special access)
- **Auth Required**: No
- **Request**:
  ```json
  {
    "pin": "123456"
  }
  ```
- **Response** (200):
  ```json
  {
    "success": true,
    "message": "PIN verification successful",
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "admin-session",
      "name": "Admin",
      "role": "admin",
      "isPINVerified": true
    }
  }
  ```

---

## Testing

### Manual Testing

#### 1. Test Login Flow

```bash
# 1. Login with valid credentials
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'

# Expected response: 200 with token

# 2. Store the returned token
TOKEN="eyJhbGciOiJIUzI1NiIs..."

# 3. Verify token
curl -X POST http://localhost:3000/auth/verify \
  -H "Authorization: Bearer $TOKEN"

# Expected response: 200 with user data
```

#### 2. Test Role-Based Access

```bash
# Test admin-only endpoint
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Should return 200

# Test with manager token
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer $MANAGER_TOKEN"

# Should return 403 Forbidden
```

#### 3. Test Password Requirements

```bash
# Try password less than 8 characters
curl -X PUT http://localhost:3000/auth/password \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "password123",
    "newPassword": "short"
  }'

# Should return 400 - Password too short
```

### Automated Testing

#### Test Suite Example

```typescript
// tests/auth.test.ts
import { describe, it, expect } from 'vitest';
import { authService } from '../src/services/authService';

describe('Authentication', () => {
  it('should login with valid credentials', async () => {
    const response = await authService.login({
      email: 'test@example.com',
      password: 'password123'
    });

    expect(response.success).toBe(true);
    expect(response.token).toBeDefined();
    expect(response.user.id).toBeDefined();
  });

  it('should reject invalid credentials', async () => {
    try {
      await authService.login({
        email: 'test@example.com',
        password: 'wrong'
      });
      expect.fail('Should throw error');
    } catch (error) {
      expect(error.response.status).toBe(401);
    }
  });

  it('should verify valid token', async () => {
    const response = await authService.verifyToken();
    expect(response.success).toBe(true);
    expect(response.user).toBeDefined();
  });
});
```

---

## Troubleshooting

### Common Issues

#### 1. "Invalid or expired token"

**Cause**: Token has expired or signature is invalid

**Solution**:
- Clear localStorage: `localStorage.clear()`
- Login again to get new token
- Check JWT_SECRET in environment matches

#### 2. "Insufficient permissions"

**Cause**: User role doesn't have required access

**Solution**:
- Verify user role in database
- Check endpoint permission requirements
- Assign correct role to user

#### 3. "No token provided"

**Cause**: Authorization header missing or malformed

**Solution**:
- Ensure token is stored in localStorage
- Check token is sent as: `Authorization: Bearer <token>`
- Verify frontend auth context is working

#### 4. "User account is inactive"

**Cause**: User status is not 'active'

**Solution**:
- Check user status in database: `SELECT status FROM users WHERE id = ...`
- Update status: `UPDATE users SET status = 'active' WHERE id = ...`

#### 5. Password hash errors

**Cause**: Password hashing failed during creation

**Solution**:
- Ensure bcryptjs is installed: `npm install bcryptjs`
- Check password field is not null
- Verify database column accepts text

### Debug Checklist

- [ ] Check `.env` file exists with `JWT_SECRET`
- [ ] Verify PostgreSQL connection is working
- [ ] Check user exists in database
- [ ] Verify user status is 'active'
- [ ] Ensure token is valid (not expired)
- [ ] Check role matches endpoint requirements
- [ ] Verify middleware chain order

### Logs to Check

```bash
# Check backend logs for errors
npm run dev 2>&1 | grep -i "auth\|error"

# Check database connectivity
npm run db:test

# View Prisma client errors
npm run db:prisma:generate
```

---

## Security Best Practices

### 1. Token Management

✅ **DO**:
- Store tokens in secure localStorage
- Include token in all authenticated requests
- Validate token on every request
- Expire tokens after 24 hours
- Generate new tokens on refresh

❌ **DON'T**:
- Store tokens in cookies (XSRF vulnerable)
- Log tokens to console
- Store multiple tokens
- Share tokens between users
- Use hardcoded tokens

### 2. Password Security

✅ **DO**:
- Hash passwords with bcryptjs (min 10 rounds)
- Enforce minimum 8 character passwords
- Validate password on change
- Log password change attempts
- Require current password for changes

❌ **DON'T**:
- Store plain text passwords
- Use weak hashing algorithms
- Accept very short passwords
- Allow password reuse
- Display passwords in logs

### 3. Role-Based Access Control

✅ **DO**:
- Check permissions on every protected endpoint
- Use middleware to enforce access
- Log permission denials
- Implement role hierarchy
- Review permissions regularly

❌ **DON'T**:
- Trust client-side role checks alone
- Use "magic" permission values
- Grant excessive permissions
- Skip role verification
- Allow role self-assignment

### 4. General Security

✅ **DO**:
- Use HTTPS in production
- Validate all inputs
- Implement rate limiting
- Log security events
- Regular security audits

❌ **DON'T**:
- Send credentials in URL
- Ignore SSL warnings
- Skip input validation
- Store sensitive data in logs
- Hardcode secrets

---

## Monitoring & Maintenance

### Key Metrics to Track

```typescript
// Login success rate
SELECT 
  COUNT(*) as total_logins,
  COUNT(CASE WHEN status = 'success' THEN 1 END) as successful,
  ROUND(100.0 * COUNT(CASE WHEN status = 'success' THEN 1 END) / COUNT(*), 2) as success_rate
FROM activity_logs
WHERE action = 'login'
AND created_at > NOW() - INTERVAL '24 hours';

// Failed login attempts
SELECT user_id, COUNT(*) as failed_attempts
FROM activity_logs
WHERE action = 'login_failed'
AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY user_id
HAVING COUNT(*) > 5;

// Active users
SELECT role, COUNT(DISTINCT user_id) as user_count
FROM activity_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY role;
```

### Regular Maintenance Tasks

- [ ] Review failed login attempts weekly
- [ ] Check for inactive users monthly
- [ ] Rotate JWT_SECRET every 3 months
- [ ] Audit role assignments quarterly
- [ ] Review permission matrix annually
- [ ] Update password requirements if needed
- [ ] Monitor token expiration patterns

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Dec 2024 | Initial comprehensive documentation |

---

## Support

For questions or issues:
1. Check this documentation
2. Review code comments in auth-middleware.js
3. Check database schema in schema.prisma
4. Review test files in tests/ directory

Last Updated: December 2024
