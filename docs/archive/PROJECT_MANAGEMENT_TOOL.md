# Project Management Tool with Timesheet

Complete project management system with integrated timesheet tracking, task management, and reporting.

## Features

### 1. Dashboard
- Overview of all projects and active tasks
- Budget tracking and spending analysis
- Team member management
- Progress indicators
- Hour allocation tracking

**Location**: `src/components/dashboard/ProjectDashboard.tsx`

### 2. Task Management
- Create, read, update, delete tasks
- Task prioritization (low, medium, high, urgent)
- Task status tracking (TODO, IN_PROGRESS, IN_REVIEW, DONE, BLOCKED, CANCELLED)
- Progress tracking with visual indicators
- Task assignment to team members
- Planned vs actual hours tracking
- Due date management
- Task descriptions and comments

**Location**: `src/components/tasks/TaskManagementEnhanced.tsx`

### 3. Timesheet Entry
- Daily hour logging
- Weekly timesheet submission
- Task-based time tracking
- Draft/Submit workflow
- Bulk operations
- Auto-calculation of total hours

**Location**: `src/components/timesheet/TimesheetEntry.tsx`

### 4. Timesheet Approval
- Manager approval dashboard
- Pending timesheet review
- Reject with reasons
- Bulk approvals
- History tracking

**Location**: `src/components/timesheet/TimesheetApproval.tsx`

## Database Schema

### Key Models

#### User
```
- id: UUID (primary key)
- name: String
- email: String (unique)
- password: String
- role: Role (ADMIN, PROJECT_MANAGER, DEVELOPER, etc.)
- timezone: String
- position: String
- department: String
```

#### Project
```
- id: UUID (primary key)
- name: String
- code: String (unique)
- description: String
- status: ProjectStatus (PLANNING, IN_PROGRESS, COMPLETED, ON_HOLD, CANCELLED)
- startDate: DateTime
- endDate: DateTime
- budget: Float
- actualCost: Float
- progress: Int (0-100)
- projectManagerId: UUID (foreign key)
```

#### Task
```
- id: UUID (primary key)
- projectId: UUID (foreign key)
- title: String
- description: String
- status: TaskStatus (TODO, IN_PROGRESS, IN_REVIEW, DONE, BLOCKED)
- priority: String (low, medium, high, urgent)
- dueDate: DateTime
- estimatedHours: Float
- actualHours: Float
- actualProgress: Float (0-100)
- plannedProgressWeight: Float
- plannedStartDate: DateTime
- plannedEndDate: DateTime
- assigneeId: UUID (foreign key)
- reporterId: UUID (foreign key)
```

#### Timesheet
```
- id: UUID (primary key)
- userId: UUID (foreign key)
- projectId: UUID (foreign key)
- taskId: UUID (foreign key, optional)
- date: Date
- hoursWorked: Float
- description: String
- status: TimesheetStatus (DRAFT, SUBMITTED, APPROVED, REJECTED)
- approvedById: UUID (foreign key, optional)
- approvedAt: DateTime
- rejectionReason: String
```

#### TimeLog
```
- id: UUID (primary key)
- userId: UUID (foreign key)
- projectId: UUID (foreign key)
- taskId: UUID (foreign key, optional)
- startTime: DateTime
- endTime: DateTime
- duration: Int (in seconds)
- description: String
- billable: Boolean
```

## API Endpoints

### Projects
- `GET /api/projects/my-projects?userId={id}` - Get user's projects
- `GET /api/projects/{id}` - Get project details
- `POST /api/projects` - Create project
- `PATCH /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

### Tasks
- `GET /api/tasks` - Get tasks (with filters)
- `GET /api/tasks/:id` - Get task details
- `POST /api/tasks` - Create task
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/projects/:projectId/tasks` - Get project tasks
- `POST /api/tasks/:id/update-progress` - Update task progress

**Query Parameters for GET /api/tasks:**
- `projectId` - Filter by project
- `assigneeId` - Filter by assignee
- `status` - Filter by status (comma-separated for multiple)
- `priority` - Filter by priority
- `search` - Search in title and description

### Timesheets
- `GET /api/timesheets` - Get timesheets (with filters)
- `POST /api/timesheets` - Create timesheet entry
- `PATCH /api/timesheets/:id` - Update timesheet entry
- `DELETE /api/timesheets/:id` - Delete timesheet entry
- `POST /api/timesheets/:id/approve` - Approve timesheet
- `POST /api/timesheets/:id/reject` - Reject timesheet
- `GET /api/timesheets/weekly/:userId` - Get weekly summary

**Query Parameters for GET /api/timesheets:**
- `userId` - Filter by user
- `projectId` - Filter by project
- `status` - Filter by status
- `startDate` - Filter from date (YYYY-MM-DD)
- `endDate` - Filter to date (YYYY-MM-DD)
- `managerId` - Get all timesheets for manager's projects

## Usage Guide

### For Employees

1. **Log Time**
   - Navigate to Timesheet tab
   - Select date and hours worked
   - Add description of work
   - Click "Add Entry"

2. **Submit Timesheet**
   - Fill in all entries for the week
   - Click "Submit Week for Approval"
   - Manager will review and approve/reject

3. **Track Tasks**
   - Go to Task Management
   - View assigned tasks
   - Update progress as work completes
   - Check time spent vs estimated

### For Managers

1. **Create Projects**
   - From Dashboard, click "New Project"
   - Set budget, timeline, team members
   - Assign project manager

2. **Create Tasks**
   - Select project
   - Click "Add Task"
   - Assign to team members
   - Set deadlines and estimates

3. **Approve Timesheets**
   - Navigate to Approvals tab
   - Review pending entries
   - Approve or reject with comments
   - Track team hours

4. **Monitor Progress**
   - View dashboard for project status
   - Check budget vs actual spending
   - Review team workload
   - Generate reports

## Component Props

### ProjectDashboard
```typescript
interface ProjectDashboard {
  // No required props
  // Uses useAuth for current user context
}
```

### TaskManagementEnhanced
```typescript
interface TaskManagementEnhancedProps {
  projectId?: string; // Optional: pre-select project
}
```

### TimesheetEntry
```typescript
interface TimesheetEntryProps {
  projectId: string;
  taskId?: string;
  onEntrySubmitted?: () => void;
}
```

### TimesheetApproval
```typescript
interface TimesheetApproval {
  // No required props
  // Uses useAuth for manager context
}
```

## Integration Points

### Authentication
All components require `useAuth` context:
```typescript
const { currentUser } = useAuth();
```

### API Communication
All API calls use fetch with standard patterns:
```typescript
const response = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});
const result = await response.json();
```

### State Management
Uses React hooks for local state:
- `useState` for component state
- `useEffect` for data fetching
- Form state managed by Ant Design Form component

## Styling

- Uses Tailwind CSS for utility classes
- Ant Design components for UI elements
- Custom CSS for specific styling needs
- Responsive design (mobile-first approach)

## Error Handling

All API calls include:
- Try/catch blocks for error handling
- User feedback via Ant Design messages
- Console logging for debugging
- HTTP status code validation

## Performance Considerations

- Pagination for large datasets (10-20 items per page)
- Lazy loading of related data
- Memoization of expensive calculations
- Efficient database queries with indexing

## Security

- Role-based access control (RBAC)
- User authentication required
- Data validation on both client and server
- Secure API endpoints with authorization checks

## Future Enhancements

1. **Advanced Reporting**
   - S-curve analysis
   - Resource allocation charts
   - Budget burndown reports
   - Team utilization reports

2. **Notifications**
   - Task assignment notifications
   - Deadline reminders
   - Timesheet reminders
   - Approval notifications

3. **Mobile App**
   - React Native implementation
   - Offline time tracking
   - Push notifications
   - Mobile timesheet entry

4. **Integrations**
   - Calendar sync (Google, Outlook)
   - Email notifications
   - Slack integration
   - Project exports

## Troubleshooting

### Timesheets Not Showing
- Verify project ID is set correctly
- Check database has entries for date range
- Ensure user has assigned timesheet entries

### Tasks Not Loading
- Verify project exists and has tasks
- Check user permissions
- Check for database connection issues

### Approval Issues
- Ensure user has manager role
- Verify timesheet status is SUBMITTED
- Check manager is assigned to project

## Contributing

When adding new features:
1. Follow existing code structure
2. Add TypeScript types for new data
3. Create corresponding API routes
4. Update database schema if needed
5. Add error handling
6. Test with real data

## Support

For issues or questions:
1. Check logs in browser console
2. Review API response in Network tab
3. Verify database schema matches Prisma schema
4. Check environment variables are set correctly
