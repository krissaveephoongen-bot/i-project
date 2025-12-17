# Enterprise Project Management Application - Complete Guide

## Overview

This is a comprehensive full-stack web application for managing Timesheet, Project, Cost, and Resource with integrated security system. Built with React, Firebase, and Tailwind CSS following Ant Design principles.

## Architecture

### Frontend Stack
- **React** - UI Components and State Management
- **TypeScript** - Type Safety
- **Tailwind CSS** - Responsive Design and Styling
- **Recharts** - Data Visualization (S-Curve Charts)
- **React Router** - Navigation
- **React Query** - Server State Management
- **React Hot Toast** - Notifications

### Backend Requirements
- **Node.js/Express** - API Server
- **PostgreSQL/Firebase** - Database
- **JWT Authentication** - Security
- **Drizzle ORM** - Database Management

## Features Implemented

### 1. User Section (Completed)
- ✅ User Dashboard with real-time overview
- ✅ Settings page with role management
- ✅ User profile management
- ✅ Unauthorized page for access control

### 2. Project Management Suite (Completed)
- ✅ Project creation, editing, deletion
- ✅ Budget management with category allocation (Labor, Materials, Equipment, Other)
- ✅ Task management system
- ✅ S-Curve progress tracking (Planned vs Actual)
- ✅ Real-time progress calculations
- ✅ Team member management
- ✅ Status tracking (Planning, Active, On-Hold, Completed, Cancelled)

### 3. Task Management System (Completed)
- ✅ Create, read, update, delete tasks
- ✅ Task weight-based progress calculation
- ✅ Actual progress tracking
- ✅ Task status management
- ✅ Task assignment to team members
- ✅ Date-based planning (Start/End dates)
- ✅ Automatic S-Curve data generation

### 4. S-Curve Report & Analytics (Completed)
- ✅ Real-time S-Curve chart visualization
- ✅ Planned Progress line
- ✅ Actual Progress line
- ✅ Variance calculation and display
- ✅ Weekly progress breakdown
- ✅ Progress variance alerts

### 5. To Be Implemented

#### Timesheet Management
- Timesheet submission and approval
- Work type categorization (Onsite, Office, Leave, Project-related, General Office Work)
- Weekly timesheet aggregation
- Approval workflow

#### Cost Management
- Cost submission and approval
- Cost categorization
- Budget vs. Actual analysis
- Cost variance reports

#### Resource Management
- Resource capacity planning
- Resource allocation tracking
- Utilization rate calculations
- Team capacity dashboard

#### Admin Features
- User and role management
- Reporting and analytics
- Document management
- System settings
- Audit logs

## Type Definitions

### Project Types (`src/types/project.ts`)
```typescript
- Task: Individual work units with dates and progress
- Milestone: Major project checkpoints
- ProjectBudget: Budget tracking and allocation
- ProjectProgress: Progress metrics
- SCurveDataPoint: S-Curve data for visualization
- Project: Main project entity
- ProjectFilters: Filter options
```

### Timesheet Types (`src/types/timesheet.ts`)
```typescript
- TimesheetEntry: Individual time entries
- TimesheetWeek: Weekly aggregation
- TimesheetApproval: Approval workflow
- TimesheetSummary: Summary analytics
- WorkType: Type of work (Onsite, Office, Leave, etc.)
```

### Cost Types (`src/types/cost.ts`)
```typescript
- Cost: Individual cost entries
- CostApproval: Approval workflow
- CostSummary: Cost analytics
- BudgetAllocation: Budget allocation by category
```

### Resource Types (`src/types/resource.ts`)
```typescript
- ResourceCapacity: Employee capacity and allocation
- ResourceAllocation: Project-specific allocation
- ResourceUtilization: Utilization metrics
- TeamCapacity: Team-wide capacity view
```

## Components

### Core Components

#### SCurveChart (`src/components/SCurveChart.tsx`)
- Displays S-Curve chart with dual lines (Planned vs Actual)
- Real-time variance calculation
- Status indicators (On Track, Behind, Ahead)
- Interactive tooltips

#### TaskManagement (`src/pages/TaskManagement.tsx`)
- Full CRUD operations for tasks
- Weight-based progress calculation
- Status filtering and management
- Task statistics dashboard
- Real-time progress bars

#### ProjectManagementSuite (`src/pages/ProjectManagementSuite.tsx`)
- Multi-tab project interface
- Project overview with key metrics
- Integrated task management
- S-Curve visualization
- Budget breakdown and tracking
- Team management

## Services

### Project Service (`src/services/projectService.ts`)
```typescript
- calculateSCurveData() - Generates S-Curve data from tasks
- createProject() - Create new project
- updateProject() - Update project details
- getProject() - Retrieve project
- deleteProject() - Delete project
- addTask() - Add task to project
- updateTask() - Update task
- deleteTask() - Remove task
```

## Database Schema (Firestore/PostgreSQL)

### Collection: artifacts/{appId}/users/{userId}/tasks
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "plannedStartDate": "timestamp",
  "plannedEndDate": "timestamp",
  "plannedProgressWeight": "number",
  "actualProgress": "number",
  "assignedTo": "string",
  "status": "pending|in-progress|completed|on-hold",
  "projectId": "string",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Collection: projects
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "clientName": "string",
  "projectManager": "string",
  "startDate": "timestamp",
  "endDate": "timestamp",
  "status": "planning|active|on-hold|completed|cancelled",
  "budget": {
    "total": "number",
    "spent": "number",
    "allocated": {
      "labor": "number",
      "materials": "number",
      "equipment": "number",
      "other": "number"
    },
    "currency": "string"
  },
  "progress": {
    "plannedProgress": "number",
    "actualProgress": "number",
    "variance": "number",
    "lastUpdated": "timestamp"
  },
  "tasks": ["Task[]"],
  "milestones": ["Milestone[]"],
  "sCurveData": ["SCurveDataPoint[]"],
  "teamMembers": ["string[]"],
  "createdBy": "string",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

## API Endpoints Required

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create project
- `GET /api/projects/{id}` - Get project details
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

### Tasks
- `POST /api/projects/{projectId}/tasks` - Add task
- `PUT /api/projects/{projectId}/tasks/{taskId}` - Update task
- `DELETE /api/projects/{projectId}/tasks/{taskId}` - Delete task

### Timesheets (To Be Implemented)
- `GET /api/timesheets` - List timesheets
- `POST /api/timesheets` - Create timesheet
- `PUT /api/timesheets/{id}` - Update timesheet
- `POST /api/timesheets/{id}/approve` - Approve timesheet

### Costs (To Be Implemented)
- `GET /api/costs` - List costs
- `POST /api/costs` - Create cost entry
- `PUT /api/costs/{id}` - Update cost
- `POST /api/costs/{id}/approve` - Approve cost

### Resources (To Be Implemented)
- `GET /api/resources` - List resources
- `GET /api/resources/{userId}/capacity` - Get capacity
- `PUT /api/resources/{userId}/allocate` - Allocate resource

## S-Curve Calculation

### Algorithm
1. For each week from project start to end:
   - Calculate planned progress based on task start/end dates
   - Calculate actual progress based on task actualProgress values
   - Apply weight: (taskProgress / 100) × (taskWeight / totalWeight)
   - Calculate variance: actualProgress - plannedProgress

### Formula
```
plannedProgress = Σ (min(daysElapsed/taskDuration, 1) × taskWeight / totalWeight)
actualProgress = Σ (taskActualProgress / 100 × taskWeight / totalWeight)
variance = actualProgress - plannedProgress
```

## Authentication

- Uses AuthContext from `src/contexts/AuthContext.tsx`
- JWT token stored in localStorage
- Bearer token in API authorization headers
- Current user accessed via `useAuthContext()` hook

## State Management

- **Local Component State** - useState for form data
- **Context** - AuthContext for user authentication
- **Server State** - React Query for API data
- **Real-time** - Firebase onSnapshot for live updates

## Security

- JWT-based authentication
- Role-based access control (admin, manager, member, viewer)
- User ID display for transparency
- Secure API endpoints with authorization headers
- Modal dialogs instead of alert() for UX

## Styling & Theme

### Tailwind CSS Classes Used
- Grid system: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`
- Colors: Blue (primary), Green (success), Red (danger), Gray (neutral)
- Spacing: Consistent padding and margins
- Shadows: `shadow-md`, `shadow-lg` for depth
- Rounded corners: `rounded-lg`, `rounded-full`
- Hover states: `hover:bg-*`, `hover:shadow-*`

### Color Palette
- Primary Blue: `#3b82f6` (`bg-blue-600`)
- Success Green: `#10b981` (`bg-green-600`)
- Danger Red: `#ef4444` (`bg-red-600`)
- Warning Yellow: `#f59e0b` (`bg-yellow-600`)
- Neutral Gray: `#6b7280` (`text-gray-700`)

## Usage Examples

### Creating a Project
```tsx
import { ProjectManagementSuite } from '@/pages';

export default function App() {
  return <ProjectManagementSuite />;
}
```

### Adding a Task
```tsx
import TaskManagement from '@/pages/TaskManagement';

export default function ProjectView() {
  return (
    <TaskManagement 
      projectId="project-123"
      onTasksUpdate={(tasks) => console.log(tasks)}
    />
  );
}
```

### Displaying S-Curve
```tsx
import SCurveChart from '@/components/SCurveChart';

export default function ProgressView() {
  return (
    <SCurveChart 
      data={sCurveData}
      title="Project Progress"
      height={400}
    />
  );
}
```

## Development Workflow

1. **Create New Feature**
   - Define types in `src/types/`
   - Create service in `src/services/`
   - Build components in `src/pages/` or `src/components/`
   - Export from index files

2. **API Integration**
   - Update service methods
   - Add error handling
   - Implement loading states
   - Show toast notifications

3. **Testing**
   - Test form submissions
   - Verify API calls
   - Check real-time updates
   - Test on multiple screen sizes

4. **Styling**
   - Use Tailwind CSS classes
   - Follow existing color scheme
   - Ensure responsive design
   - Test accessibility

## Environment Variables

Required environment variables:
```
VITE_API_BASE_URL=http://localhost:3001
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_API_KEY=your-api-key
```

## Performance Optimization

- Lazy load routes
- Memoize expensive calculations
- Use React.memo for list items
- Implement virtual scrolling for large lists
- Cache API responses

## Browser Support

- Chrome (Latest)
- Firefox (Latest)
- Safari (Latest)
- Edge (Latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Common Issues

1. **Tasks not updating in S-Curve**
   - Verify weight sum = 100%
   - Check date ranges
   - Ensure actualProgress is updated

2. **Budget calculations incorrect**
   - Verify category allocations
   - Check for null/undefined values
   - Ensure currency consistency

3. **API errors**
   - Check authorization token
   - Verify request format
   - Check server logs
   - Validate input data

## Next Steps

1. Implement Timesheet Management system
2. Build Cost Management module
3. Create Resource Management dashboard
4. Add Reporting & Analytics
5. Implement Document Management
6. Build Admin User Management
7. Add Real-time Notifications
8. Create comprehensive reporting system
9. Implement data export (PDF, Excel)
10. Add advanced filtering and search

## Contributing

- Follow existing code structure
- Use TypeScript for type safety
- Add comments for complex logic
- Test thoroughly before pushing
- Update documentation
- Follow commit conventions

## Support

For issues or questions:
- Check existing type definitions
- Review service implementations
- Test in browser DevTools
- Check console for errors
- Review API responses

---

**Last Updated**: December 2025
**Version**: 1.0.0
**Status**: Active Development
