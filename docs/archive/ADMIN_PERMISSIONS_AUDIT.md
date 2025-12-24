# Admin Permissions Audit Report

## Summary
User Role: **ADMIN** (jakgrits.ph@appworks.co.th)

Admin users have the highest permission level in the system with access to all core features.

---

## ADMIN Permissions Matrix

### ✅ User Management (Full Control)
| Action | Permission | Status | Notes |
|--------|-----------|--------|-------|
| Create Users | `users:create` | ✅ Allowed | POST /api/users |
| Read Users | `users:read` | ✅ Allowed | GET /api/users, GET /api/users/:id |
| Update Users | `users:update` | ✅ Allowed | PUT /api/users/:id |
| Delete Users | `users:delete` | ✅ Allowed | DELETE /api/users/:id |
| Assign Roles | `users:assign-role` | ✅ Allowed | POST /api/users/:id/role |
| Change Status | `users:change-status` | ✅ Allowed | PATCH /api/users/:id/status |

### ✅ Project Management (Full Control)
| Action | Permission | Status | Notes |
|--------|-----------|--------|-------|
| Create Projects | `projects:create` | ✅ Allowed | POST /api/projects |
| View Projects | `projects:read` | ✅ Allowed | GET /api/projects |
| Update Projects | `projects:update` | ✅ Allowed | PUT /api/projects/:id |
| Delete Projects | `projects:delete` | ✅ Allowed | DELETE /api/projects/:id |
| Manage Teams | `projects:manage-team` | ✅ Allowed | Add/remove project members |
| Manage Budget | `projects:manage-budget` | ✅ Allowed | Update project budget |

### ✅ Cost Management (Full Control)
| Action | Permission | Status | Notes |
|--------|-----------|--------|-------|
| Create Costs | `costs:create` | ✅ Allowed | POST /api/costs |
| View Costs | `costs:read` | ✅ Allowed | GET /api/costs |
| Update Costs | `costs:update` | ✅ Allowed | PUT /api/costs/:id |
| Delete Costs | `costs:delete` | ✅ Allowed | DELETE /api/costs/:id |
| Approve Costs | `costs:approve` | ✅ Allowed | PATCH /api/costs/:id/approve |
| Export Costs | `costs:export` | ✅ Allowed | GET /api/costs/export |

### ✅ Team Management (Full Control)
| Action | Permission | Status | Notes |
|--------|-----------|--------|-------|
| Create Teams | `teams:create` | ✅ Allowed | POST /api/teams |
| View Teams | `teams:read` | ✅ Allowed | GET /api/teams |
| Update Teams | `teams:update` | ✅ Allowed | PUT /api/teams/:id |
| Delete Teams | `teams:delete` | ✅ Allowed | DELETE /api/teams/:id |
| Manage Members | `teams:manage-members` | ✅ Allowed | Add/remove team members |

### ✅ Report Access (Full Control)
| Action | Permission | Status | Notes |
|--------|-----------|--------|-------|
| View Reports | `reports:read` | ✅ Allowed | GET /api/reports |
| Export Reports | `reports:export` | ✅ Allowed | GET /api/reports/export |
| Share Reports | `reports:share` | ✅ Allowed | Share with other users |

### ✅ Admin Console (Exclusive)
| Action | Permission | Status | Notes |
|--------|-----------|--------|-------|
| Access Console | `admin:access` | ✅ Allowed | /admin-console |
| System Settings | `admin:settings` | ✅ Allowed | Configure system |
| Audit Logs | `admin:audit` | ✅ Allowed | View all activities |
| User Management | `admin:users` | ✅ Allowed | Admin user panel |

### ✅ Analytics (Full Access)
| Action | Permission | Status | Notes |
|--------|-----------|--------|-------|
| View Analytics | `analytics:view` | ✅ Allowed | GET /api/analytics/* |
| Export Analytics | `analytics:export` | ✅ Allowed | Export data |

---

## Potential Blocking Issues

### 🔴 Database Schema Issues (Current)
- **Missing Tables:**
  - `project_members` - Used in project access checks
  - Missing many extended columns in `projects` table
  
- **Solution:** Run migration to create missing tables

### 🟡 API Route Registration Issues (Fixed)
- **Status:** ✅ FIXED - Routes now registered in server/app.js
  - `✅ /api/projects` - Enabled
  - `✅ /api/teams` - Enabled
  - `✅ /api/admin` - Enabled
  - `✅ /api/activities` - Enabled

### 🟡 Missing Admin Routes (Current)
These routes are commented out and need to be enabled:
```javascript
// server/app.js
// app.use('/api/admin/users', adminUserRoutes);  // ← DISABLED
// app.use('/api/reports', reportsRoutes);         // ← DISABLED
// app.use('/api/export', exportRoutes);           // ← DISABLED
// app.use('/api/templates', templateRoutes);      // ← DISABLED
```

### 🟡 Authentication Token Issues
- Token may expire after 24 hours
- Need to refresh token if operations fail with "Invalid or expired token"

---

## What ADMIN Can Do Now (Working)

### ✅ Working Features
1. **Login** - Fully working
2. **View Projects** - GET /api/projects (returns empty state with helpful message)
3. **Create Projects** - POST /api/projects (form available but needs team data)
4. **View Teams** - GET /api/teams (no teams yet)
5. **View Activity Logs** - GET /api/activities (table exists now)
6. **User Authentication** - Full auth system working

### ⚠️ Partially Working
1. **Manage Projects** - Can create but form requires team/member selection (no data in DB)
2. **Manage Teams** - Can create but needs users from database
3. **Admin Console** - Menu available but depends on enabled routes

### ❌ Not Working (Blocked)
1. **Admin User Management** - Route not registered
2. **Export/Reports** - Routes disabled
3. **Project Members Management** - Table missing
4. **Extended Project Features** - Missing columns in DB schema

---

## Recommended Actions

### Immediate Fixes Needed:

#### 1. Enable Missing API Routes
```javascript
// server/app.js
app.use('/api/admin/users', adminUserRoutes);  // Uncomment
app.use('/api/reports', reportsRoutes);        // Uncomment
app.use('/api/export', exportRoutes);          // Uncomment
```

#### 2. Create Missing Database Tables
```sql
CREATE TABLE project_members (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  user_id UUID REFERENCES "User"(id),
  role VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project_id, user_id)
);
```

#### 3. Extend Projects Table Schema
```sql
ALTER TABLE projects ADD COLUMN IF NOT EXISTS objective TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS scope TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS stakeholders TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS customer VARCHAR(255);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_manager UUID REFERENCES "User"(id);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS team_members TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS department VARCHAR(255);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS priority VARCHAR(50) DEFAULT 'medium';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS risk_level VARCHAR(50) DEFAULT 'medium';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_type VARCHAR(50) DEFAULT 'external';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS progress DECIMAL(5,2) DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS actual_progress DECIMAL(5,2) DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS planned_progress DECIMAL(5,2) DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
```

---

## Permission Hierarchy

```
ADMIN (Full Access)
├── ✅ Create/Read/Update/Delete all resources
├── ✅ Manage all teams
├── ✅ Manage all projects
├── ✅ Manage all users
├── ✅ View all reports
├── ✅ Access admin console
└── ✅ View audit logs

MANAGER
├── ✅ Create/Read/Update projects
├── ✅ Read teams
├── ✅ Create costs & approve
├── ✅ Generate reports
└── ❌ Cannot delete projects
        Cannot manage users
        Cannot access admin

MEMBER
├── ✅ Read projects (assigned)
├── ✅ Create costs
├── ✅ View reports
└── ❌ Cannot create projects
        Cannot manage teams
        Cannot delete costs

VIEWER
├── ✅ Read projects
├── ✅ View reports
└── ❌ Cannot create/update anything
```

---

## Testing Checklist for ADMIN

- [ ] Login with admin account
- [ ] View projects list (working)
- [ ] Create a new project
- [ ] View teams list
- [ ] Create a new team
- [ ] Add members to team
- [ ] View activity logs
- [ ] Create a cost entry
- [ ] Approve costs
- [ ] Generate reports
- [ ] Access admin console
- [ ] Manage users
- [ ] View audit logs

---

## Support

For issues or blocked operations:
1. Check server logs: `node server/app.js`
2. Verify token is valid and not expired
3. Check database schema matches expected columns
4. Verify all API routes are registered in `server/app.js`
5. Ensure required middleware is applied to routes
