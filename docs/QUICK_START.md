# Quick Start - Fresh Project

## ⚡ 5-Minute Setup

### Step 1: Prepare Environment

```bash
# Copy environment template if needed
cp .env.example .env

# Verify these in .env:
# DATABASE_URL=postgres://...
# REACT_APP_API_URL=http://localhost:5000/api
```

### Step 2: Reset Database

```bash
# Clean all old data and initialize fresh
npm run db:clean

# Or separately:
npm run db:reset      # Clean all projects
npm run db:init       # Add sample data
```

### Step 3: Start Development

```bash
# Terminal 1: Start frontend
npm run dev

# Terminal 2: Start backend (if running locally)
npm run start:server
```

### Step 4: Access Application

```
Frontend:  http://localhost:5173
API:       http://localhost:5000/api
Admin:     http://localhost:5173/admin
```

## 📋 First Steps in App

### 1. Login
- **Email:** admin@local.dev
- Use your configured password

### 2. View Dashboard
- Check real-time metrics
- See team workload
- Monitor active projects

### 3. Create First Project
1. Go to **Projects** page
2. Click **Create Project** button
3. Fill in:
   - Project Name
   - Project Code (e.g., PROJ-001)
   - Description
   - Start/End dates
   - Budget
   - Manager
   - Client

### 4. Define Project Charter (Optional but Recommended)
1. Click **Project Charter** tab
2. Add:
   - Project Objective
   - Business Case
   - Success Criteria
   - Scope
   - Constraints
   - Assumptions
   - Risks

### 5. Add Team Members
1. Click **Team** tab
2. Click **Add Team Member**
3. Select from available users
4. Set role and availability

### 6. Create Tasks
1. Click **Tasks** tab
2. Click **Create Task**
3. Fill in:
   - Task Title
   - Description
   - Priority
   - Assigned to
   - Due Date
   - Estimated Hours

### 7. Log Time (Timesheet)
1. Go to **Timesheet** page
2. Select date and project/task
3. Log hours worked
4. Add description

### 8. Track Expenses
1. In project, click **Expenses**
2. Click **Add Expense**
3. Enter amount, category, description
4. Submit for approval

### 9. Monitor Progress
1. View **S-Curve Chart** in project details
2. Check task completion %
3. Monitor budget utilization
4. Review team capacity

## 🎯 Progress Tracking

### Key Metrics Displayed
- **Project Status** - Planning, Active, On-Hold, Completed
- **Completion %** - Tasks completed / total tasks
- **Budget Status** - Spent vs Budget
- **Timeline** - Current vs Planned (S-Curve)
- **Team Workload** - Hours logged / available
- **Risk Level** - Based on timeline variance

### S-Curve Interpretation
- **Planned Line** - Expected progress
- **Actual Line** - Real progress
- **Variance** - Difference between planned and actual
- **Trend** - Shows if on track or delayed

## 🔍 Viewing Progress

### Dashboard
Shows overview of all projects and team metrics

### Project Detail
Shows detailed view of single project with all tabs:
- Summary
- Tasks
- Team
- Expenses
- S-Curve
- Charter

### Reports (Optional)
Generate various reports for analysis

## 📊 Progress Stages

```
Phase 1: Planning (0-10%)
├── Define scope
├── Create charter
└── Identify risks

Phase 2: Execution (10-70%)
├── Create tasks
├── Assign team
├── Log time & expenses
└── Update status

Phase 3: Monitoring (continuous)
├── Track progress
├── Review metrics
├── Manage risks
└── Control budget

Phase 4: Closure (90-100%)
├── Complete tasks
├── Final reviews
├── Lessons learned
└── Archive
```

## ✅ Feature Checklist

### Project Management
- [ ] Create project
- [ ] Define charter
- [ ] Add team members
- [ ] Set budget

### Task Management
- [ ] Create tasks
- [ ] Assign tasks
- [ ] Set priorities
- [ ] Update status

### Time Tracking
- [ ] Log daily hours
- [ ] Assign to tasks
- [ ] Submit timesheet
- [ ] Review hours

### Expense Tracking
- [ ] Log expenses
- [ ] Add receipts
- [ ] Submit for approval
- [ ] Track budget

### Progress Monitoring
- [ ] View S-Curve
- [ ] Check completion %
- [ ] Monitor budget
- [ ] Review dashboard

## 🐛 Troubleshooting

### "Cannot connect to database"
```bash
# Check PostgreSQL is running
psql $DATABASE_URL

# Run migrations
npm run db:migrate

# Initialize fresh data
npm run db:init
```

### "API not responding"
```bash
# Check server is running on port 5000
# Check REACT_APP_API_URL in .env
# Restart both frontend and backend
```

### "Authentication failed"
```bash
# Clear browser cache and cookies
# Restart the application
# Check database has users
npm run db:init
```

### "Can't create project"
```bash
# Check you're logged in as admin or manager
# Verify database tables exist
npm run db:migrate
```

## 📱 Responsive Design

- Desktop: Full featured UI
- Tablet: Optimized layout
- Mobile: Simplified view

## 🎨 Theme

- Light/Dark mode support
- Tailwind CSS styling
- Accessible color scheme
- Professional look & feel

## 📞 Support

For issues or questions:
1. Check FRESH_START_GUIDE.md for detailed setup
2. Review PROJECT_STRUCTURE.md for architecture
3. Check individual feature documentation

## 🎓 Learning Path

1. **Basics** - Create a simple project
2. **Teams** - Add team members
3. **Tasks** - Break down into tasks
4. **Tracking** - Log time and expenses
5. **Monitoring** - Review progress charts
6. **Advanced** - Use reports and analytics

## 🚀 Next Level

Once comfortable with basics:
- Create multiple projects
- Use advanced filtering
- Generate reports
- Export data
- Bulk operations
- Custom templates

---

**Happy Project Managing! 🎉**
