# Testing Authentication & Live Connections Guide

This document provides detailed instructions for testing the authentication system with real database connections.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Test Environment Setup](#test-environment-setup)
3. [Manual Testing](#manual-testing)
4. [Automated Testing](#automated-testing)
5. [Real Connection Tests](#real-connection-tests)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

```bash
# Node.js and npm
node --version  # v16 or higher
npm --version   # v8 or higher

# PostgreSQL
psql --version  # v12 or higher

# Tools (optional but helpful)
curl            # For HTTP testing
jq              # For JSON formatting
```

### Setup Steps

```bash
# 1. Clone/navigate to project
cd /path/to/project-mgnt

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env

# 4. Update .env with your database credentials
# Edit .env with your values

# 5. Verify database connection
npm run db:test

# 6. Start the server
npm run server

# 7. In another terminal, start frontend
npm run dev
```

---

## Test Environment Setup

### Create Test Database

```bash
# Connect to PostgreSQL
psql -U postgres -h localhost

# Create test database
CREATE DATABASE test_project_mgnt;

# Connect to test database
\c test_project_mgnt

# Create tables (run schema.sql or use Prisma)
npx prisma migrate deploy --skip-generate
```

### Create Test Users

```bash
# Using psql
psql -U postgres -h localhost -d project_mgnt

-- Create test admin user
INSERT INTO users (name, email, password, role, status)
VALUES (
  'Admin Test',
  'admin@test.com',
  '$2a$10$...',  -- bcryptjs hash of "password123"
  'admin',
  'active'
);

-- Create test manager
INSERT INTO users (name, email, password, role, status)
VALUES (
  'Manager Test',
  'manager@test.com',
  '$2a$10$...',
  'manager',
  'active'
);

-- Create test member
INSERT INTO users (name, email, password, role, status)
VALUES (
  'Member Test',
  'member@test.com',
  '$2a$10$...',
  'member',
  'active'
);
```

### Generate Password Hashes

```bash
# Create a quick Node script
node -e "
const bcryptjs = require('bcryptjs');
const password = 'password123';
bcryptjs.hash(password, 10).then(hash => {
  console.log('Password hash:', hash);
});
"
```

---

## Manual Testing

### Test 1: Login with Valid Credentials

```bash
# Step 1: Get admin token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "password123"
  }' | jq .

# Expected response:
# {
#   "success": true,
#   "message": "Login successful",
#   "token": "eyJhbGciOiJIUzI1NiIs...",
#   "user": {
#     "id": "uuid-here",
#     "name": "Admin Test",
#     "email": "admin@test.com",
#     "role": "admin"
#   }
# }

# Step 2: Store token for later use
export ADMIN_TOKEN="<token-from-response>"
echo "Token: $ADMIN_TOKEN"
```

### Test 2: Verify Token

```bash
# Verify the token is valid
curl -X POST http://localhost:3000/auth/verify \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" | jq .

# Expected response:
# {
#   "success": true,
#   "message": "Token is valid",
#   "user": {
#     "id": "uuid-here",
#     "email": "admin@test.com",
#     "role": "admin",
#     "name": "Admin Test"
#   }
# }
```

### Test 3: Get User Profile

```bash
# Fetch authenticated user's profile
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" | jq .

# Expected response:
# {
#   "success": true,
#   "data": {
#     "id": "uuid",
#     "name": "Admin Test",
#     "email": "admin@test.com",
#     "role": "admin",
#     "department": null,
#     "position": null,
#     "phone": null,
#     "status": "active",
#     "created_at": "2024-01-15T10:30:00Z"
#   }
# }
```

### Test 4: Update Profile

```bash
# Update user profile
curl -X PUT http://localhost:3000/auth/profile \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin Test Updated",
    "department": "Engineering",
    "phone": "+1-555-0123"
  }' | jq .

# Expected response: 200 with updated user
```

### Test 5: Change Password

```bash
# Change password
curl -X PUT http://localhost:3000/auth/password \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "password123",
    "newPassword": "newpassword456"
  }' | jq .

# Expected response:
# {
#   "success": true,
#   "message": "Password changed successfully"
# }

# Now you can login with new password
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "newpassword456"
  }' | jq .
```

### Test 6: Test Role-Based Access

```bash
# Try accessing admin endpoint with manager token
export MANAGER_TOKEN="<token-for-manager-user>"

curl -X GET http://localhost:3000/api/admin/dashboard \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" | jq .

# Expected response: 403 Forbidden
# {
#   "success": false,
#   "message": "Admin access required"
# }
```

### Test 7: Test Invalid Token

```bash
# Try with invalid token
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer invalid.token.here" \
  -H "Content-Type: application/json" | jq .

# Expected response: 403 Forbidden
# {
#   "success": false,
#   "message": "Invalid or expired token"
# }
```

### Test 8: Test Missing Token

```bash
# Try without token
curl -X GET http://localhost:3000/auth/profile \
  -H "Content-Type: application/json" | jq .

# Expected response: 401 Unauthorized
# {
#   "success": false,
#   "message": "No token provided. Please login first."
# }
```

### Test 9: Test Login with Invalid Credentials

```bash
# Try wrong password
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "wrongpassword"
  }' | jq .

# Expected response: 401 Unauthorized
# {
#   "success": false,
#   "message": "Invalid email or password"
# }
```

### Test 10: Test PIN Verification

```bash
# Verify with correct PIN
curl -X POST http://localhost:3000/auth/pin-verify \
  -H "Content-Type: application/json" \
  -d '{
    "pin": "123456"
  }' | jq .

# Expected response: 200 with admin token
# {
#   "success": true,
#   "message": "PIN verification successful",
#   "token": "eyJhbGciOiJIUzI1NiIs...",
#   "user": {
#     "id": "admin-session",
#     "name": "Admin",
#     "role": "admin"
#   }
# }
```

### Test 11: Test Logout

```bash
# Logout (requires token)
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" | jq .

# Expected response: 200
# {
#   "success": true,
#   "message": "Logout successful"
# }

# Note: Client should remove token from localStorage
```

---

## Automated Testing

### Run Test Suite

```bash
# Run the authentication test script
npm run db:test

# Or with npx
npx tsx scripts/test-auth-connection.ts

# Expected output:
# 🚀 Starting Authentication & Connection Tests
# 📍 API Base URL: http://localhost:3000
# ...
# 📊 TEST RESULTS SUMMARY
# ✅ 1. Login with valid credentials
# ✅ 2. Login with invalid credentials
# ...
# 📈 Summary: 8 passed, 0 failed, 0 skipped
```

### Create Custom Test Suite

```bash
# Create test file
cat > tests/auth-integration.test.ts << 'EOF'
import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';

const API_URL = 'http://localhost:3000';
let adminToken: string;
let managerToken: string;

describe('Authentication Integration Tests', () => {
  beforeAll(async () => {
    // Login as admin
    const adminRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@test.com',
      password: 'password123'
    });
    adminToken = adminRes.data.token;

    // Login as manager
    const managerRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'manager@test.com',
      password: 'password123'
    });
    managerToken = managerRes.data.token;
  });

  it('should login successfully', async () => {
    const res = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@test.com',
      password: 'password123'
    });

    expect(res.status).toBe(200);
    expect(res.data.token).toBeDefined();
    expect(res.data.user.role).toBe('admin');
  });

  it('should verify token', async () => {
    const res = await axios.post(
      `${API_URL}/auth/verify`,
      {},
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );

    expect(res.status).toBe(200);
    expect(res.data.user).toBeDefined();
  });

  it('should reject invalid token', async () => {
    try {
      await axios.post(
        `${API_URL}/auth/verify`,
        {},
        {
          headers: { Authorization: 'Bearer invalid' }
        }
      );
      expect.fail('Should have rejected');
    } catch (error: any) {
      expect(error.response.status).toBe(403);
    }
  });

  it('should deny manager access to admin endpoint', async () => {
    try {
      await axios.get(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${managerToken}` }
      });
      expect.fail('Should have denied access');
    } catch (error: any) {
      expect(error.response.status).toBe(403);
    }
  });

  it('should allow admin access to admin endpoint', async () => {
    const res = await axios.get(`${API_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    expect(res.status).toBe(200);
  });
});
EOF

# Run test
npm run test -- tests/auth-integration.test.ts
```

---

## Real Connection Tests

### Test Database Connection

```bash
# Check if database is running
psql -U postgres -h localhost -d project_mgnt -c "SELECT version();"

# Expected output: PostgreSQL version info

# Check if users table exists
psql -U postgres -h localhost -d project_mgnt -c "SELECT COUNT(*) FROM users;"

# Expected output: (count) - number of users
```

### Test Backend API

```bash
# Check if backend is running
curl http://localhost:3000/health 2>/dev/null || echo "Server not responding"

# Should return health check info (if endpoint exists)
```

### Test Frontend

```bash
# Check if frontend is running
curl http://localhost:5173/index.html 2>/dev/null | head -1

# Should return HTML content
```

### Test End-to-End Flow

```bash
#!/bin/bash

API_URL="http://localhost:3000"

echo "🔄 Testing End-to-End Authentication Flow"
echo "=========================================="

# Step 1: Login
echo "1️⃣ Testing login..."
LOGIN_RESPONSE=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "password123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')
if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "❌ Login failed"
  exit 1
fi

echo "✅ Login successful: $TOKEN"

# Step 2: Verify token
echo -e "\n2️⃣ Testing token verification..."
VERIFY_RESPONSE=$(curl -s -X POST $API_URL/auth/verify \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

if echo $VERIFY_RESPONSE | jq -e '.success' > /dev/null; then
  echo "✅ Token verified"
else
  echo "❌ Token verification failed"
  exit 1
fi

# Step 3: Get profile
echo -e "\n3️⃣ Testing profile retrieval..."
PROFILE_RESPONSE=$(curl -s -X GET $API_URL/auth/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

USER_NAME=$(echo $PROFILE_RESPONSE | jq -r '.data.name')
if [ ! -z "$USER_NAME" ]; then
  echo "✅ Profile retrieved: $USER_NAME"
else
  echo "❌ Profile retrieval failed"
  exit 1
fi

# Step 4: Logout
echo -e "\n4️⃣ Testing logout..."
LOGOUT_RESPONSE=$(curl -s -X POST $API_URL/auth/logout \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

if echo $LOGOUT_RESPONSE | jq -e '.success' > /dev/null; then
  echo "✅ Logout successful"
else
  echo "❌ Logout failed"
  exit 1
fi

echo -e "\n✨ All tests passed!"
```

Save as `test-e2e.sh` and run:

```bash
chmod +x test-e2e.sh
./test-e2e.sh
```

---

## Troubleshooting

### Connection Refused

**Issue**: Cannot connect to backend server

**Solution**:
```bash
# 1. Check if server is running
ps aux | grep node

# 2. Check if port 3000 is in use
lsof -i :3000

# 3. Start server
npm run server

# 4. Verify server started
curl http://localhost:3000/health
```

### Database Connection Error

**Issue**: Cannot connect to PostgreSQL

**Solution**:
```bash
# 1. Check if PostgreSQL is running
psql -U postgres -h localhost -c "SELECT 1;"

# 2. Verify connection string in .env
cat .env | grep DATABASE_URL

# 3. Test connection directly
psql "postgresql://user:password@localhost:5432/database"

# 4. Check database exists
psql -U postgres -c "\l" | grep project_mgnt
```

### Invalid Token Error

**Issue**: "Invalid or expired token"

**Solution**:
```bash
# 1. Check token format
# Should start with "eyJ"
echo $TOKEN | cut -c1-3

# 2. Verify token is recent (24h old max)
npm run db:test

# 3. Get new token
curl -X POST http://localhost:3000/auth/login ...
```

### Permission Denied Error

**Issue**: "Insufficient permissions"

**Solution**:
```bash
# 1. Check user role in database
psql -U postgres -d project_mgnt -c "SELECT email, role FROM users WHERE email = 'admin@test.com';"

# 2. Update user role if needed
psql -U postgres -d project_mgnt -c "UPDATE users SET role = 'admin' WHERE email = 'admin@test.com';"

# 3. Login again to get new token with updated role
```

### Password Hash Issues

**Issue**: Cannot login with correct password

**Solution**:
```bash
# 1. Check if password is hashed
psql -U postgres -d project_mgnt -c "SELECT email, password FROM users LIMIT 1;"

# 2. If not hashed (doesn't start with $2a$), hash it
node -e "
const bcryptjs = require('bcryptjs');
bcryptjs.hash('password123', 10).then(hash => {
  console.log('UPDATE users SET password = \'' + hash + '\' WHERE email = \'admin@test.com\';');
});
"

# 3. Copy and paste the UPDATE statement into psql
```

---

## Monitoring & Logs

### View Backend Logs

```bash
# See all logs
npm run server 2>&1

# Filter auth-related logs
npm run server 2>&1 | grep -i auth

# Filter errors
npm run server 2>&1 | grep -i error
```

### View Database Activity

```bash
# Check recent login activity
psql -U postgres -d project_mgnt -c "
SELECT user_id, action, description, created_at 
FROM activity_logs 
WHERE action LIKE 'login%' 
ORDER BY created_at DESC 
LIMIT 10;"

# Check failed login attempts
psql -U postgres -d project_mgnt -c "
SELECT user_id, COUNT(*) as attempts 
FROM activity_logs 
WHERE action = 'login_failed' 
AND created_at > NOW() - INTERVAL '1 hour'
GROUP BY user_id;"
```

---

## Performance Testing

### Load Testing

```bash
# Install Apache Bench
apt-get install apache2-utils

# Test login endpoint (100 requests, 10 concurrent)
ab -n 100 -c 10 -T application/json \
  -p login.json \
  http://localhost:3000/auth/login

# Test protected endpoint (with token)
ab -n 100 -c 10 \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/auth/profile
```

### Response Time Measurement

```bash
# Measure login response time
time curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "password123"
  }' > /dev/null

# Expected: < 500ms for typical connection
```

---

## Cleanup

```bash
# Remove test data
psql -U postgres -d project_mgnt -c "
DELETE FROM activity_logs 
WHERE created_at < NOW() - INTERVAL '7 days';"

# Reset user status
psql -U postgres -d project_mgnt -c "
UPDATE users SET status = 'active' 
WHERE is_deleted = false;"

# Backup database
pg_dump project_mgnt > backup.sql
```

---

## Summary Checklist

- [ ] PostgreSQL running and database created
- [ ] Test users created with correct passwords
- [ ] Backend server running on port 3000
- [ ] Frontend running on port 5173
- [ ] All manual tests passing
- [ ] Automated test script passing
- [ ] E2E flow working end-to-end
- [ ] Logs showing expected activity
- [ ] No errors in console
- [ ] Response times acceptable

---

**Last Updated**: December 2024
**Version**: 1.0
