# Project Manager Feature - Implementation Steps

## Phase 1: Database Setup ✅

### Completed
- [x] Added `ProjectManager` model to Prisma schema
- [x] Added `ProjectManagerAssignment` model to Prisma schema
- [x] Updated `User` model with ProjectManager relation
- [x] Updated `Project` model with ProjectManagerAssignment relation
- [x] Created migration guide documentation

### Next: Run Migration
```bash
cd c:/Users/Jakgrits/project-mgnt
npx prisma migrate dev --name add_project_manager_models
```

**Expected Output:**
```
✔ Your database has been successfully migrated to revision xyz
✔ Generated Prisma Client (v5.x.x) in 234ms
```

## Phase 2: API Endpoints

### Create Backend Service Layer
Create `src/server/routes/projectManagers.ts`:

```typescript
import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/project-managers - List all project managers
router.get('/', async (req, res) => {
  try {
    const managers = await prisma.projectManager.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        projectAssignments: { where: { status: 'active' } }
      }
    });

    const response = managers.map(m => ({
      id: m.id,
      name: m.user.name,
      email: m.user.email,
      role: m.managerRole,
      status: m.status,
      projectsManaged: m.projectAssignments.length,
      joinDate: m.joinDate,
      lastActive: m.lastActive
    }));

    res.json({ data: response });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch managers' });
  }
});

// POST /api/project-managers - Create new project manager
router.post('/', async (req, res) => {
  try {
    const { userId, name, email, role, status } = req.body;

    // Create or update user
    const user = await prisma.user.upsert({
      where: { email },
      update: { name },
      create: {
        name,
        email,
        password: 'temp-password', // Should be set during onboarding
        role: 'manager'
      }
    });

    // Create project manager
    const manager = await prisma.projectManager.create({
      data: {
        userId: user.id,
        managerRole: role || 'Project Manager',
        status: status || 'active'
      },
      include: { user: true }
    });

    res.status(201).json({ data: manager });
  } catch (error) {
    res.status(400).json({ error: 'Failed to create manager' });
  }
});

// PUT /api/project-managers/:id - Update project manager
router.put('/:id', async (req, res) => {
  try {
    const { managerRole, status, isAvailable, maxProjects } = req.body;

    const manager = await prisma.projectManager.update({
      where: { id: req.params.id },
      data: {
        managerRole,
        status,
        isAvailable,
        maxProjects,
        lastActive: new Date()
      },
      include: { user: true }
    });

    res.json({ data: manager });
  } catch (error) {
    res.status(400).json({ error: 'Failed to update manager' });
  }
});

// DELETE /api/project-managers/:id - Delete project manager
router.delete('/:id', async (req, res) => {
  try {
    await prisma.projectManager.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Manager deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete manager' });
  }
});

// GET /api/project-managers/:id/projects - Get manager's projects
router.get('/:id/projects', async (req, res) => {
  try {
    const assignments = await prisma.projectManagerAssignment.findMany({
      where: {
        projectManagerId: req.params.id,
        status: 'active'
      },
      include: { project: true }
    });

    res.json({ data: assignments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

export default router;
```

### Register Routes in Server
In your main server file (e.g., `server/index.ts`):

```typescript
import projectManagerRoutes from './routes/projectManagers';

app.use('/api/project-managers', projectManagerRoutes);
```

## Phase 3: Frontend Integration

### Update ProjectManagerUsers.tsx
Replace mock data with API calls:

```typescript
// Replace the fetchManagers function
const fetchManagers = async () => {
  try {
    setLoading(true);
    const response = await fetch('/api/project-managers');
    const data = await response.json();
    
    // Transform API response to match component state
    const transformedData = data.data.map((manager: any) => ({
      id: manager.id,
      name: manager.name,
      email: manager.email,
      role: manager.role,
      status: manager.status,
      projectsManaged: manager.projectsManaged,
      joinDate: manager.joinDate,
      lastActive: manager.lastActive
    }));
    
    setManagers(transformedData);
    setPagination({
      ...pagination,
      total: transformedData.length,
    });
  } catch (error) {
    console.error('Error fetching project managers:', error);
    message.error('Failed to load project managers');
  } finally {
    setLoading(false);
  }
};

// Replace handleModalOk to use API
const handleModalOk = async () => {
  try {
    const values = await form.validateFields();
    
    if (editingManager) {
      // Update existing manager
      const response = await fetch(`/api/project-managers/${editingManager.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          managerRole: values.role,
          status: values.status
        })
      });
      
      if (!response.ok) throw new Error('Update failed');
      message.success('Project manager updated successfully');
    } else {
      // Create new manager
      const response = await fetch('/api/project-managers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          role: values.role,
          status: values.status
        })
      });
      
      if (!response.ok) throw new Error('Creation failed');
      message.success('Project manager added successfully');
    }
    
    setIsModalOpen(false);
    form.resetFields();
    fetchManagers(); // Refresh list
  } catch (error) {
    message.error('Operation failed');
  }
};
```

### Create Service Layer
Create `src/services/projectManagerService.ts`:

```typescript
export const projectManagerService = {
  async getManagers() {
    const response = await fetch('/api/project-managers');
    if (!response.ok) throw new Error('Failed to fetch managers');
    return response.json();
  },

  async getManager(id: string) {
    const response = await fetch(`/api/project-managers/${id}`);
    if (!response.ok) throw new Error('Failed to fetch manager');
    return response.json();
  },

  async createManager(data: any) {
    const response = await fetch('/api/project-managers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create manager');
    return response.json();
  },

  async updateManager(id: string, data: any) {
    const response = await fetch(`/api/project-managers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update manager');
    return response.json();
  },

  async deleteManager(id: string) {
    const response = await fetch(`/api/project-managers/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete manager');
    return response.json();
  },

  async getManagerProjects(id: string) {
    const response = await fetch(`/api/project-managers/${id}/projects`);
    if (!response.ok) throw new Error('Failed to fetch projects');
    return response.json();
  }
};
```

## Phase 4: Testing

### Unit Tests
Create `src/__tests__/projectManager.test.ts`:

```typescript
import { projectManagerService } from '../services/projectManagerService';

describe('Project Manager Service', () => {
  it('should fetch all managers', async () => {
    const data = await projectManagerService.getManagers();
    expect(data).toHaveProperty('data');
    expect(Array.isArray(data.data)).toBe(true);
  });

  it('should create a new manager', async () => {
    const result = await projectManagerService.createManager({
      name: 'Test Manager',
      email: 'test@example.com',
      role: 'Project Manager',
      status: 'active'
    });
    expect(result.data).toHaveProperty('id');
  });
});
```

### Integration Tests
Test API endpoints and database operations.

## Phase 5: Deployment

### Pre-deployment Checklist
- [ ] Run Prisma migrations on production database
- [ ] Test all API endpoints in staging environment
- [ ] Verify frontend can fetch and display real data
- [ ] Test error handling and edge cases
- [ ] Review security (authentication, authorization)
- [ ] Load test with connection pooling

### Production Deployment
```bash
# 1. Build the application
npm run build

# 2. Run migrations
npx prisma migrate deploy

# 3. Start the server
npm start

# 4. Verify endpoints
curl https://your-domain.com/api/project-managers
```

## Phase 6: Monitoring

### Add Logging
Log all manager operations for audit trail:

```typescript
import logger from 'winston'; // or your logging library

router.post('/', async (req, res) => {
  try {
    // ... create manager code ...
    logger.info(`Project Manager created: ${manager.id}`, {
      userId: manager.userId,
      timestamp: new Date()
    });
  } catch (error) {
    logger.error(`Failed to create manager: ${error.message}`);
  }
});
```

### Set up Alerts
- Monitor API response times
- Track error rates
- Monitor database connection pool health
- Alert on unusual activity patterns

## Timeline

**Day 1:** Database migration + API endpoints
**Day 2:** Frontend integration + testing
**Day 3:** Testing & bug fixes
**Day 4:** Deployment preparation
**Day 5:** Production deployment & monitoring

## Rollback Plan

If issues arise:

```bash
# Rollback migration
npx prisma migrate resolve --rolled-back "add_project_manager_models"

# Or restore from backup
psql < backup.sql
```

## Success Metrics

- [ ] All CRUD operations working
- [ ] Frontend displays real data from API
- [ ] Search and filter working correctly
- [ ] Role-based access control enforced
- [ ] No database errors
- [ ] API response time < 500ms
- [ ] 100% feature test coverage
