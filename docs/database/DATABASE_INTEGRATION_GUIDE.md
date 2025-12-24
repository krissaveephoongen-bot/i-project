# Database Integration Guide - Menu Enhancement

## Overview

The menu system has been upgraded to display **real data from the database** instead of static content. This includes:

- **Live Statistics**: Project counts, task metrics, team size
- **Active Projects**: User's assigned projects with progress bars
- **Assigned Tasks**: User's pending tasks with due dates and priority
- **Performance Metrics**: Overdue tasks, pending approvals, etc.

## Architecture

### Frontend Components

#### 1. MenuEnhanced Page
**File**: `src/pages/MenuEnhanced.tsx`

Displays:
- **Stats Cards**: 4 key metrics from backend
  - Active Projects (with total count)
  - Assigned Tasks (with overdue count)
  - Pending Actions (Timesheets + Costs)
  - Team Members count
  
- **Quick Access Sections**:
  - Active Projects: Grid with progress bars
  - Assigned Tasks: List with due dates and priority badges
  
- **Enhanced Menu**: Same as before with favorites/search

#### 2. Menu Service
**File**: `src/services/menuService.ts`

Handles all backend communication:
```typescript
// Get dashboard stats
const stats = await menuService.getMenuStats();

// Get active projects
const projects = await menuService.getActiveProjects(limit: 5);

// Get assigned tasks
const tasks = await menuService.getAssignedTasks(limit: 5);

// Track page access
await menuService.trackItemAccess(itemId, type);

// Get unread notifications count
const count = await menuService.getNotificationCount();
```

**Error Handling**: Returns empty/default values if backend is unavailable

### Backend Routes

#### Menu Routes
**File**: `server/menu-routes.js`

All routes require authentication (`verifyToken` middleware)

##### Endpoints:

1. **GET `/api/menu/stats`** - Dashboard statistics
```json
{
  "totalProjects": 15,
  "activeProjects": 8,
  "totalTasks": 120,
  "pendingTasks": 45,
  "totalTeamMembers": 12,
  "pendingTimesheets": 3,
  "pendingCosts": 2,
  "myProjectsCount": 4,
  "assignedTasksCount": 8,
  "overdueTasks": 2
}
```

2. **GET `/api/menu/projects?limit=5`** - User's active projects
```json
[
  {
    "id": "uuid",
    "name": "Project Name",
    "code": "PRJ-001",
    "status": "IN_PROGRESS",
    "progress": 65,
    "priority": "high"
  }
]
```

3. **GET `/api/menu/tasks?limit=5`** - User's assigned tasks
```json
[
  {
    "id": "uuid",
    "title": "Task Title",
    "status": "IN_PROGRESS",
    "projectId": "uuid",
    "projectName": "Project Name",
    "dueDate": "2025-12-20T00:00:00Z",
    "priority": "high",
    "assigneeName": "John Doe"
  }
]
```

4. **GET `/api/menu/recent?limit=5`** - Recently accessed items
```json
[
  {
    "id": "uuid",
    "title": "Item Title",
    "type": "project|task",
    "projectId": "uuid",
    "path": "/projects/uuid",
    "lastAccessed": "2025-01-15T10:30:00Z",
    "status": "IN_PROGRESS"
  }
]
```

5. **POST `/api/menu/track`** - Track item access
```json
{
  "itemId": "uuid",
  "type": "project|task",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

6. **GET `/api/menu/notifications/unread-count`** - Notification count
```json
{
  "count": 5
}
```

## Database Queries

### Statistics Calculation

```sql
-- Active Projects
SELECT COUNT(*) FROM projects 
WHERE status IN ('PLANNING', 'IN_PROGRESS')

-- Pending Tasks
SELECT COUNT(*) FROM tasks 
WHERE status IN ('TODO', 'IN_PROGRESS')

-- Overdue Tasks
SELECT COUNT(*) FROM tasks 
WHERE status != 'DONE' AND due_date < NOW()

-- User's Projects
SELECT COUNT(*) FROM project_manager_assignments 
WHERE project_manager_id = $1 AND status = 'active'

-- User's Tasks
SELECT COUNT(*) FROM tasks 
WHERE assignee_id = $1 AND status != 'DONE'
```

## Integration Steps

### 1. Frontend Setup

The `MenuEnhanced` page is already integrated:

```bash
# Visit in browser
http://localhost:3000/menu-enhanced
```

### 2. Backend Setup

Routes are already registered in `server/app.js`:

```javascript
const menuRoutes = require('./menu-routes');
app.use('/api/menu', menuRoutes);
```

### 3. Database Requirements

**Prisma must be configured and migrations applied:**

```bash
# Apply migrations
npx prisma migrate deploy

# Or generate schema
npx prisma generate

# View data
npx prisma studio
```

## Data Flow

```
User opens /menu-enhanced
    ↓
MenuEnhanced.tsx loads
    ↓
useQuery hooks trigger:
  - getMenuStats()
  - getActiveProjects()
  - getAssignedTasks()
    ↓
menuService.ts calls:
  - GET /api/menu/stats
  - GET /api/menu/projects
  - GET /api/menu/tasks
    ↓
menu-routes.js:
  - Executes Prisma queries
  - Filters by user & status
  - Returns formatted JSON
    ↓
React renders with real data
```

## Caching Strategy

Uses React Query with 5-minute stale time:

```typescript
const { data: stats } = useQuery({
  queryKey: ['menuStats'],
  queryFn: () => menuService.getMenuStats(),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

- Data stays fresh for 5 minutes
- Refetch on window focus
- Manual refetch via `queryClient.invalidateQueries()`

## Performance Considerations

### Query Optimization

Each route is optimized:

1. **Stats Route**: Uses `.count()` (fast aggregation)
2. **Projects Route**: Filters by `status = 'active'` only
3. **Tasks Route**: Includes only needed relations
4. **Limits**: Default `limit=5`, configurable via query params

### Database Indexes

Schema includes indexes on:
- `status` (projects, tasks)
- `assigneeId` (tasks)
- `userId` (project managers)
- `isRead` (notifications)

## Testing the Integration

### 1. Verify Backend is Running

```bash
curl http://localhost:5000/api/menu/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Check Frontend

Visit: `http://localhost:3000/menu-enhanced`

Should display:
- Statistics cards (4 cards)
- Active projects (if any)
- Assigned tasks (if any)
- Standard menu items

### 3. Test Data Population

```bash
# Check projects in database
npx prisma studio
# Navigate to projects table
# Should have status: IN_PROGRESS

# Check tasks
# Should have assigneeId matching current user
```

### 4. Monitor Network

In browser DevTools → Network tab:
- `GET /api/menu/stats` - ~200ms
- `GET /api/menu/projects` - ~200ms
- `GET /api/menu/tasks` - ~200ms

## Troubleshooting

### Stats Show Zero

**Cause**: No data in database
**Solution**: Create test data via:
```bash
npx prisma studio
# Add projects and tasks
```

### "Failed to fetch statistics"

**Cause**: Backend error or no authentication
**Solution**:
1. Check server logs
2. Verify token is valid
3. Check `/api/menu/stats` response in Network tab

### Missing Active Projects

**Cause**: Projects have status != IN_PROGRESS/PLANNING
**Solution**: Update project status via Prisma Studio

### Slow Performance

**Cause**: Too many projects/tasks
**Solution**:
1. Reduce `limit` parameter
2. Add database indexes
3. Cache longer (increase `staleTime`)

## Future Enhancements

1. **Sync to Backend**
   - Store recent items in database (not localStorage)
   - Enable cross-device access

2. **Advanced Filtering**
   - Filter projects by team/client
   - Filter tasks by priority/status

3. **Real-time Updates**
   - WebSocket for live stats
   - Push notifications for new tasks

4. **Role-based Menu**
   - Different stats for different roles
   - Admin sees team-wide metrics

5. **Custom Dashboards**
   - User chooses which cards to display
   - Drag-to-reorder functionality

6. **Analytics Integration**
   - Track most-accessed pages
   - Predict user needs

## Files Modified/Created

### Created:
- `src/services/menuService.ts` - Backend API client
- `src/pages/MenuEnhanced.tsx` - Enhanced menu page
- `server/menu-routes.js` - Backend API endpoints

### Modified:
- `server/app.js` - Registered menu routes
- `src/router/index.tsx` - Added `/menu-enhanced` route

### Documentation:
- `DATABASE_INTEGRATION_GUIDE.md` - This file
- `MENU_ENHANCEMENT_GUIDE.md` - Previous enhancement guide
