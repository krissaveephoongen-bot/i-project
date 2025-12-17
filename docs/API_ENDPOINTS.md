# API Endpoints Documentation

## Overview
Complete REST API and WebSocket endpoints for the Project Management System.

---

## Authentication

All endpoints require JWT token in the `Authorization` header:
```
Authorization: Bearer <JWT_TOKEN>
```

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/password/change` - Change password

---

## File Management

### GET /api/files
Get all files for the authenticated user
- **Query Parameters:**
  - `entityType` (optional): Filter by entity type (project, task, general)
  - `entityId` (optional): Filter by entity ID
- **Response:** `{ success, data: UploadedFile[], count }`

### POST /api/files
Upload a new file
- **Request Body:**
  ```json
  {
    "name": "string",
    "size": number,
    "type": "string (MIME type)",
    "url": "string",
    "entityType": "project|task|general",
    "entityId": "string (optional)"
  }
  ```
- **Response:** `{ success, data: UploadedFile, message }`

### GET /api/files/:fileId
Get a specific file
- **Response:** `{ success, data: UploadedFile }`

### PUT /api/files/:fileId
Update file metadata
- **Request Body:**
  ```json
  {
    "name": "string (optional)",
    "entityType": "string (optional)",
    "entityId": "string (optional)"
  }
  ```
- **Response:** `{ success, data: UploadedFile, message }`

### DELETE /api/files/:fileId
Delete a file
- **Response:** `{ success, message }`

### GET /api/files/entity/:entityType/:entityId
Get all files for a specific entity
- **Response:** `{ success, data: UploadedFile[], count }`

---

## Reports & Export

### GET /api/reports/data
Get comprehensive report data
- **Query Parameters:**
  - `startDate` (optional): Filter start date
  - `endDate` (optional): Filter end date
- **Response:**
  ```json
  {
    "summary": {
      "totalProjects": number,
      "activeProjects": number,
      "completedProjects": number,
      "totalTasks": number,
      "completedTasks": number,
      "teamMembers": number
    },
    "projects": [{ id, name, status, progress, budget, teamSize, endDate }],
    "tasks": [{ id, title, project, status, priority, assignee, dueDate }],
    "team": [{ id, name, role, workload, activeProjects, completedTasks }]
  }
  ```

### POST /api/reports/export/pdf
Export report data as PDF
- **Request Body:** ReportData
- **Response:** PDF file (binary)
- **Headers:** `Content-Type: application/pdf`

### POST /api/reports/export/csv
Export report data as CSV
- **Request Body:** ReportData
- **Response:** CSV file (text)
- **Headers:** `Content-Type: text/csv`

### POST /api/reports/export/json
Export report data as JSON
- **Request Body:** ReportData
- **Response:** JSON file
- **Headers:** `Content-Type: application/json`

### POST /api/reports/share
Share report via email
- **Request Body:**
  ```json
  {
    "reportId": "string",
    "emails": ["email1@example.com", "email2@example.com"]
  }
  ```
- **Response:** `{ success, message, recipients }`

### GET /api/reports/project-summary
Get project summary report
- **Response:** Array of projects with summary statistics

### GET /api/reports/timesheet-summary
Get timesheet summary report
- **Query Parameters:**
  - `startDate` (optional)
  - `endDate` (optional)
  - `userId` (optional)
- **Response:** `{ summary, totals }`

### GET /api/reports/expense-summary
Get expense summary report
- **Query Parameters:**
  - `startDate` (optional)
  - `endDate` (optional)
  - `projectId` (optional)
- **Response:** `{ by_category, by_status, totals }`

---

## Templates

### GET /api/templates
Get all available templates
- **Response:** `{ success, data: Template[], count }`

### GET /api/templates/:templateName/tasks
Get tasks from a specific template
- **Response:** `{ success, data: Task[], count }`

### POST /api/templates
Create a new template (Manager+)
- **Request Body:**
  ```json
  {
    "name": "string",
    "description": "string (optional)",
    "category": "string",
    "type": "project|task"
  }
  ```
- **Response:** `{ success, data: Template, message }`

### POST /api/templates/:templateId/tasks
Add task to template (Manager+)
- **Request Body:**
  ```json
  {
    "name": "string",
    "description": "string (optional)",
    "priority": "low|medium|high|urgent",
    "estimatedHours": number,
    "orderIndex": number
  }
  ```
- **Response:** `{ success, data: TemplateTask, message }`

### GET /api/templates/:templateId
Get template details
- **Response:** `{ success, data: Template }`

### PUT /api/templates/:templateId
Update template (Manager+)
- **Request Body:**
  ```json
  {
    "name": "string (optional)",
    "description": "string (optional)",
    "category": "string (optional)",
    "isActive": boolean (optional)
  }
  ```
- **Response:** `{ success, data: Template, message }`

### DELETE /api/templates/:templateId
Delete template (soft delete, Manager+)
- **Response:** `{ success, message }`

---

## Team Customization

### GET /api/teams/:teamId/customization
Get team customization settings
- **Required Permission:** Team member or admin
- **Response:** `{ success, data: TeamCustomization }`

### PUT /api/teams/:teamId/customization
Update team customization (Manager+)
- **Required Permission:** Team manager or admin
- **Request Body:**
  ```json
  {
    "workflows": ["array of workflow names"],
    "statuses": ["array of status values"],
    "priorities": ["array of priority levels"],
    "customFields": [{ id, name, type }],
    "automationRules": [{ id, name, enabled }]
  }
  ```
- **Response:** `{ success, data: TeamCustomization, message }`

### POST /api/teams/:teamId/customization/workflows
Add custom workflow (Manager+)
- **Request Body:**
  ```json
  {
    "name": "string",
    "stages": ["stage1", "stage2", "stage3"],
    "description": "string (optional)"
  }
  ```
- **Response:** `{ success, data: CustomWorkflow, message }`

### POST /api/teams/:teamId/customization/automation-rules
Add automation rule (Manager+)
- **Request Body:**
  ```json
  {
    "name": "string",
    "trigger": { "event": "string", "conditions": {} },
    "action": { "type": "string", "params": {} },
    "isEnabled": boolean
  }
  ```
- **Response:** `{ success, data: AutomationRule, message }`

### GET /api/teams/:teamId/customization/automation-rules
Get team automation rules
- **Response:** `{ success, data: AutomationRule[], count }`

### PUT /api/teams/:teamId/customization/automation-rules/:ruleId
Update automation rule (Manager+)
- **Request Body:**
  ```json
  {
    "name": "string (optional)",
    "trigger": { ... } (optional),
    "action": { ... } (optional),
    "isEnabled": boolean (optional)
  }
  ```
- **Response:** `{ success, data: AutomationRule, message }`

---

## Analytics

### GET /api/analytics/budget-variance
Calculate budget variance by project
- **Response:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "string",
        "name": "string",
        "budget": number,
        "actual_expenses": number,
        "variance": number,
        "variance_percentage": number
      }
    ],
    "summary": {
      "totalBudget": number,
      "totalVariance": number,
      "avgVariancePercentage": number,
      "projectCount": number
    }
  }
  ```

### GET /api/analytics/resource-utilization
Calculate resource utilization
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "users": [
        {
          "id": "string",
          "name": "string",
          "position": "string",
          "active_projects": number,
          "total_hours": number,
          "avg_hours_per_day": number,
          "workload": number,
          "capacity": number,
          "available_capacity": number
        }
      ],
      "summary": {
        "totalCapacity": number,
        "totalWorkload": number,
        "overallUtilization": number,
        "teamSize": number,
        "overloadedCount": number,
        "underutilizedCount": number
      }
    }
  }
  ```

### GET /api/analytics/project-performance
Analyze project performance metrics
- **Response:** Array of projects with performance metrics

### GET /api/analytics/team-productivity
Analyze team productivity
- **Query Parameters:**
  - `startDate` (optional)
  - `endDate` (optional)
- **Response:** `{ success, data: TeamMember[], summary }`

### GET /api/analytics/task-distribution
Analyze task distribution
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "byStatus": [{ status, count, percentage }],
      "byPriority": [{ priority, count, percentage }],
      "byProject": [{ id, name, task_count, completed_count }]
    }
  }
  ```

---

## Activity Log

### GET /api/activities
Get activity log
- **Query Parameters:**
  - `limit` (optional, default: 50)
  - `offset` (optional, default: 0)
  - `entityType` (optional)
  - `entityId` (optional)
- **Response:** `{ success, data: Activity[], total, hasMore }`

### GET /api/activities/recent
Get recent activities (last 10)
- **Response:** `{ success, data: Activity[], count }`

---

## WebSocket (Real-time Collaboration)

### Connection
**URL:** `wss://your-domain/api/ws?token=<JWT_TOKEN>`

### Message Types

#### Subscribe to Event
```json
{
  "type": "subscribe",
  "payload": {
    "eventType": "task:update|presence:update|chat:message"
  }
}
```

#### Publish Event
```json
{
  "type": "publish",
  "payload": {
    "eventType": "string",
    "data": {}
  }
}
```

#### Update User Presence
```json
{
  "type": "presence:update",
  "payload": {
    "status": "active|away|offline"
  }
}
```

#### Update Task
```json
{
  "type": "task:update",
  "payload": {
    "taskId": "string",
    "projectId": "string",
    "updates": {}
  }
}
```

#### Send Chat Message
```json
{
  "type": "chat:message",
  "payload": {
    "projectId": "string",
    "content": "string"
  }
}
```

#### Send Notification
```json
{
  "type": "notification",
  "payload": {
    "userId": "string",
    "title": "string",
    "message": "string",
    "priority": "low|normal|high"
  }
}
```

#### Server Response Examples

**Connection Established:**
```json
{
  "type": "connection:established",
  "data": {
    "userId": "string",
    "userName": "string",
    "timestamp": "2025-12-15T10:00:00Z"
  }
}
```

**Event Received:**
```json
{
  "type": "task:update",
  "data": {
    "taskId": "string",
    "projectId": "string",
    "updates": {},
    "sender": {
      "id": "string",
      "name": "string"
    },
    "timestamp": "2025-12-15T10:00:00Z"
  }
}
```

---

## Projects

### GET /api/projects
Get all projects
- **Query Parameters:**
  - `status` (optional)
  - `limit` (optional)
  - `offset` (optional)
- **Response:** `{ data: Project[], total, hasMore }`

### POST /api/projects
Create new project
- **Request Body:** Project data
- **Response:** `{ data: Project, message }`

### GET /api/projects/:projectId
Get project details
- **Response:** `{ data: Project }`

### PUT /api/projects/:projectId
Update project
- **Request Body:** Partial project data
- **Response:** `{ data: Project, message }`

### DELETE /api/projects/:projectId
Delete project
- **Response:** `{ success, message }`

### GET /api/projects/:projectId/tasks
Get project tasks
- **Response:** `{ data: Task[], total }`

### POST /api/projects/:projectId/tasks
Add task to project
- **Request Body:** Task data
- **Response:** `{ data: Task, message }`

---

## Users

### GET /api/users
Get all users (Admin)
- **Response:** `{ data: User[], total }`

### GET /api/users/:userId
Get user profile
- **Response:** `{ data: User }`

### PUT /api/users/:userId
Update user profile
- **Request Body:** User data
- **Response:** `{ data: User, message }`

### GET /api/users/me
Get current user profile
- **Response:** `{ data: User }`

---

## Health Check

### GET /api/health/db
Full database health check
- **Response:** Database connection status

### GET /api/health/db/simple
Simple connection test
- **Response:** `{ status: "connected|disconnected", timestamp }`

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error type",
  "message": "Error description"
}
```

---

## Error Codes

- **400**: Bad Request - Invalid input
- **401**: Unauthorized - Missing or invalid token
- **403**: Forbidden - Insufficient permissions
- **404**: Not Found - Resource not found
- **500**: Internal Server Error - Server error

---

## Rate Limiting

Currently no rate limiting. Implement as needed based on production requirements.

---

## CORS

All endpoints support CORS. Origins can be configured in `.env` file.

---

## Pagination

Use `limit` and `offset` query parameters for pagination:
- `limit`: Number of results (default: 50, max: 100)
- `offset`: Number of results to skip (default: 0)

---

**Last Updated:** December 2025
**API Version:** 2.0
