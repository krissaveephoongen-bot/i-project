# Admin Console - Quick Start Guide

## ⚡ 5 Minutes Setup

### 1. Start the Server
```bash
npm run dev
# or
npm start
```

### 2. Create Admin User (if not exists)
```sql
INSERT INTO users (id, name, email, password, role, status)
VALUES (gen_random_uuid(), 'Admin User', 'admin@example.com', 'Admin@123', 'admin', 'active');
```

### 3. Login to Admin Console
- URL: `http://localhost:5000/admin/login.html`
- Email: `admin@example.com`
- Password: `Admin@123`

### 4. You're Ready!
You now have access to:
- ✅ Dashboard with real-time stats
- ✅ Project management
- ✅ User management
- ✅ Task management
- ✅ Reports & exports
- ✅ System settings

---

## Main Features

### 📊 Dashboard
Real-time overview of:
- Total projects and active projects
- User statistics
- Pending approvals
- Total budget
- Recent activities

### 📁 Project Management
- Create, edit, delete projects
- Set budgets and deadlines
- Track progress
- Manage project status

### 👥 User Management
- Add/edit users
- Assign roles (Admin, Manager, Member)
- Manage user status
- View user details

### ✅ Task Management
- Create and assign tasks
- Set priorities (High, Medium, Low)
- Track task status
- Monitor progress

### 📈 Reports
- Export to CSV, PDF, Excel
- View project reports
- User analytics
- Budget reports

### ⚙️ Settings
- Configure app settings
- Set timezone
- Language preferences
- Email notifications

---

## Navigation

```
Admin Console
├── Dashboard          [Overview & stats]
├── Projects           [CRUD operations]
├── Users              [User management]
├── Tasks              [Task tracking]
├── Reports            [Data export]
└── Settings           [Configuration]
```

---

## Common Tasks

### ➕ Add New Project
1. Click "Add New Project" button
2. Fill in details (name, budget, description)
3. Select status (Active, Completed, On Hold, Cancelled)
4. Click "Save"

### ➕ Add New User
1. Go to "Users" section
2. Click "Add New User"
3. Enter name, email, and role
4. Click "Save"

### ✏️ Edit Existing Item
1. Find the item in the list
2. Click the edit (pencil) icon
3. Modify details
4. Click "Save"

### 🗑️ Delete Item
1. Find the item in the list
2. Click the delete (trash) icon
3. Confirm deletion
4. Item will be removed

### 📥 Export Data
1. Go to "Reports" section
2. Click the desired export button
3. Choose format (CSV, PDF, Excel)
4. File will download automatically

---

## Troubleshooting

### Login fails
- Check if server is running
- Verify email and password are correct
- Clear browser cache

### Page not loading
- Check browser console (F12)
- Verify API endpoint is correct
- Check network tab for errors

### Data not showing
- Wait for page to load completely
- Refresh the page
- Check if you have admin role

---

## Default Credentials

```
Email:    admin@example.com
Password: Admin@123
Role:     Admin
Status:   Active
```

**⚠️ Change password immediately after first login!**

---

## Key Information

### Admin Console URL
- Login: `http://localhost:5000/admin/login.html`
- Dashboard: `http://localhost:5000/admin/index.html`

### API Base URL
- `http://localhost:5000/api`

### Database
- PostgreSQL connection string in `.env`
- Tables: users, projects, tasks, timesheets, etc.

### Authentication
- Token-based (JWT)
- Auto-logout after 24 hours
- Remember me option available

---

## File Locations

```
📁 admin-console/
  ├── index.html          (Main page)
  ├── app.jsx             (React component)
  ├── login.html          (Login page)
  └── admin-console-style.css

📁 server/routes/
  └── admin-routes.js     (API endpoints)

📁 docs/
  └── ADMIN_CONSOLE_COMPLETE.md
```

---

## Next Steps

1. **Login** to the admin console
2. **Create** a test project
3. **Add** some users
4. **Create** tasks for projects
5. **View** reports and statistics
6. **Customize** settings as needed

---

## Support

For detailed information, see:
- 📖 Full Documentation: `ADMIN_CONSOLE_COMPLETE.md`
- 🔌 API Routes: `server/routes/admin-routes.js`
- 🎨 Styles: `admin-console/admin-console-style.css`

---

**Version**: 1.0.0
**Status**: ✅ Production Ready
**Last Updated**: December 2024
