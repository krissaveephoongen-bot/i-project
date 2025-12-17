# Admin Console Deployment Checklist

## 🚀 Deployment Steps

### Phase 1: Pre-Deployment (Day 1)

#### Database Setup
- [ ] Verify PostgreSQL is running
- [ ] Create admin user:
```sql
INSERT INTO users (id, name, email, password, role, status, created_at)
VALUES (
  gen_random_uuid(),
  'Administrator',
  'admin@yourcompany.com',
  'SecurePassword@123',
  'admin',
  'active',
  NOW()
);
```
- [ ] Verify all required tables exist
- [ ] Run database migrations if needed
- [ ] Test database connection

#### Backend Setup
- [ ] Copy `server/routes/admin-routes.js` to your server directory
- [ ] Update `server/index.js` or main server file:
```javascript
// Add these lines
const adminRoutes = require('./routes/admin-routes');
const express = require('express');
const path = require('path');

// Mount routes (after middleware setup)
app.use('/api/admin', adminRoutes);
app.use('/api', adminRoutes);

// Serve admin console files
app.use('/admin', express.static(path.join(__dirname, '../admin-console')));
```
- [ ] Verify middleware are in correct order
- [ ] Test API endpoints with Postman or curl
- [ ] Check error logs for issues

#### Environment Configuration
- [ ] Create/update `.env` file with:
```
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=project_management
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRY=24h

# API
API_PORT=5000
NODE_ENV=development
API_TIMEOUT=30000

# Admin Console
ADMIN_ENABLED=true
```
- [ ] Never commit `.env` to repository
- [ ] Use different secrets for production

#### Frontend Setup
- [ ] Copy admin-console folder to project root
- [ ] Verify all files are present:
  - [ ] index.html
  - [ ] app.jsx
  - [ ] login.html
  - [ ] admin-console-style.css
- [ ] Check file paths in HTML
- [ ] Test in browser for 404 errors

---

### Phase 2: Testing (Day 2)

#### Functionality Testing
- [ ] **Login Test**
  - [ ] Test with correct credentials
  - [ ] Test with wrong password (should fail)
  - [ ] Test with non-existent email (should fail)
  - [ ] Test remember me checkbox
  - [ ] Test auto-logout

- [ ] **Dashboard Test**
  - [ ] Verify all stats load
  - [ ] Check stat cards display correct data
  - [ ] Verify recent projects list
  - [ ] Test responsive design (mobile, tablet, desktop)

- [ ] **Projects Page Test**
  - [ ] List all projects
  - [ ] Create new project (with all fields)
  - [ ] Edit existing project
  - [ ] Delete project (with confirmation)
  - [ ] Verify data persistence in database

- [ ] **Users Page Test**
  - [ ] List all users
  - [ ] Create new user
  - [ ] Edit user information
  - [ ] Verify role assignment
  - [ ] Test status changes

- [ ] **Tasks Page Test**
  - [ ] List all tasks
  - [ ] Create new task
  - [ ] Edit task details
  - [ ] Change task status
  - [ ] Set task priority

- [ ] **Reports Page Test**
  - [ ] Access reports section
  - [ ] Click report cards
  - [ ] Test CSV export
  - [ ] Test PDF export
  - [ ] Test Excel export

- [ ] **Settings Page Test**
  - [ ] Change app name
  - [ ] Change timezone
  - [ ] Change language
  - [ ] Toggle notifications
  - [ ] Toggle auto backup

#### API Testing
```bash
# Test login
curl -X POST http://localhost:5000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yourcompany.com","password":"SecurePassword@123"}'

# Test get projects (use token from login response)
curl -X GET http://localhost:5000/api/admin/projects \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test create project
curl -X POST http://localhost:5000/api/admin/projects \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Project","budget":100000,"status":"active"}'
```

#### Security Testing
- [ ] Test invalid token returns 401
- [ ] Test missing token returns 401
- [ ] Test non-admin user cannot access
- [ ] Test password is not logged
- [ ] Test CORS headers are correct
- [ ] Test SQL injection protection
- [ ] Test XSS protection (input validation)

#### Performance Testing
- [ ] Load dashboard with 1000+ projects
- [ ] Test pagination works
- [ ] Test sorting functionality
- [ ] Check page load time (<2 seconds)
- [ ] Monitor memory usage
- [ ] Check database query performance

---

### Phase 3: Production Preparation (Day 3)

#### Security Hardening
- [ ] Change default admin password
- [ ] Generate strong JWT_SECRET
```bash
# Generate random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure firewall rules
- [ ] Set up rate limiting:
```javascript
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/admin/auth/login', limiter);
```
- [ ] Implement CSRF protection if needed
- [ ] Add security headers:
```javascript
app.use(helmet()); // npm install helmet
```

#### Database Optimization
- [ ] Create indexes:
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_tasks_status ON tasks(status);
```
- [ ] Enable connection pooling
- [ ] Configure backup schedule
- [ ] Test backup/restore process
- [ ] Set up WAL (Write-Ahead Logging)

#### Monitoring Setup
- [ ] Set up error logging
- [ ] Configure log rotation
- [ ] Set up application monitoring (e.g., PM2)
```bash
npm install -g pm2
pm2 start server.js
pm2 save
pm2 startup
```
- [ ] Configure alerting for errors
- [ ] Monitor disk space
- [ ] Monitor memory usage
- [ ] Monitor database size

#### Backup Configuration
- [ ] Create automated backup script:
```bash
#!/bin/bash
# backup.sh
BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U postgres project_management > "$BACKUP_DIR/backup_$DATE.sql"
```
- [ ] Schedule daily backups
- [ ] Test restore procedure
- [ ] Store backups offsite
- [ ] Document backup procedure

---

### Phase 4: Deployment (Day 4)

#### Pre-Deployment Checklist
- [ ] All tests passed
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Backups verified
- [ ] Monitoring configured
- [ ] Team notified
- [ ] Rollback plan ready

#### Production Deployment
1. **Backup Database**
```bash
pg_dump -U postgres project_management > backup_pre_deployment.sql
```

2. **Update Server Files**
```bash
# Copy new files
cp -r admin-console /var/www/project-management/
cp server/routes/admin-routes.js /var/www/project-management/server/routes/
```

3. **Update Environment**
```bash
# Edit .env for production
nano /var/www/project-management/.env
# Set NODE_ENV=production
# Update database credentials
# Update JWT_SECRET
```

4. **Install Dependencies (if needed)**
```bash
cd /var/www/project-management
npm install --production
```

5. **Restart Server**
```bash
# Using PM2
pm2 restart all

# Or using systemd
systemctl restart nodejs

# Or using docker
docker restart project-management
```

6. **Verify Deployment**
- [ ] Check server is running
- [ ] Test login endpoint
- [ ] Check admin console loads
- [ ] Verify all pages work
- [ ] Check error logs

---

### Phase 5: Post-Deployment (Day 5)

#### Verification
- [ ] [ ] Monitor error logs for 24 hours
- [ ] [ ] Check system performance
- [ ] [ ] Verify backups are working
- [ ] [ ] User testing (have users test functionality)
- [ ] [ ] Load testing (simulate real traffic)

#### Documentation
- [ ] [ ] Document admin procedures
- [ ] [ ] Create admin user guide
- [ ] [ ] Document troubleshooting steps
- [ ] [ ] Create runbook for on-call
- [ ] [ ] Update system architecture docs

#### Communication
- [ ] [ ] Notify users of admin panel availability
- [ ] [ ] Send admin credentials securely
- [ ] [ ] Conduct admin training
- [ ] [ ] Provide support contact info
- [ ] [ ] Get feedback from admins

#### Maintenance Plan
- [ ] [ ] Schedule monthly security updates
- [ ] [ ] Plan quarterly feature reviews
- [ ] [ ] Set up performance monitoring alerts
- [ ] [ ] Create incident response plan
- [ ] [ ] Document admin responsibilities

---

## 🔒 Production Security Checklist

- [ ] HTTPS enabled (SSL/TLS)
- [ ] Strong JWT_SECRET configured
- [ ] Default credentials changed
- [ ] Database password strong
- [ ] Firewall configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] SQL injection prevention verified
- [ ] XSS protection enabled
- [ ] CSRF tokens implemented
- [ ] Security headers set
- [ ] Secrets not in git repository
- [ ] Access logs enabled
- [ ] Error logs secured
- [ ] Admin IP whitelisting considered

---

## 📊 Production Monitoring

### Key Metrics to Track
- [ ] API response time (target: <200ms)
- [ ] Database query time (target: <100ms)
- [ ] Error rate (target: <0.1%)
- [ ] Uptime (target: >99.9%)
- [ ] CPU usage (target: <70%)
- [ ] Memory usage (target: <80%)
- [ ] Disk usage (target: <85%)
- [ ] Active user count
- [ ] Request volume

### Monitoring Tools
- **PM2**: Process monitoring
- **New Relic**: APM
- **Datadog**: Infrastructure monitoring
- **ELK Stack**: Log aggregation
- **Grafana**: Metrics visualization

---

## 🚨 Rollback Plan

If deployment fails:

```bash
# Stop current server
pm2 stop all

# Restore database
psql -U postgres project_management < backup_pre_deployment.sql

# Restore previous code
git checkout previous-commit
npm install

# Restart server
pm2 start server.js

# Verify
curl http://localhost:5000/api/admin/auth/login
```

---

## 📋 Sign-Off Checklist

- [ ] **Development**: Code complete and tested
- [ ] **QA**: All tests passed
- [ ] **Security**: Security review passed
- [ ] **DevOps**: Deployment ready
- [ ] **Management**: Approval received
- [ ] **Users**: Notification sent
- [ ] **Documentation**: Updated

**Deployed By**: _________________
**Date**: _________________
**Approved By**: _________________

---

## 📞 Support During Deployment

- **Lead Developer**: [Contact Info]
- **DevOps**: [Contact Info]
- **Database Admin**: [Contact Info]
- **On-Call Engineer**: [Contact Info]

---

## 🎯 Success Criteria

- [ ] Admin console loads without errors
- [ ] All CRUD operations work
- [ ] Database queries perform well
- [ ] No security warnings
- [ ] Users can login successfully
- [ ] Reports generate correctly
- [ ] Exports work (CSV, PDF, Excel)
- [ ] Settings save properly
- [ ] Error logging works
- [ ] Monitoring is active

---

## 📝 Post-Deployment Report

**Deployment Date**: _______________
**Start Time**: _______________
**End Time**: _______________
**Duration**: _______________

**Issues Encountered**:
- Issue 1: _______________
- Issue 2: _______________

**Resolution**:
- Resolution 1: _______________
- Resolution 2: _______________

**Notes**:
_______________________________________________

**Signed Off By**: _________________

---

**Status**: ✅ Ready for Production
**Version**: 1.0.0
**Last Updated**: December 2024
