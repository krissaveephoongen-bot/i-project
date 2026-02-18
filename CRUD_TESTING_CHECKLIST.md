# CRUD Operations Testing Checklist

**Date:** February 16, 2025  
**Objective:** Verify that all Create, Read, Update, Delete operations work correctly across all pages

---

## 📋 Testing Scope

This checklist covers all features with CRUD operations:
- ✅ Timesheets
- ✅ Projects
- ✅ Clients
- ✅ Users/Staff
- ✅ Expenses
- ✅ Leave/Approvals
- ✅ Tasks

---

## 🧪 Test Format

For each feature, test:
1. **CREATE** - Add new item
2. **READ** - View item in list and detail
3. **UPDATE** - Edit item
4. **DELETE** - Remove item with confirmation

**Mark:** ✅ (Pass), ❌ (Fail), ⏳ (Pending)

---

## 1️⃣ CLIENTS MANAGEMENT

**Page:** `/clients`  
**Components:** ClientFormModal, DeleteConfirmationDialog

### CREATE - Add New Client
- [ ] Click "New Client" button
- [ ] Fill form:
  - [ ] Client Name (required)
  - [ ] Email (optional, validate format)
  - [ ] Phone (optional, validate format: 02-xxx-xxxx)
  - [ ] Tax ID (optional, 13 digits Thai)
  - [ ] Address (optional)
  - [ ] Notes (optional)
- [ ] Submit form
- [ ] Check success toast message: "✅ Successfully created Client"
- [ ] New client appears in list
- [ ] List is sorted alphabetically

**Status:** ____

### READ - View Clients
- [ ] Clients list displays with all columns:
  - [ ] Client name
  - [ ] Email
  - [ ] Phone
  - [ ] Tax ID
  - [ ] Actions menu
- [ ] Search functionality works (name/email)
- [ ] Pagination works (if > 10 clients)
- [ ] CSV export includes all client data

**Status:** ____

### UPDATE - Edit Client
- [ ] Click edit icon on a client row
- [ ] Modal opens with current data
- [ ] Modify at least one field
- [ ] Submit changes
- [ ] Check success toast: "✅ Successfully updated Client"
- [ ] Changes reflected in list
- [ ] Can edit Tax ID without duplicates error

**Status:** ____

### DELETE - Remove Client
- [ ] Click delete icon on a client
- [ ] Confirmation dialog appears
- [ ] Click "Delete" to confirm
- [ ] Check success toast: "✅ Successfully deleted Client"
- [ ] Client removed from list

**Status:** ____

### Error Handling
- [ ] Try creating client without name → Shows error message
- [ ] Try invalid email format → Shows validation error
- [ ] Try invalid phone format → Shows validation error
- [ ] Try duplicate Tax ID → Shows error message
- [ ] Try invalid Tax ID (not 13 digits) → Shows error message

**Status:** ____

---

## 2️⃣ PROJECTS MANAGEMENT

**Page:** `/projects`  
**Pages:** `/projects/new`, `/projects/[id]/edit`  
**Components:** ProjectForm, ProjectCreationWizard

### CREATE - Add New Project
- [ ] Click "New Project" button
- [ ] Form/Wizard loads with fields:
  - [ ] Project name (required)
  - [ ] Client selection (required)
  - [ ] Description
  - [ ] Start date
  - [ ] End date
  - [ ] Budget
  - [ ] Status
- [ ] Submit form
- [ ] Check success toast: "✅ Successfully created Project"
- [ ] New project appears in list
- [ ] Can create client inline during project creation

**Status:** ____

### READ - View Projects
- [ ] Projects list displays with:
  - [ ] Project name
  - [ ] Client name
  - [ ] Status badge
  - [ ] Start/End dates
  - [ ] Budget display
  - [ ] Actions menu
- [ ] Filter by status works
- [ ] Search by name works
- [ ] Click project to view details

**Status:** ____

### UPDATE - Edit Project
- [ ] Click edit on a project
- [ ] Edit page/modal opens with current data
- [ ] Modify fields:
  - [ ] Name
  - [ ] Budget
  - [ ] Status
  - [ ] Dates
- [ ] Save changes
- [ ] Check success toast: "✅ Successfully updated Project"
- [ ] Changes reflected in list and details

**Status:** ____

### DELETE - Remove Project
- [ ] Click delete on a project
- [ ] Confirmation dialog shows project name
- [ ] Click "Delete" to confirm
- [ ] Check success toast: "✅ Successfully deleted Project"
- [ ] Project removed from list

**Status:** ____

### Error Handling
- [ ] Cannot create project without name
- [ ] Cannot create project without client
- [ ] Cannot delete project with active timesheets (if applicable)
- [ ] Date validation (end date after start date)

**Status:** ____

---

## 3️⃣ TIMESHEET MANAGEMENT

**Page:** `/timesheet`  
**Components:** TimesheetModal, MonthlyView, WeeklyView

### CREATE - Add Time Entry
- [ ] Click "Add Entry" or click on date in calendar
- [ ] TimesheetModal opens with fields:
  - [ ] Date (required)
  - [ ] Project (required)
  - [ ] Hours (required)
  - [ ] Work type (Required/Optional)
  - [ ] Description
- [ ] Fill in hours (decimal format, e.g., 8.5)
- [ ] Submit
- [ ] Check success toast: "✅ Successfully created Timesheet"
- [ ] Entry appears in monthly view
- [ ] Total hours update
- [ ] Alert if parallel work detected

**Status:** ____

### READ - View Timesheet
- [ ] Monthly view displays:
  - [ ] All entered days highlighted
  - [ ] Daily hour totals
  - [ ] Project colors
  - [ ] Status indicators (Draft/Submitted/Approved)
- [ ] Weekly view shows:
  - [ ] Detailed hours per day
  - [ ] Projects list
  - [ ] Cumulative hours
- [ ] Activity log shows entries with timestamps

**Status:** ____

### UPDATE - Edit Time Entry
- [ ] Click on existing entry
- [ ] Modal opens with current data
- [ ] Edit hours, project, or description
- [ ] Save changes
- [ ] Check success toast: "✅ Successfully updated Timesheet"
- [ ] Changes reflected in views
- [ ] Total hours recalculate

**Status:** ____

### DELETE - Remove Time Entry
- [ ] Click delete on an entry
- [ ] Confirmation dialog appears
- [ ] Click "Delete" to confirm
- [ ] Check success toast: "✅ Successfully deleted Timesheet"
- [ ] Entry removed from views
- [ ] Total hours update

**Status:** ____

### Submit Timesheet
- [ ] Click "Submit Timesheet" button
- [ ] Modal shows submission confirmation
- [ ] Status changes to "Submitted"
- [ ] Button becomes "Recall Submission" (if allowed)
- [ ] Manager sees entry in approvals

**Status:** ____

### Error Handling
- [ ] Cannot add entry without project
- [ ] Cannot add entry without hours
- [ ] Cannot add future dates (if restricted)
- [ ] Cannot edit submitted entries (if locked)
- [ ] Parallel work warnings display

**Status:** ____

---

## 4️⃣ USERS/STAFF MANAGEMENT

**Page:** `/users`  
**Components:** UserFormModal, RoleSelector

### CREATE - Add New User
- [ ] Click "Add User" button
- [ ] UserFormModal opens with fields:
  - [ ] Full name (required)
  - [ ] Email (required, unique)
  - [ ] Phone
  - [ ] Role (admin/manager/employee)
  - [ ] Department
  - [ ] Position
- [ ] Set role permissions
- [ ] Submit form
- [ ] Check success toast: "✅ Successfully created User"
- [ ] New user appears in list
- [ ] User can log in with credentials

**Status:** ____

### READ - View Users
- [ ] Users list displays:
  - [ ] Name
  - [ ] Email
  - [ ] Role badge
  - [ ] Department
  - [ ] Status
- [ ] Filter by role works
- [ ] Filter by department works
- [ ] Search by name/email works

**Status:** ____

### UPDATE - Edit User
- [ ] Click edit on a user
- [ ] Modal opens with current data
- [ ] Edit:
  - [ ] Name
  - [ ] Email (if unique)
  - [ ] Phone
  - [ ] Role
  - [ ] Department
- [ ] Save changes
- [ ] Check success toast: "✅ Successfully updated User"
- [ ] Changes reflected in list

**Status:** ____

### DELETE - Remove User
- [ ] Click delete on a user
- [ ] Confirmation dialog shows warnings (if timesheets exist)
- [ ] Click "Delete" to confirm
- [ ] Check success toast: "✅ Successfully deleted User"
- [ ] User removed from list
- [ ] User cannot log in anymore

**Status:** ____

### Error Handling
- [ ] Cannot create user without name
- [ ] Cannot create user without email
- [ ] Cannot create duplicate email
- [ ] Cannot delete admin if only one exists
- [ ] Cannot delete user with incomplete action items

**Status:** ____

---

## 5️⃣ EXPENSES MANAGEMENT

**Page:** `/expenses`  
**Components:** ExpenseForm, ExpenseModal

### CREATE - Add Expense
- [ ] Click "Add Expense" button
- [ ] Form opens with fields:
  - [ ] Date (required)
  - [ ] Category (required)
  - [ ] Description
  - [ ] Amount (required)
  - [ ] Project (optional)
  - [ ] Receipt (file upload)
- [ ] Fill form with valid data
- [ ] Submit
- [ ] Check success toast: "✅ Successfully created Expense"
- [ ] Expense appears in list
- [ ] Total expenses update

**Status:** ____

### READ - View Expenses
- [ ] Expenses list shows:
  - [ ] Date
  - [ ] Category with icon
  - [ ] Description
  - [ ] Amount formatted with currency
  - [ ] Status (Draft/Submitted/Approved)
- [ ] Filter by category works
- [ ] Filter by date range works
- [ ] Search by description works
- [ ] Total summary updates

**Status:** ____

### UPDATE - Edit Expense
- [ ] Click edit on an expense
- [ ] Form opens with current data
- [ ] Edit amount, category, or description
- [ ] Upload new receipt if needed
- [ ] Save changes
- [ ] Check success toast: "✅ Successfully updated Expense"
- [ ] Changes reflected in list

**Status:** ____

### DELETE - Remove Expense
- [ ] Click delete on an expense
- [ ] Confirmation dialog appears
- [ ] Click "Delete" to confirm
- [ ] Check success toast: "✅ Successfully deleted Expense"
- [ ] Expense removed from list
- [ ] Total recalculates

**Status:** ____

### Error Handling
- [ ] Cannot add expense without amount
- [ ] Cannot add expense without date
- [ ] Cannot add negative amount
- [ ] File upload validation (max size, type)
- [ ] Cannot edit approved expenses (if locked)

**Status:** ____

---

## 6️⃣ LEAVE/TIME OFF MANAGEMENT

**Page:** `/timeoff` or `/leave`  
**Components:** LeaveRequestModal, LeaveAllocationForm

### CREATE - Request Leave
- [ ] Click "Request Leave" button
- [ ] Modal opens with fields:
  - [ ] Leave type (sick/vacation/personal)
  - [ ] Start date
  - [ ] End date
  - [ ] Reason
  - [ ] Attachment (optional)
- [ ] Fill form
- [ ] Submit
- [ ] Check success toast: "✅ Successfully created Leave Request"
- [ ] Request appears in pending list
- [ ] Manager sees in approvals

**Status:** ____

### READ - View Leave Requests
- [ ] Leave list shows:
  - [ ] Type with icon
  - [ ] Duration
  - [ ] Status badge
  - [ ] Dates
- [ ] Calendar view shows leave dates
- [ ] Can filter by type and status

**Status:** ____

### UPDATE - Edit Leave Request
- [ ] Click edit on pending request
- [ ] Modal opens with current data
- [ ] Edit dates or reason
- [ ] Save changes
- [ ] Check success toast: "✅ Successfully updated Leave Request"
- [ ] Changes reflected in views

**Status:** ____

### DELETE - Cancel Leave Request
- [ ] Click delete on pending request
- [ ] Confirmation dialog appears
- [ ] Click "Delete" to confirm
- [ ] Check success toast: "✅ Successfully deleted Leave Request"
- [ ] Request removed from list

**Status:** ____

### Error Handling
- [ ] Cannot request leave in past
- [ ] Cannot overlap existing leave
- [ ] Cannot exceed annual balance
- [ ] Cannot edit approved/rejected requests

**Status:** ____

---

## 7️⃣ APPROVALS MANAGEMENT

**Page:** `/approvals`  
**Components:** ApprovalModal, ApprovalsList

### READ - View Approval Queue
- [ ] List shows pending items:
  - [ ] Employee name
  - [ ] Item type (Timesheet/Expense/Leave)
  - [ ] Amount/Hours
  - [ ] Submission date
  - [ ] Status
- [ ] Filter by type works
- [ ] Filter by status works
- [ ] Search by employee works

**Status:** ____

### APPROVE - Accept Item
- [ ] Click "Approve" button
- [ ] Modal shows details
- [ ] Click "Approve" to confirm
- [ ] Success toast: "✅ Approved successfully"
- [ ] Item moves to "Approved" status
- [ ] Employee receives notification

**Status:** ____

### REJECT - Decline Item
- [ ] Click "Reject" button
- [ ] Modal shows details
- [ ] Enter rejection reason
- [ ] Click "Reject" to confirm
- [ ] Success toast: "✅ Rejected successfully"
- [ ] Item moves to "Rejected" status
- [ ] Employee can resubmit

**Status:** ____

### Error Handling
- [ ] Cannot approve without viewing details
- [ ] Cannot reject without reason
- [ ] Cannot approve already approved items

**Status:** ____

---

## 8️⃣ TASKS MANAGEMENT

**Page:** `/tasks` (if exists)  
**Components:** TaskFormModal, TaskBoard

### CREATE - Add Task
- [ ] Click "Add Task" button
- [ ] Form opens with:
  - [ ] Title
  - [ ] Description
  - [ ] Assigned to (user)
  - [ ] Project
  - [ ] Priority
  - [ ] Due date
- [ ] Submit form
- [ ] Success toast appears
- [ ] Task appears in list/board

**Status:** ____

### READ - View Tasks
- [ ] Tasks display in:
  - [ ] List view with status
  - [ ] Kanban board by status (if available)
  - [ ] Calendar by due date (if available)
- [ ] Can filter by assignee
- [ ] Can filter by priority
- [ ] Can search by title

**Status:** ____

### UPDATE - Edit Task
- [ ] Click on task
- [ ] Details modal opens
- [ ] Edit fields
- [ ] Save changes
- [ ] Changes reflected in views

**Status:** ____

### DELETE - Remove Task
- [ ] Click delete button
- [ ] Confirmation appears
- [ ] Click confirm
- [ ] Task removed from views

**Status:** ____

---

## 📊 CROSS-FUNCTIONAL TESTS

### Data Integrity
- [ ] Creating item in one page reflects in related pages
- [ ] Deleting item removes all references
- [ ] Editing updates all related displays
- [ ] No orphaned data remains

**Status:** ____

### Error Messages
- [ ] All error messages are clear and in correct language
- [ ] Error messages include actionable information
- [ ] Validation errors appear before submission
- [ ] Server errors show specific details

**Status:** ____

### Toast Notifications
- [ ] Success toasts appear for all CREATE operations
- [ ] Success toasts appear for all UPDATE operations
- [ ] Success toasts appear for all DELETE operations
- [ ] Error toasts appear with error details
- [ ] Toasts display in correct language (Thai/English)
- [ ] Toasts auto-dismiss after 3-5 seconds

**Status:** ____

### Loading States
- [ ] Buttons show "Loading..." during submission
- [ ] Modals disable submission while processing
- [ ] Lists show loading spinners while fetching
- [ ] No duplicate submissions possible

**Status:** ____

### Responsive Design
- [ ] Forms display correctly on mobile
- [ ] Modals responsive on tablet
- [ ] Tables have horizontal scroll on small screens
- [ ] Touch targets are adequate (48px minimum)

**Status:** ____

---

## 🔒 SECURITY & PERMISSIONS

### Authorization
- [ ] Employee cannot delete others' timesheets
- [ ] Employee cannot approve own submissions
- [ ] Manager cannot access admin settings
- [ ] Unauthorized access shows error

**Status:** ____

### Data Validation
- [ ] All form inputs validated client-side
- [ ] All form inputs validated server-side
- [ ] XSS prevention in text fields
- [ ] SQL injection prevention in searches

**Status:** ____

---

## 📝 SUMMARY

### Total Test Cases: ____ / ____

### Passed: ____  
### Failed: ____  
### Pending: ____  

---

## ❌ FAILED TESTS

List any failed tests here with details:

1. **Test Name:**  
   **Page:** `/`  
   **Issue:**  
   **Error Message:**  
   **Steps to Reproduce:**  
   **Expected vs Actual:**  

---

## 📋 NOTES

- Testing performed in: [Thai/English/Both]
- Browser: [Chrome/Firefox/Safari/Edge]
- Device: [Desktop/Tablet/Mobile]
- Database: [PostgreSQL/Supabase]
- API: [Local/Remote]

---

**Tester:** ______________  
**Date:** ______________  
**Time Spent:** ______________  
**Approved by:** ______________
