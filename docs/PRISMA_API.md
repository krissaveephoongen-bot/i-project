# Prisma API Documentation

## Base URL
```
http://localhost:5000/api/prisma
```

## Authentication
All endpoints require Bearer token authentication in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Users API

### Get All Users
```http
GET /users?role=admin&search=john&skip=0&take=10
```

**Query Parameters:**
- `role` (optional) - Filter by user role (admin, user)
- `search` (optional) - Search by name or email
- `skip` (optional) - Pagination offset (default: 0)
- `take` (optional) - Pagination limit (default: 10)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "admin",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "_count": {
        "createdCosts": 5,
        "approvedCosts": 10,
        "costApprovals": 8
      }
    }
  ],
  "pagination": {
    "total": 50,
    "skip": 0,
    "take": 10
  }
}
```

### Get User By ID
```http
GET /users/:id
```

### Create User
```http
POST /users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure_password",
  "role": "user"
}
```

### Update User
```http
PUT /users/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "email": "newemail@example.com",
  "role": "admin"
}
```

### Delete User
```http
DELETE /users/:id
```

### Change Password
```http
PUT /users/:id/change-password
Content-Type: application/json

{
  "currentPassword": "current_password",
  "newPassword": "new_password"
}
```

### Get User Activity
```http
GET /users/:id/activity
```

**Response:**
```json
{
  "data": {
    "userId": "uuid",
    "name": "Admin User",
    "role": "admin",
    "activity": {
      "costsCreated": 5,
      "costsApproved": 10,
      "approvalsGiven": 8
    }
  }
}
```

---

## Projects API

### Get All Projects
```http
GET /projects?status=active&search=redesign&skip=0&take=10
```

**Query Parameters:**
- `status` (optional) - Filter by project status (active, completed, on-hold)
- `search` (optional) - Search by name or description
- `skip` (optional) - Pagination offset
- `take` (optional) - Pagination limit

### Get Project By ID
```http
GET /projects/:id
```

**Response Includes:**
- Project details
- All associated costs
- Budget analysis and statistics

### Create Project
```http
POST /projects
Content-Type: application/json

{
  "name": "Website Redesign",
  "description": "Complete website redesign project",
  "budget": 10000,
  "startDate": "2024-01-01",
  "endDate": "2024-03-31",
  "status": "active"
}
```

### Update Project
```http
PUT /projects/:id
Content-Type: application/json

{
  "name": "Updated Project Name",
  "budget": 15000,
  "status": "on-hold"
}
```

### Delete Project
```http
DELETE /projects/:id
```

### Get Budget Analysis
```http
GET /projects/:id/budget-analysis
```

**Response:**
```json
{
  "data": {
    "projectId": "uuid",
    "projectName": "Website Redesign",
    "budget": 10000,
    "spent": 7500,
    "remaining": 2500,
    "percentageUsed": "75.00",
    "costBreakdown": {
      "Development": 5000,
      "Design": 2000,
      "Testing": 500
    }
  }
}
```

---

## Costs API

### Get All Costs
```http
GET /costs?projectId=uuid&status=pending&category=Development&startDate=2024-01-01&endDate=2024-12-31&skip=0&take=10
```

**Query Parameters:**
- `projectId` (optional) - Filter by project
- `status` (optional) - pending, approved, rejected
- `category` (optional) - Development, Design, etc.
- `startDate` (optional) - Filter by date range
- `endDate` (optional) - Filter by date range
- `skip` (optional) - Pagination offset
- `take` (optional) - Pagination limit

### Get Cost By ID
```http
GET /costs/:id
```

### Create Cost
```http
POST /costs
Content-Type: application/json

{
  "projectId": "uuid",
  "description": "Database implementation",
  "amount": 5000,
  "category": "Development",
  "date": "2024-01-15",
  "submittedBy": "uuid",
  "invoiceNumber": "INV-001"
}
```

### Update Cost
```http
PUT /costs/:id
Content-Type: application/json

{
  "description": "Updated description",
  "amount": 5500,
  "status": "pending"
}
```

### Delete Cost
```http
DELETE /costs/:id
```

### Approve Cost
```http
POST /costs/:id/approve
Content-Type: application/json

{
  "approvedBy": "uuid",
  "comment": "Approved as per budget"
}
```

### Get Cost Summary
```http
GET /costs/project/:projectId/summary
```

**Response:**
```json
{
  "data": {
    "total": 7500,
    "count": 15,
    "byStatus": [
      {
        "status": "approved",
        "_sum": { "amount": 7000 },
        "_count": 10
      },
      {
        "status": "pending",
        "_sum": { "amount": 500 },
        "_count": 5
      }
    ],
    "byCategory": [
      {
        "category": "Development",
        "_sum": { "amount": 5000 },
        "_count": 8
      }
    ]
  }
}
```

---

## Attachments API

### Get All Attachments
```http
GET /attachments?costId=uuid&skip=0&take=10
```

### Get Attachment By ID
```http
GET /attachments/:id
```

### Upload Attachment
```http
POST /attachments
Content-Type: multipart/form-data

{
  "file": <file>,
  "costId": "uuid"
}
```

### Delete Attachment
```http
DELETE /attachments/:id
```

### Get Cost Attachments
```http
GET /costs/:costId/attachments
```

### Upload to Cost
```http
POST /costs/:costId/attachments
Content-Type: multipart/form-data

{
  "file": <file>
}
```

---

## Approvals API

### Get All Approvals
```http
GET /approvals?status=pending&costId=uuid&approvedBy=uuid&skip=0&take=10
```

### Get Approval By ID
```http
GET /approvals/:id
```

### Create Approval
```http
POST /approvals
Content-Type: application/json

{
  "costId": "uuid",
  "status": "pending",
  "comment": "Awaiting review",
  "approvedBy": "uuid"
}
```

### Update Approval
```http
PUT /approvals/:id
Content-Type: application/json

{
  "status": "approved",
  "comment": "Approved"
}
```

### Delete Approval
```http
DELETE /approvals/:id
```

### Get Cost Approvals
```http
GET /costs/:costId/approvals
```

### Get Pending Approvals
```http
GET /pending-approvals?approvedBy=uuid&skip=0&take=10
```

### Approve Cost
```http
POST /costs/:costId/approve
Content-Type: application/json

{
  "approvedBy": "uuid",
  "comment": "Approved"
}
```

### Reject Cost
```http
POST /costs/:costId/reject
Content-Type: application/json

{
  "approvedBy": "uuid",
  "comment": "Does not meet requirements"
}
```

### Get Approval Statistics
```http
GET /approval-statistics
```

**Response:**
```json
{
  "data": {
    "byStatus": [
      {
        "status": "approved",
        "_count": 25
      },
      {
        "status": "pending",
        "_count": 10
      }
    ],
    "byApprover": [
      {
        "approvedBy": "uuid",
        "_count": 15
      }
    ]
  }
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "status": 400
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `409` - Conflict (e.g., duplicate email)
- `500` - Internal Server Error

---

## Examples

### Create a Complete Workflow

1. **Create a Project**
```bash
curl -X POST http://localhost:5000/api/prisma/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token" \
  -d '{
    "name": "Mobile App Development",
    "description": "Native iOS/Android app",
    "budget": 50000,
    "startDate": "2024-01-01"
  }'
```

2. **Create a Cost**
```bash
curl -X POST http://localhost:5000/api/prisma/costs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token" \
  -d '{
    "projectId": "project_uuid",
    "description": "Backend API Development",
    "amount": 15000,
    "category": "Development",
    "submittedBy": "user_uuid"
  }'
```

3. **Upload Invoice**
```bash
curl -X POST http://localhost:5000/api/prisma/costs/cost_uuid/attachments \
  -H "Authorization: Bearer token" \
  -F "file=@invoice.pdf"
```

4. **Approve Cost**
```bash
curl -X POST http://localhost:5000/api/prisma/costs/cost_uuid/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token" \
  -d '{
    "approvedBy": "approver_uuid",
    "comment": "Approved per budget agreement"
  }'
```

---

## Pagination

All list endpoints support pagination:

```http
GET /costs?skip=0&take=10
```

- `skip` - Number of records to skip (offset)
- `take` - Number of records to return (limit)

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "total": 100,
    "skip": 0,
    "take": 10
  }
}
```

---

## Filtering & Search

**Text Search** (case-insensitive):
```http
GET /projects?search=redesign
GET /users?search=john
```

**Filter by Status:**
```http
GET /costs?status=approved
GET /projects?status=active
```

**Filter by Date Range:**
```http
GET /costs?startDate=2024-01-01&endDate=2024-12-31
```

---

## Database Constraints

- User emails must be unique
- Foreign keys are enforced
- Deleting projects cascades to costs and attachments
- Deleting costs cascades to approvals and attachments
- Users with active costs cannot be deleted
