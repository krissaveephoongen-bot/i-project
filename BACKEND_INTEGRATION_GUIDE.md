# Backend Integration Guide - Timesheet & Leave API

**Status:** API Routes Created ✅  
**Date:** February 15, 2026  
**Files:** 2 route files + 1 index file

---

## 📦 Files Created

1. **`backend/src/routes/timesheet.routes.ts`** (11 endpoints)
2. **`backend/src/routes/leave.routes.ts`** (9 endpoints)
3. **`backend/src/routes/index.ts`** (main index file)

---

## 🔌 How to Integrate Into Express App

### Step 1: Import Routes in Your App

In `backend/src/app.ts` or your main Express file:

```typescript
import apiRoutes from './routes';

// Mount API routes
app.use('/api', apiRoutes);
```

### Step 2: Ensure Auth Middleware is Configured

The routes expect `req.user` to be set by your auth middleware. Make sure your auth middleware runs BEFORE the routes:

```typescript
// Auth middleware (must run before routes)
app.use(authenticateToken); // or whatever your auth middleware is called
app.use(requireAuth); // optional: require auth for all /api routes

// Routes (after auth middleware)
app.use('/api', apiRoutes);
```

### Step 3: Ensure Prisma Client is Imported

The services use Prisma. Make sure it's properly initialized:

```typescript
import { PrismaClient } from '@prisma/client';

// In services, it's already imported:
const prisma = new PrismaClient();
```

---

## 📍 API Endpoints Available

### Timesheet Endpoints

```
POST   /api/timesheet/entries
GET    /api/timesheet/entries
GET    /api/timesheet/entries/:id
PUT    /api/timesheet/entries/:id
DELETE /api/timesheet/entries/:id

POST   /api/timesheet/entries/:id/approve
POST   /api/timesheet/entries/:id/reject

POST   /api/timesheet/entries/:id/comments
GET    /api/timesheet/entries/:id/comments

GET    /api/timesheet/hours/monthly
GET    /api/timesheet/hours/project/:projectId
```

### Leave Endpoints

```
POST   /api/leave/requests
GET    /api/leave/requests
GET    /api/leave/requests/:id
PUT    /api/leave/requests/:id
DELETE /api/leave/requests/:id

POST   /api/leave/requests/:id/approve
POST   /api/leave/requests/:id/reject
GET    /api/leave/for-approval

GET    /api/leave/allocations/:year
PUT    /api/leave/allocations/:year
GET    /api/leave/allocations/:year/balance
```

---

## 🧪 Testing with cURL

### Create Time Entry
```bash
curl -X POST http://localhost:3001/api/timesheet/entries \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "date": "2024-02-15",
    "startTime": "09:00",
    "endTime": "17:00",
    "breakDuration": 60,
    "workType": "project",
    "projectId": "proj-123",
    "description": "Development work"
  }'
```

### Get Monthly Hours
```bash
curl -X GET "http://localhost:3001/api/timesheet/hours/monthly?month=2&year=2024" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Approve Time Entry
```bash
curl -X POST http://localhost:3001/api/timesheet/entries/entry-123/approve \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Leave Request
```bash
curl -X POST http://localhost:3001/api/leave/requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "startDate": "2024-12-25",
    "endDate": "2024-12-27",
    "leaveType": "annual",
    "reason": "Holiday break"
  }'
```

### Get Leave Balance
```bash
curl -X GET "http://localhost:3001/api/leave/allocations/2024/balance" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 Request/Response Examples

### Create Time Entry Request
```json
POST /api/timesheet/entries
{
  "date": "2024-02-15",
  "startTime": "09:00",
  "endTime": "17:00",
  "breakDuration": 60,
  "workType": "project",
  "projectId": "proj-123",
  "taskId": "task-456",
  "description": "Development work"
}
```

### Create Time Entry Response (201)
```json
{
  "success": true,
  "data": {
    "id": "entry-789",
    "date": "2024-02-15",
    "startTime": "09:00",
    "endTime": "17:00",
    "breakDuration": 60,
    "workType": "project",
    "projectId": "proj-123",
    "taskId": "task-456",
    "userId": "user-123",
    "hours": 7,
    "billableHours": 7,
    "description": "Development work",
    "status": "pending",
    "approvedBy": null,
    "approvedAt": null,
    "rejectedReason": null,
    "createdAt": "2024-02-15T10:00:00Z",
    "updatedAt": "2024-02-15T10:00:00Z"
  },
  "message": "Time entry created successfully"
}
```

### Error Response (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "details": {
    "startTime": "Start time must be in HH:mm format (00:00-23:59)",
    "endTime": "End time must be after start time"
  }
}
```

### Unauthorized Response (401)
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### Forbidden Response (403)
```json
{
  "success": false,
  "message": "Only managers can approve time entries"
}
```

---

## 🔐 Authorization Rules

### Time Entry Access
- **Create:** Any authenticated user (for themselves)
- **Read:** Owner, managers, admins
- **Update:** Owner or admin (pending/rejected only)
- **Delete:** Owner or admin (pending/rejected only)
- **Approve:** Managers, admins only
- **Reject:** Managers, admins only

### Leave Request Access
- **Create:** Any authenticated user (for themselves)
- **Read:** Owner, managers, admins
- **Approve:** Managers, admins only
- **Reject:** Managers, admins only
- **View Pending:** Managers, admins (for-approval endpoint)

### Allocation Access
- **Read:** Owner, admins
- **Update:** Admins only

---

## 🚨 Error Codes

| Status | Code | Meaning |
|--------|------|---------|
| 201 | Success | Created successfully |
| 200 | Success | Operation successful |
| 400 | Bad Request | Validation failed |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Not authorized to access |
| 404 | Not Found | Resource not found |
| 500 | Server Error | Internal server error |

---

## 💾 Database Constraints

The API routes respect all database constraints:

- Foreign key validation (user, project, task)
- Status constraints (pending, approved, rejected, etc.)
- Date validations (past dates, future dates)
- Hour calculations (breakDuration cannot exceed total time)
- Balance tracking (leave hours checked before approval)

---

## 🧩 How Routes Use Services

```
Client Request
    ↓
Express Route Handler
    ↓
Validate Auth (req.user)
    ↓
Extract Request Data
    ↓
Call Service Method
    ↓
Service Validates Input
    ↓
Service Interacts with Database
    ↓
Service Returns Data
    ↓
Route Formats Response
    ↓
Send Response to Client
```

Each layer (route, service) handles different concerns:
- **Routes:** HTTP concerns (status codes, headers)
- **Services:** Business logic (validation, calculations)
- **Database:** Data persistence

---

## 🔧 Middleware Configuration

Your Express app should have this middleware order:

```typescript
import express from 'express';
import apiRoutes from './routes';

const app = express();

// 1. Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Logging (optional)
app.use(logger);

// 3. Authentication ⭐ IMPORTANT
app.use(authenticateToken);

// 4. API Routes
app.use('/api', apiRoutes);

// 5. Error handling (last)
app.use(errorHandler);

export default app;
```

---

## 📝 Request Validation

All requests are validated by services:

1. **Format Validation:** HH:mm time format, ISO dates
2. **Range Validation:** startTime < endTime, valid break duration
3. **Business Logic:** Leave balance, status constraints
4. **Authorization:** User ownership, role-based access

Validation errors return 400 with detailed error messages.

---

## 🎯 Common Integration Tasks

### Add Timesheet Routes
```typescript
// In app.ts
import apiRoutes from './routes';
app.use('/api', apiRoutes); // Already includes timesheet routes
```

### Add Custom Middleware
```typescript
// In timesheet.routes.ts
router.use(requireManagerRole); // Add before manager-only routes
```

### Change Base URL
```typescript
// In app.ts
app.use('/api/v2', apiRoutes); // Changes base from /api to /api/v2
```

### Add Request Logging
```typescript
// In app.ts
app.use('/api', (req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
}, apiRoutes);
```

---

## 🐛 Debugging Tips

1. **Check Auth:** Ensure `req.user.id` is set in middleware
2. **Check Database:** Verify Prisma can connect to PostgreSQL
3. **Check Status Codes:** Review error responses for details
4. **Check Logs:** Server logs show service-level errors
5. **Test Endpoints:** Use cURL or Postman to test individually

---

## 🚀 Next Steps

After integrating routes:

1. **Test each endpoint** with sample data
2. **Create frontend types** (Task 3)
3. **Create frontend services** (Task 4)
4. **Create React hooks** (Task 5)
5. **Build UI components** (Phase 2)

---

## 📞 Quick Reference

| Need | Location |
|------|----------|
| Time entry logic | `TimesheetService` |
| Leave logic | `LeaveService` |
| Time calculations | `timesheet.utils.ts` |
| Input validation | `timesheet.validation.ts` |
| HTTP routes | `timesheet.routes.ts`, `leave.routes.ts` |
| Error handling | `AppError` class |

---

**Ready to integrate?** Add these routes to your Express app and you have a fully functional timesheet and leave API! 🚀
