# Project Management Tool - Setup Guide

## Quick Start (5 minutes)

### 1. Database Setup
The Prisma schema already includes the necessary models. If you haven't run migrations yet:

```bash
# Run Prisma migrations
npx prisma migrate dev

# Seed test data (optional)
npx prisma db seed
```

### 2. Start Backend
```bash
# Terminal 1 - Backend
cd c:\Users\Jakgrits\project-mgnt
npm install
npm run dev
# Server starts on http://localhost:5000
```

### 3. Start Frontend
```bash
# Terminal 2 - Frontend
npm run dev
# Frontend starts on http://localhost:5173
```

### 4. Access Application
- **URL**: http://localhost:5173
- **Login**: Use existing user credentials from database
- **Dashboard**: Should load with projects and tasks

## File Structure

```
project-mgnt/
├── src/
│   ├── components/
│   │   ├── dashboard/
│   │   │   └── ProjectDashboard.tsx          (Main dashboard)
│   │   ├── tasks/
│   │   │   ├── TaskManagement.tsx            (Legacy)
│   │   │   └── TaskManagementEnhanced.tsx    (New - use this)
│   │   └── timesheet/
│   │       ├── TimesheetEntry.tsx            (Log hours)
│   │       └── TimesheetApproval.tsx         (Manager approvals)
│   └── pages/
│       └── HomePage.tsx                      (Main layout)
│
├── server/
│   ├── task-routes.js                        (Task CRUD)
│   ├── timesheet-routes.js                   (Timesheet CRUD + approval)
│   ├── project-routes.js                     (Existing)
│   ├── auth-routes.js                        (Existing)
│   └── app.js                                (Modified to include new routes)
│
└── prisma/
    └── schema.prisma                         (Already has all models)
```

## API Routes Added

### Task Management
```
GET    /api/tasks                     - List tasks (with filters)
GET    /api/tasks/:id                 - Get task details
POST   /api/tasks                     - Create task
PATCH  /api/tasks/:id                 - Update task
DELETE /api/tasks/:id                 - Delete task
GET    /api/projects/:projectId/tasks - Get project tasks
POST   /api/tasks/:id/update-progress - Update progress
```

### Timesheet
```
GET    /api/timesheets                     - List timesheets
POST   /api/timesheets                     - Create entry
PATCH  /api/timesheets/:id                 - Update entry
DELETE /api/timesheets/:id                 - Delete entry (draft only)
POST   /api/timesheets/:id/approve         - Approve entry
POST   /api/timesheets/:id/reject          - Reject entry
GET    /api/timesheets/weekly/:userId      - Weekly summary
```

## Key Features

### 1. Dashboard Tab
Shows:
- Total projects (active, planning, completed)
- Budget overview and spending
- Team members and utilization
- Project progress metrics
- Task breakdown

### 2. Task Management Tab
Shows:
- All tasks with status and priority
- Task assignment tracking
- Progress tracking (0-100%)
- Estimated vs actual hours
- Due date management
- Detailed task drawer with timesheet integration

### 3. Timesheet Tab
Allows:
- Daily time logging
- Weekly hour tracking
- Task-based entries
- Draft/Submit workflow
- Summary statistics

### 4. Approvals Tab (Managers Only)
Shows:
- Pending timesheet entries
- Employee hours
- Approve/reject actions
- Rejection reasons

## Configuration

### Environment Variables
Create `.env` in root:
```
DATABASE_URL="postgresql://user:password@localhost:5432/project_mgmt"
JWT_SECRET="your-secret-key"
NODE_ENV="development"
PORT=5000
```

### Ant Design Theme
Components use default Ant Design theme. Customize in:
- `tailwind.config.js` - Tailwind theme
- `src/styles/` - Custom styles

## Common Tasks

### Create a New Project
1. Go to Dashboard
2. Click "New Project" (if available)
3. Fill in project details
4. Assign project manager
5. Add team members

### Create a Task
1. Go to Task Management
2. Select project from dropdown
3. Click "Add Task"
4. Fill in task details
5. Assign to team member
6. Set estimate and dates

### Log Time
1. Go to Timesheet
2. Select date
3. Enter hours worked
4. Add description (optional)
5. Click "Add Entry"
6. Submit week when ready

### Approve Timesheets (Manager Only)
1. Go to Approvals tab
2. Review pending entries
3. Click approve (✓) or reject (✗)
4. If rejecting, provide reason

## Testing

### Manual Testing Checklist

**Task Management**
- [ ] Create task
- [ ] Edit task
- [ ] Delete task
- [ ] Update progress
- [ ] Assign to user
- [ ] Change status

**Timesheet**
- [ ] Add entry
- [ ] Edit entry
- [ ] Delete entry (draft only)
- [ ] Submit week
- [ ] View history

**Approval (Manager)**
- [ ] View pending timesheets
- [ ] Approve entry
- [ ] Reject with reason
- [ ] Bulk approve

## Data Model Relationships

```
User
├── assignedTasks (Task[])
├── reportedTasks (Task[])
├── timesheets (Timesheet[])
├── timeLogs (TimeLog[])
└── approvedTimesheets (Timesheet[])

Project
├── tasks (Task[])
├── timesheets (Timesheet[])
├── timeLogs (TimeLog[])
└── costs (Cost[])

Task
├── project (Project)
├── assignee (User)
├── reporter (User)
├── timesheets (Timesheet[])
├── timeLogs (TimeLog[])
└── comments (Comment[])

Timesheet
├── user (User)
├── project (Project)
├── task (Task)
└── approvedBy (User)
```

## Troubleshooting

### Issue: "Cannot find module 'timesheet-routes'"
**Solution**: Ensure files are saved in correct location:
- `server/timesheet-routes.js`
- `server/task-routes.js`

### Issue: API returns 404
**Solution**: Check that routes are registered in `server/app.js`:
```javascript
app.use('/api', timesheetRoutes);
app.use('/api', taskRoutes);
```

### Issue: Database unique constraint error
**Solution**: Check Prisma unique constraints:
- `Timesheet`: unique on `(userId, projectId, taskId, date)`
- Ensure no duplicate entries for same date

### Issue: Timesheets not loading
**Solution**:
1. Check `projectId` is set
2. Verify user has entries in database
3. Check date range is correct
4. Review browser Network tab for API errors

## Performance Tips

1. **Pagination**: Uses 10-20 items per page
2. **Lazy Loading**: Related data loaded on demand
3. **Memoization**: Use React.memo for static components
4. **Database Indexes**: Already defined in schema

## Security Notes

- All endpoints require authentication context
- Managers can only approve their own project's timesheets
- Delete only available for DRAFT timesheets
- Input validation on all forms
- SQL injection prevention via Prisma

## Next Steps

1. ✅ Database setup
2. ✅ Backend running
3. ✅ Frontend running
4. ✅ Login to application
5. Create first project
6. Create tasks
7. Log time
8. Review dashboard

## Support Resources

- **Database Schema**: `prisma/schema.prisma`
- **API Examples**: `PROJECT_MANAGEMENT_TOOL.md`
- **Component Props**: See individual component files
- **Type Definitions**: TypeScript interfaces in component files

## Deployment

### Production Build
```bash
npm run build
npm run preview
```

### Docker
```bash
docker build -f Dockerfile -t project-mgmt .
docker run -p 5000:5000 -p 3000:3000 project-mgmt
```

### Environment Setup
Ensure these are set in production:
- `DATABASE_URL` - Production database URL
- `JWT_SECRET` - Secure secret key
- `NODE_ENV` - Set to "production"

---

**Ready to use!** Start with the Quick Start section above.
