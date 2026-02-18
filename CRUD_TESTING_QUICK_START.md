# CRUD Testing - Quick Start Guide

## 🚀 Setup

### 1. Start the Application
```bash
npm run dev:all
```

This starts:
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:3001

### 2. Login Credentials

Use these test accounts:

```
Admin Account:
  Email: admin@company.com
  Password: Admin@123

Manager Account:
  Email: manager@company.com
  Password: Manager@123

Employee Account:
  Email: employee@company.com
  Password: Employee@123
```

### 3. Open Browser DevTools
- **Windows/Linux:** `F12` or `Ctrl+Shift+I`
- **Mac:** `Cmd+Option+I`
- Open **Console** tab to watch for errors

---

## 📋 Testing Checklist by Priority

### Phase 1: Core Features (Must Test)

#### 1. Clients Page (`/clients`)
```
✅ CREATE: Add new client with all fields
✅ READ: View client list with search
✅ UPDATE: Edit client details
✅ DELETE: Remove client with confirmation
```

**Time:** 5-10 minutes

#### 2. Projects Page (`/projects`)
```
✅ CREATE: Add new project
✅ READ: View project list with filters
✅ UPDATE: Edit project details
✅ DELETE: Remove project
```

**Time:** 5-10 minutes

#### 3. Timesheet (`/timesheet`)
```
✅ CREATE: Add time entry
✅ READ: View entries in monthly view
✅ UPDATE: Edit existing entry
✅ DELETE: Remove entry
```

**Time:** 10-15 minutes

---

### Phase 2: Secondary Features (Should Test)

#### 4. Users Page (`/users`)
```
✅ CREATE: Add new user
✅ READ: View user list
✅ UPDATE: Edit user details
✅ DELETE: Remove user
```

**Time:** 5-10 minutes

#### 5. Expenses (`/expenses`)
```
✅ CREATE: Add expense
✅ READ: View expense list
✅ UPDATE: Edit expense
✅ DELETE: Remove expense
```

**Time:** 5-10 minutes

---

### Phase 3: Approval & Integration (Nice to Test)

#### 6. Approvals Page (`/approvals`)
```
✅ READ: View pending approvals
✅ APPROVE: Accept submission
✅ REJECT: Decline submission
```

**Time:** 5-10 minutes

---

## 🧪 Detailed Test Scenarios

### Scenario 1: Create Client
```
1. Navigate to /clients
2. Click "New Client" button
3. Fill in form:
   - Name: "Test Company Ltd."
   - Email: "contact@testcompany.com"
   - Phone: "02-123-4567"
   - Tax ID: "1234567890123"
   - Address: "123 Main St, Bangkok"
4. Click "Create Client"
5. ✅ Verify: Toast shows "✅ Successfully created Client"
6. ✅ Verify: New client appears in list
```

### Scenario 2: Error Handling - Invalid Tax ID
```
1. Navigate to /clients
2. Click "New Client"
3. Fill in form with:
   - Name: "Test"
   - Tax ID: "123" (only 3 digits)
4. Click "Create Client"
5. ✅ Verify: Form shows error "Tax ID must be exactly 13 digits"
6. ✅ Verify: Request not sent to server
```

### Scenario 3: Update Client
```
1. Navigate to /clients
2. Find a client and click edit icon
3. Change Name to "Updated Company Name"
4. Click "Save Changes"
5. ✅ Verify: Toast shows "✅ Successfully updated Client"
6. ✅ Verify: List shows updated name
```

### Scenario 4: Delete Client
```
1. Navigate to /clients
2. Find a client and click delete icon
3. Confirmation dialog appears
4. Click "Delete" button
5. ✅ Verify: Toast shows "✅ Successfully deleted Client"
6. ✅ Verify: Client removed from list
```

### Scenario 5: Create Timesheet Entry
```
1. Navigate to /timesheet
2. Click on a date or "Add Entry" button
3. Fill TimesheetModal:
   - Date: Today
   - Project: Select a project
   - Hours: 8
   - Work Type: Required
4. Click "Create"
5. ✅ Verify: Toast shows "✅ Successfully created Timesheet"
6. ✅ Verify: Entry appears in monthly view
7. ✅ Verify: Daily total updates
```

### Scenario 6: Submit Timesheet
```
1. Navigate to /timesheet
2. Add entries for the week/month
3. Click "Submit Timesheet" button
4. Confirmation dialog appears
5. Click "Submit" to confirm
6. ✅ Verify: Status changes to "Submitted"
7. ✅ Verify: Manager sees entry in /approvals
```

### Scenario 7: Approve Submission (Manager)
```
1. Login as Manager account
2. Navigate to /approvals
3. Find pending timesheet/expense
4. Click "Approve" button
5. Confirmation modal appears
6. Click "Approve" to confirm
7. ✅ Verify: Status changes to "Approved"
8. ✅ Verify: Employee can see approved status
```

---

## 🔍 What to Look For

### ✅ Success Indicators
- Toast notification appears with correct message
- Data appears/updates/removes in list immediately
- No console errors (F12 → Console tab)
- Loading states work (buttons show "Loading...")
- Confirmations prevent accidental deletion
- Correct language displayed (Thai/English)

### ❌ Failure Indicators
- Toast doesn't appear
- Data not reflected in list
- Console shows red errors
- Buttons become unresponsive
- Wrong error message displayed
- Generic error instead of specific message

### 📊 Network Monitoring
1. Open DevTools → **Network** tab
2. Look for API calls when submitting forms
3. Expected status codes:
   - `200` - Success (GET, PUT, DELETE)
   - `201` - Created (POST)
   - `400` - Validation error
   - `500` - Server error

---

## 🐛 Common Issues to Test

### Issue 1: API Not Responding
**Test:** Disconnect internet, try to create item
**Expected:** Network error toast or timeout message

### Issue 2: Validation Not Working
**Test:** Submit form with invalid email
**Expected:** Form shows validation error before submission

### Issue 3: Duplicate Prevention
**Test:** Create two clients with same Tax ID
**Expected:** Second creation fails with "Tax ID already exists"

### Issue 4: Permission Denial
**Test:** Employee tries to delete other's entry
**Expected:** Error message "You do not have permission"

### Issue 5: Concurrent Operations
**Test:** Submit two forms simultaneously
**Expected:** Both process without conflicts

---

## 📝 Test Report Template

```
Test Date: ________________
Tester: ________________
Application Version: ________________
Browser: ________________
Database: ________________

CLIENTS PAGE CRUD:
  ✅ Create: PASS / FAIL
  ✅ Read: PASS / FAIL
  ✅ Update: PASS / FAIL
  ✅ Delete: PASS / FAIL

PROJECTS PAGE CRUD:
  ✅ Create: PASS / FAIL
  ✅ Read: PASS / FAIL
  ✅ Update: PASS / FAIL
  ✅ Delete: PASS / FAIL

TIMESHEET PAGE CRUD:
  ✅ Create: PASS / FAIL
  ✅ Read: PASS / FAIL
  ✅ Update: PASS / FAIL
  ✅ Delete: PASS / FAIL

USERS PAGE CRUD:
  ✅ Create: PASS / FAIL
  ✅ Read: PASS / FAIL
  ✅ Update: PASS / FAIL
  ✅ Delete: PASS / FAIL

EXPENSES PAGE CRUD:
  ✅ Create: PASS / FAIL
  ✅ Read: PASS / FAIL
  ✅ Update: PASS / FAIL
  ✅ Delete: PASS / FAIL

ERROR HANDLING:
  ✅ Validation errors show: PASS / FAIL
  ✅ Server errors show details: PASS / FAIL
  ✅ Toast messages correct language: PASS / FAIL

Issues Found:
1. ________________
2. ________________
3. ________________

Overall Status: PASS / FAIL / PENDING
```

---

## 🎯 Success Criteria

### All Tests Pass If:
- ✅ Create operations work on all pages
- ✅ Read operations show correct data
- ✅ Update operations reflect changes
- ✅ Delete operations remove data
- ✅ Error messages are specific and helpful
- ✅ Toast notifications display correctly
- ✅ No console errors
- ✅ Form validation works client-side
- ✅ Server validation catches errors
- ✅ Permissions enforced correctly

---

## 📞 Troubleshooting

### Frontend Not Loading
```bash
# Clear cache and restart
rm -rf .next node_modules
npm install
npm run dev
```

### API Not Responding
```bash
# Check backend is running
npm run dev:backend
# Should see "Server running on port 3001"
```

### Database Connection Error
```bash
# Check database is running
docker ps
# Restart if needed
docker-compose down
docker-compose up -d
```

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

---

## 🚀 Performance Tips

- Test in incognito/private mode (no cache interference)
- Clear localStorage if changing test accounts: `localStorage.clear()`
- Use browser DevTools throttling to test on slow networks
- Test on mobile by resizing window: `F12` → `Ctrl+Shift+M`

---

**Happy Testing!** 🎉
