# Full Implementation Plan - All 4 Features

## Features to Implement
1. **Team Management** - Add/Remove members from projects
2. **Task Management** - Create/Edit/Delete tasks with status tracking  
3. **Expense Tracking** - Enter expenses with approval workflow
4. **Enhanced Dashboard** - Statistics and charts

---

## 1. DATABASE SCHEMA UPDATES

### A. Team Members Table (Project-specific)
```sql
CREATE TABLE project_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member', -- 'lead', 'member', 'viewer'
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);
```

### B. Enhanced Tasks Table (Already exists, may need adjustments)
Ensure existing tasks table has:
- status (todo, in-progress, review, completed)
- priority (low, medium, high, critical)
- progress percentage
- assignee

### C. Expenses Table (Already exists, enhance if needed)
Ensure existing expenses table has:
- amount
- category
- project_id
- user_id
- status (pending, approved, rejected)
- approval_notes

### D. Dashboard Stats Table (New - for caching)
```sql
CREATE TABLE dashboard_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    total_tasks INTEGER,
    completed_tasks INTEGER,
    pending_expenses DECIMAL(15,2),
    approved_expenses DECIMAL(15,2),
    team_members INTEGER,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 2. API ENDPOINTS

### Team Management
- `GET /api/projects/:id/members` - List project members
- `POST /api/projects/:id/members` - Add member to project
- `DELETE /api/projects/:id/members/:userId` - Remove member
- `PATCH /api/projects/:id/members/:userId` - Update member role

### Task Management
- `POST /api/tasks` - Create task
- `GET /api/tasks` - List tasks
- `GET /api/tasks/:id` - Get task details
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/status` - Update status
- `GET /api/projects/:id/tasks` - List project tasks

### Expense Tracking
- `POST /api/expenses` - Submit expense
- `GET /api/expenses` - List expenses
- `GET /api/expenses/:id` - Get expense details
- `PATCH /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `PATCH /api/expenses/:id/approve` - Approve expense
- `PATCH /api/expenses/:id/reject` - Reject expense

### Enhanced Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/charts` - Get chart data
- `GET /api/dashboard/summary` - Get summary data

---

## 3. FRONTEND COMPONENTS

### Team Management
- `components/TeamManagement.jsx` - Main component
- `components/TeamMemberList.jsx` - List members
- `components/AddMemberModal.jsx` - Add member dialog
- `components/MemberCard.jsx` - Member card

### Task Management
- `components/TaskManagement.jsx` - Main component
- `components/TaskList.jsx` - List tasks
- `components/TaskCard.jsx` - Task card
- `components/TaskForm.jsx` - Create/edit form
- `components/TaskStatusBadge.jsx` - Status indicator

### Expense Tracking
- `components/ExpenseTracking.jsx` - Main component
- `components/ExpenseList.jsx` - List expenses
- `components/ExpenseForm.jsx` - Submit form
- `components/ExpenseApprovalList.jsx` - Approval queue
- `components/ExpenseCard.jsx` - Expense card

### Enhanced Dashboard
- `components/EnhancedDashboard.jsx` - Main dashboard
- `components/StatsCards.jsx` - Statistics display
- `components/ChartContainer.jsx` - Charts section
- `components/ProjectProgressChart.jsx` - Project chart
- `components/ExpenseBreakdownChart.jsx` - Expense chart
- `components/TeamUtilizationChart.jsx` - Team chart

---

## 4. SERVICES

### Team Management Service
- `services/teamService.js`

### Task Management Service
- `services/taskService.js`

### Expense Service
- `services/expenseService.js`

### Dashboard Service
- `services/dashboardService.js`

---

## 5. IMPLEMENTATION ORDER

1. Create database migrations
2. Create API backend routes and services
3. Create React components
4. Create service layer (API client)
5. Integrate into main app
6. Add styling (Tailwind/CSS)
7. Test all features

