# API Deployment Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ database
- npm or yarn package manager
- Git for version control

## Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd project-mgnt
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
```bash
# Copy example env file
cp server/.env.example server/.env

# Edit with your configuration
nano server/.env
```

### 4. Create Database Tables
```bash
# Run migrations
npm run db:push

# Or run setup script
npm run setup:api
```

### 5. Start Server
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

---

## Database Setup

### Create Tables

The database migration file creates the following tables:

1. **files** - File management
2. **templates** - Project/task templates
3. **template_tasks** - Tasks within templates
4. **team_customization** - Team settings
5. **custom_workflows** - Custom workflows
6. **automation_rules** - Automation rules
7. **activity_log** - Activity tracking
8. **notifications** - User notifications
9. **audit_log** - Audit trail

### Run Migration

```bash
# Using provided script
npm run db:push

# Or manually
psql -U postgres -d your_database -f database/migrations/003-create-new-tables.sql
```

### Verify Tables

```bash
# Connect to database
psql -U postgres -d your_database

# List tables
\dt

# Check table structure
\d+ files
\d+ templates
\d+ automation_rules
```

---

## API Endpoints Verification

### Health Check
```bash
curl -X GET http://localhost:5000/api/health/db
```

### Test File Upload
```bash
curl -X POST http://localhost:5000/api/files \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "test-file.pdf",
    "size": 1024,
    "type": "application/pdf",
    "url": "file://path/to/file",
    "entityType": "project"
  }'
```

### Test Report Data
```bash
curl -X GET http://localhost:5000/api/reports/data \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### Test WebSocket
```bash
# Using wscat tool
npm install -g wscat

wscat -c "ws://localhost:5000/api/ws?token=<JWT_TOKEN>"

# Subscribe to events
{"type":"subscribe","payload":{"eventType":"task:update"}}

# Publish event
{"type":"publish","payload":{"eventType":"task:update","data":{"taskId":"123"}}}
```

---

## Production Deployment

### 1. Environment Configuration

```bash
# Set production environment
export NODE_ENV=production
export JWT_SECRET=<strong-random-secret>
export DATABASE_URL=postgresql://user:password@prod-host:5432/db
export CORS_ORIGIN=https://yourdomain.com
```

### 2. SSL/TLS Setup

For WebSocket over HTTPS:

```javascript
// In app.js
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('path/to/private-key.pem'),
  cert: fs.readFileSync('path/to/certificate.pem')
};

https.createServer(options, app).listen(443);
```

### 3. Reverse Proxy Setup (Nginx)

```nginx
upstream api_server {
  server localhost:5000;
}

server {
  listen 443 ssl http2;
  server_name api.yourdomain.com;

  ssl_certificate /path/to/certificate.pem;
  ssl_certificate_key /path/to/private-key.pem;

  # WebSocket support
  location /api/ws {
    proxy_pass http://api_server;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # WebSocket timeout settings
    proxy_read_timeout 3600s;
    proxy_send_timeout 3600s;
  }

  # Regular API requests
  location /api {
    proxy_pass http://api_server;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

### 4. Process Management (PM2)

```bash
# Install PM2
npm install -g pm2

# Create ecosystem config (ecosystem.config.js)
module.exports = {
  apps: [{
    name: 'api',
    script: './server/app.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};

# Start with PM2
pm2 start ecosystem.config.js

# View logs
pm2 logs

# Monitor
pm2 monit
```

### 5. Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "server/app.js"]
```

```bash
# Build image
docker build -t project-api:1.0 .

# Run container
docker run -d \
  --name project-api \
  -p 5000:5000 \
  -e DATABASE_URL=postgresql://... \
  -e JWT_SECRET=... \
  project-api:1.0
```

### 6. Database Backup

```bash
# Automated backup script
#!/bin/bash
BACKUP_DIR="/backups/database"
DATE=$(date +%Y%m%d_%H%M%S)

pg_dump $DATABASE_URL > $BACKUP_DIR/backup_$DATE.sql

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql" -mtime +30 -delete
```

### 7. Monitoring & Logging

```bash
# Using ELK Stack
# Elasticsearch, Logstash, Kibana

# Or using Winston logger
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

---

## Performance Optimization

### 1. Database Connection Pooling
```javascript
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### 2. Redis Caching
```bash
# Install Redis
npm install redis

# Cache report data
const client = redis.createClient();
const cachedData = await client.get('reports:data');
```

### 3. Query Optimization
- Add database indexes
- Use prepared statements
- Implement query caching
- Monitor slow queries

### 4. API Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## Security Checklist

- [ ] Change JWT_SECRET to strong random value
- [ ] Enable HTTPS/TLS
- [ ] Setup database password
- [ ] Enable database encryption
- [ ] Setup firewall rules
- [ ] Enable CORS for trusted origins only
- [ ] Implement rate limiting
- [ ] Setup DDoS protection
- [ ] Enable database backups
- [ ] Setup log monitoring
- [ ] Implement request validation
- [ ] Sanitize inputs

---

## Troubleshooting

### WebSocket Connection Issues
```javascript
// Check WebSocket logs
wss.on('error', (error) => {
  console.error('WebSocket error:', error);
});
```

### Database Connection Errors
```bash
# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### JWT Token Issues
```javascript
// Verify token
const decoded = jwt.verify(token, JWT_SECRET);
```

### File Upload Issues
```bash
# Check upload directory permissions
chmod 755 ./uploads

# Check file size limits
# Max file size: 50MB (configurable)
```

---

## Maintenance

### Regular Tasks
- Monitor disk space
- Review logs
- Update dependencies
- Backup database
- Monitor performance metrics
- Update security patches

### Useful Commands
```bash
# Check server status
pm2 status

# View real-time logs
pm2 logs

# Restart server
pm2 restart api

# Update dependencies
npm update

# Audit security
npm audit
```

---

## Support

For issues or questions:
1. Check logs: `pm2 logs`
2. Review documentation: `API_ENDPOINTS.md`
3. Test endpoints with curl or Postman
4. Check database connectivity
5. Verify environment variables

---

**Last Updated:** December 2025
**Version:** 2.0
