# Menu Enhancement - Testing Guide

## Pre-Test Checklist

- [x] Code committed to repository
- [x] Backend routes created
- [x] Frontend components created
- [ ] Database has test data
- [ ] Development server running
- [ ] You are logged in

---

## Step 1: Prepare Test Data

### Option A: Using Prisma Studio (Recommended)

```bash
# Open Prisma Studio
npx prisma studio

# This opens a web UI at http://localhost:5555
```

**In Prisma Studio:**

1. **Go to Projects table**
   - Click "Add record"
   - Fill in:
     ```
     name: "Test Project 1"
     code: "TST-001"
     description: "Test description"
     budget: 50000
     startDate: (today)
     endDate: (today + 30 days)
     status: "IN_PROGRESS"      ← IMPORTANT
     priority: "high"
     progress: 65
     clientId: (leave empty or select if exists)
     ```
   - Click Save

2. **Create more projects** (at least 3-5):
   - Same process, vary the status:
     - Some: IN_PROGRESS
     - Some: PLANNING
     - Some: COMPLETED

3. **Go to Tasks table**
   - Click "Add record"
   - Fill in:
     ```
     title: "Setup Authentication"
     description: "Implement user auth system"
     status: "IN_PROGRESS"       ← IMPORTANT
     priority: "high"
     dueDate: (today + 5 days)
     estimatedHours: 16
     projectId: (select Test Project 1)
     assigneeId: (select YOUR user)  ← IMPORTANT
     reporterId: (select YOUR user)
     ```
   - Click Save

4. **Create more tasks** (at least 3-5):
   - Vary statuses: TODO, IN_PROGRESS, IN_REVIEW
   - Assign all to yourself
   - Mix due dates (some past, some future)

### Option B: Using SQL (If you prefer)

```bash
# Connect to database
psql $DATABASE_URL

-- Add projects
INSERT INTO projects (name, code, status, progress, priority, start_date, created_at, updated_at) 
VALUES 
  ('Test Project 1', 'TST-001', 'IN_PROGRESS', 65, 'high', NOW(), NOW(), NOW()),
  ('Test Project 2', 'TST-002', 'PLANNING', 30, 'medium', NOW(), NOW(), NOW()),
  ('Test Project 3', 'TST-003', 'IN_PROGRESS', 45, 'urgent', NOW(), NOW(), NOW());

-- Add tasks (replace $USER_ID with your actual user ID)
INSERT INTO tasks (title, status, priority, project_id, assignee_id, reporter_id, due_date, created_at, updated_at)
VALUES 
  ('Setup Authentication', 'IN_PROGRESS', 'high', (SELECT id FROM projects WHERE code = 'TST-001'), '$USER_ID', '$USER_ID', NOW() + INTERVAL '5 days', NOW(), NOW()),
  ('Create Dashboard', 'TODO', 'high', (SELECT id FROM projects WHERE code = 'TST-001'), '$USER_ID', '$USER_ID', NOW() + INTERVAL '3 days', NOW(), NOW()),
  ('Write Documentation', 'IN_PROGRESS', 'medium', (SELECT id FROM projects WHERE code = 'TST-002'), '$USER_ID', '$USER_ID', NOW() + INTERVAL '10 days', NOW(), NOW());
```

---

## Step 2: Start Development Server

```bash
# Terminal 1: Start frontend
npm run dev

# Terminal 2: Start backend (if not already running)
npm run server
# OR if you use concurrently:
npm run dev:all
```

**Verify both are running:**
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

---

## Step 3: Test the Enhanced Menu

### Manual Testing

1. **Login to your account** (if not already)

2. **Navigate to the enhanced menu**:
   ```
   http://localhost:3000/menu-enhanced
   ```

3. **Verify you see** (in this order):

   ✓ **Header**:
   ```
   "Dashboard Menu"
   "Quick access to all features and sections"
   ```

   ✓ **Stats Cards** (4 cards):
   ```
   Active Projects: [number] of [total]
   Assigned Tasks: [number] (+[overdue] OD)
   Pending Actions: [number] (Timesheets & Costs)
   Team Members: [number] (Active users)
   ```

   ✓ **Active Projects** (if you created them):
   ```
   [Project Name] [PROJECT CODE]
   Progress bar at [%]
   [Priority badge]
   ```

   ✓ **Assigned Tasks** (if you assigned tasks to yourself):
   ```
   [Task Title]
   [Project Name]
   [Due date]
   [Priority badge]
   ```

   ✓ **Search Bar & Controls**:
   ```
   Search input field
   Category filter buttons
   Grid/List view toggles
   ```

   ✓ **Menu Items**:
   ```
   Grid or list of all menu options
   Star icons to add favorites
   Categories and descriptions
   ```

---

## Step 4: Test API Calls

### Method 1: Using Browser DevTools

1. **Open DevTools** (F12)
2. **Go to Network tab**
3. **Refresh the page** (Ctrl+Shift+R)
4. **Look for API calls** starting with `/api/menu/`

**You should see requests like**:
```
GET /api/menu/stats              200 OK   ~150ms
GET /api/menu/projects           200 OK   ~150ms
GET /api/menu/tasks              200 OK   ~150ms
```

**Inspect each response** (click on request):
- Status: 200
- Response: Valid JSON with data
- Time: <300ms

### Method 2: Using cURL (Backend Testing)

```bash
# First, get your authentication token
# Option 1: From browser Network tab
#   - Login request
#   - Look for response with "token" or "jwt"
#   - Copy the token

TOKEN="your_token_here"

# Test stats endpoint
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/menu/stats

# Should return JSON like:
# {
#   "totalProjects": 3,
#   "activeProjects": 2,
#   "totalTasks": 5,
#   "assignedTasksCount": 3,
#   "overdueTasks": 0,
#   ...
# }

# Test projects endpoint
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/menu/projects

# Test tasks endpoint
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/menu/tasks
```

### Method 3: Using Postman

1. **Import API collection** (if you have one)
2. **Add Authorization header**:
   ```
   Authorization: Bearer <your_token>
   ```
3. **Create test requests**:
   - GET http://localhost:5000/api/menu/stats
   - GET http://localhost:5000/api/menu/projects
   - GET http://localhost:5000/api/menu/tasks
4. **Send and verify** all return 200 with data

---

## Step 5: Test Interactive Features

### Test Search
1. Type "project" in search box
2. Should filter menu items
3. Only items with "project" in title/description shown

### Test Category Filter
1. Click "Projects" category button
2. Should show only project-related menu items
3. Click "All" to show everything again

### Test View Toggle
1. Click grid icon (should show grid view)
2. Click list icon (should show list view)
3. Both should display same items, different layouts

### Test Favorites
1. Click star icon on any menu item
2. Star should turn yellow/filled
3. Refresh page
4. Star should still be filled (saved in localStorage)
5. Click again to unstar

### Test Quick Access Links
1. Click on any project card
2. Should navigate to `/projects/[id]`
3. Back button should work

1. Click on any task item
2. Should navigate to `/projects/[projectId]`
3. Back button should work

---

## Step 6: Test Data Refresh

1. **Initial load** (record load times):
   - Open DevTools Performance tab
   - Reload page
   - Record: Initial load time

2. **Subsequent loads** (should be cached):
   - Data should load instantly (from React Query cache)
   - API calls might be skipped (due to 5min cache)

3. **Force refresh** (clear cache):
   - Open DevTools Application tab
   - Find React Query cache key starting with `['menuStats']`
   - Delete cache entry
   - Reload page
   - Should see API calls again

4. **Wait 5+ minutes**:
   - Data should automatically refresh
   - Check Network tab for new API calls

---

## Step 7: Test Error Scenarios

### Test 1: Logout & Try to Access
1. Logout (if possible)
2. Try to visit `/menu-enhanced`
3. Should redirect to login
4. Stats should be empty/error message

### Test 2: Kill Backend Server
1. Stop `npm run server` process
2. Refresh the page
3. Should show "Failed to fetch" gracefully
4. Should still show static menu items
5. Should NOT crash the app

### Test 3: Clear Authentication Token
1. Open DevTools > Application > LocalStorage
2. Delete auth tokens/JWT
3. Refresh page
4. Should get 401 error
5. Should redirect to login

---

## Step 8: Performance Testing

### Measure Load Times

```javascript
// In browser console
performance.mark('menu-start');
// ... navigate to /menu-enhanced
performance.mark('menu-end');
performance.measure('menu-load', 'menu-start', 'menu-end');
console.log(performance.getEntriesByName('menu-load')[0]);
```

**Expected results**:
- Initial load: 500-1000ms
- Subsequent loads: <100ms (cached)
- Each API call: <200ms
- Total: <1 second

### Test with Slow Network

In DevTools:
1. Network tab > Throttling dropdown
2. Select "Slow 4G" or custom
3. Reload page
4. Verify it still works (might be slow)
5. Check loading states (spinners if implemented)

---

## Step 9: Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (if on Mac)
- [ ] Edge (if on Windows)
- [ ] Mobile Browser (iOS Safari or Chrome Mobile)

**Checklist for each**:
- [ ] Page loads
- [ ] Stats display
- [ ] Projects grid visible
- [ ] Tasks list visible
- [ ] Search works
- [ ] Favorites work
- [ ] Responsive layout

---

## Step 10: Document Results

### Create Test Report

```markdown
# Menu Enhancement Test Report

## Date: [TODAY]
## Tester: [YOUR NAME]
## Environment: Development

### Test Results

#### Stats Display
- [ ] Pass: All 4 cards showing
- [ ] Pass: Numbers match database count
- [ ] Pass: Auto-refresh works

#### Projects Grid
- [ ] Pass: Shows 3+ projects
- [ ] Pass: Progress bars render
- [ ] Pass: Click navigation works

#### Tasks List
- [ ] Pass: Shows 3+ tasks
- [ ] Pass: Due dates display
- [ ] Pass: Click navigation works

#### Features
- [ ] Pass: Search works
- [ ] Pass: Filter works
- [ ] Pass: Favorites persist
- [ ] Pass: View toggle works

#### Performance
- [ ] Pass: Initial load <1s
- [ ] Pass: API calls <200ms each
- [ ] Pass: No console errors

#### Error Handling
- [ ] Pass: Graceful fallback if backend down
- [ ] Pass: Auth error handled
- [ ] Pass: No app crashes

#### Browsers Tested
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile

### Issues Found
(List any problems)

### Sign-off
Ready for staging: [ ] Yes [ ] No
```

---

## Troubleshooting During Testing

### Issue: "Stats show all zeros"

**Solution**:
1. Check Prisma Studio - do you have projects?
2. Make sure projects have `status = 'IN_PROGRESS'`
3. Check tasks have `assigneeId` matching your user

### Issue: "Projects grid is empty"

**Solution**:
1. Create at least one project
2. Ensure it has `status = 'IN_PROGRESS' or 'PLANNING'`
3. Check Network tab - did `/api/menu/projects` return data?

### Issue: "Tasks list is empty"

**Solution**:
1. Create at least one task
2. Assign it to your user (set `assigneeId` to your user ID)
3. Make sure `status` is not 'DONE'

### Issue: "API calls return 401 error"

**Solution**:
1. You're not authenticated
2. Login first
3. Check `Authorization` header in Network tab

### Issue: "API calls timeout / very slow"

**Solution**:
1. Check database connection
2. Run: `npx prisma db execute --stdin < test.sql`
3. Check server logs for errors
4. Reduce data size (delete old records)

### Issue: "Page content looks broken"

**Solution**:
1. Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
2. Clear cache: DevTools > Application > Clear all
3. Check browser console for JS errors (F12)

---

## What to Do After Testing

### If All Tests Pass ✅

1. **Create test report** (document results)
2. **Commit to git** (if changes made)
3. **Deploy to staging** (for team testing)
4. **Schedule user acceptance test** (with real users)
5. **Deploy to production** (after sign-off)

### If Issues Found ❌

1. **Document the bug**
   - What did you do?
   - What did you expect?
   - What actually happened?
   - Screenshots?

2. **Check logs**
   - Browser console (F12)
   - Server logs (`npm run dev`)

3. **Identify root cause**
   - Frontend issue?
   - Backend issue?
   - Database issue?

4. **Fix and retest**

---

## Quick Reference: Expected Behavior

| Element | Should... |
|---------|-----------|
| Stats Cards | Update automatically every 5 min |
| Projects Grid | Show top 5, clickable, with progress |
| Tasks List | Show top 5, due date sorted |
| Search | Filter in real-time |
| Favorites | Persist after refresh |
| View Mode | Save preference |
| API Calls | Return in <200ms |
| Errors | Fail gracefully |
| Mobile | Be responsive |

---

## Success Criteria

You're done when:

✅ All stats cards show correct numbers  
✅ Projects and tasks from database display  
✅ No console errors or warnings  
✅ All API calls return 200 status  
✅ Performance is good (load <1s)  
✅ All interactive features work  
✅ Responsive on mobile  
✅ Works across browsers  
✅ Error scenarios handled gracefully  
✅ Test report completed  

**Time to completion: 1-2 hours**

Happy testing! 🚀
