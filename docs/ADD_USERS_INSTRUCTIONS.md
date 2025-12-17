# 👥 Adding Painai Users to Database

## 🎯 Users to Add

The following users will be added to your project management system:

| Role | Email | Password | Department | Position |
|------|-------|----------|------------|----------|
| **Admin** | admin@painai.com | admin123 | IT | System Administrator |
| **Manager** | jakgrits.ph@appworks.co.th | manager123 | PM | Project Manager |
| **Employee** | somying@painai.com | employee123 | Development | Software Developer |

## 🚀 Quick Setup Instructions

### Option 1: Run Complete SQL Script (Recommended)

1. **Open Neon Console** (https://neon.tech)
2. **Go to SQL Editor**
3. **Copy and paste** the entire contents of `add-painai-users.sql`
4. **Execute** the script
5. **Verify** the users were created

### Option 2: Use Sample Data Function

1. **Run the schema** if not already done:
   ```sql
   -- First run: database/neon-schema.sql
   ```

2. **Execute the sample data function**:
   ```sql
   SELECT insert_sample_data();
   ```

## 📋 What Gets Created

### 👤 Users
- **3 users** with different roles (Admin, Manager, Employee)
- **Proper credentials** for authentication
- **Department and position** assignments

### 🏢 Customers
- **2 sample customers** for testing
- **Government and private** sector examples

### 📁 Projects
- **2 active projects** with realistic data
- **Different priorities** and progress levels
- **Proper team assignments**

### ✅ Tasks
- **7 tasks** across projects
- **Various statuses** (todo, progress, completed)
- **Proper weight and progress** tracking

### ⏰ Worklogs
- **6 time entries** with hours and manday calculations
- **Mix of project and office** work types
- **Approved and pending** statuses

### 💰 Expenses
- **4 expense records** with different categories
- **Travel, equipment, service, software** examples
- **Various approval statuses**

## 🔍 Verification

After running the script, you can verify the data:

```sql
-- Check users
SELECT name, email, role, department FROM users WHERE email LIKE '%@painai.com%';

-- Check projects
SELECT name, status, progress, customer FROM projects WHERE object_id LIKE 'project-painai-%';

-- Check recent worklogs
SELECT user_name, date, hours, description FROM worklogs 
WHERE object_id LIKE 'worklog-painai-%' 
ORDER BY date DESC;
```

## 🛠️ Troubleshooting

### If Users Already Exist
The script includes `DELETE` statements to prevent conflicts. It will:
- Remove old sample data
- Insert fresh Painai-specific data
- Handle duplicate email errors gracefully

### If Script Fails
1. **Check database connection** - Ensure you're connected to the correct Neon project
2. **Verify schema** - Make sure `neon-schema.sql` was run first
3. **Check permissions** - Ensure you have INSERT permissions on all tables

### If You Need to Reset
```sql
-- Clear all Painai data (careful!)
DELETE FROM worklogs WHERE object_id LIKE 'worklog-painai-%';
DELETE FROM expenses WHERE object_id LIKE 'expense-painai-%';
DELETE FROM tasks WHERE object_id LIKE 'task-painai-%';
DELETE FROM projects WHERE object_id LIKE 'project-painai-%';
DELETE FROM customers WHERE object_id LIKE 'customer-painai-%';
DELETE FROM users WHERE email LIKE '%@painai.com%';
```

## 🎮 Testing the Users

### Login Testing
1. **Open your web application**
2. **Try logging in** with each user:
   - Admin: Full access to all features
   - Manager: Project management capabilities
   - Employee: Basic user features

### Role Testing
- **Admin** should see user management and system settings
- **Manager** should see project oversight and team management
- **Employee** should see assigned tasks and timesheet entry

## 📝 Files Reference

| File | Purpose |
|------|---------|
| `add-painai-users.sql` | Complete user insertion script |
| `neon-schema.sql` | Database schema (updated with Painai sample data) |
| `QUERY_TRUNCATION_SOLUTION.md` | Query management solutions |
| `connection-status.html` | Database connection testing |

## ✅ Success Indicators

You'll know it worked when:
- ✅ **3 users** appear in the users list
- ✅ **Login works** with the provided credentials  
- ✅ **Projects and tasks** are visible in the dashboard
- ✅ **Worklogs and expenses** show realistic data
- ✅ **No error messages** during script execution

---

**🎉 Your Painai users are ready to use!** The system now has realistic test data for development and demonstration purposes.