# API Reference - Project Management Tool

Complete API documentation for the Project Management Tool.

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints require authentication. Include JWT token in header:
```
Authorization: Bearer <token>
Content-Type: application/json
```

## Response Format

All responses follow this format:
```json
{
  "success": true/false,
  "data": {},
  "message": "Description",
  "error": "Error details (if any)"
}
```

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad request / validation error |
| 404 | Not found |
| 500 | Server error |

---

## Tasks API

### List Tasks
```
GET /api/tasks
```

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| projectId | string | No | Filter by project |
| assigneeId | string | No | Filter by assignee user |
| status | string | No | Filter by status (comma-separated for multiple) |
| priority | string | No | Filter by priority |
| search | string | No | Search in title and description |

**Example Request:**
```bash
GET /api/tasks?projectId=abc123&status=IN_PROGRESS,TODO
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "task-uuid",
      "title": "Build login page",
      "description": "Create user login interface",
      "status": "IN_PROGRESS",
      "priority": "high",
      "projectId": "project-uuid",
      "assigneeId": "user-uuid",
      "dueDate": "2024-12-31T00:00:00Z",
      "estimatedHours": 8,
      "actualHours": 5.5,
      "actualProgress": 75,
      "plannedProgressWeight": 10,
      "plannedStartDate": "2024-12-15T00:00:00Z",
      "plannedEndDate": "2024-12-20T00:00:00Z",
      "createdAt": "2024-12-01T10:00:00Z",
      "updatedAt": "2024-12-10T14:30:00Z",
      "project": { "id": "...", "name": "..." },
      "assignee": { "id": "...", "name": "..." },
      "reporter": { "id": "...", "name": "..." },
      "timesheets": [],
      "timeLogs": [],
      "comments": []
    }
  ]
}
```

---

### Get Single Task
```
GET /api/tasks/{id}
```

**Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Task ID (UUID) |

**Example Request:**
```bash
GET /api/tasks/550e8400-e29b-41d4-a716-446655440000
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "task-uuid",
    "title": "Build login page",
    "description": "Create user login interface",
    "status": "IN_PROGRESS",
    "priority": "high",
    "projectId": "project-uuid",
    "assigneeId": "user-uuid",
    "dueDate": "2024-12-31T00:00:00Z",
    "estimatedHours": 8,
    "actualHours": 5.5,
    "actualProgress": 75,
    "plannedProgressWeight": 10,
    "plannedStartDate": "2024-12-15T00:00:00Z",
    "plannedEndDate": "2024-12-20T00:00:00Z",
    "createdAt": "2024-12-01T10:00:00Z",
    "updatedAt": "2024-12-10T14:30:00Z",
    "project": { "id": "...", "name": "..." },
    "assignee": { "id": "...", "name": "..." },
    "reporter": { "id": "...", "name": "..." },
    "subTasks": [],
    "parentTask": null,
    "timesheets": [],
    "timeLogs": [],
    "comments": []
  }
}
```

---

### Create Task
```
POST /api/tasks
```

**Request Body:**
```json
{
  "projectId": "project-uuid",
  "title": "Build login page",
  "description": "Create user login interface",
  "status": "TODO",
  "priority": "high",
  "dueDate": "2024-12-31T00:00:00Z",
  "estimatedHours": 8,
  "assigneeId": "user-uuid",
  "plannedStartDate": "2024-12-15T00:00:00Z",
  "plannedEndDate": "2024-12-20T00:00:00Z",
  "plannedProgressWeight": 10,
  "reporterId": "user-uuid"
}
```

**Required Fields:**
- `projectId`
- `title`
- `reporterId`

**Success Response (201):**
```json
{
  "success": true,
  "data": { /* task object */ },
  "message": "Task created"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Missing required fields: projectId, title, reporterId",
  "error": "Error details"
}
```

---

### Update Task
```
PATCH /api/tasks/{id}
```

**Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Task ID (UUID) |

**Request Body:** (any of these fields)
```json
{
  "title": "New title",
  "description": "New description",
  "status": "IN_PROGRESS",
  "priority": "medium",
  "dueDate": "2024-12-31T00:00:00Z",
  "estimatedHours": 10,
  "actualHours": 5,
  "actualProgress": 50,
  "assigneeId": "user-uuid",
  "plannedStartDate": "2024-12-15T00:00:00Z",
  "plannedEndDate": "2024-12-20T00:00:00Z",
  "plannedProgressWeight": 15
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": { /* updated task object */ },
  "message": "Task updated"
}
```

**Note:** If `actualProgress` is set to 100, status automatically changes to DONE.

---

### Delete Task
```
DELETE /api/tasks/{id}
```

**Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Task ID (UUID) |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Task deleted"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Task not found"
}
```

---

### Get Project Tasks
```
GET /api/projects/{projectId}/tasks
```

**Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| projectId | string | Yes | Project ID (UUID) |

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    { /* task objects */ }
  ]
}
```

---

### Update Task Progress
```
POST /api/tasks/{id}/update-progress
```

**Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Task ID (UUID) |

**Request Body:**
```json
{
  "progress": 75,
  "status": "IN_PROGRESS"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": { /* updated task */ },
  "message": "Task progress updated"
}
```

---

## Timesheet API

### List Timesheets
```
GET /api/timesheets
```

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| userId | string | No | Filter by user |
| projectId | string | No | Filter by project |
| status | string | No | Filter by status |
| startDate | string | No | Filter from date (YYYY-MM-DD) |
| endDate | string | No | Filter to date (YYYY-MM-DD) |
| managerId | string | No | Get all entries for manager's projects |

**Example Request:**
```bash
GET /api/timesheets?userId=abc123&status=SUBMITTED&startDate=2024-12-01&endDate=2024-12-31
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "timesheet-uuid",
      "userId": "user-uuid",
      "projectId": "project-uuid",
      "taskId": "task-uuid",
      "date": "2024-12-10",
      "hoursWorked": 8,
      "description": "Worked on login page",
      "status": "SUBMITTED",
      "approvedById": null,
      "approvedAt": null,
      "rejectionReason": null,
      "createdAt": "2024-12-10T08:00:00Z",
      "updatedAt": "2024-12-10T17:00:00Z",
      "user": { "id": "...", "name": "..." },
      "project": { "id": "...", "name": "..." },
      "task": { "id": "...", "title": "..." },
      "approvedBy": null
    }
  ]
}
```

---

### Create Timesheet Entry
```
POST /api/timesheets
```

**Request Body:**
```json
{
  "userId": "user-uuid",
  "projectId": "project-uuid",
  "taskId": "task-uuid",
  "date": "2024-12-10",
  "hoursWorked": 8,
  "description": "Worked on login page",
  "status": "DRAFT"
}
```

**Required Fields:**
- `userId`
- `projectId`
- `date`
- `hoursWorked`

**Success Response (201):**
```json
{
  "success": true,
  "data": { /* timesheet object */ },
  "message": "Timesheet entry created"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Timesheet entry already exists for this date"
}
```

---

### Update Timesheet Entry
```
PATCH /api/timesheets/{id}
```

**Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Timesheet ID (UUID) |

**Request Body:**
```json
{
  "hoursWorked": 7.5,
  "description": "Updated description",
  "status": "SUBMITTED",
  "actualProgress": 80
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": { /* updated timesheet */ },
  "message": "Timesheet entry updated"
}
```

---

### Delete Timesheet Entry
```
DELETE /api/timesheets/{id}
```

**Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Timesheet ID (UUID) |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Timesheet entry deleted"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Can only delete draft entries"
}
```

---

### Approve Timesheet
```
POST /api/timesheets/{id}/approve
```

**Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Timesheet ID (UUID) |

**Request Body:**
```json
{
  "approvedById": "manager-uuid"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": { /* updated timesheet */ },
  "message": "Timesheet approved"
}
```

---

### Reject Timesheet
```
POST /api/timesheets/{id}/reject
```

**Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Timesheet ID (UUID) |

**Request Body:**
```json
{
  "rejectionReason": "Please include more detail about the work"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": { /* updated timesheet */ },
  "message": "Timesheet rejected"
}
```

---

### Get Weekly Timesheet Summary
```
GET /api/timesheets/weekly/{userId}
```

**Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| userId | string | Yes | User ID (UUID) |

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| weekStart | string | No | Start date (YYYY-MM-DD) |
| weekEnd | string | No | End date (YYYY-MM-DD) |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "weekStart": "2024-12-08T00:00:00Z",
      "weekEnd": "2024-12-14T00:00:00Z",
      "totalHours": 40,
      "byDay": {
        "2024-12-08": 8,
        "2024-12-09": 8,
        "2024-12-10": 8,
        "2024-12-11": 8,
        "2024-12-12": 8
      },
      "byProject": {
        "Project A": 20,
        "Project B": 20
      },
      "byStatus": {
        "DRAFT": 0,
        "SUBMITTED": 5,
        "APPROVED": 35,
        "REJECTED": 0
      }
    },
    "entries": [
      { /* timesheet entries */ }
    ]
  }
}
```

---

## Statuses and Enums

### Task Status
```
TODO
IN_PROGRESS
IN_REVIEW
DONE
BLOCKED
CANCELLED
```

### Task Priority
```
low
medium
high
urgent
```

### Timesheet Status
```
DRAFT
SUBMITTED
APPROVED
REJECTED
```

### Project Status
```
DRAFT
PLANNING
IN_PROGRESS
ON_HOLD
COMPLETED
CANCELLED
```

---

## Common Use Cases

### Get All Tasks for a Project
```bash
GET /api/projects/{projectId}/tasks
```

### Get My Assigned Tasks
```bash
GET /api/tasks?assigneeId={userId}&status=TODO,IN_PROGRESS
```

### Get Pending Timesheets (Manager)
```bash
GET /api/timesheets?managerId={managerId}&status=SUBMITTED
```

### Get Weekly Hours Summary
```bash
GET /api/timesheets/weekly/{userId}
```

### Create Task and Log Time
```bash
# 1. Create task
POST /api/tasks
{
  "projectId": "project-uuid",
  "title": "New Feature",
  "reporterId": "user-uuid",
  ...
}

# 2. Log time (response includes task id)
POST /api/timesheets
{
  "userId": "user-uuid",
  "projectId": "project-uuid",
  "taskId": "task-uuid",
  "date": "2024-12-10",
  "hoursWorked": 8
}

# 3. Submit timesheet
PATCH /api/timesheets/{id}
{
  "status": "SUBMITTED"
}

# 4. Approve (as manager)
POST /api/timesheets/{id}/approve
{
  "approvedById": "manager-uuid"
}
```

---

## Rate Limiting

No rate limiting currently implemented. In production, consider:
- 100 requests per minute per user
- 1000 requests per hour per IP

## Pagination

Implement pagination using:
- `limit` - Items per page (default: 20)
- `offset` - Skip items (default: 0)

Example:
```bash
GET /api/tasks?limit=10&offset=20
```

---

## Best Practices

1. **Always check success field** before accessing data
2. **Include error handling** for all API calls
3. **Use query parameters** for filtering
4. **Cache responses** when appropriate
5. **Implement retry logic** for failed requests
6. **Use timestamps** in ISO 8601 format
7. **Validate input** before sending requests
8. **Log errors** for debugging
9. **Test thoroughly** before deployment
10. **Monitor API performance** in production

---

## Webhooks (Future)

Planned webhook events:
- `task.created`
- `task.updated`
- `task.completed`
- `timesheet.submitted`
- `timesheet.approved`
- `timesheet.rejected`

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-12-15 | Initial release with tasks and timesheets |

---

**Last Updated**: 2024-12-15
**API Version**: 1.0
