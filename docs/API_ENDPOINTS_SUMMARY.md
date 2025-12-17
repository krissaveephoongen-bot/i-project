# Prisma API Endpoints - Complete Summary

**Base URL**: `http://localhost:5000/api/prisma`

## 📋 Table of Contents
1. [Users API](#users-api)
2. [Projects API](#projects-api)
3. [Costs API](#costs-api)
4. [Attachments API](#attachments-api)
5. [Approvals API](#approvals-api)
6. [Dashboard API](#dashboard-api)

---

## Users API

### GET /users
List all users with pagination and filtering

**Query Parameters**:
- `role` (optional) - Filter by role: admin, user
- `search` (optional) - Search by name or email
- `skip` (optional) - Pagination offset (default: 0)
- `take` (optional) - Pagination limit (default: 10)

**Response**:
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
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
  "pagination": { "total": 50, "skip": 0, "take": 10 }
}
```

### GET /users/:id
Get specific user details

### POST /users
Create new user

**Request**:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secure_password",
  "role": "user"
}
```

### PUT /users/:id
Update user

**Request** (partial update):
```json
{
  "name": "Updated Name",
  "email": "newemail@example.com",
  "role": "admin"
}
```

### DELETE /users/:id
Delete user

### PUT /users/:id/change-password
Change user password

**Request**:
```json
{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

### GET /users/:id/activity
Get user activity summary

**Response**:
```json
{
  "data": {
    "userId": "uuid",
    "name": "John Doe",
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

### GET /projects
List all projects with cost summaries

**Query Parameters**:
- `status` (optional) - Filter: active, completed, on-hold
- `search` (optional) - Search by name or description
- `skip` (optional) - Pagination offset
- `take` (optional) - Pagination limit

**Response**:
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Mobile App",
      "description": "iOS and Android",
      "budget": 100000,
      "startDate": "2024-01-01T00:00:00Z",
      "endDate": "2024-12-31T00:00:00Z",
      "status": "active",
      "totalSpent": 45000,
      "costCount": 15,
      "approvedCosts": 12,
      "pendingCosts": 3,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": { "total": 10, "skip": 0, "take": 10 }
}
```

### GET /projects/:id
Get project with full details and costs

**Response Includes**:
- Project details
- All costs with status
- Cost statistics (total, approved, pending)
- Budget analysis
- User information

### POST /projects
Create new project

**Request**:
```json
{
  "name": "Website Redesign",
  "description": "Complete website redesign",
  "budget": 50000,
  "startDate": "2024-01-01",
  "endDate": "2024-06-30",
  "status": "active"
}
```

### PUT /projects/:id
Update project

**Request**:
```json
{
  "name": "Updated Name",
  "budget": 60000,
  "status": "on-hold"
}
```

### DELETE /projects/:id
Delete project (cascades to costs and attachments)

### GET /projects/:id/budget-analysis
Get detailed budget analysis

**Response**:
```json
{
  "data": {
    "projectId": "uuid",
    "projectName": "Mobile App",
    "budget": 100000,
    "spent": 45000,
    "remaining": 55000,
    "percentageUsed": "45.00",
    "costBreakdown": {
      "Development": 30000,
      "Design": 10000,
      "Testing": 5000
    }
  }
}
```

---

## Costs API

### GET /costs
List all costs with filtering and pagination

**Query Parameters**:
- `projectId` (optional) - Filter by project
- `status` (optional) - Filter: pending, approved, rejected
- `category` (optional) - Filter by category
- `startDate` (optional) - Filter by date range start
- `endDate` (optional) - Filter by date range end
- `skip` (optional) - Pagination offset
- `take` (optional) - Pagination limit

**Response**:
```json
{
  "data": [
    {
      "id": "uuid",
      "projectId": "uuid",
      "description": "Backend API",
      "amount": 25000,
      "category": "Development",
      "date": "2024-01-15T00:00:00Z",
      "status": "approved",
      "invoiceNumber": "INV-001",
      "submittedBy": "uuid",
      "approvedBy": "uuid",
      "project": { "id": "uuid", "name": "Mobile App" },
      "submitted": { "id": "uuid", "name": "John", "email": "john@example.com" },
      "approved": { "id": "uuid", "name": "Jane", "email": "jane@example.com" },
      "attachments": [],
      "approvals": [],
      "createdAt": "2024-01-15T00:00:00Z",
      "updatedAt": "2024-01-15T00:00:00Z"
    }
  ],
  "pagination": { "total": 50, "skip": 0, "take": 10 }
}
```

### GET /costs/:id
Get cost with full details and approval history

### POST /costs
Create new cost

**Request**:
```json
{
  "projectId": "uuid",
  "description": "Frontend Development",
  "amount": 20000,
  "category": "Development",
  "date": "2024-01-15",
  "submittedBy": "uuid",
  "invoiceNumber": "INV-001"
}
```

**Validates**:
- Project exists
- Amount is positive
- Required fields present
- Budget is sufficient

### PUT /costs/:id
Update cost

**Request**:
```json
{
  "description": "Updated description",
  "amount": 22000,
  "category": "Design"
}
```

### DELETE /costs/:id
Delete cost (cascades to attachments and approvals)

### POST /costs/:id/approve
Approve cost with approval record

**Request**:
```json
{
  "approvedBy": "uuid",
  "comment": "Approved per budget agreement"
}
```

**Operations**:
- Updates cost status to approved
- Records approver
- Creates CostApproval entry

### GET /costs/project/:projectId/summary
Get cost summary for project

**Response**:
```json
{
  "data": {
    "total": 45000,
    "count": 15,
    "byStatus": [
      { "status": "approved", "_sum": { "amount": 40000 }, "_count": 12 },
      { "status": "pending", "_sum": { "amount": 5000 }, "_count": 3 }
    ],
    "byCategory": [
      { "category": "Development", "_sum": { "amount": 30000 }, "_count": 8 }
    ]
  }
}
```

---

## Attachments API

### GET /attachments
List all attachments

**Query Parameters**:
- `costId` (optional) - Filter by cost
- `skip` (optional) - Pagination offset
- `take` (optional) - Pagination limit

### GET /attachments/:id
Get specific attachment details

### POST /attachments
Upload file attachment

**Request**: multipart/form-data
```
file: <binary>
costId: uuid
```

### DELETE /attachments/:id
Delete attachment and remove file

### GET /costs/:costId/attachments
Get all attachments for a cost

### POST /costs/:costId/attachments
Upload file directly to cost

**Request**: multipart/form-data
```
file: <binary>
```

**Response**:
```json
{
  "data": {
    "id": "uuid",
    "costId": "uuid",
    "filename": "invoice.pdf",
    "url": "/uploads/invoice-12345.pdf",
    "size": 102400,
    "mimeType": "application/pdf",
    "createdAt": "2024-01-15T00:00:00Z"
  },
  "message": "Attachment uploaded successfully"
}
```

---

## Approvals API

### GET /approvals
List all approvals

**Query Parameters**:
- `status` (optional) - Filter: pending, approved, rejected
- `costId` (optional) - Filter by cost
- `approvedBy` (optional) - Filter by approver
- `skip` (optional) - Pagination offset
- `take` (optional) - Pagination limit

### GET /approvals/:id
Get specific approval

### POST /approvals
Create approval record

**Request**:
```json
{
  "costId": "uuid",
  "status": "pending",
  "comment": "Awaiting review",
  "approvedBy": "uuid"
}
```

### PUT /approvals/:id
Update approval

**Request**:
```json
{
  "status": "approved",
  "comment": "Approved"
}
```

### DELETE /approvals/:id
Delete approval record

### GET /costs/:costId/approvals
Get all approvals for a cost

**Response**:
```json
{
  "data": [
    {
      "id": "uuid",
      "costId": "uuid",
      "status": "approved",
      "comment": "Approved",
      "approvedBy": "uuid",
      "approved": {
        "id": "uuid",
        "name": "Jane Doe",
        "email": "jane@example.com"
      },
      "createdAt": "2024-01-15T00:00:00Z"
    }
  ]
}
```

### GET /pending-approvals
Get all pending approvals

**Query Parameters**:
- `approvedBy` (optional) - Filter by approver
- `skip` (optional) - Pagination offset
- `take` (optional) - Pagination limit

### POST /costs/:costId/approve
Approve cost (shortcut)

**Request**:
```json
{
  "approvedBy": "uuid",
  "comment": "Approved"
}
```

**Operations**:
- Updates cost status to approved
- Creates approval record
- Records approver

### POST /costs/:costId/reject
Reject cost

**Request**:
```json
{
  "approvedBy": "uuid",
  "comment": "Does not meet requirements"
}
```

### GET /approval-statistics
Get approval statistics

**Response**:
```json
{
  "data": {
    "byStatus": [
      { "status": "approved", "_count": 25 },
      { "status": "pending", "_count": 10 }
    ],
    "byApprover": [
      { "approvedBy": "uuid", "_count": 15 }
    ]
  }
}
```

---

## Dashboard API

### GET /dashboard
Dashboard summary with all key metrics

**Response**:
```json
{
  "data": {
    "summary": {
      "totalUsers": 50,
      "totalProjects": 10,
      "totalCosts": 150,
      "totalSpent": 450000
    },
    "costStats": [
      {
        "status": "approved",
        "_count": 130,
        "_sum": { "amount": 420000 }
      }
    ]
  }
}
```

### GET /dashboard/projects
Projects overview with budget summary

### GET /dashboard/costs
Costs overview with trends

### GET /dashboard/approvals
Approvals overview

### GET /dashboard/users
User statistics

### GET /dashboard/project/:projectId
Project-specific dashboard

**Response**:
```json
{
  "data": {
    "projectStats": {
      "projectId": "uuid",
      "projectName": "Mobile App",
      "budget": 100000,
      "spent": 45000,
      "remaining": 55000,
      "percentageUsed": "45.00",
      "costBreakdown": { ... }
    },
    "costsByStatus": [ ... ],
    "costsByCategory": [ ... ]
  }
}
```

### GET /dashboard/user/:userId
User activity dashboard

### GET /dashboard/budget-analysis
Overall budget analysis

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request succeeded |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid parameters |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Duplicate or constraint violation |
| 500 | Server Error - Internal error |

---

## Error Response Format

```json
{
  "error": "Description of the error",
  "status": 400
}
```

---

## Common Workflows

### Complete Cost Submission & Approval

1. **Create Cost**
```bash
POST /costs
{
  "projectId": "proj-123",
  "description": "Backend API",
  "amount": 25000,
  "category": "Development",
  "submittedBy": "user-123"
}
```

2. **Upload Invoice**
```bash
POST /costs/cost-123/attachments
Content-Type: multipart/form-data
file: invoice.pdf
```

3. **Review & Approve**
```bash
POST /costs/cost-123/approve
{
  "approvedBy": "approver-123",
  "comment": "Approved"
}
```

### Project Budget Tracking

1. **Create Project**
```bash
POST /projects
{ "name": "Mobile App", "budget": 100000 }
```

2. **Track Spending**
```bash
GET /projects/proj-123
# See: totalSpent, remaining, percentageUsed
```

3. **Analyze Budget**
```bash
GET /projects/proj-123/budget-analysis
# See: breakdown by category, spent vs budget
```

### User Activity Monitoring

1. **Get User Stats**
```bash
GET /users/user-123/activity
# See: costs created, costs approved, approvals given
```

2. **Get User Dashboard**
```bash
GET /dashboard/user/user-123
# See: recent activity, statistics
```

---

## Pagination

All list endpoints support pagination:

```
?skip=0&take=10
```

- `skip` - Number of records to skip
- `take` - Maximum records to return

Example:
```bash
GET /costs?skip=20&take=10  # Records 20-29
```

---

## Filtering & Search

### Text Search
```bash
GET /projects?search=mobile
GET /users?search=john
```

### Status Filtering
```bash
GET /costs?status=approved
GET /projects?status=active
```

### Date Range
```bash
GET /costs?startDate=2024-01-01&endDate=2024-12-31
```

### Category Filtering
```bash
GET /costs?category=Development
```

---

## Field Definitions

### Cost Statuses
- `pending` - Waiting for approval
- `approved` - Approved for payment
- `rejected` - Rejected by approver

### Project Statuses
- `active` - Currently running
- `completed` - Finished
- `on-hold` - Paused

### User Roles
- `admin` - Full access
- `user` - Limited access

### Approval Statuses
- `pending` - Awaiting review
- `approved` - Approved
- `rejected` - Rejected

---

## Rate Limiting & Constraints

- No explicit rate limiting (implement at infrastructure level)
- Database constraints:
  - Budget must be positive
  - Email must be unique
  - Foreign keys enforced
  - Maximum file size: 50MB

---

## Version History

- **v2.0.0** (Current) - Prisma ORM integration with full API
- v1.0.0 - Legacy database system

---

For detailed implementation examples and troubleshooting, see [PRISMA_SETUP_GUIDE.md](./PRISMA_SETUP_GUIDE.md)
