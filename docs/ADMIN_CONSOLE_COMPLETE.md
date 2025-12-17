# Admin Console - Complete Documentation

## Overview
A fully functional, modern Admin Console for the Project Management System with complete CRUD operations and system management features.

## Features Included

### 1. **Dashboard**
- Real-time statistics overview
- Project status summary
- User activity metrics
- Budget tracking
- Recent projects display
- Quick access widgets

### 2. **Project Management**
- ✅ View all projects
- ✅ Create new projects
- ✅ Edit project details
- ✅ Delete projects
- ✅ Filter by status
- ✅ Budget tracking
- ✅ Progress monitoring

### 3. **User Management**
- ✅ View all users
- ✅ Create new users
- ✅ Edit user information
- ✅ Manage user roles
- ✅ User status management
- ✅ Department assignment

### 4. **Task Management**
- ✅ View all tasks
- ✅ Create tasks
- ✅ Update task status
- ✅ Set priorities
- ✅ Track progress
- ✅ Assign team members

### 5. **Reports**
- ✅ Project reports
- ✅ User analytics
- ✅ Task statistics
- ✅ Budget reports
- ✅ Export to CSV
- ✅ Export to PDF
- ✅ Export to Excel

### 6. **System Settings**
- ✅ Application configuration
- ✅ Timezone settings
- ✅ Language preferences
- ✅ Email notifications
- ✅ Auto backup settings
- ✅ System maintenance

## Project Structure

```
admin-console/
├── index.html              # Main admin console page
├── app.jsx                 # React admin app (complete)
├── login.html              # Admin login page
├── components/
│   └── AdminSidebar.js     # Sidebar component
├── utils/
│   ├── auth.js             # Authentication utilities
│   └── api.js              # API client
├── admin-console-style.css # Global styles
└── docs/                   # Documentation files
```

## Installation & Setup

### Prerequisites
- Node.js 16+
- PostgreSQL 12+
- npm or yarn

### Step 1: Install Dependencies
```bash
cd project-mgnt
npm install
```

### Step 2: Create Admin Routes
Routes are already created in `/server/routes/admin-routes.js`

Add to your main server file:
```javascript
const adminRoutes = require('./routes/admin-routes');
app.use('/api/admin', adminRoutes);
app.use('/api', adminRoutes); // For standard endpoints
```

### Step 3: Create Admin User
```sql
INSERT INTO users (id, name, email, password, role, status)
VALUES (gen_random_uuid(), 'Admin User', 'admin@example.com', 'Admin@123', 'admin', 'active');
```

### Step 4: Access Admin Console
1. Navigate to: `http://localhost:5000/admin/login.html`
2. Login with admin@example.com / Admin@123
3. You will be redirected to `/admin/index.html`

## Usage Guide

### Dashboard
The dashboard displays:
- **Stats Cards**: Total projects, active projects, total users, active users, pending approvals, total budget
- **Project Status**: Summary of projects by status
- **Recent Projects**: List of latest 10 projects
- **Quick Stats**: Key metrics at a glance

### Project Management
1. **View Projects**: All projects are listed in a table
2. **Create Project**: Click "Add New Project" button
   - Enter project name
   - Add description
   - Set budget
   - Choose status (Active, Completed, On Hold, Cancelled)
3. **Edit Project**: Click edit icon next to project
4. **Delete Project**: Click delete icon (confirmation required)

### User Management
1. **View Users**: All users listed with roles and status
2. **Create User**: Click "Add New User"
   - Enter name
   - Enter email
   - Select role (Member, Manager, Admin)
3. **Edit User**: Click edit icon
4. **User Roles**:
   - Admin: Full system access
   - Manager: Project and user management
   - Member: Basic access

### Task Management
1. **View Tasks**: All system tasks in a table
2. **Create Task**: Click "Add New Task"
   - Task name (required)
   - Description
   - Status (To Do, In Progress, Completed)
   - Priority (Low, Medium, High)
3. **Edit Task**: Click edit icon
4. **Track Progress**: Visual progress indicators

### Reports Section
- Click on report cards to view detailed reports
- Export options:
  - **CSV**: For spreadsheet applications
  - **PDF**: For printing and sharing
  - **Excel**: For advanced analysis

### Settings
Configure application behavior:
- **Application Name**: Customize system name
- **Timezone**: Set timezone (Bangkok, Ho Chi Minh, UTC)
- **Language**: Thai or English
- **Email Notifications**: Enable/disable
- **Auto Backup**: Enable/disable automatic backups

## API Endpoints

### Authentication
```
POST /api/admin/auth/login
- Email: admin@example.com
- Password: Admin@123
- Returns: JWT token
```

### Projects
```
GET /api/admin/projects                    # Get all projects
POST /api/admin/projects                   # Create project
PUT /api/admin/projects/:id                # Update project
DELETE /api/admin/projects/:id             # Delete project
```

### Users
```
GET /api/admin/users                       # Get all users
POST /api/admin/users                      # Create user
PUT /api/admin/users/:id                   # Update user
```

### Tasks
```
GET /api/admin/tasks                       # Get all tasks
POST /api/admin/tasks                      # Create task
PUT /api/admin/tasks/:id                   # Update task
```

### Statistics
```
GET /api/admin/dashboard/stats             # Dashboard statistics
GET /api/admin/statistics                  # System statistics
```

## Authentication & Security

### Token Storage
- Tokens stored in localStorage (remember me) or sessionStorage
- Automatically included in all API requests
- Auto logout on 401 response

### Role-Based Access
- Only admin users can access console
- Non-admin users redirected to login
- Invalid tokens cleared automatically

### Session Management
- Auto-logout after 24 hours
- Manual logout available
- Remember me functionality

## Features Implementation

### Alert System
```javascript
// Success
<Alert type="success" message="操作成功" onClose={handleClose} />

// Error
<Alert type="error" message="错误信息" onClose={handleClose} />

// Warning
<Alert type="warning" message="警告信息" onClose={handleClose} />
```

### Loading States
All pages show loading spinners while fetching data

### Form Validation
- Email validation
- Required field validation
- Number format validation
- Date validation

### Responsive Design
- Mobile-friendly layout
- Tablet optimized
- Desktop full features
- Sidebar collapsible on mobile

## Styling & Theming

### Color Scheme
- Primary: #3B82F6 (Blue)
- Secondary: #10B981 (Green)
- Warning: #F59E0B (Amber)
- Danger: #EF4444 (Red)

### Components Styled
- Stat cards with hover effects
- Tables with alternating rows
- Modals with animations
- Buttons with states
- Forms with focus states

## Troubleshooting

### Login Issues
1. Check if admin user exists in database
2. Verify email and password
3. Check browser console for errors
4. Clear localStorage/sessionStorage

### API Errors
1. Verify server is running on correct port
2. Check API endpoint URLs
3. Verify authentication token is valid
4. Check database connection

### Display Issues
1. Clear browser cache
2. Try different browser
3. Check browser console for errors
4. Verify CSS is loaded

## Performance Optimization

- Data pagination (100 items max per request)
- Lazy loading of components
- Optimized re-renders with React
- Debounced search and filters
- Cached API responses

## Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Future Enhancements
- [ ] Advanced filtering and search
- [ ] Data visualization charts
- [ ] Batch operations
- [ ] Activity logging
- [ ] User audit trail
- [ ] Email notifications
- [ ] SMS alerts
- [ ] Two-factor authentication
- [ ] Role-based permissions customization
- [ ] Custom dashboard widgets

## Support & Maintenance

### Regular Maintenance
- Check logs regularly
- Monitor database performance
- Update dependencies
- Review security patches

### Common Tasks
1. **Backup Database**: Use pg_dump
2. **Clear Cache**: Browser DevTools
3. **Reset Admin Password**: Database SQL
4. **Export Data**: Use Reports section

## File Structure

```
project-mgnt/
├── admin-console/
│   ├── index.html           # Main page
│   ├── app.jsx              # React component
│   ├── login.html           # Login page
│   └── styles/              # CSS files
├── server/
│   └── routes/
│       └── admin-routes.js  # API routes
└── docs/
    └── ADMIN_CONSOLE_COMPLETE.md  # This file
```

## Quick Links
- **Admin Login**: `/admin/login.html`
- **Admin Dashboard**: `/admin/index.html`
- **API Documentation**: `/api/docs`
- **Database Schema**: `/docs/DATABASE.md`

## Version History
- **v1.0.0**: Initial release
  - Complete dashboard
  - Project management
  - User management
  - Task management
  - Reports
  - Settings

## Contact & Support
For issues or questions:
1. Check documentation
2. Review API responses
3. Check browser console
4. Contact system administrator

---
**Last Updated**: December 2024
**Status**: Production Ready
**License**: MIT
