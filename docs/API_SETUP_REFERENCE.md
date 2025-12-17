# API Setup Reference - Backend Implementation

## Overview
This document provides the complete API specifications needed to support the three new features.

---

## 🔐 1. Role Management API

### Base Path: `/api/roles`

#### GET /api/roles
Get all roles with optional filtering
```
Query Parameters:
  - limit: number (optional, default: 50)
  - offset: number (optional, default: 0)
  - search: string (optional)

Response:
{
  "data": [
    {
      "id": "role-1",
      "name": "Project Manager",
      "description": "Manages projects and teams",
      "permissions": ["project:*", "task:*", "user:view"],
      "user_count": 5,
      "created_at": "2025-01-01T00:00:00Z"
    }
  ],
  "total": 10
}
```

#### POST /api/roles
Create a new role
```
Request Body:
{
  "name": "string (required, unique)",
  "description": "string (optional)",
  "permissions": ["string array (required)"]
}

Response:
{
  "data": {
    "id": "new-role-id",
    "name": "New Role",
    "description": "...",
    "permissions": [...],
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

#### GET /api/roles/:id
Get specific role
```
Response:
{
  "data": {
    "id": "role-1",
    "name": "Project Manager",
    "description": "...",
    "permissions": [...],
    "user_count": 5,
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

#### PUT /api/roles/:id
Update a role
```
Request Body:
{
  "name": "string (optional)",
  "description": "string (optional)",
  "permissions": ["string array (optional)"]
}

Response:
{
  "data": {
    "id": "role-1",
    "name": "Updated Role",
    "description": "...",
    "permissions": [...],
    "updated_at": "2025-01-01T00:00:00Z"
  }
}
```

#### DELETE /api/roles/:id
Delete a role
```
Response:
{
  "success": true,
  "message": "Role deleted successfully"
}
```

---

### Permissions Management

#### GET /api/permissions
Get all available permissions
```
Response:
{
  "data": [
    {
      "id": "project:view",
      "name": "View Projects",
      "description": "Can view project details",
      "category": "Projects"
    },
    ...
  ]
}
```

---

### User-Role Assignment

#### POST /api/users/:userId/roles/:roleId
Assign role to user
```
Response:
{
  "success": true,
  "message": "Role assigned successfully"
}
```

#### DELETE /api/users/:userId/roles/:roleId
Remove role from user
```
Response:
{
  "success": true,
  "message": "Role removed successfully"
}
```

#### GET /api/users/:userId/roles
Get user's roles
```
Response:
{
  "data": [
    {
      "id": "role-1",
      "name": "Project Manager",
      "permissions": [...],
      "assigned_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

#### GET /api/roles/stats
Get role statistics
```
Response:
{
  "data": {
    "totalRoles": 5,
    "rolesDistribution": {
      "admin": 2,
      "manager": 10,
      "member": 45
    },
    "permissionsCount": 24
  }
}
```

---

## 📊 2. Analytics API

### Base Path: `/api/analytics`

#### GET /api/analytics/dashboard-metrics
Get comprehensive dashboard metrics
```
Query Parameters:
  - startDate: ISO8601 (optional)
  - endDate: ISO8601 (optional)

Response:
{
  "data": {
    "overview": {
      "totalProjects": 25,
      "activeProjects": 15,
      "completedProjects": 8,
      "onHoldProjects": 1,
      "cancelledProjects": 1
    },
    "financials": {
      "totalBudget": 1000000,
      "totalSpent": 750000,
      "budgetUtilization": 75,
      "budgetVariance": -250000,
      "costPercentageVariance": 2.5,
      "projectedOverrun": 50000
    },
    "schedule": {
      "averageProgress": 65,
      "averageScheduleVariance": 5,
      "onTimeProjects": 12,
      "behindScheduleProjects": 2,
      "aheadOfScheduleProjects": 1
    },
    "performance": {
      "projectsAtRisk": 2,
      "projectsCritical": 0,
      "resourceUtilization": 80,
      "teamProductivity": 85,
      "qualityScore": 92
    },
    "trends": {
      "monthlyProgress": [
        { "month": "Jan", "value": 20 },
        { "month": "Feb", "value": 40 }
      ],
      "monthlyBudgetUsage": [
        { "month": "Jan", "allocated": 100000, "spent": 75000 }
      ],
      "projectCompletionRate": 32
    }
  }
}
```

#### GET /api/analytics/projects/:id/metrics
Get project-specific metrics
```
Response:
{
  "data": {
    "id": "project-1",
    "name": "Project Name",
    "totalBudget": 500000,
    "spent": 375000,
    "budgetVariance": -125000,
    "budgetVariancePercent": 25,
    "progress": 70,
    "plannedProgress": 65,
    "scheduleVariance": 5,
    "scheduleVariancePercent": 7.7,
    "completedTasks": 35,
    "totalTasks": 50,
    "taskCompletionRate": 70,
    "teamSize": 8,
    "healthStatus": "healthy",
    "daysRemaining": 45,
    "timelineStatus": "on-track"
  }
}
```

#### GET /api/analytics/charts/:type
Get chart data
```
Parameters:
  - type: 'budget-trend' | 'progress-trend' | 'distribution' | etc.
  - period: 'week' | 'month' | 'quarter' | 'year'

Response:
{
  "data": {
    "labels": ["Jan", "Feb", "Mar", ...],
    "datasets": [
      {
        "label": "Allocated",
        "data": [100000, 120000, 110000],
        "backgroundColor": "rgba(59, 130, 246, 0.5)",
        "borderColor": "rgba(59, 130, 246, 1)"
      }
    ]
  }
}
```

#### GET /api/analytics/kpis
Get key performance indicators
```
Response:
{
  "data": {
    "projectSuccessRate": 88,
    "budgetAccuracy": 85,
    "scheduleAccuracy": 90,
    "qualityScore": 92,
    "customerSatisfaction": 4.5,
    "teamProductivity": 85,
    "riskMitigationRate": 95
  }
}
```

#### GET /api/analytics/resource-utilization
Get resource utilization metrics
```
Response:
{
  "data": {
    "teamMembers": [
      {
        "id": "user-1",
        "name": "John Doe",
        "utilization": 95,
        "assignedTasks": 12,
        "completedTasks": 10
      }
    ],
    "departmentUtilization": {
      "engineering": 88,
      "design": 75,
      "qa": 92
    }
  }
}
```

#### GET /api/analytics/projects/:id/burndown
Get burndown chart data
```
Response:
{
  "data": {
    "labels": ["Day 1", "Day 2", "Day 3", ...],
    "datasets": [
      {
        "label": "Ideal",
        "data": [50, 45, 40, 35, 30, ...]
      },
      {
        "label": "Actual",
        "data": [50, 48, 42, 38, 32, ...]
      }
    ]
  }
}
```

#### GET /api/analytics/risk-assessment
Get risk assessment
```
Response:
{
  "data": {
    "highRiskProjects": [
      {
        "id": "project-1",
        "name": "...",
        "healthStatus": "critical",
        ...
      }
    ],
    "riskFactors": [
      {
        "factor": "Budget Overrun",
        "severity": "high",
        "affectedProjects": 3
      },
      {
        "factor": "Schedule Delay",
        "severity": "medium",
        "affectedProjects": 2
      }
    ],
    "mitigationStrategies": [
      "Allocate additional resources",
      "Review project scope"
    ]
  }
}
```

#### GET /api/analytics/reports/export/pdf
Export report as PDF
```
Query Parameters:
  - startDate: ISO8601
  - endDate: ISO8601

Response: PDF file (application/pdf)
```

---

## 🔔 3. Notification API

### Base Path: `/api/notifications`

#### GET /api/notifications
Get user's notifications
```
Query Parameters:
  - limit: number (optional, default: 50)
  - offset: number (optional, default: 0)
  - unread: boolean (optional)

Response:
{
  "data": [
    {
      "id": "notif-1",
      "userId": "user-1",
      "type": "success",
      "title": "Project Created",
      "message": "New project has been created",
      "data": { "projectId": "project-1" },
      "read": false,
      "created_at": "2025-01-01T12:00:00Z",
      "actionUrl": "/projects/project-1"
    }
  ],
  "total": 25
}
```

#### GET /api/notifications/:id
Get specific notification
```
Response:
{
  "data": {
    "id": "notif-1",
    "userId": "user-1",
    "type": "success",
    "title": "Project Created",
    ...
  }
}
```

#### PUT /api/notifications/:id/read
Mark notification as read
```
Response:
{
  "success": true,
  "data": {
    "id": "notif-1",
    "read": true
  }
}
```

#### PUT /api/notifications/read-all
Mark all notifications as read
```
Response:
{
  "success": true,
  "message": "All notifications marked as read"
}
```

#### DELETE /api/notifications/:id
Delete notification
```
Response:
{
  "success": true,
  "message": "Notification deleted"
}
```

#### GET /api/notifications/unread-count
Get unread notification count
```
Response:
{
  "count": 5
}
```

---

### Notification Preferences

#### GET /api/notifications/preferences
Get user's notification preferences
```
Response:
{
  "data": {
    "userId": "user-1",
    "emailNotifications": true,
    "pushNotifications": true,
    "inAppNotifications": true,
    "notificationFrequency": "immediate",
    "categories": {
      "projects": true,
      "tasks": true,
      "comments": true,
      "team": true,
      "system": true
    }
  }
}
```

#### PUT /api/notifications/preferences
Update notification preferences
```
Request Body:
{
  "emailNotifications": boolean (optional),
  "pushNotifications": boolean (optional),
  "inAppNotifications": boolean (optional),
  "notificationFrequency": "immediate" | "hourly" | "daily" (optional),
  "categories": {
    "projects": boolean (optional),
    "tasks": boolean (optional),
    "comments": boolean (optional),
    "team": boolean (optional),
    "system": boolean (optional)
  }
}

Response:
{
  "data": {
    "userId": "user-1",
    "emailNotifications": true,
    ...
  }
}
```

---

### WebSocket (Real-time Notifications)

#### Connection
```
URL: /ws/notifications?userId={userId}&token={token}
Method: WebSocket
Authentication: JWT token in query parameter
```

#### Message Types Received
```javascript
// Single notification
{
  "id": "notif-1",
  "userId": "user-1",
  "type": "success",
  "title": "Notification Title",
  "message": "Notification message",
  "data": {},
  "read": false,
  "created_at": "2025-01-01T12:00:00Z"
}
```

#### Message Types Sent
```javascript
// Mark as read
{
  "type": "mark_as_read",
  "payload": {
    "notificationId": "notif-1"
  }
}

// Mark all as read
{
  "type": "mark_all_as_read",
  "payload": {}
}

// Send notification (admin only)
{
  "type": "send_notification",
  "payload": {
    "userId": "user-id",
    "type": "success",
    "title": "Title",
    "message": "Message",
    "data": {}
  }
}
```

---

## 🔗 Authentication

All endpoints require:
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

Admin-only endpoints require:
```
- User role must include 'admin:*' permission
- OR user.role = 'admin'
```

---

## 📊 Response Format

All successful responses follow:
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "optional message"
}
```

All error responses follow:
```json
{
  "success": false,
  "error": "Error code",
  "message": "Human readable message"
}
```

---

## 🚨 Error Codes

| Code | Meaning | HTTP Status |
|------|---------|------------|
| `UNAUTHORIZED` | Missing or invalid token | 401 |
| `FORBIDDEN` | User lacks required permissions | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `VALIDATION_ERROR` | Invalid request data | 400 |
| `CONFLICT` | Resource already exists | 409 |
| `SERVER_ERROR` | Internal server error | 500 |

---

## 📝 Implementation Example (Express.js)

```javascript
const express = require('express');
const router = express.Router();
const authMiddleware = require('./middleware/auth');
const adminMiddleware = require('./middleware/admin');

// Roles
router.get('/roles', authMiddleware, getRoles);
router.post('/roles', authMiddleware, adminMiddleware, createRole);
router.get('/roles/:id', authMiddleware, getRole);
router.put('/roles/:id', authMiddleware, adminMiddleware, updateRole);
router.delete('/roles/:id', authMiddleware, adminMiddleware, deleteRole);

// Analytics
router.get('/analytics/dashboard-metrics', authMiddleware, getDashboardMetrics);
router.get('/analytics/projects/:id/metrics', authMiddleware, getProjectMetrics);
router.get('/analytics/charts/:type', authMiddleware, getChartData);
router.get('/analytics/resource-utilization', authMiddleware, getResourceUtilization);
router.get('/analytics/risk-assessment', authMiddleware, getRiskAssessment);

// Notifications
router.get('/notifications', authMiddleware, getNotifications);
router.get('/notifications/:id', authMiddleware, getNotification);
router.put('/notifications/:id/read', authMiddleware, markAsRead);
router.put('/notifications/read-all', authMiddleware, markAllAsRead);
router.delete('/notifications/:id', authMiddleware, deleteNotification);
router.get('/notifications/unread-count', authMiddleware, getUnreadCount);
router.get('/notifications/preferences', authMiddleware, getPreferences);
router.put('/notifications/preferences', authMiddleware, updatePreferences);

module.exports = router;
```

---

## 🔌 WebSocket Server Example (Node.js)

```javascript
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

const wss = new WebSocket.Server({ port: 8080 });
const userConnections = new Map();

wss.on('connection', async (ws, req) => {
  try {
    // Parse query parameters
    const url = new URL(req.url, `http://${req.headers.host}`);
    const userId = url.searchParams.get('userId');
    const token = url.searchParams.get('token');

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.sub !== userId) {
      ws.close(1008, 'Unauthorized');
      return;
    }

    // Store connection
    if (!userConnections.has(userId)) {
      userConnections.set(userId, []);
    }
    userConnections.get(userId).push(ws);

    // Handle messages
    ws.on('message', async (data) => {
      const message = JSON.parse(data);
      
      switch (message.type) {
        case 'mark_as_read':
          await markNotificationAsRead(message.payload.notificationId);
          break;
        case 'mark_all_as_read':
          await markAllAsRead(userId);
          break;
      }
    });

    // Handle disconnection
    ws.on('close', () => {
      const connections = userConnections.get(userId);
      const index = connections.indexOf(ws);
      if (index > -1) {
        connections.splice(index, 1);
      }
    });
  } catch (error) {
    ws.close(1008, 'Unauthorized');
  }
});

// Send notification to user
function sendToUser(userId, notification) {
  const connections = userConnections.get(userId);
  if (connections) {
    connections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(notification));
      }
    });
  }
}
```

---

**This reference should provide everything needed to implement the backend APIs.**
