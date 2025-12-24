# Project Manager Feature - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Migrate Database (2 min)
```bash
cd c:/Users/Jakgrits/project-mgnt
npx prisma migrate dev --name add_project_manager_models
```

Expected output:
```
✔ Your database has been successfully migrated to revision xyz
✔ Generated Prisma Client
```

### Step 2: Access the Feature (1 min)

**URLs:**
- Frontend Page: `http://localhost:3000/project-manager-users` (Admin only)
- Menu: Click Projects → Project Manager → Manager Users
- Sidebar: Click "Project Manager" → "Manager Users"

### Step 3: Test with Mock Data (1 min)

The page comes with pre-loaded mock data showing 4 project managers:
- John Doe (5 projects, Active)
- Jane Smith (8 projects, Active)
- Mike Johnson (3 projects, Inactive)
- Sarah Williams (6 projects, Active)

**Try:**
- Search for a name
- Filter by status
- Add a new manager
- Edit a manager's role
- Toggle manager status
- Delete a manager

### Step 4: Connect to Real API (1 min - when ready)

**File:** `src/pages/ProjectManagerUsers.tsx`

Replace the `mockManagers` with API call. See "API Integration" section below.

## 📋 Quick Reference

### Database Tables
- `ProjectManager` - Manager profiles
- `ProjectManagerAssignment` - Manager-to-project assignments
- `User` - Extended with ProjectManager relation
- `Project` - Extended with assignment relations

### Key Files
```
src/
├── pages/ProjectManagerUsers.tsx          ← Main component (with mock data)
├── config/menu-config.ts                 ← Menu items
├── components/layout/Sidebar.tsx         ← Sidebar navigation
└── router/index.tsx                      ← Routes

prisma/
└── schema.prisma                         ← Database schema (UPDATED)
```

### Routes
- `/project-manager` - Public project manager page
- `/project-manager-users` - Admin-only manager management

## 🔌 API Integration (When Ready)

### Option A: Using Service Layer (Recommended)

Create `src/services/projectManagerService.ts`:
```typescript
export const projectManagerService = {
  async getManagers() {
    const response = await fetch('/api/project-managers');
    return response.json();
  },
  // ... other methods
};
```

Then use in component:
```typescript
const data = await projectManagerService.getManagers();
```

### Option B: Direct Fetch Calls

Update `fetchManagers()` in ProjectManagerUsers.tsx:
```typescript
const fetchManagers = async () => {
  try {
    setLoading(true);
    const response = await fetch('/api/project-managers');
    const data = await response.json();
    setManagers(data.data);
  } catch (error) {
    message.error('Failed to load managers');
  } finally {
    setLoading(false);
  }
};
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] Page loads without errors
- [ ] Mock data displays in table
- [ ] Search works
- [ ] Status filter works
- [ ] Can open add manager modal
- [ ] Can open edit modal
- [ ] Can delete manager
- [ ] Statistics update correctly
- [ ] Responsive on mobile

### Quick Test Commands
```bash
# Run TypeScript check
npm run typecheck

# Build project
npm run build

# Start dev server
npm run dev
```

## 🛠️ Common Tasks

### View Database
```bash
npx prisma studio
```
Opens web interface at `http://localhost:5555` to view and edit data.

### Reset Database
```bash
# Delete all data and run migrations
npx prisma migrate reset --force
```

### Generate Types
```bash
npx prisma generate
```

### Check Schema Validity
```bash
npx prisma validate
```

## ⚙️ Configuration

### Customize Manager Roles
In `schema.prisma` or in the form options:
```typescript
<Option value="Project Manager">Project Manager</Option>
<Option value="Senior Project Manager">Senior Project Manager</Option>
<Option value="Lead Project Manager">Lead Project Manager</Option>
```

### Adjust Table Columns
Edit the `columns` array in `ProjectManagerUsers.tsx` to add/remove columns.

### Change Stats Cards
Modify the grid layout and stats in the component.

## 📊 Database Schema

### Quick Lookups
```prisma
// Get all active managers
const managers = await prisma.projectManager.findMany({
  where: { status: 'active' }
});

// Get manager's projects
const projects = await prisma.projectManagerAssignment.findMany({
  where: { projectManagerId: managerId }
});

// Check availability
const manager = await prisma.projectManager.findUnique({
  where: { id: managerId },
  include: { projectAssignments: true }
});
```

## 🚨 Troubleshooting

### "Module not found" error
```bash
npm install
npx prisma generate
```

### Database migration failed
```bash
# Check migration status
npx prisma migrate status

# Resolve issues
npx prisma migrate resolve --rolled-back add_project_manager_models
```

### Page not found
- Verify route in `src/router/index.tsx`
- Check URL: should be `/project-manager-users`
- Ensure you're logged in as admin

### Mock data not showing
- Check browser console for errors
- Clear browser cache
- Restart dev server

## 📚 Full Documentation

For detailed information, see:
- **IMPLEMENTATION_STEPS.md** - Complete roadmap
- **DATABASE_SCHEMA_REFERENCE.md** - Database details
- **PRISMA_MIGRATION_GUIDE.md** - Migration guide
- **PROJECT_MANAGER_SUMMARY.md** - Full feature overview

## ✅ Checklist Before Going to Production

- [ ] Database migrated successfully
- [ ] API endpoints created and tested
- [ ] Frontend connected to real API
- [ ] Error handling implemented
- [ ] Loading states working
- [ ] Tests passing
- [ ] Environment variables set
- [ ] Database backups configured
- [ ] Monitoring set up
- [ ] Documentation updated

## 🎯 Next Steps

1. **Now:** Run the migration and test the mock data
2. **Soon:** Create backend API endpoints
3. **Later:** Connect frontend to API
4. **Finally:** Deploy to production

## 💡 Pro Tips

1. **Use Prisma Studio** to visualize relationships:
   ```bash
   npx prisma studio
   ```

2. **Check schema before migrating:**
   ```bash
   npx prisma validate
   ```

3. **Keep migration names descriptive:**
   ```bash
   npx prisma migrate dev --name add_project_manager_models
   ```

4. **Test locally before production:**
   - Always run migrations on dev database first
   - Test all CRUD operations
   - Verify role-based access

## 🆘 Need Help?

1. Check the documentation files
2. Review error messages in browser console
3. Check database logs: `npx prisma studio`
4. Review the component code with comments

## 📞 Support

All questions answered in:
- `IMPLEMENTATION_STEPS.md` - "Troubleshooting" section
- `DATABASE_SCHEMA_REFERENCE.md` - Query examples
- Component code comments

---

**Ready to go!** 🚀

Start with: `npx prisma migrate dev --name add_project_manager_models`

Then visit: `http://localhost:3000/project-manager-users`
