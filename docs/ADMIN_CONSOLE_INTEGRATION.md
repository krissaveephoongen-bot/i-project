# Admin Console Integration Guide

## Integration Steps

### Step 1: Add Routes to Server

Edit your main server file (e.g., `server.js` or `index.js`):

```javascript
// Import admin routes
const adminRoutes = require('./routes/admin-routes');

// Mount admin routes
app.use('/api/admin', adminRoutes);
app.use('/api', adminRoutes); // Also mount for standard endpoints

// Serve admin console static files
app.use('/admin', express.static(path.join(__dirname, '../admin-console')));
```

### Step 2: Update Middleware

Ensure your auth middleware is correct:

```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

const verifyAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

module.exports = { verifyToken, verifyAdmin };
```

### Step 3: Create Admin User

Run this SQL to create an admin user:

```sql
-- Create admin user
INSERT INTO users (id, name, email, password, role, status, created_at)
VALUES (
  gen_random_uuid(),
  'Admin User',
  'admin@example.com',
  'Admin@123',  -- Change this password
  'admin',
  'active',
  NOW()
);

-- Verify user was created
SELECT id, name, email, role, status FROM users WHERE email = 'admin@example.com';
```

### Step 4: Update Environment Variables

Add to `.env` file:

```env
# JWT Configuration
JWT_SECRET=your-secret-key-here
JWT_EXPIRY=24h

# API Configuration
API_BASE_URL=http://localhost:5000/api
API_TIMEOUT=30000

# Admin Console
ADMIN_PANEL_ENABLED=true
ADMIN_CONSOLE_PATH=/admin
```

### Step 5: Enable CORS (if needed)

```javascript
const cors = require('cors');

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true
}));
```

### Step 6: Test the Setup

1. Start your server:
```bash
npm start
# or
npm run dev
```

2. Navigate to admin console:
```
http://localhost:5000/admin/login.html
```

3. Login with:
   - Email: `admin@example.com`
   - Password: `Admin@123`

4. You should see the dashboard

---

## File Structure After Integration

```
project-mgnt/
├── admin-console/
│   ├── index.html                 ✅ Main page
│   ├── app.jsx                    ✅ React component
│   ├── login.html                 ✅ Login page
│   └── admin-console-style.css    ✅ Styles
├── server/
│   ├── middleware/
│   │   ├── auth.js               ✅ Auth middleware
│   │   └── error.js
│   ├── routes/
│   │   ├── admin-routes.js       ✅ Admin API routes
│   │   ├── project-routes.js
│   │   ├── user-routes.js
│   │   └── ...
│   ├── services/
│   │   ├── database.js
│   │   └── ...
│   └── index.js                  🔧 Update with admin routes
├── src/
│   ├── services/
│   │   ├── api-client.ts        ✅ API client
│   │   ├── teamService.ts
│   │   └── ...
│   └── ...
└── .env                          🔧 Add JWT config
```

---

## Database Tables Required

Ensure these tables exist:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'member',
  status VARCHAR(50) DEFAULT 'active',
  department VARCHAR(255),
  position VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active',
  budget DECIMAL(12, 2),
  progress INTEGER DEFAULT 0,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  project_id UUID,
  assignee UUID,
  status VARCHAR(50) DEFAULT 'todo',
  priority VARCHAR(50) DEFAULT 'medium',
  progress INTEGER DEFAULT 0,
  estimated_hours DECIMAL(6, 2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (assignee) REFERENCES users(id)
);

-- Timesheets table
CREATE TABLE timesheets (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  project_id UUID,
  task_id UUID,
  hours DECIMAL(6, 2),
  date DATE,
  status VARCHAR(50) DEFAULT 'submitted',
  created_at TIMESTAMP DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (task_id) REFERENCES tasks(id)
);
```

---

## API Endpoints Available

### Authentication
```
POST /api/admin/auth/login
  Body: { email, password }
  Response: { token, user }
```

### Projects
```
GET    /api/admin/projects         - Get all projects
POST   /api/admin/projects         - Create project
PUT    /api/admin/projects/:id     - Update project
DELETE /api/admin/projects/:id     - Delete project
```

### Users
```
GET    /api/admin/users            - Get all users
POST   /api/admin/users            - Create user
PUT    /api/admin/users/:id        - Update user
```

### Tasks
```
GET    /api/admin/tasks            - Get all tasks
POST   /api/admin/tasks            - Create task
PUT    /api/admin/tasks/:id        - Update task
```

### Statistics
```
GET    /api/admin/dashboard/stats  - Dashboard statistics
GET    /api/admin/statistics       - System statistics
```

---

## Testing the Integration

### 1. Test Login
```bash
curl -X POST http://localhost:5000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin@123"}'
```

### 2. Test Dashboard Stats
```bash
curl -X GET http://localhost:5000/api/admin/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Test Project Creation
```bash
curl -X POST http://localhost:5000/api/admin/projects \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Project","budget":50000,"status":"active"}'
```

---

## Troubleshooting Integration

### Issue: Routes not found (404)
**Solution**: 
- Check routes are imported in server file
- Verify route path is correct
- Check middleware order

### Issue: Authentication fails
**Solution**:
- Verify JWT_SECRET is set in .env
- Check user exists in database
- Verify token format in Authorization header

### Issue: CORS errors
**Solution**:
- Enable CORS middleware
- Add correct origins to CORS config
- Check preflight requests

### Issue: Database errors
**Solution**:
- Verify database connection
- Check tables exist with correct schema
- Review error logs

---

## Production Checklist

- [ ] Change default admin password
- [ ] Set secure JWT_SECRET in .env
- [ ] Enable HTTPS
- [ ] Configure database backups
- [ ] Set up error logging
- [ ] Enable rate limiting
- [ ] Configure email notifications
- [ ] Set up monitoring/alerts
- [ ] Review security audit
- [ ] Test all features
- [ ] Create admin backup user
- [ ] Document admin procedures
- [ ] Set up user onboarding

---

## Performance Tips

1. **Database Indexes**
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_tasks_status ON tasks(status);
```

2. **API Pagination**
- Implement limit/offset in list endpoints
- Cache frequently accessed data
- Use connection pooling

3. **Frontend Optimization**
- Lazy load components
- Minimize re-renders
- Cache API responses
- Use compression

---

## Security Considerations

1. **Password Policy**
   - Minimum 8 characters
   - Uppercase and lowercase
   - Numbers and special characters
   - Change on first login

2. **Access Control**
   - Only admin users can access console
   - Verify token on every request
   - Log all admin actions
   - Implement role-based permissions

3. **Data Protection**
   - Use HTTPS only
   - Encrypt sensitive data
   - Regular backups
   - Data retention policies

---

## Maintenance Tasks

### Daily
- Monitor error logs
- Check disk space
- Verify backups completed

### Weekly
- Review user activity
- Check performance metrics
- Update security patches

### Monthly
- Database optimization
- User access review
- Capacity planning

---

## Support & Contact

For issues:
1. Check error logs: `logs/` directory
2. Review API responses
3. Check browser console (F12)
4. Contact system administrator

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Status**: ✅ Ready for Production
