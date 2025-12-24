# Project Management Tool - Quick Reference Card

## 🚀 Get Started in 5 Minutes

```bash
# 1. Install & Setup
npm install
npx prisma migrate dev

# 2. Start Backend
npm run dev                # Terminal 1 - Port 5000

# 3. Start Frontend (new terminal)
npm run dev                # Terminal 2 - Port 5173

# 4. Open Browser
http://localhost:5173
```

---

## 📱 Main Features

| Feature | What It Does | Where to Find |
|---------|------------|---|
| **Dashboard** | Overview of projects, budgets, team | Click Dashboard tab |
| **Tasks** | Create, manage, track tasks | Click Task Management tab |
| **Timesheet** | Log hours and submit | Click Timesheet tab |
| **Approvals** | Manager approval (if manager) | Click Approvals tab |

---

## 🎯 Common Tasks

### Create a Task
1. Go to **Task Management**
2. Select project from dropdown
3. Click **Add Task**
4. Fill in details (title required)
5. Click **OK**

### Log Time
1. Go to **Timesheet**
2. Select date
3. Enter hours (0.5-24)
4. Add description (optional)
5. Click **Add Entry**

### Submit Week
1. Go to **Timesheet**
2. Log all entries
3. Click **Submit Week for Approval**
4. Manager will review

### Approve Timesheet (Manager)
1. Go to **Approvals** tab
2. Review pending entries
3. Click **✓** to approve or **✗** to reject
4. If rejecting, explain why

---

## 📊 Dashboard Metrics

| Metric | What It Shows |
|--------|---|
| Total Projects | All active projects |
| Active | Currently in progress |
| Avg Progress | Overall completion % |
| Team Members | Total across projects |
| Budget | Spent vs total |
| Hours | Logged vs allocated |

---

## 🔌 API Quick Reference

### Tasks
```
GET    /api/tasks?assigneeId={id}&status=TODO
POST   /api/tasks
PATCH  /api/tasks/{id}
DELETE /api/tasks/{id}
```

### Timesheets
```
GET    /api/timesheets?userId={id}&status=SUBMITTED
POST   /api/timesheets
PATCH  /api/timesheets/{id}
POST   /api/timesheets/{id}/approve
POST   /api/timesheets/{id}/reject
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `src/components/dashboard/ProjectDashboard.tsx` | Dashboard view |
| `src/components/tasks/TaskManagementEnhanced.tsx` | Task management |
| `src/components/timesheet/TimesheetEntry.tsx` | Log hours |
| `src/components/timesheet/TimesheetApproval.tsx` | Approve time |
| `server/task-routes.js` | Task API |
| `server/timesheet-routes.js` | Timesheet API |

---

## 🔑 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Navigate between fields |
| `Enter` | Submit form |
| `Escape` | Close dialog |
| `Ctrl+S` | Save (when available) |

---

## 📈 Task Statuses

| Status | Next Step |
|--------|-----------|
| TODO | Assign and start |
| IN_PROGRESS | Log time daily |
| IN_REVIEW | Wait for approval |
| DONE | No action needed |
| BLOCKED | Unblock & resume |

---

## ⏰ Timesheet Statuses

| Status | What to Do |
|--------|-----------|
| DRAFT | Edit or add more |
| SUBMITTED | Wait for approval |
| APPROVED | Done (hours counted) |
| REJECTED | Fix and resubmit |

---

## 🎨 Priority Levels

| Level | Color | Use When |
|-------|-------|----------|
| Low | Gray | Can wait |
| Medium | Orange | Normal work |
| High | Red | Time-sensitive |
| Urgent | Dark Red | Do immediately |

---

## 👤 Roles & Access

| Role | Can Do | Cannot Do |
|------|--------|----------|
| **Developer** | View tasks, log time | Approve, create projects |
| **Team Lead** | Create tasks, assign | Create projects, approve |
| **Manager** | All + approve timesheets | — |
| **Admin** | Everything | — |

---

## ❌ Common Issues

| Issue | Fix |
|-------|-----|
| "Routes not found" | Restart backend: `npm run dev` |
| "Can't connect DB" | Check DATABASE_URL in .env |
| "Tasks not loading" | Select project first |
| "Can't approve" | Check if you're a manager |
| "Entry already exists" | Check date - one entry per day per task |

---

## 📞 Need Help?

1. Check **[USER_GUIDE_PROJECT_MANAGEMENT.md](./USER_GUIDE_PROJECT_MANAGEMENT.md)** - Full guide
2. Check **[API_REFERENCE.md](./API_REFERENCE.md)** - API details
3. Check **[SETUP_PROJECT_MANAGEMENT.md](./SETUP_PROJECT_MANAGEMENT.md)** - Setup issues
4. Check browser console for errors

---

## 💡 Pro Tips

### Time Tracking
- ✅ Log time daily, not weekly
- ✅ Be specific in descriptions
- ✅ Use task references
- ✅ Keep hours accurate

### Task Management
- ✅ Use realistic estimates
- ✅ Set clear descriptions
- ✅ Assign to one person per task
- ✅ Update progress weekly

### For Managers
- ✅ Review timesheets timely
- ✅ Provide feedback on rejects
- ✅ Monitor team capacity
- ✅ Plan workload based on history

---

## 🔐 Security

- ✅ Never share your password
- ✅ Log out before leaving
- ✅ Don't share session cookies
- ✅ Report suspicious activity

---

## 📱 Mobile Access

The app works on mobile browsers:
- iPhone Safari ✅
- Chrome Mobile ✅
- Android Browsers ✅
- Tablets ✅

---

## 🌐 Environment

```
Backend:  http://localhost:5000
Frontend: http://localhost:5173
Database: PostgreSQL (configured in .env)
```

---

## 📊 Data Flow

```
User Input
    ↓
React Component
    ↓
API Call (Fetch)
    ↓
Express Route
    ↓
Prisma Query
    ↓
PostgreSQL Database
    ↓
Response JSON
    ↓
Component Update
    ↓
Visual Update
```

---

## 🎯 Success Metrics

Track these to measure productivity:

| Metric | Good Range |
|--------|-----------|
| Tasks Completed | 80%+ |
| On-time Delivery | 95%+ |
| Budget Variance | ±10% |
| Team Utilization | 80-90% |
| Timesheet Accuracy | 98%+ |

---

## 📅 Weekly Routine

**Monday**
- [ ] Review assigned tasks
- [ ] Plan week's work
- [ ] Check priorities

**Daily**
- [ ] Log time
- [ ] Update task progress
- [ ] Check notifications

**Friday**
- [ ] Complete timesheet
- [ ] Review weekly accomplishments
- [ ] Submit timesheet

**Manager**
- [ ] Review pending approvals
- [ ] Approve/reject timesheets
- [ ] Check team progress
- [ ] Monitor budget

---

## 🚀 Deployment

### Development
```bash
npm run dev              # Start dev server
npm run test             # Run tests
npm run lint             # Check code
```

### Production
```bash
npm run build            # Create production build
npm run preview          # Preview build locally
docker build -t app .    # Create container
```

---

## 📝 Important Dates

Remember to:
- Submit timesheet by **end of week**
- Create tasks by **Monday**
- Finish tasks by **due date**
- Approve timesheets by **next day**

---

## 🔗 Quick Links

| Link | Purpose |
|------|---------|
| [Setup Guide](./SETUP_PROJECT_MANAGEMENT.md) | Get it running |
| [User Guide](./USER_GUIDE_PROJECT_MANAGEMENT.md) | How to use |
| [API Reference](./API_REFERENCE.md) | API details |
| [Project Guide](./PROJECT_MANAGEMENT_TOOL.md) | Architecture |
| [Main Index](./PROJECT_MGMT_INDEX.md) | Everything |

---

## ✅ Checklist

### First Time Setup
- [ ] Read this card
- [ ] Install dependencies
- [ ] Run migrations
- [ ] Start backend
- [ ] Start frontend
- [ ] Login
- [ ] Read USER_GUIDE

### Monthly
- [ ] Review project progress
- [ ] Check budget status
- [ ] Assess team workload
- [ ] Plan next month

### Quarterly
- [ ] Review system performance
- [ ] Check data quality
- [ ] Plan improvements
- [ ] Update procedures

---

## 🎓 Learning Path

**5 min** - This card  
**15 min** - Setup & login  
**30 min** - User guide basics  
**1 hour** - Full functionality  
**2 hours** - All features  
**4 hours** - Developer level  

---

## 🏆 Best Practices

### Do's ✅
- Do log time daily
- Do update task progress
- Do assign clear owners
- Do set realistic deadlines
- Do document decisions
- Do communicate delays

### Don'ts ❌
- Don't wait until Friday to log time
- Don't over-estimate hours
- Don't assign multiple people per task
- Don't ignore blockers
- Don't skip descriptions
- Don't miss deadlines without notice

---

## 💬 Common Questions

**Q: Can I edit my timesheet after submitting?**  
A: No, but your manager can reject it for revision.

**Q: How do I track time across projects?**  
A: Create timesheet entries per project with task references.

**Q: What if I work overtime?**  
A: Log it normally (system allows up to 24h/day per project).

**Q: Can I delete approved timesheets?**  
A: No, only DRAFT entries can be deleted.

**Q: How do I see my team's progress?**  
A: Use the Dashboard to see all projects and tasks.

---

## 🎯 One-Minute Overview

**Project Management Tool** lets you:
- **Manage tasks** - Create, assign, track progress
- **Log time** - Track hours spent on work
- **Submit timesheets** - Weekly approval workflow
- **Monitor progress** - Dashboard with metrics
- **Approve work** - Manager timesheet approval

**Start:** Read SETUP guide → Setup → Use!

---

## 📞 Support Contacts

- **Technical Issues:** Check logs, review errors
- **Setup Problems:** See SETUP_PROJECT_MANAGEMENT.md
- **Usage Questions:** See USER_GUIDE_PROJECT_MANAGEMENT.md
- **API Questions:** See API_REFERENCE.md
- **Manager Issues:** Contact your manager

---

**Quick Reference v1.0**  
**Last Updated:** December 15, 2024  
**Status:** ✅ Ready to Use

**→ Start with SETUP_PROJECT_MANAGEMENT.md**
