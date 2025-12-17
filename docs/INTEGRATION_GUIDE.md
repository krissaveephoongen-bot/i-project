# Integration Guide - Quick Setup

## Step 1: Run Database Migration

```bash
# Run migration
npm run db:migrate
```

This creates:
- `project_members` table
- Enhanced `expenses` table
- `dashboard_stats` table
- `audit_logs` table

---

## Step 2: Update Server App.js

Add these imports to `server/app.js`:

```javascript
const teamManagementRoutes = require('./routes/team-management-routes');
const taskManagementRoutes = require('./routes/task-management-routes');
const expenseManagementRoutes = require('./routes/expense-management-routes');
const dashboardRoutes = require('./routes/dashboard-routes');
```

Add these route mounts (after auth middleware):

```javascript
// Team Management Routes
app.use('/api', teamManagementRoutes);

// Task Management Routes
app.use('/api', taskManagementRoutes);

// Expense Management Routes
app.use('/api', expenseManagementRoutes);

// Dashboard Routes
app.use('/api', dashboardRoutes);
```

---

## Step 3: Ensure Database Service is Available

The routes expect a PostgreSQL pool in `server/services/database.js`:

```javascript
// server/services/database.js should export:
module.exports = {
    pool: pg.Pool // configured PostgreSQL pool
}
```

If this doesn't exist, create it:

```javascript
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

module.exports = { pool };
```

---

## Step 4: Verify Auth Middleware

All routes use `verifyToken` middleware. Ensure it's properly configured in:

```javascript
// server/middleware/auth.js
module.exports = {
    verifyToken: async (req, res, next) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) return res.status(401).json({ error: 'No token' });
            
            // Verify JWT and set req.user
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (error) {
            res.status(401).json({ error: 'Invalid token' });
        }
    }
};
```

---

## Step 5: Add Frontend Components

Copy these files to your React app:

```
src/
  components/
    TeamManagement.jsx
    TeamManagement.css
    TaskManagement.jsx
    TaskManagement.css
    ExpenseTracking.jsx
    ExpenseTracking.css
    EnhancedDashboard.jsx
    EnhancedDashboard.css

services/
    teamService.js
    taskService.js
    expenseService.js
    dashboardService.js
```

---

## Step 6: Import in Your Pages

### Project Details Page

```jsx
import TeamManagement from '../components/TeamManagement';
import TaskManagement from '../components/TaskManagement';
import ExpenseTracking from '../components/ExpenseTracking';

function ProjectDetailsPage() {
    const { projectId } = useParams();
    const { user } = useAuth();

    return (
        <div className="project-details">
            <h1>Project Details</h1>
            
            {/* Team Tab */}
            <TabPanel label="Team">
                <TeamManagement projectId={projectId} />
            </TabPanel>

            {/* Tasks Tab */}
            <TabPanel label="Tasks">
                <TaskManagement projectId={projectId} />
            </TabPanel>

            {/* Expenses Tab */}
            <TabPanel label="Expenses">
                <ExpenseTracking 
                    projectId={projectId} 
                    userRole={user.role}
                />
            </TabPanel>
        </div>
    );
}
```

### Dashboard Page

```jsx
import EnhancedDashboard from '../components/EnhancedDashboard';

function DashboardPage() {
    return (
        <div className="dashboard">
            <EnhancedDashboard />
        </div>
    );
}
```

---

## Step 7: Environment Setup

Ensure `.env` has:

```
REACT_APP_API_URL=http://localhost:5001/api
DATABASE_URL=postgresql://user:password@localhost:5432/project_management
JWT_SECRET=your_secret_key
```

---

## Step 8: Install Required Dependencies

All required dependencies are already in `package.json`:
- axios
- sonner (toast notifications)
- lucide-react (icons)
- react-hook-form (forms)

Just verify they're installed:

```bash
npm install
```

---

## Step 9: Test the Integration

### Test Team Management

```javascript
// In browser console
fetch('http://localhost:5001/api/projects/PROJECT_ID/members', {
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
}).then(r => r.json()).then(console.log)
```

### Test Task Creation

```javascript
fetch('http://localhost:5001/api/tasks', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    },
    body: JSON.stringify({
        projectId: 'PROJECT_ID',
        name: 'Test Task',
        priority: 'medium',
        status: 'todo'
    })
}).then(r => r.json()).then(console.log)
```

### Test Expense Submission

```javascript
fetch('http://localhost:5001/api/expenses', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    },
    body: JSON.stringify({
        projectId: 'PROJECT_ID',
        amount: 1000,
        category: 'travel',
        expenseDate: '2025-12-15'
    })
}).then(r => r.json()).then(console.log)
```

---

## Step 10: Troubleshooting

### Routes Not Found (404)
- [ ] Check routes are mounted in `server/app.js`
- [ ] Check server is restarted after adding routes
- [ ] Verify route file imports correctly

### Database Errors
- [ ] Run migration: `npm run db:migrate`
- [ ] Check DATABASE_URL is correct
- [ ] Verify PostgreSQL is running

### Auth Errors (401)
- [ ] Check token is being sent in Authorization header
- [ ] Verify JWT_SECRET matches
- [ ] Check token is valid (not expired)

### CORS Errors
- [ ] Ensure CORS middleware is configured
- [ ] Check origin in CORS config matches frontend URL

### No Data Displaying
- [ ] Check browser Network tab for failed requests
- [ ] Check server console for errors
- [ ] Verify user has proper permissions

---

## API Endpoints Summary

### Team Management
```
GET    /api/projects/:projectId/members
POST   /api/projects/:projectId/members
DELETE /api/projects/:projectId/members/:userId
PATCH  /api/projects/:projectId/members/:userId
GET    /api/projects/:projectId/members/count
```

### Task Management
```
GET    /api/tasks?projectId=...&status=...&priority=...
GET    /api/tasks/:id
POST   /api/tasks
PATCH  /api/tasks/:id
PATCH  /api/tasks/:id/status
DELETE /api/tasks/:id
GET    /api/projects/:projectId/tasks
```

### Expense Tracking
```
GET    /api/expenses?projectId=...&status=...
GET    /api/expenses/:id
POST   /api/expenses
PATCH  /api/expenses/:id
PATCH  /api/expenses/:id/approve
PATCH  /api/expenses/:id/reject
DELETE /api/expenses/:id
GET    /api/expenses/pending/approval
GET    /api/expenses/summary/stats
```

### Dashboard
```
GET    /api/dashboard/stats?projectId=...
GET    /api/dashboard/charts/projects
GET    /api/dashboard/charts/expenses
GET    /api/dashboard/charts/tasks
GET    /api/dashboard/charts/team
GET    /api/dashboard/summary
GET    /api/dashboard/project/:projectId
```

---

## Customization Tips

### Change Colors
Update CSS files and adjust Tailwind colors as needed.

### Add Notifications
Services use toast notifications from `sonner`. Customize as needed:

```javascript
import { toast } from 'sonner';

toast.success('Custom message');
toast.error('Error message');
toast.loading('Loading...');
```

### Modify Form Fields
Edit component `formData` state to add/remove fields.

### Change Table Columns
Edit the table JSX in components to show different data.

---

**Integration Complete!**

All features are now ready to use. Start with the Project Details page to test Team and Task Management, then move to the Dashboard for statistics.
