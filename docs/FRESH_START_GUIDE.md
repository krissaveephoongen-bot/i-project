# Fresh Start Guide

This guide helps you reset the application and start fresh.

## Prerequisites

- Node.js >= 18
- PostgreSQL database configured
- Environment variables in `.env` file

## Step 1: Reset Database

Clean all project data from the database:

```bash
# Option A: Using npm script
npm run db:reset

# Option B: Using direct TypeScript
npx ts-node database/reset-projects.ts
```

This will:
- Delete all projects
- Delete all tasks
- Delete all time entries
- Delete all expenses
- Delete all comments and activity logs
- **Preserve users** for continuity

## Step 2: Initialize Fresh Data (Optional)

Add initial data to start with:

```bash
# Option A: Using npm script
npm run db:init

# Option B: Using direct TypeScript
npx ts-node database/init-fresh.ts
```

This will create:
- 1 Admin user (admin@local.dev)
- 4 Sample team members
- 3 Sample clients

## Step 3: Start Application

```bash
# Development mode
npm run dev

# Production build
npm run build
npm run preview
```

## Default Credentials (After Init)

If you ran the init script:

```
Email: admin@local.dev
Password: Use your configured authentication system
```

## Viewing Progress

1. **Login** to the application
2. **Go to Projects** page
3. Click **Create Project** button
4. Start creating your first project

Progress tracking features:
- ✅ Project creation with charter
- ✅ Task management with status
- ✅ Team member assignment
- ✅ Time tracking (timesheet)
- ✅ Expense tracking
- ✅ Budget management
- ✅ S-Curve progress visualization

## File Structure for Development

```
src/
  ├── pages/            # Main pages
  │   ├── Projects.tsx  # Projects list
  │   ├── ProjectDetail.tsx  # Single project view
  │   ├── Timesheet.tsx  # Time tracking
  │   └── dashboard/
  ├── components/       # Reusable components
  ├── services/        # API services
  ├── hooks/           # Custom hooks
  └── types/           # TypeScript types

database/
  ├── migrate.ts       # Schema migrations
  ├── reset-projects.ts # Clean all projects
  └── init-fresh.ts    # Initialize sample data
```

## API Endpoints

All API calls use `REACT_APP_API_URL` environment variable (defaults to `http://localhost:5000/api`)

**Key endpoints:**
- `GET /projects` - List all projects
- `POST /projects` - Create project
- `GET /projects/:id` - Get project details
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project
- `GET /projects/:id/tasks` - Get project tasks
- `GET /projects/:id/team` - Get team members
- `GET /projects/:id/expenses` - Get expenses

## Monitoring Progress

### Dashboard
Shows real-time metrics:
- Active projects count
- Task completion rate
- Budget utilization
- Team workload
- Timeline deadlines

### Project Detail
View individual project progress:
- Task status breakdown
- Budget vs spent
- S-Curve progress chart
- Team member assignments
- Activity timeline

## Next Steps

1. **Create first project** - Define objectives and scope
2. **Add team members** - Assign people to projects
3. **Create tasks** - Break down work into tasks
4. **Log time** - Track hours in timesheet
5. **Log expenses** - Record project costs
6. **Review progress** - Monitor using S-Curve and reports

## Troubleshooting

### Database Connection Issues
```bash
# Check database connection
npm run db:test

# View connection status
psql $DATABASE_URL
```

### API Not Working
1. Check `.env` file has `REACT_APP_API_URL`
2. Ensure server is running on port 5000
3. Check database is accessible

### Authentication Issues
1. Clear browser cookies
2. Clear application cache
3. Restart server and app

## Support

For detailed feature documentation, see individual feature READMEs in the codebase.
