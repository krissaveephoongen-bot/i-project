# ✅ Admin CRUD Testing Checklist

## 🔑 **Prerequisites**
- [ ] Login as **Admin** user
- [ ] Verify admin privileges are active
- [ ] Check database connection
- [ ] Ensure all required tables exist

---

## 🕐 **Timesheet Testing**

### **Create Operations**
- [ ] **Test 1**: Create new timesheet entry
  - [ ] Navigate to `/timesheet`
  - [ ] Select current month
  - [ ] Click "Add Entry" or "New Entry"
  - [ ] Fill in: Project, Date, Hours, Activity
  - [ ] Click "Save"
  - [ ] **Expected**: Entry appears in table with success notification

- [ ] **Test 2**: Create entry with invalid data
  - [ ] Try to save without required fields
  - [ ] **Expected**: Validation error shown

### **Read Operations**
- [ ] **Test 3**: View monthly timesheet
  - [ ] Navigate to `/timesheet`
  - [ ] Check all entries are visible
  - [ ] Verify total hours calculation
  - [ ] **Expected**: All entries displayed correctly

- [ ] **Test 4**: Search and filter
  - [ ] Use search functionality
  - [ ] Filter by project
  - [ ] **Expected**: Results filtered correctly

### **Update Operations**
- [ ] **Test 5**: Edit existing entry
  - [ ] Click "Edit" on an entry
  - [ ] Modify hours or description
  - [ ] Click "Update"
  - [ ] **Expected**: Entry updated with success notification

### **Delete Operations**
- [ ] **Test 6**: Delete entry
  - [ ] Click "Delete" on an entry
  - [ ] Confirm deletion
  - [ ] **Expected**: Entry removed, total hours updated

---

## 👥 **Stakeholders Testing**

### **Create Operations**
- [ ] **Test 7**: Add new stakeholder
  - [ ] Navigate to `/stakeholders`
  - [ ] Look for "Add Stakeholder" button
  - [ ] Fill in: Name, Email, Role, Organization
  - [ ] Click "Save"
  - [ ] **Expected**: Stakeholder appears in directory

- [ ] **Test 8**: Create stakeholder via API
  - [ ] Test POST `/api/stakeholders`
  - [ ] **Expected**: 201 response with stakeholder data

### **Read Operations**
- [ ] **Test 9**: View all stakeholders
  - [ ] Navigate to `/stakeholders`
  - [ ] Check all stakeholders are displayed
  - [ ] **Expected**: Complete stakeholder list shown

- [ ] **Test 10**: Filter stakeholders
  - [ ] Use project filter
  - [ ] **Expected**: Filtered results displayed

### **Update Operations**
- [ ] **Test 11**: Edit stakeholder
  - [ ] Find edit functionality
  - [ ] Modify stakeholder details
  - [ ] Click "Update"
  - [ ] **Expected**: Changes saved and reflected

- [ ] **Test 12**: Update via API
  - [ ] Test PUT `/api/stakeholders`
  - [ ] **Expected**: 200 response with updated data

### **Delete Operations**
- [ ] **Test 13**: Delete stakeholder
  - [ ] Find delete functionality
  - [ ] Confirm deletion
  - [ ] **Expected**: Stakeholder removed from list

- [ ] **Test 14**: Delete via API
  - [ ] Test DELETE `/api/stakeholders`
  - [ ] **Expected**: 200 response, stakeholder removed

---

## 💰 **Expenses Testing**

### **Create Operations**
- [ ] **Test 15**: Create new expense claim
  - [ ] Navigate to `/expenses`
  - [ ] Click "New Claim"
  - [ ] Fill in: Project, Date, Amount, Category, Description
  - [ ] Click "Save Claim"
  - [ ] **Expected**: Expense appears with "Pending" status

- [ ] **Test 16**: Upload receipt
  - [ ] Try to upload receipt file
  - [ ] **Expected**: File uploaded successfully

### **Read Operations**
- [ ] **Test 17**: View all expenses
  - [ ] Navigate to `/expenses`
  - [ ] Check all expenses are visible
  - [ ] Verify status badges
  - [ ] **Expected**: Complete expense list with statuses

- [ ] **Test 18**: Filter expenses
  - [ ] Filter by status (pending/approved/rejected)
  - [ ] Filter by category
  - [ ] **Expected**: Results filtered correctly

### **Update Operations**
- [ ] **Test 19**: Edit pending expense
  - [ ] Click "Edit" on pending expense
  - [ ] Modify amount or description
  - [ ] Click "Update"
  - [ ] **Expected**: Expense updated

- [ ] **Test 20**: Try to edit approved expense
  - [ ] Find approved expense
  - [ ] Try to edit
  - [ ] **Expected**: Should not allow editing

### **Delete Operations**
- [ ] **Test 21**: Delete pending expense
  - [ ] Click "Delete" on pending expense
  - [ ] Confirm deletion
  - [ ] **Expected**: Expense removed

- [ ] **Test 22**: Try to delete approved expense
  - [ ] Find approved expense
  - [ ] Try to delete
  - [ ] **Expected**: Should not allow deletion

### **Admin Operations**
- [ ] **Test 23**: Approve expense
  - [ ] Click on pending expense
  - [ ] Click "Approve"
  - [ ] **Expected**: Status changes to "Approved"

- [ ] **Test 24**: Reject expense
  - [ ] Click on pending expense
  - [ ] Click "Reject"
  - [ ] Add rejection reason
  - [ ] **Expected**: Status changes to "Rejected"

---

## 🔍 **Admin Privilege Verification**

### **Access Control Tests**
- [ ] **Test 25**: Admin can access all CRUD operations
- [ ] **Test 26**: Admin can view other users' data
- [ ] **Test 27**: Admin can override restrictions
- [ ] **Test 28**: Admin receives admin notifications

### **Cross-Module Tests**
- [ ] **Test 29**: Create timesheet for different projects
- [ ] **Test 30**: Assign stakeholders to multiple projects
- [ ] **Test 31**: Create expenses for different projects
- [ ] **Test 32**: View consolidated reports

---

## 🚨 **Error Handling Tests**

### **Validation Tests**
- [ ] **Test 33**: Submit empty forms
- [ ] **Test 34**: Submit invalid email formats
- [ ] **Test 35**: Submit negative amounts
- [ ] **Test 36**: Submit future dates for timesheet

### **Concurrency Tests**
- [ ] **Test 37**: Multiple users editing same data
- [ ] **Test 38**: Simultaneous CRUD operations
- [ ] **Test 39**: Network interruption during save

---

## 📊 **Data Integrity Tests**

### **Relationship Tests**
- [ ] **Test 40**: Delete project with associated data
- [ ] **Test 41**: Create expense for non-existent project
- [ ] **Test 42**: Assign stakeholder to deleted project

### **Audit Tests**
- [ ] **Test 43**: Check admin actions are logged
- [ ] **Test 44**: Verify timestamps are correct
- [ ] **Test 45**: Check data consistency

---

## 🎯 **Performance Tests**

### **Load Tests**
- [ ] **Test 46**: Load large datasets
- [ ] **Test 47**: Search performance with many records
- [ ] **Test 48**: Pagination with large datasets

---

## 📝 **Test Results Summary**

| Module | Create | Read | Update | Delete | Admin Ops | Status |
|--------|--------|------|--------|--------|-----------|---------|
| Timesheet | [ ] | [ ] | [ ] | [ ] | [ ] | ⏳ |
| Stakeholders | [ ] | [ ] | [ ] | [ ] | [ ] | ⏳ |
| Expenses | [ ] | [ ] | [ ] | [ ] | [ ] | ⏳ |

---

## 🚀 **Ready to Start Testing**

1. **Login as Admin**
2. **Follow each test step**
3. **Mark completed tests with [x]**
4. **Document any issues found**
5. **Take screenshots for visual verification**

**Good luck with testing! 🎯**
