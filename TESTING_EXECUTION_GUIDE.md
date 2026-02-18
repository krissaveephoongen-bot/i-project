# CRUD Testing - Complete Execution Guide

**Date:** February 16, 2025  
**Purpose:** Complete guide to executing CRUD tests for the project management system

---

## 🎯 Testing Options

You can test CRUD operations in 3 ways:

### Option 1: Manual Testing (Recommended for UI/UX Verification)
- **Time:** 30-75 minutes
- **Cost:** High effort, comprehensive results
- **Best for:** Full user experience validation

### Option 2: Automated Testing (For Regression & CI/CD)
- **Time:** 5-10 minutes
- **Cost:** Low effort, consistent results
- **Best for:** Repeatable testing, integration tests

### Option 3: Mixed Testing (Best Practice)
- **Manual:** Phase 1 (Core features) - 30 min
- **Automated:** Phase 2-3 (Edge cases) - 10 min
- **Best for:** Balancing thoroughness and speed

---

## 📋 MANUAL TESTING (Recommended Now)

### Prerequisites
```bash
# 1. Start the development environment
npm run dev:all

# 2. Verify servers are running
# Frontend: http://localhost:3000
# Backend: http://localhost:3001

# 3. Open DevTools
# F12 or Ctrl+Shift+I

# 4. Go to Console tab
# Watch for errors
```

### Test Accounts
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

### Phase 1: Core Features (30 minutes) ⭐ START HERE

#### 1.1 Clients CRUD (10 minutes)
```
Steps:
1. Navigate to http://localhost:3000/clients
2. TEST CREATE:
   - Click "New Client"
   - Fill: Name, Email, Phone, Tax ID
   - Submit
   - ✓ Toast shows "✅ Successfully created Client"
   - ✓ Client appears in list
   
3. TEST READ:
   - Verify list displays all clients
   - Test search by name
   - Test search by email
   
4. TEST UPDATE:
   - Click edit on your test client
   - Change name and email
   - Save
   - ✓ Changes appear in list
   
5. TEST DELETE:
   - Click delete on test client
   - Confirm deletion
   - ✓ Client removed from list
   
6. TEST ERRORS:
   - Try creating without name → Error shown
   - Try invalid email → Validation error
   - Try duplicate Tax ID → Error message
```

#### 1.2 Projects CRUD (10 minutes)
```
Steps:
1. Navigate to http://localhost:3000/projects
2. TEST CREATE:
   - Click "New Project"
   - Fill: Name, Client, Budget, Dates
   - Submit
   - ✓ Toast shows success
   - ✓ Project in list
   
3. TEST READ:
   - Verify columns display
   - Test filters by status
   - Test search by name
   
4. TEST UPDATE:
   - Edit project details
   - Change budget and status
   - Save and verify
   
5. TEST DELETE:
   - Delete test project
   - Confirm and verify removal
```

#### 1.3 Timesheet CRUD (10 minutes)
```
Steps:
1. Navigate to http://localhost:3000/timesheet
2. TEST CREATE:
   - Click "Add Entry" 
   - Fill: Date, Project, Hours, Description
   - Submit
   - ✓ Entry appears in calendar
   - ✓ Hours calculated
   
3. TEST READ:
   - View monthly calendar
   - Check weekly view
   - Check activity log
   
4. TEST UPDATE:
   - Click on entry
   - Change hours and description
   - Save and verify
   
5. TEST DELETE:
   - Delete entry
   - Confirm and verify removal
   
6. TEST SUBMIT:
   - Submit timesheet
   - Check status changes
```

---

## 🤖 AUTOMATED TESTING (For After Manual)

### Unit Tests (Fast & Isolated)

```bash
# Run all unit tests
npm run test:unit

# Run specific test file
npm run test:unit -- clients

# Watch mode (auto-rerun)
npm run test:unit -- --watch
```

**Available Unit Tests:**
- ✅ `useTimesheet.test.ts` - Timesheet logic
- ✅ `useTimer.test.ts` - Timer functionality
- ✅ `validation.test.ts` - Form validation
- ✅ `timesheet.utils.test.ts` - Timesheet utilities
- ✅ `leave.utils.test.ts` - Leave utilities
- ✅ `db.test.ts` - Database operations

### Integration Tests (Full Flow)

```bash
# Run integration tests
npm run test:integration

# Specific test
npm run test:integration -- clients

# Coverage report
npm run test:integration -- --coverage
```

**What They Test:**
- API endpoints
- Database operations
- Data relationships
- Error handling
- Permission checks

### E2E Tests (User Workflows)

```bash
# Run E2E tests headless
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:headed

# Run specific test
npm run test:e2e -- clients
```

**What They Test:**
- Complete user workflows
- UI interactions
- Form submissions
- Navigation flows
- Error messages

---

## 🧪 EXECUTING TESTS NOW

### Quick Test (5 minutes)
```bash
# Just run unit tests
npm run test:unit

# Watch output for failures
# Look for: "Tests: X passed, Y failed"
```

### Standard Test (15 minutes)
```bash
# Run unit + integration tests
npm run test:unit
npm run test:integration

# Should see: "All tests passed ✓"
```

### Full Test (30-45 minutes)
```bash
# Run all tests
npm run test:unit
npm run test:integration
npm run test:e2e

# Should see: "✓ All suites passed"
```

---

## 📊 TEST RESULTS INTERPRETATION

### Success Indicators ✅
```
✓ Tests passing: 15/15
✓ No console errors
✓ All assertions passed
✓ Coverage > 80%
```

### Failure Indicators ❌
```
✗ Tests failed: 2/15
✗ Red error messages
✗ Assertion errors
✗ Timeout errors
✗ Network errors
```

---

## 🐛 Finding & Reporting Issues

### If Test Fails
1. **Note the test name**
2. **Read the error message**
3. **Check DevTools Console** (F12)
4. **Reproduce manually** if needed
5. **File bug report** with details

### Using Bug Report Template
```bash
# Open the bug report template
cat BUG_REPORT_TEMPLATE.md

# Fill in:
- What failed
- Steps to reproduce
- Error message
- Expected vs actual
- Screenshot/logs
```

---

## 📈 CRUD Testing Checklist

### Clients (`/clients`)
- [ ] Can create client
- [ ] Can view client list
- [ ] Can search clients
- [ ] Can edit client
- [ ] Can delete client
- [ ] Validation works
- [ ] Toast messages show
- [ ] No console errors

### Projects (`/projects`)
- [ ] Can create project
- [ ] Can view project list
- [ ] Can filter by status
- [ ] Can search projects
- [ ] Can edit project
- [ ] Can delete project
- [ ] Related timesheets unaffected
- [ ] No console errors

### Timesheet (`/timesheet`)
- [ ] Can add entry
- [ ] Can view calendar
- [ ] Can view weekly
- [ ] Can edit entry
- [ ] Can delete entry
- [ ] Hours calculate
- [ ] Status tracking works
- [ ] Can submit timesheet

### Users (`/users`)
- [ ] Can create user
- [ ] Can view user list
- [ ] Can edit user
- [ ] Can delete user
- [ ] Role assignment works
- [ ] Permissions enforced
- [ ] No console errors

### Expenses (`/expenses`)
- [ ] Can create expense
- [ ] Can view list
- [ ] Can filter by category
- [ ] Can edit expense
- [ ] Can delete expense
- [ ] Receipt upload works
- [ ] Currency displays
- [ ] No console errors

### Approvals (`/approvals`)
- [ ] Can view pending items
- [ ] Can approve items
- [ ] Can reject items
- [ ] Reason field required
- [ ] Status updates
- [ ] Employee sees results
- [ ] No console errors

---

## 📝 Test Execution Template

Use this to track your manual testing:

```
TEST DATE: 2025-02-16
TESTER: [Your Name]
TIME STARTED: ___:___
TIME ENDED: ___:___

PHASE 1 RESULTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Clients:
  ✅ CREATE: PASS / FAIL / ERROR: ________
  ✅ READ: PASS / FAIL / ERROR: ________
  ✅ UPDATE: PASS / FAIL / ERROR: ________
  ✅ DELETE: PASS / FAIL / ERROR: ________

Projects:
  ✅ CREATE: PASS / FAIL / ERROR: ________
  ✅ READ: PASS / FAIL / ERROR: ________
  ✅ UPDATE: PASS / FAIL / ERROR: ________
  ✅ DELETE: PASS / FAIL / ERROR: ________

Timesheet:
  ✅ CREATE: PASS / FAIL / ERROR: ________
  ✅ READ: PASS / FAIL / ERROR: ________
  ✅ UPDATE: PASS / FAIL / ERROR: ________
  ✅ DELETE: PASS / FAIL / ERROR: ________

PHASE 1 SUMMARY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Tests: 12
Passed: ___
Failed: ___
Errors: ___

CRITICAL ISSUES FOUND:
1. ________________
2. ________________

NOTES:
_________________________________________________________________
_________________________________________________________________
```

---

## ✅ Success Criteria

### Phase 1 Passes If:
- ✅ All Clients CRUD tests pass
- ✅ All Projects CRUD tests pass
- ✅ All Timesheet CRUD tests pass
- ✅ Error messages are clear
- ✅ Toast notifications work
- ✅ No critical console errors
- ✅ Data persists after refresh

### Overall Success If:
- ✅ All 3 phases pass
- ✅ No critical bugs found
- ✅ Error handling works
- ✅ Both Thai and English display
- ✅ Permissions enforced
- ✅ Ready for deployment

---

## 🚀 Next Steps After Testing

### If All Tests Pass ✅
1. ✅ Document in test results
2. ✅ Sign off on testing
3. ✅ Proceed to deployment
4. ✅ Mark as "Ready for Production"

### If Some Tests Fail ❌
1. ❌ File bug reports
2. ❌ Assign to developer
3. ❌ Document workarounds
4. ❌ Retest after fixes
5. ❌ Continue until all pass

### If Cannot Test 🚫
1. Check: Servers running?
2. Check: Database connected?
3. Check: Port conflicts?
4. Check: Firewall blocking?
5. Troubleshoot or escalate

---

## 📞 Troubleshooting

### Can't Connect to Frontend
```bash
# Check if running
curl http://localhost:3000

# If not, start it
npm run dev

# If port in use
# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Can't Connect to Backend
```bash
# Check if running
curl http://localhost:3001

# If not, start it
npm run dev:backend

# If port in use
# Kill process on port 3001
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Database Connection Error
```bash
# Check if Docker running
docker ps

# If not, start Docker containers
docker-compose up -d

# Check logs
docker-compose logs postgres
```

### Tests Won't Run
```bash
# Clear cache
rm -rf .next node_modules
npm install

# Try again
npm run test:unit
```

---

## 📚 Related Documentation

- **Quick Start:** `CRUD_TESTING_QUICK_START.md`
- **Detailed Checklist:** `CRUD_TESTING_CHECKLIST.md`
- **Test Results:** `CRUD_TEST_RESULTS.md`
- **Bug Reports:** `BUG_REPORT_TEMPLATE.md`
- **Full Index:** `CRUD_TESTING_INDEX.md`

---

## 🎯 RECOMMENDED TEST PLAN

### For Today (2 hours)
1. **Manual Phase 1** (30 min) - Clients, Projects, Timesheet
2. **Review Results** (10 min) - Document findings
3. **File Bug Reports** (20 min) - If issues found
4. **Unit Tests** (10 min) - Run automated suite

### If Time Permits (Additional 1 hour)
5. **Manual Phase 2** (20 min) - Users, Expenses
6. **Integration Tests** (10 min) - Full flow tests
7. **E2E Tests** (20 min) - Complete workflows
8. **Final Review** (10 min) - Summarize results

---

## 📋 FINAL CHECKLIST

Before declaring testing complete:

- [ ] Phase 1 manual tests executed
- [ ] Results documented in CRUD_TEST_RESULTS.md
- [ ] All bugs filed with BUG_REPORT_TEMPLATE.md
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] No critical failures
- [ ] Sign-off obtained
- [ ] Documentation updated

---

**Ready to Test:** ✅ YES

**Quick Start Command:**
```bash
npm run dev:all
# Then visit http://localhost:3000 and follow testing guide
```

**Estimated Duration:** 30-75 minutes

**Expected Outcome:** Comprehensive CRUD validation report

---

*Created: 2025-02-16*  
*Status: Ready to Execute*  
*Next: Start Phase 1 Manual Testing*
