# 🧪 CRUD Testing Guide

This guide helps you test all CRUD (Create, Read, Update, Delete) operations across the application.

## 📋 **Test Checklist**

### 1. **Projects CRUD** (`/projects`)
- [ ] **Create**: Click "สร้างโครงการใหม่" → Fill form → Save
- [ ] **Read**: View project list → Click project name → View details
- [ ] **Update**: Click "แก้ไข" button → Modify data → Save changes
- [ ] **Delete**: Click "ลบ" icon → Confirm deletion → Verify removal

### 2. **Tasks CRUD** (`/tasks`)
- [ ] **Create**: Click "เพิ่มงาน" → Select project → Fill task details → Save
- [ ] **Read**: View task list → Click task → View full details
- [ ] **Update**: Click edit icon → Modify task → Save changes
- [ ] **Delete**: Click trash icon → Confirm → Verify removal

### 3. **Clients CRUD** (`/clients`)
- [ ] **Create**: Click "เพิ่มลูกค้า" → Fill client form → Save
- [ ] **Read**: Browse client list → Click client → View details
- [ ] **Update**: Click edit → Modify client info → Save
- [ ] **Delete**: Click delete → Confirm → Verify removal

### 4. **Expenses CRUD** (`/expenses`)
- [ ] **Create**: Click "บันทึกค่าใช้จ่าย" → Fill expense form → Save
- [ ] **Read**: View expense list → Click expense → View details
- [ ] **Update**: Click edit → Modify expense → Save
- [ ] **Delete**: Click trash → Confirm → Verify removal

### 5. **Timesheet CRUD** (`/timesheet`)
- [ ] **Create**: Click "เพิ่มรายการใหม่" → Select date/project → Fill time → Save
- [ ] **Read**: View calendar → Click date → View entries
- [ ] **Update**: Click time entry → Modify → Save changes
- [ ] **Delete**: Click delete icon in modal → Confirm → Verify removal

### 6. **Users CRUD** (`/users`)
- [ ] **Create**: Click "เพิ่มผู้ใช้งาน" → Fill user form → Save
- [ ] **Read**: View user list → Click user → View profile
- [ ] **Update**: Click edit → Modify user info → Save
- [ ] **Delete**: Click delete → Confirm → Verify removal

### 7. **Reports CRUD** (`/reports`)
- [ ] **Generate**: Select report type → Set parameters → Generate
- [ ] **Read**: View report list → Click report → View details
- [ ] **Export**: Click export button → Download CSV/PDF
- [ ] **Filter**: Apply filters → Verify filtered results

## 🔧 **Testing Steps**

### **Before Testing**
1. **Clear Cache**: Use dashboard clear cache button
2. **Login**: Ensure proper authentication
3. **Permissions**: Test with different user roles
4. **Data**: Prepare test data for each operation

### **During Testing**
1. **Create Operations**:
   - Fill all required fields
   - Test validation (empty fields, invalid data)
   - Verify data appears in list
   - Check database persistence

2. **Read Operations**:
   - Verify list displays correctly
   - Test search and filtering
   - Check detail views
   - Verify pagination

3. **Update Operations**:
   - Modify existing data
   - Test validation
   - Verify changes persist
   - Check audit logs if available

4. **Delete Operations**:
   - Test soft delete vs permanent delete
   - Verify confirmation dialogs
   - Check cascading deletes
   - Verify data removal

### **After Testing**
1. **Data Integrity**: Check database consistency
2. **Performance**: Measure response times
3. **Error Handling**: Test error messages
4. **UI/UX**: Verify user experience

## 🐛 **Common Issues to Check**

### **Create Issues**
- Required field validation
- Duplicate data prevention
- File upload handling
- Permission checks

### **Read Issues**
- Loading states
- Empty states
- Search functionality
- Filter accuracy

### **Update Issues**
- Concurrent modification handling
- Validation on existing data
- Permission checks
- Data consistency

### **Delete Issues**
- Confirmation dialogs
- Soft delete implementation
- Related data cleanup
- Permission validation

## 📊 **Test Data Template**

### **Project Test Data**
```
Name: Test Project CRUD
Description: Testing create/update/delete
Status: Active
Budget: 100000
Start Date: 2026-01-01
End Date: 2026-12-31
```

### **Task Test Data**
```
Title: Test CRUD Task
Description: Testing task operations
Priority: Medium
Status: In Progress
Assignee: Test User
Due Date: 2026-12-31
```

### **Client Test Data**
```
Name: Test Client CRUD
Email: test@crud.com
Phone: 0812345678
Address: Test Address
Type: Individual
```

## ✅ **Success Criteria**

Each CRUD operation should:
- [ ] **Load quickly** (< 3 seconds)
- [ ] **Show proper feedback** (loading, success, error)
- [ ] **Validate input** (required fields, format)
- [ ] **Handle errors** gracefully
- [ ] **Update UI** immediately
- [ ] **Persist data** correctly
- [ ] **Maintain security** (permissions, validation)

## 🚀 **Ready to Test**

Use this checklist to systematically test all CRUD operations in your application. Mark each item as completed when verified working correctly.
