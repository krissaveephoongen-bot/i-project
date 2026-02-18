# 🔐 Admin CRUD Testing Guide

## 📋 **Test Overview**

This guide covers comprehensive CRUD testing for admin users across Timesheet, Stakeholders, and Expenses modules.

---

## 🕐 **Timesheet CRUD Testing**

### **1. Create Timesheet Entry**
**Path**: `/timesheet`
**Steps**:
1. Login as **Admin** user
2. Navigate to Timesheet page
3. Select current month/year
4. Click "Add Entry" button
5. Fill in required fields:
   - Project (select from dropdown)
   - Date (calendar picker)
   - Hours worked
   - Activity description
6. Click "Save"

**Expected Results**:
- ✅ Entry appears in timesheet table
- ✅ Success notification shown
- ✅ Total hours calculated correctly
- ✅ Entry can be edited/deleted

### **2. Read/View Timesheet**
**Steps**:
1. View monthly timesheet overview
2. Check daily entries
3. Filter by project
4. Search activities
5. View submitted timesheets

**Expected Results**:
- ✅ All entries visible to admin
- ✅ Can view any user's timesheet
- ✅ Search/filter works correctly
- ✅ Pagination works

### **3. Update Timesheet Entry**
**Steps**:
1. Click "Edit" on existing entry
2. Modify hours, description, or project
3. Click "Update"

**Expected Results**:
- ✅ Entry updated in table
- ✅ Success notification
- ✅ Changes reflected immediately

### **4. Delete Timesheet Entry**
**Steps**:
1. Click "Delete" on entry
2. Confirm deletion
3. Verify removal

**Expected Results**:
- ✅ Entry removed from table
- ✅ Success notification
- ✅ Total hours updated

---

## 👥 **Stakeholders CRUD Testing**

### **1. Create Stakeholder**
**Path**: `/projects/[id]/stakeholders` or `/stakeholders`
**Steps**:
1. Login as **Admin**
2. Navigate to Stakeholders section
3. Click "Add Stakeholder"
4. Fill in details:
   - Name
   - Email
   - Role/Position
   - Organization
   - Contact information
5. Click "Save"

**Expected Results**:
- ✅ Stakeholder appears in list
- ✅ Email notification sent (if configured)
- ✅ Can be assigned to projects

### **2. Read/View Stakeholders**
**Steps**:
1. View all stakeholders list
2. Search by name/email
3. Filter by role
4. View stakeholder details

**Expected Results**:
- ✅ All stakeholders visible
- ✅ Search/filter functional
- ✅ Detailed view accessible

### **3. Update Stakeholder**
**Steps**:
1. Click "Edit" on stakeholder
2. Update information
3. Click "Save"

**Expected Results**:
- ✅ Information updated
- ✅ Changes reflected immediately
- ✅ Success notification

### **4. Delete Stakeholder**
**Steps**:
1. Click "Delete" on stakeholder
2. Confirm deletion
3. Check for project assignments

**Expected Results**:
- ✅ Stakeholder removed
- ✅ Project assignments cleaned up
- ✅ Success notification

---

## 💰 **Expenses CRUD Testing**

### **1. Create Expense**
**Path**: `/expenses`
**Steps**:
1. Login as **Admin**
2. Navigate to Expenses page
3. Click "New Claim" button
4. Fill in expense details:
   - Project (dropdown)
   - Date
   - Amount (THB)
   - Category (travel, meals, supplies, etc.)
   - Description
   - Receipt URL (if any)
5. Click "Save Claim"

**Expected Results**:
- ✅ Expense appears in table
- ✅ Status shows "Pending"
- ✅ Can be edited while pending
- ✅ Receipt upload works

### **2. Read/View Expenses**
**Steps**:
1. View all expenses list
2. Filter by status (pending, approved, rejected)
3. Filter by category
4. Search by description
5. View expense details

**Expected Results**:
- ✅ All expenses visible to admin
- ✅ Filters work correctly
- ✅ Status badges displayed
- ✅ Amount totals calculated

### **3. Update Expense**
**Steps**:
1. Click "Edit" on pending expense
2. Modify amount, category, or description
3. Click "Update"

**Expected Results**:
- ✅ Expense updated
- ✅ Changes reflected
- ✅ Success notification
- ❌ Cannot edit approved/rejected expenses

### **4. Delete Expense**
**Steps**:
1. Click "Delete" on pending expense
2. Confirm deletion
3. Verify removal

**Expected Results**:
- ✅ Expense removed
- ✅ Success notification
- ❌ Cannot delete approved expenses

### **5. Approve/Reject Expenses**
**Admin-only Actions**:
1. Click on pending expense
2. Review details and receipt
3. Click "Approve" or "Reject"
4. Add rejection reason if needed

**Expected Results**:
- ✅ Status changes to approved/rejected
- ✅ Email notification sent to user
- ✅ Cannot be edited after approval

---

## 🔍 **Admin Privilege Verification**

### **Access Control Tests**
1. **Login as Admin** - Full access to all CRUD operations
2. **Login as Manager** - Limited CRUD (own team only)
3. **Login as Employee** - Read-only or restricted access

### **Expected Admin Privileges**
- ✅ Create any type of entry
- ✅ View all entries (including other users')
- ✅ Edit any entry
- ✅ Delete any entry
- ✅ Approve/reject expenses
- ✅ Manage all stakeholders
- ✅ Override restrictions

---

## 🧪 **Test Data Templates**

### **Timesheet Test Data**
```json
{
  "project": "Website Redesign",
  "date": "2024-02-15",
  "hours": 8,
  "activity": "Frontend development - React components",
  "category": "Development"
}
```

### **Stakeholder Test Data**
```json
{
  "name": "John Smith",
  "email": "john.smith@company.com",
  "role": "Project Sponsor",
  "organization": "ABC Corporation",
  "phone": "+66-2-123-4567"
}
```

### **Expense Test Data**
```json
{
  "project": "Mobile App Development",
  "date": "2024-02-14",
  "amount": 1500,
  "category": "travel",
  "description": "Client meeting transportation",
  "receiptUrl": "https://example.com/receipt.pdf"
}
```

---

## ✅ **Testing Checklist**

### **Timesheet**
- [ ] Create entry with valid data
- [ ] Create entry with invalid data (error handling)
- [ ] Edit existing entry
- [ ] Delete entry
- [ ] View monthly summary
- [ ] Search/filter functionality
- [ ] Pagination works

### **Stakeholders**
- [ ] Add new stakeholder
- [ ] Edit stakeholder information
- [ ] Delete stakeholder
- [ ] Assign to projects
- [ ] Search/filter stakeholders
- [ ] View stakeholder details

### **Expenses**
- [ ] Create expense claim
- [ ] Upload receipt
- [ ] Edit pending claim
- [ ] Delete pending claim
- [ ] Approve expense
- [ ] Reject expense with reason
- [ ] View expense reports
- [ ] Filter by status/category

### **Admin Privileges**
- [ ] Access all CRUD operations
- [ ] View other users' data
- [ ] Override restrictions
- [ ] Perform admin-only actions
- [ ] Receive admin notifications

---

## 🚨 **Common Issues to Check**

1. **Permission Errors** - Ensure admin can bypass all restrictions
2. **Data Validation** - Test with invalid/empty data
3. **Concurrent Access** - Multiple users editing same data
4. **File Uploads** - Receipt uploads for expenses
5. **Email Notifications** - Approval/rejection emails
6. **Database Integrity** - Foreign key constraints
7. **Audit Trail** - Admin actions logged

---

## 📊 **Success Criteria**

- All CRUD operations work correctly
- Admin privileges properly enforced
- Data validation prevents invalid entries
- User experience is intuitive
- Error messages are helpful
- Performance is acceptable
- Security measures are effective

**Run through this checklist systematically to ensure comprehensive testing!** 🎯
