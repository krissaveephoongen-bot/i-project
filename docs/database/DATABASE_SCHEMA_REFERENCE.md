# Database Schema Reference - Project Manager

## Quick Reference

### ProjectManager Table Structure
```sql
CREATE TABLE "ProjectManager" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID UNIQUE NOT NULL,
  managerRole VARCHAR(255) DEFAULT 'Project Manager',
  department VARCHAR(255),
  phone VARCHAR(20),
  status VARCHAR(50) DEFAULT 'active',
  isAvailable BOOLEAN DEFAULT true,
  maxProjects INTEGER DEFAULT 5,
  joinDate TIMESTAMPTZ(6) DEFAULT NOW(),
  lastActive TIMESTAMPTZ(6) DEFAULT NOW(),
  createdAt TIMESTAMPTZ(6) DEFAULT NOW(),
  updatedAt TIMESTAMPTZ(6) DEFAULT NOW(),
  FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  INDEX idx_status (status),
  INDEX idx_isAvailable (isAvailable)
);
```

### ProjectManagerAssignment Table Structure
```sql
CREATE TABLE "ProjectManagerAssignment" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projectManagerId UUID NOT NULL,
  projectId UUID NOT NULL,
  role VARCHAR(50) DEFAULT 'manager',
  startDate TIMESTAMPTZ(6) DEFAULT NOW(),
  endDate TIMESTAMPTZ(6),
  status VARCHAR(50) DEFAULT 'active',
  createdAt TIMESTAMPTZ(6) DEFAULT NOW(),
  updatedAt TIMESTAMPTZ(6) DEFAULT NOW(),
  FOREIGN KEY (projectManagerId) REFERENCES "ProjectManager"(id) ON DELETE CASCADE,
  FOREIGN KEY (projectId) REFERENCES "Project"(id) ON DELETE CASCADE,
  UNIQUE(projectManagerId, projectId),
  INDEX idx_projectManagerId (projectManagerId),
  INDEX idx_projectId (projectId),
  INDEX idx_status (status)
);
```

## Entity Relationships Diagram

```
┌─────────────┐
│    User     │
├─────────────┤
│ id (PK)     │
│ name        │
│ email       │
│ role        │
└─────────────┘
      │
      │ 1:1 (userId FK)
      │
┌─────────────────────────┐
│   ProjectManager        │
├─────────────────────────┤
│ id (PK)                 │
│ userId (FK, UNIQUE)     │ ──→ User.id
│ managerRole             │
│ status                  │
│ isAvailable             │
│ maxProjects             │
│ joinDate                │
│ lastActive              │
└─────────────────────────┘
      │
      │ 1:* (projectManagerId FK)
      │
┌──────────────────────────────┐
│ ProjectManagerAssignment     │
├──────────────────────────────┤
│ id (PK)                      │
│ projectManagerId (FK)        │ ──→ ProjectManager.id
│ projectId (FK)               │ ──→ Project.id
│ role                         │
│ startDate                    │
│ endDate                      │
│ status                       │
│ UNIQUE(projectManagerId,     │
│        projectId)            │
└──────────────────────────────┘
      │
      │ *:1
      │
      └──→ Project.id
```

## Field Enumerations

### ProjectManager.status
- `active` - Manager is currently active
- `inactive` - Manager is not currently active
- `on-leave` - Manager is temporarily unavailable

### ProjectManager.managerRole
- `Project Manager` - Standard project manager
- `Senior Project Manager` - Senior level manager
- `Lead Project Manager` - Lead/Principal level manager

### ProjectManagerAssignment.role
- `manager` - Primary project manager
- `co-manager` - Secondary/supporting manager
- `stakeholder` - Involved but not primary responsibility

### ProjectManagerAssignment.status
- `active` - Assignment is currently active
- `inactive` - Assignment is paused/inactive
- `completed` - Assignment has been completed

## Query Patterns

### 1. Find all active managers
```prisma
const activeManagers = await prisma.projectManager.findMany({
  where: { status: 'active' },
  include: { user: true }
});
```

### 2. Get a manager's current project assignments
```prisma
const assignments = await prisma.projectManagerAssignment.findMany({
  where: {
    projectManagerId: managerId,
    status: 'active'
  },
  include: {
    project: true,
    projectManager: { include: { user: true } }
  }
});
```

### 3. Find managers for a specific project
```prisma
const managers = await prisma.projectManagerAssignment.findMany({
  where: { projectId: projectId },
  include: {
    projectManager: { include: { user: true } }
  }
});
```

### 4. Check if manager has capacity
```prisma
const assignment = await prisma.projectManager.findUnique({
  where: { userId: userId },
  include: {
    projectAssignments: {
      where: { status: 'active' }
    }
  }
});

const isAvailable = 
  assignment?.isAvailable && 
  (assignment?.projectAssignments.length ?? 0) < (assignment?.maxProjects ?? 5);
```

### 5. Update last active timestamp
```prisma
await prisma.projectManager.update({
  where: { id: managerId },
  data: { lastActive: new Date() }
});
```

## Performance Considerations

### Indexes Created
- `ProjectManager.userId` - For fast lookup by user
- `ProjectManager.status` - For filtering active/inactive managers
- `ProjectManager.isAvailable` - For availability queries
- `ProjectManagerAssignment.projectManagerId` - For manager lookups
- `ProjectManagerAssignment.projectId` - For project lookups
- `ProjectManagerAssignment.status` - For filtering active assignments

### Recommended Additional Indexes (optional)
```prisma
// If querying frequently by department
@@index([department])

// If querying by manager role
@@index([managerRole])

// If querying assignment by date range
@@index([startDate, endDate])
```

## Data Migration Example

If migrating existing users to project managers:

```prisma
// Migrate all admin users to Project Managers
const adminUsers = await prisma.user.findMany({
  where: { role: 'admin' }
});

for (const user of adminUsers) {
  await prisma.projectManager.create({
    data: {
      userId: user.id,
      managerRole: 'Lead Project Manager',
      status: 'active',
      isAvailable: true,
      maxProjects: 10,
      joinDate: user.createdAt
    }
  });
}
```

## Connection Pool Settings

For Prisma Postgres connection pooling:

```env
# .env or .env.local
DATABASE_URL="postgresql://[user]:[password]@[host]:[port]/[database]"
DIRECT_URL="postgresql://[user]:[password]@[host-direct]:[port]/[database]"
```

The `DIRECT_URL` is used for migrations, while `DATABASE_URL` uses the connection pool.

## Backup & Recovery

### Backup Specific Tables
```bash
# Backup ProjectManager and assignments
pg_dump -t ProjectManager -t ProjectManagerAssignment \
  postgresql://user:password@host/database > backup.sql
```

### Restore from Backup
```bash
psql postgresql://user:password@host/database < backup.sql
```

## Clean Up Old Data

```prisma
// Archive completed assignments
const completedAssignments = await prisma.projectManagerAssignment.updateMany({
  where: {
    status: 'completed',
    updatedAt: {
      lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // 90 days old
    }
  },
  data: { status: 'archived' } // If adding archive status
});

// Deactivate inactive managers (no activity > 60 days)
const inactiveManagers = await prisma.projectManager.updateMany({
  where: {
    lastActive: {
      lt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
    }
  },
  data: { status: 'inactive' }
});
```
