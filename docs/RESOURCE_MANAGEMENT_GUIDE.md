# Resource Management Module - Complete Guide

## Overview
Comprehensive resource management module with real data from the database, including team allocation, capacity planning, and utilization tracking.

---

## Features

### 1. All Resources View
Display all team members with real utilization data:
- Name, email, department, position
- Projects assigned
- Tasks assigned and completed
- Allocated hours
- Average progress
- Utilization percentage (0-100%)
- Filter by department

**API:** `GET /api/resources?department=...`

### 2. Project Team View
View team members assigned to a specific project:
- All team member details
- Role in project (Viewer, Member, Lead)
- Tasks assigned in this project
- Completed tasks count
- Estimated hours
- Average progress on project tasks
- Date when assigned

**API:** `GET /api/resources/team/:projectId`

### 3. Project Allocation View
Detailed resource allocation breakdown:
- Which resources are assigned to project
- Hours allocated and completed
- Remaining hours
- Task breakdown (todo, in-progress, review, completed)
- Critical and high-priority tasks
- Overall project progress
- Summary statistics

**API:** `GET /api/resources/allocation/:projectId`

### 4. Team Capacity View
Team capacity and workload analysis:
- By department breakdown
- Utilization rate (%) for each team member
- Current workload (Low, Medium, High)
- Capacity status (Available, Moderate, At Capacity)
- Projects assigned
- Active tasks
- Hours allocated and completed

**API:** `GET /api/resources/capacity/team?department=...`

---

## Database Queries

All endpoints query real data from:
- `users` table - Team members
- `project_members` table - Project assignments
- `tasks` table - Task assignments
- Calculated fields:
  - Utilization = (allocated_hours / 40) * 100
  - Progress = average of task progress
  - Capacity = based on tasks and hours

---

## API Endpoints

### Get All Resources
```http
GET /api/resources?department=IT
```

**Response:**
```json
{
  "success": true,
  "resources": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "department": "IT",
      "position": "Developer",
      "hourlyRate": 500,
      "projectsAssigned": 2,
      "tasksAssigned": 5,
      "completedTasks": 2,
      "allocatedHours": 32.5,
      "avgProgress": 45.5,
      "utilization": "81.25",
      "totalProjects": 2
    }
  ],
  "total": 15
}
```

### Get Single Resource
```http
GET /api/resources/:resourceId
```

**Response:**
```json
{
  "success": true,
  "resource": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "department": "IT",
    "position": "Developer",
    "phone": "123-456-7890",
    "hourlyRate": 500,
    "status": "active",
    "projectsAssigned": 2,
    "tasksAssigned": 5,
    "completedTasks": 2,
    "allocatedHours": 32.5,
    "avgProgress": 45.5,
    "utilization": "81.25",
    "projects": [
      {
        "id": "uuid",
        "name": "Project A",
        "status": "active",
        "role": "member",
        "taskCount": 3,
        "totalHours": 20
      }
    ],
    "tasks": [
      {
        "id": "uuid",
        "name": "Task Name",
        "status": "in-progress",
        "priority": "high",
        "progress": 50,
        "estimatedHours": 8,
        "dueDate": "2025-12-25",
        "projectName": "Project A",
        "projectId": "uuid"
      }
    ]
  }
}
```

### Get Project Team
```http
GET /api/resources/team/:projectId
```

**Response:**
```json
{
  "success": true,
  "teamMembers": [
    {
      "membershipId": "uuid",
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "department": "IT",
      "position": "Developer",
      "hourlyRate": 500,
      "role": "member",
      "assignedAt": "2025-11-01T10:00:00Z",
      "tasksInProject": 3,
      "completedTasks": 1,
      "estimatedHours": 20,
      "avgProgress": 45
    }
  ],
  "total": 5,
  "projectId": "uuid"
}
```

### Get Project Allocation
```http
GET /api/resources/allocation/:projectId
```

**Response:**
```json
{
  "success": true,
  "projectId": "uuid",
  "allocations": [
    {
      "resourceId": "uuid",
      "resourceName": "John Doe",
      "department": "IT",
      "role": "member",
      "projectName": "Project A",
      "projectId": "uuid",
      "projectStatus": "active",
      "taskCount": 3,
      "completedCount": 1,
      "pendingCount": 1,
      "inProgressCount": 1,
      "totalEstimatedHours": 20,
      "completedHours": 8,
      "remainingHours": 12,
      "avgProgress": 45,
      "latestDueDate": "2025-12-25",
      "criticalTasks": 0,
      "highPriorityTasks": 1,
      "utilizationRate": "40.00"
    }
  ],
  "summary": {
    "totalAllocatedHours": 60,
    "totalCompletedHours": 25,
    "totalRemainingHours": 35,
    "totalTasks": 10,
    "totalCompleted": 4,
    "overallProgress": "40.00",
    "teamSize": 3
  }
}
```

### Get Team Capacity
```http
GET /api/resources/capacity/team?department=IT
```

**Response:**
```json
{
  "success": true,
  "teamCapacity": {
    "IT": [
      {
        "id": "uuid",
        "name": "John Doe",
        "position": "Developer",
        "hourlyRate": 500,
        "projectsCount": 2,
        "totalTasks": 5,
        "completedTasks": 2,
        "activeTasks": 3,
        "totalHours": 32.5,
        "completedHours": 10,
        "avgProgress": 45.5,
        "utilization": "81.25",
        "capacity": "Moderate"
      }
    ]
  },
  "totalResources": 5
}
```

### Get Available Resources
```http
GET /api/resources/availability/list
```

**Response:**
```json
{
  "success": true,
  "availableResources": [
    {
      "id": "uuid",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "department": "IT",
      "position": "QA Engineer",
      "hourlyRate": 400,
      "currentProjects": 1,
      "pendingTasks": 2,
      "allocatedHours": 15,
      "workload": "Low",
      "available": true
    }
  ],
  "total": 8
}
```

---

## Component Usage

### Basic Implementation

```jsx
import ResourceManagement from './components/ResourceManagement';

// View all resources
<ResourceManagement />

// View project-specific resources
<ResourceManagement projectId={projectId} />
```

### Integration in Projects

```jsx
function ProjectPage() {
    const { projectId } = useParams();

    return (
        <div className="project-page">
            <div className="tabs">
                <TabPanel label="Overview">
                    {/* ... */}
                </TabPanel>
                
                <TabPanel label="Resources">
                    <ResourceManagement projectId={projectId} />
                </TabPanel>
                
                <TabPanel label="Tasks">
                    {/* ... */}
                </TabPanel>
            </div>
        </div>
    );
}
```

---

## Data Visualization

### Utilization Indicators
- **0-50%:** Green (Available) - Good capacity
- **50-80%:** Yellow (Moderate) - Some capacity
- **80-100%:** Red (At Capacity) - Limited availability

### Workload Classification
- **Low:** 0-2 projects or ≤20 hours allocated
- **Medium:** 2-3 projects and 20-35 hours allocated
- **High:** 3+ projects or >35 hours allocated

### Capacity Status
- **Available:** 1-2 active tasks and <20 allocated hours
- **Moderate:** 3-4 active tasks and 20-35 allocated hours
- **At Capacity:** 4+ active tasks or >35 allocated hours

---

## Real Data Examples

### Query 1: All Resources (Marketing Dept)
```sql
SELECT u.id, u.name, COUNT(pm.project_id) as projects,
       COUNT(t.id) as tasks, AVG(t.progress) as progress
FROM users u
LEFT JOIN project_members pm ON u.id = pm.user_id
LEFT JOIN tasks t ON u.id = t.assignee
WHERE u.department = 'Marketing'
GROUP BY u.id, u.name;
```

**Result:**
```
John Doe     | Marketing | 2 projects | 5 tasks | 45% progress
Jane Smith   | Marketing | 1 project  | 3 tasks | 60% progress
```

### Query 2: Project Allocation
```sql
SELECT u.name, COUNT(t.id) as tasks, 
       SUM(t.estimated_hours) as total_hours,
       COUNT(CASE WHEN t.status='completed' THEN 1 END) as completed
FROM project_members pm
LEFT JOIN users u ON pm.user_id = u.id
LEFT JOIN tasks t ON pm.project_id = t.project_id AND t.assignee = u.id
WHERE pm.project_id = 'project-123'
GROUP BY u.name;
```

**Result:**
```
John Doe   | 3 tasks | 20 hours | 1 completed
Jane Smith | 2 tasks | 15 hours | 1 completed
```

---

## Features in Detail

### Resource Filtering
- By department (IT, HR, Finance, Operations, Marketing)
- Automatic workload calculation
- Capacity-based sorting

### Team Assignment Tracking
- Date assigned to project
- Role in project (Viewer, Member, Lead)
- Hours allocated
- Task assignments
- Progress tracking

### Allocation Management
- Task breakdown by status
- Hour tracking (allocated vs completed)
- Critical task identification
- Priority task counting
- Progress percentage

### Capacity Planning
- Department-wise breakdown
- Utilization metrics
- Workload balancing
- Availability status
- Project distribution

---

## Setup Instructions

### 1. Mount Routes in server/app.js

```javascript
const resourceManagementRoutes = require('./routes/resource-management-routes');

app.use('/api', resourceManagementRoutes);
```

### 2. Ensure Database Service

The module requires a PostgreSQL pool in `server/services/database.js`:

```javascript
const { pool } = require('./services/database');
module.exports = { pool };
```

### 3. Add Component to UI

```jsx
import ResourceManagement from './components/ResourceManagement';

<ResourceManagement projectId={projectId} />
```

---

## Performance Considerations

### Database Indexes
The routes use:
- `projects.id` - PRIMARY KEY
- `users.id` - PRIMARY KEY
- `project_members(project_id, user_id)`
- `tasks(project_id, assignee)`

### Query Optimization
- Uses aggregation at database level
- Calculates percentages and metrics in query
- Groups efficiently for team capacity

### Caching Opportunity
Results could be cached in `dashboard_stats` table:

```javascript
// Cache dashboard data every hour
UPDATE dashboard_stats SET
  total_tasks = (SELECT COUNT(*) FROM tasks...),
  completed_tasks = (SELECT COUNT(*) FROM tasks WHERE status='completed'...),
  last_updated = NOW()
WHERE project_id = $1;
```

---

## Error Handling

All endpoints return:

```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed message"
}
```

Common errors:
- 401: Unauthorized (missing token)
- 404: Resource not found
- 500: Server error (database issue)

---

## Testing Checklist

- [ ] List all resources (no filter)
- [ ] List resources by department
- [ ] Get single resource details
- [ ] Get project team members
- [ ] Get project allocation
- [ ] Get team capacity by department
- [ ] Get available resources for allocation
- [ ] Verify calculations (utilization %, progress)
- [ ] Check responsive design
- [ ] Test with large datasets

---

## Future Enhancements

1. **Resource Requests**
   - Manager can request additional resources
   - Approval workflow

2. **Bulk Allocation**
   - Assign multiple resources to project
   - Batch update roles

3. **Time Off Management**
   - Track vacation/leave
   - Adjust capacity automatically

4. **Skill Tracking**
   - Match resources to required skills
   - Suggest best resource for task

5. **Cost Analysis**
   - Calculate project costs
   - Budget vs actual comparison

6. **Export Capabilities**
   - Export allocation to CSV
   - Generate capacity reports

7. **Notifications**
   - Alert when overallocated
   - Remind of upcoming deadlines

8. **Advanced Analytics**
   - Trending utilization over time
   - Predictive capacity planning
   - Resource performance metrics

---

**Status:** ✅ Complete with Real Data
**Last Updated:** December 15, 2025
