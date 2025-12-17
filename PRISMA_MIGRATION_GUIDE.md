# Prisma Migration Guide - Project Manager Schema

## Overview
This guide covers the new database models added to support the Project Manager Users management feature.

## New Models Added

### 1. ProjectManager Model
Represents a project manager user profile with their capabilities and status.

**Fields:**
- `id` - UUID primary key
- `userId` - Foreign key to User (unique, one-to-one relationship)
- `managerRole` - Type of project manager role (Project Manager, Senior Project Manager, Lead Project Manager)
- `department` - Optional department assignment
- `phone` - Optional contact phone number
- `status` - Current status (active, inactive, on-leave)
- `isAvailable` - Boolean indicating if manager is available for new projects
- `maxProjects` - Maximum number of projects manager can handle (default: 5)
- `joinDate` - When the manager joined the organization
- `lastActive` - Last activity timestamp
- `createdAt` - Record creation timestamp
- `updatedAt` - Record last update timestamp

**Relations:**
- `user` - One-to-one relationship with User model
- `projectAssignments` - One-to-many relationship with ProjectManagerAssignment

**Indexes:**
- `userId` (unique)
- `status`
- `isAvailable`

### 2. ProjectManagerAssignment Model
Represents the assignment of a project manager to a specific project.

**Fields:**
- `id` - UUID primary key
- `projectManagerId` - Foreign key to ProjectManager
- `projectId` - Foreign key to Project
- `role` - Assignment role (manager, co-manager, stakeholder)
- `startDate` - When assignment started
- `endDate` - Optional end date for assignment
- `status` - Assignment status (active, inactive, completed)
- `createdAt` - Record creation timestamp
- `updatedAt` - Record last update timestamp

**Relations:**
- `projectManager` - Many-to-one relationship with ProjectManager
- `project` - Many-to-one relationship with Project

**Constraints:**
- Unique constraint on `(projectManagerId, projectId)` - Prevents duplicate assignments
- Cascade delete on both foreign keys

**Indexes:**
- `projectManagerId`
- `projectId`
- `status`

### 3. Updated User Model
Added relation to ProjectManager:
```prisma
projectManager  ProjectManager?
```

### 4. Updated Project Model
Added relation to ProjectManagerAssignment:
```prisma
projectManagerAssignments ProjectManagerAssignment[]
```

## Migration Steps

### Step 1: Generate Migration
```bash
npx prisma migrate dev --name add_project_manager_models
```

### Step 2: Verify Schema
The migration will create the following tables in PostgreSQL:
- `ProjectManager`
- `ProjectManagerAssignment`

Plus add foreign key constraints to existing tables.

### Step 3: Generate Prisma Client
```bash
npx prisma generate
```

### Step 4: Test with Prisma Studio (Optional)
```bash
npx prisma studio
```

## Database Relationships

```
User
├── 1..1 ProjectManager
│   └── 1..* ProjectManagerAssignment
│       └── * Project
└── ...other relations...

Project
├── 1..* Cost
├── 1..* ProjectManagerAssignment
│   └── * ProjectManager
└── ...other relations...
```

## Usage Examples

### Create a Project Manager
```typescript
const projectManager = await prisma.projectManager.create({
  data: {
    user: {
      connect: { id: userId }
    },
    managerRole: 'Senior Project Manager',
    department: 'Engineering',
    status: 'active'
  },
  include: { user: true }
});
```

### Assign Project Manager to Project
```typescript
const assignment = await prisma.projectManagerAssignment.create({
  data: {
    projectManager: {
      connect: { id: projectManagerId }
    },
    project: {
      connect: { id: projectId }
    },
    role: 'manager',
    status: 'active'
  },
  include: {
    projectManager: { include: { user: true } },
    project: true
  }
});
```

### Get Project Manager with Assignments
```typescript
const manager = await prisma.projectManager.findUnique({
  where: { userId: userId },
  include: {
    user: true,
    projectAssignments: {
      include: { project: true },
      where: { status: 'active' }
    }
  }
});
```

### Get Projects for a Manager
```typescript
const projects = await prisma.projectManagerAssignment.findMany({
  where: {
    projectManagerId: projectManagerId,
    status: 'active'
  },
  include: { project: true }
});
```

## API Service Layer

To integrate with the frontend, create a service file:

```typescript
// src/services/projectManagerService.ts
export const projectManagerService = {
  // Get all project managers
  getManagers: async () => {
    const response = await fetch('/api/project-managers');
    return response.json();
  },

  // Create new manager
  createManager: async (data) => {
    const response = await fetch('/api/project-managers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // Update manager
  updateManager: async (id, data) => {
    const response = await fetch(`/api/project-managers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // Delete manager
  deleteManager: async (id) => {
    const response = await fetch(`/api/project-managers/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  }
};
```

## Backend API Endpoints

Suggested endpoints to implement:

```
GET    /api/project-managers              - List all managers
GET    /api/project-managers/:id          - Get manager details
POST   /api/project-managers              - Create new manager
PUT    /api/project-managers/:id          - Update manager
DELETE /api/project-managers/:id          - Delete manager

GET    /api/project-managers/:id/projects - Get manager's projects
POST   /api/project-managers/:id/projects - Assign project to manager
DELETE /api/project-managers/:id/projects/:projectId - Remove project assignment
```

## Notes

- Cascade delete is enabled for both relationships, so deleting a ProjectManager will automatically delete related ProjectManagerAssignments
- The `(projectManagerId, projectId)` unique constraint prevents duplicate assignments
- Connection pooling from Prisma Postgres ensures efficient query handling
- All timestamp fields use `Timestamptz(6)` for PostgreSQL compatibility

## Rollback (if needed)

```bash
npx prisma migrate resolve --rolled-back "add_project_manager_models"
```

Then delete the migration file from `prisma/migrations/`.

## Next Steps

1. Run the migration
2. Create API endpoints in your backend
3. Update the `ProjectManagerUsers.tsx` frontend component to use real API calls instead of mock data
4. Create database seed data for testing (optional)
