# Authentication Implementation Complete Guide

This guide provides step-by-step implementation instructions for integrating the authentication system throughout the application.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Backend Setup](#backend-setup)
3. [Frontend Setup](#frontend-setup)
4. [Protected Routes Implementation](#protected-routes-implementation)
5. [Permission System Integration](#permission-system-integration)
6. [Testing & Validation](#testing--validation)
7. [Integration Checklist](#integration-checklist)

---

## Quick Start

### Prerequisites

- Node.js 16+ installed
- PostgreSQL database running
- npm packages installed

### 1. Environment Setup

```bash
# 1. Navigate to project root
cd /path/to/project-mgnt

# 2. Create/update .env file
cp .env.example .env

# 3. Update .env with your values
# DATABASE_URL=postgresql://user:password@localhost:5432/dbname
# JWT_SECRET=your-super-secret-key-min-32-chars
# ADMIN_PIN=123456

# 4. Install dependencies
npm install

# 5. Run database migration (if needed)
npx prisma migrate dev

# 6. Start backend server
npm run server

# 7. In another terminal, start frontend
npm run dev

# 8. Test authentication
npm run db:test
```

---

## Backend Setup

### Step 1: Environment Variables

```env
# .env
JWT_SECRET=your-super-secret-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=24h
ADMIN_PIN=123456
DATABASE_URL=postgresql://user:password@localhost:5432/project_mgnt
DIRECT_URL=postgresql://user:password@localhost:5432/project_mgnt
NODE_ENV=development
PORT=3000
```

### Step 2: Database Schema

The auth system requires these tables:

```sql
-- Users table (required)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'member', -- admin, manager, member, viewer
  department VARCHAR(255),
  position VARCHAR(255),
  phone VARCHAR(20),
  status VARCHAR(50) DEFAULT 'active', -- active, inactive
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- Activity logs (optional but recommended)
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100),
  description TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_user ON activity_logs(user_id);
CREATE INDEX idx_activity_action ON activity_logs(action);
```

### Step 3: Authentication Middleware Setup

The middleware is already in `server/middleware/auth-middleware.js`:

```javascript
// Export the key functions:
module.exports = {
  authenticateToken,      // Verify JWT token
  requireRole,           // Check user role
  requireAdmin,          // Admin-only access
  requireManager,        // Manager or admin access
  checkProjectAccess,    // Project-level access
  checkTeamAccess,       // Team-level access
  generateToken,         // Generate JWT
  verifyPassword,        // Verify password hash
  hashPassword          // Hash password
};
```

### Step 4: Auth Routes Implementation

The auth routes are already in `server/auth-routes.js`. They include:

```
POST   /auth/login         - Login with email/password
POST   /auth/logout        - Logout user
GET    /auth/profile       - Get current user profile
PUT    /auth/profile       - Update user profile
PUT    /auth/password      - Change password
POST   /auth/verify        - Verify token validity
POST   /auth/pin-verify    - Admin PIN authentication
```

### Step 5: Apply Middleware to Routes

Example of protecting a route:

```javascript
const { authenticateToken, requireAdmin } = require('./middleware/auth-middleware');

// Protect a single route
router.get('/api/users', 
  authenticateToken,  // Step 1: Verify token
  requireAdmin,       // Step 2: Check role
  handler            // Step 3: Handle request
);

// Protect multiple routes with role
const protectAdminRoutes = [
  authenticateToken,
  requireAdmin
];

router.get('/api/admin/dashboard', protectAdminRoutes, handler);
router.delete('/api/users/:id', protectAdminRoutes, handler);
```

### Step 6: Permissions System Integration

Use the new permissions middleware:

```javascript
const { checkPermission, checkAnyPermission } = require('./middleware/permissions-middleware');

// Single permission check
router.post('/api/projects',
  authenticateToken,
  checkPermission('projects:create'),  // Only users with this permission
  handler
);

// Multiple permissions (user needs ONE)
router.get('/api/reports',
  authenticateToken,
  checkAnyPermission(['reports:read', 'analytics:view']),
  handler
);
```

---

## Frontend Setup

### Step 1: Auth Context Creation

Create `src/context/AuthContext.tsx`:

```typescript
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService } from '../services/authService';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'member' | 'viewer';
  department?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const token = authService.getToken();
        if (token) {
          const response = await authService.verifyToken();
          if (response.success) {
            setUser(response.user);
          } else {
            authService.clearToken();
          }
        }
      } catch (error) {
        authService.clearToken();
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const response = await authService.login({ email, password });

      if (response.success) {
        authService.setToken(response.token);
        setUser(response.user);
        return;
      }

      throw new Error(response.message || 'Login failed');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message;
      setError(message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Continue logout even if API call fails
    } finally {
      authService.clearToken();
      setUser(null);
    }
  };

  const checkPermission = (permission: string): boolean => {
    if (!user) return false;
    // Implement based on your role-permission mapping
    return true;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
    checkPermission
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### Step 2: Protected Route Wrapper

Create `src/components/ProtectedRoute.tsx`:

```typescript
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spin } from 'antd';

interface ProtectedRouteProps {
  children: JSX.Element;
  requiredRole?: string | string[];
  fallback?: JSX.Element;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  fallback
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Spin size="large" style={{ marginTop: '50px' }} />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(user?.role || '')) {
      return fallback || <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};
```

### Step 3: Update Router Configuration

Update `src/router/index.tsx`:

```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { AuthProvider } from '../context/AuthContext';

// Pages
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import ProjectManagerUsers from '../pages/ProjectManagerUsers';
import AdminConsole from '../pages/AdminConsole';
import Unauthorized from '../pages/Unauthorized';

export const AppRouter = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin-only routes */}
          <Route
            path="/project-manager-users"
            element={
              <ProtectedRoute requiredRole="admin">
                <ProjectManagerUsers />
              </ProtectedRoute>
            }
          />

          {/* Manager routes */}
          <Route
            path="/admin-console"
            element={
              <ProtectedRoute requiredRole={['admin', 'manager']}>
                <AdminConsole />
              </ProtectedRoute>
            }
          />

          {/* Error routes */}
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};
```

### Step 4: Create Login Page

Create `src/pages/Login.tsx`:

```typescript
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, Button, Card, message, Spin } from 'antd';
import { useAuth } from '../context/AuthContext';
import styles from './Login.module.css';

interface LoginFormValues {
  email: string;
  password: string;
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuth();
  const [form] = Form.useForm();

  const handleSubmit = async (values: LoginFormValues) => {
    try {
      await login(values.email, values.password);
      const from = (location.state?.from?.pathname) || '/dashboard';
      navigate(from, { replace: true });
      message.success('Login successful!');
    } catch (error: any) {
      message.error(error.message || 'Login failed');
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card} title="Login">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          disabled={isLoading}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Invalid email' }
            ]}
          >
            <Input placeholder="your@email.com" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please enter password' }]}
          >
            <Input.Password placeholder="••••••••" />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={isLoading} block>
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </Form>
      </Card>
    </div>
  );
}
```

### Step 5: Update Existing Components

Update any component that needs auth context:

```typescript
import { useAuth } from '../context/AuthContext';

export function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please login first</div>;
  }

  return (
    <div>
      <p>Welcome, {user?.name}!</p>
      <p>Role: {user?.role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

---

## Protected Routes Implementation

### Step 1: Sidebar Menu Protection

Update `src/components/layout/Sidebar.tsx`:

```typescript
import { useAuth } from '../../context/AuthContext';

export function Sidebar() {
  const { user } = useAuth();

  const getVisibleMenuItems = () => {
    const baseItems = [
      // Available for all authenticated users
      { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
      { path: '/projects', label: 'Projects', icon: 'project' }
    ];

    // Admin-only items
    if (user?.role === 'admin') {
      baseItems.push({
        path: '/project-manager-users',
        label: 'Project Manager Users',
        icon: 'team'
      });
      baseItems.push({
        path: '/admin-console',
        label: 'Admin Console',
        icon: 'setting'
      });
    }

    // Manager-level items
    if (['admin', 'manager'].includes(user?.role || '')) {
      baseItems.push({
        path: '/costs',
        label: 'Cost Management',
        icon: 'dollar'
      });
    }

    return baseItems;
  };

  return (
    <aside>
      {getVisibleMenuItems().map(item => (
        <Link key={item.path} to={item.path}>
          {item.label}
        </Link>
      ))}
    </aside>
  );
}
```

### Step 2: Component-Level Permission Checks

```typescript
import { useAuth } from '../context/AuthContext';

export function CostApprovalPanel() {
  const { user } = useAuth();

  // Only admins and managers can approve costs
  if (!['admin', 'manager'].includes(user?.role || '')) {
    return <div>You don't have permission to approve costs</div>;
  }

  return (
    <div>
      {/* Approval UI */}
    </div>
  );
}
```

---

## Permission System Integration

### Step 1: Using Permissions Middleware

```javascript
// server/routes/project-managers.ts
const { checkPermission } = require('../middleware/permissions-middleware');
const { authenticateToken } = require('../middleware/auth-middleware');

router.post('/api/project-managers',
  authenticateToken,
  checkPermission('project-managers:create'),
  async (req, res) => {
    // Create project manager
  }
);

router.get('/api/project-managers',
  authenticateToken,
  checkPermission('project-managers:read'),
  async (req, res) => {
    // List project managers
  }
);

router.put('/api/project-managers/:id',
  authenticateToken,
  checkPermission('project-managers:update'),
  async (req, res) => {
    // Update project manager
  }
);
```

### Step 2: Frontend Permission Checks

Create `src/hooks/usePermissions.ts`:

```typescript
import { useAuth } from '../context/AuthContext';

const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: [
    'users:create',
    'users:delete',
    'projects:delete',
    'admin:access'
  ],
  manager: [
    'projects:create',
    'costs:approve',
    'teams:manage'
  ],
  member: [
    'costs:create',
    'projects:read'
  ],
  viewer: [
    'projects:read'
  ]
};

export function usePermissions() {
  const { user } = useAuth();

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    const permissions = ROLE_PERMISSIONS[user.role] || [];
    return permissions.includes(permission);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(p => hasPermission(p));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(p => hasPermission(p));
  };

  return { hasPermission, hasAnyPermission, hasAllPermissions };
}
```

---

## Testing & Validation

### Step 1: Test Authentication

```bash
# Run the test script
npm run db:test

# Or manually with curl
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

### Step 2: Test Protected Routes

```bash
# Test with invalid token
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer invalid_token"

# Should return 403 Forbidden
```

### Step 3: Test Role-Based Access

```bash
# Test admin-only endpoint with manager token
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer $MANAGER_TOKEN"

# Should return 403 Forbidden
```

### Step 4: Frontend Testing

Create `tests/auth.test.tsx`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProtectedRoute } from '../src/components/ProtectedRoute';
import { AuthProvider } from '../src/context/AuthContext';

describe('Authentication', () => {
  it('should redirect to login when not authenticated', () => {
    render(
      <AuthProvider>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </AuthProvider>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should show content when authenticated with correct role', () => {
    // Mock authentication
    // Render protected route
    // Verify content is shown
  });
});
```

---

## Integration Checklist

Use this checklist to ensure complete implementation:

### Backend
- [ ] JWT_SECRET configured in .env
- [ ] Database tables created (users, activity_logs)
- [ ] Auth routes implemented (/auth/*)
- [ ] Auth middleware working
- [ ] Permissions middleware available
- [ ] Protected routes have middleware chain
- [ ] Password hashing working (bcryptjs)
- [ ] Token expiration configured (24h)

### Frontend
- [ ] Auth context created and exported
- [ ] Auth provider wraps app
- [ ] ProtectedRoute component created
- [ ] Login page implemented
- [ ] useAuth hook available
- [ ] Routes use ProtectedRoute wrapper
- [ ] Authorization header on API calls
- [ ] Token stored/retrieved from localStorage

### Database
- [ ] Users table exists with all columns
- [ ] Indexes created for performance
- [ ] Roles (admin, manager, member, viewer) in use
- [ ] Password field contains hashes, not plain text
- [ ] Status field controls access

### Testing
- [ ] Login endpoint tested
- [ ] Token verification tested
- [ ] Role-based access tested
- [ ] Invalid credentials rejected
- [ ] Expired tokens rejected
- [ ] E2E login flow tested

### Security
- [ ] JWT_SECRET is strong (min 32 chars)
- [ ] Passwords are hashed
- [ ] HTTPS in production
- [ ] CORS properly configured
- [ ] Rate limiting on login endpoint
- [ ] Tokens expire after 24h
- [ ] Sensitive data not logged

### Documentation
- [ ] AUTH_SYSTEM_DOCUMENTATION.md reviewed
- [ ] AUTH_IMPLEMENTATION_GUIDE.md completed
- [ ] Code comments added
- [ ] API documentation updated
- [ ] Team trained on usage

---

## Common Tasks

### Add a New User

```typescript
// Backend: server/user-routes.js
router.post('/api/users', authenticateToken, requireAdmin, async (req, res) => {
  const { name, email, password, role } = req.body;
  const hashedPassword = await hashPassword(password);
  
  const result = await executeQuery(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role`,
    [name, email, hashedPassword, role]
  );

  res.json({ success: true, user: result.rows[0] });
});
```

### Change User Role

```typescript
router.put('/api/users/:id/role', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const result = await executeQuery(
    `UPDATE users SET role = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, name, email, role`,
    [role, id]
  );

  res.json({ success: true, user: result.rows[0] });
});
```

### Activate/Deactivate User

```typescript
router.put('/api/users/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'active' or 'inactive'

  const result = await executeQuery(
    `UPDATE users SET status = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, name, status`,
    [status, id]
  );

  res.json({ success: true, user: result.rows[0] });
});
```

---

## Next Steps

1. **Implementation**: Follow the checklist above
2. **Testing**: Run the test script (`npm run db:test`)
3. **Integration**: Connect frontend to backend
4. **Monitoring**: Set up logging and alerts
5. **Maintenance**: Regular security reviews

---

**Last Updated**: December 2024
**Status**: Ready for Implementation
