# Execution Guide - Data Connection Fixes
**Date:** December 23, 2025  
**Status:** Ready to Execute

---

## 📋 Complete Execution Checklist

All backend changes are complete. Follow these steps to deploy:

---

## Step 1: Apply Database Migration

### Command
```bash
npx prisma migrate dev
```

### What It Does
- Creates `projectManagerId` column in `Project` table
- Creates foreign key relationship to ProjectManager
- Creates index on projectManagerId for performance
- Updates local Prisma schema

### Expected Output
```
✅ Your database has been successfully migrated to migration_XXXXX_add_projectManagerId_to_project.
```

### Troubleshooting
If you see errors:
- Check DATABASE_URL is set correctly
- Ensure PostgreSQL is running
- Run: `npx prisma db push` if migration doesn't apply

### Time: 1-2 minutes

---

## Step 2: Verify Data Connections

### Command
```bash
node scripts/verify-data-connections.js
```

### What It Does
- Verifies projectManagerId field exists
- Checks S-Curve fields on Task model
- Tests all relationships load correctly
- Checks for orphaned records
- Counts data statistics

### Expected Output
```
✅ SUCCESS projectManagerId field is accessible
✅ SUCCESS All S-Curve fields are accessible on Task
✅ SUCCESS Project relations load correctly
✅ SUCCESS No orphaned tasks found
✅ SUCCESS All project relationships are properly configured

Data Statistics:
  • Total Projects: X
  • Total Tasks: Y
  • Total Project Managers: Z
  • Projects with assigned Manager: W

✅ All data connections verified successfully!
```

### If Verification Fails
- Check migration applied (Step 1)
- Restart dev server if running
- Check DATABASE_URL is correct
- Review error messages carefully

### Time: 1-2 minutes

---

## Step 3: Start Development Server

### Command
```bash
npm run dev
```

OR (for full stack)

```bash
npm run dev:all
```

### What It Does
- Starts Vite development server (port 3000)
- Loads all updated code with S-Curve fields
- Ready for frontend updates

### Expected Output
```
VITE v5.0.0  ready in 234 ms

➜  Local:   http://localhost:5000/
```

### Keep This Running
Leave this terminal open while doing frontend updates.

### Time: 1 minute

---

## Step 4: Update Frontend Components

### Files to Update
See **FRONTEND_UPDATE_GUIDE.md** for detailed instructions

### Key Changes
```typescript
// Change 1: ProjectManager access
OLD: project.projectManager.name
NEW: project.projectManager?.user?.name

// Change 2: Task relations
OLD: task.assignedTo, task.reportedBy
NEW: task.assignee, task.reporter

// Change 3: New S-Curve fields (now available)
task.plannedStartDate
task.plannedEndDate
task.plannedProgressWeight
task.actualProgress
```

### Find & Replace Pattern
In VS Code: Press `Ctrl+H` (Find and Replace)

| Find | Replace |
|------|---------|
| `projectManager?.name` | `projectManager?.user?.name` |
| `projectManager?.email` | `projectManager?.user?.email` |
| `.assignedTo` | `.assignee` |
| `.reportedBy` | `.reporter` |

### Files Likely Needing Updates
- `src/components/projects/*`
- `src/components/tasks/*`
- `src/pages/Projects.tsx`
- `src/pages/MyProjects.tsx`
- `src/pages/dashboard/ProjectTableView.tsx`

### Time: 30-45 minutes

---

## Step 5: Run Tests

### Command
```bash
npm run test
```

### What It Does
- Runs all unit tests with Vitest
- Validates TypeScript compilation
- Checks for component errors

### Expected Output
```
✅ All tests pass (or shows which ones fail)
```

### Fix Any Failures
- Review error messages
- Update components per FRONTEND_UPDATE_GUIDE.md
- Re-run tests

### Optional: E2E Tests
```bash
npm run test:e2e
```

### Time: 5-10 minutes

---

## Step 6: Manual Testing

### Test in Browser
1. Go to `http://localhost:3000`
2. Login with your account
3. Navigate to Projects
4. Verify project manager displays correctly
5. Check tasks show all fields
6. Create a new task
7. Verify S-Curve fields in task form

### Test API Responses
```bash
# Get projects list
curl http://localhost:5000/api/projects

# Get single project
curl http://localhost:5000/api/projects/[id]

# Create task
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","projectId":"[id]"}'
```

### Expected Responses
- projectManagerId field present
- projectManager.user.name (not projectManager.name)
- tasks include S-Curve fields
- No errors in browser console

### Time: 10-15 minutes

---

## 🚀 Quick Start Commands

### For Impatient Users
```bash
# 1. Apply migration
npx prisma migrate dev

# 2. Verify setup (wait for "successfully" message)
node scripts/verify-data-connections.js

# 3. Start server
npm run dev

# 4. In another terminal - run tests
npm run test

# 5. Manual testing in browser
# http://localhost:3000
```

**Total Time:** 30-45 minutes

---

## ⚠️ Common Issues & Fixes

### Issue 1: "Migration not found"
**Solution:** Migration file should exist at:
```
prisma/migrations/20251223000001_add_projectManagerId_to_project/migration.sql
```
If missing, create it with:
```bash
npx prisma migrate resolve --rolled-back 20251223000001_add_projectManagerId_to_project
```

---

### Issue 2: "projectManagerId field not found"
**Solution:** 
1. Ensure migration applied: `npx prisma migrate status`
2. Run: `npx prisma generate`
3. Restart dev server

---

### Issue 3: "Cannot read property 'user' of undefined"
**Solution:** In component code, use optional chaining:
```typescript
// ❌ WRONG
project.projectManager.user.name

// ✅ CORRECT
project.projectManager?.user?.name
```

---

### Issue 4: "assignedTo is not a function"
**Solution:** Task relation was renamed to `assignee`:
```typescript
// ❌ WRONG
task.assignedTo?.name

// ✅ CORRECT
task.assignee?.name
```

---

### Issue 5: Tests failing with "property does not exist"
**Solution:** Update TypeScript types in affected files. See FRONTEND_UPDATE_GUIDE.md

---

## 📊 Progress Tracking

### Completed (Do Not Repeat)
- [x] Backend code changes
- [x] Database migration file
- [x] API endpoint updates
- [x] Verification scripts
- [x] Documentation

### Ready to Execute (Follow These Steps)
- [ ] Step 1: npx prisma migrate dev
- [ ] Step 2: node scripts/verify-data-connections.js
- [ ] Step 3: npm run dev
- [ ] Step 4: Update frontend components
- [ ] Step 5: npm run test
- [ ] Step 6: Manual testing

### Post-Deployment
- [ ] All tests passing
- [ ] No console errors
- [ ] All features working
- [ ] Deploy to staging
- [ ] Final approval
- [ ] Deploy to production

---

## 🎯 Success Criteria

You'll know it's working when:

✅ Migration completes without errors  
✅ Verification script shows all green  
✅ Dev server starts  
✅ No TypeScript errors after component updates  
✅ Tests pass  
✅ Manual testing shows correct data  
✅ Browser console has no errors  
✅ Projects display with manager details  
✅ Tasks show all S-Curve fields  

---

## 📞 Support

### If Something Goes Wrong

1. **Check the error message**
   - Read it carefully, usually describes the problem

2. **Run verification again**
   ```bash
   node scripts/verify-data-connections.js
   ```

3. **Check database migration**
   ```bash
   npx prisma migrate status
   ```

4. **Review the guides**
   - FRONTEND_UPDATE_GUIDE.md
   - IMPLEMENTATION_SUMMARY.md
   - DATA_CONNECTION_FIX_CHECKLIST.md

5. **Check server logs**
   - Terminal running `npm run dev`
   - Look for error messages

6. **Browser console**
   - Press F12
   - Check Console tab for errors

---

## ⏱️ Time Estimate

| Step | Duration |
|------|----------|
| Migration | 1-2 min |
| Verification | 1-2 min |
| Start server | 1 min |
| Frontend updates | 30-45 min |
| Tests | 5-10 min |
| Manual testing | 10-15 min |
| **TOTAL** | **1-1.5 hours** |

---

## 📝 Notes

- Keep one terminal running `npm run dev`
- Open second terminal for commands
- Don't skip verification step
- Frontend updates are the longest part
- Test frequently while updating components

---

## Next Steps After Completion

Once all steps are complete:

1. Review all changes
2. Commit to git
3. Create pull request
4. Code review
5. Deploy to staging
6. QA testing
7. Deploy to production

---

**Ready?** Start with Step 1: `npx prisma migrate dev`

For detailed information, see:
- **QUICK_START_FIXES.md** - 5-minute overview
- **FRONTEND_UPDATE_GUIDE.md** - Component updates
- **API_RESPONSE_EXAMPLES.md** - API testing
