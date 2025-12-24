# Cost Management API Testing Guide

## Overview
This guide demonstrates all available APIs for the Cost Management system and how to test them.

## API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Cost Management Endpoints

#### 1. Get All Costs
```bash
GET /prisma/costs
```

**Query Parameters:**
- `projectId` (optional) - Filter by project ID
- `status` (optional) - Filter by status: pending, approved, rejected
- `category` (optional) - Filter by category
- `startDate` (optional) - Filter costs after date (ISO 8601)
- `endDate` (optional) - Filter costs before date (ISO 8601)
- `skip` (optional) - Pagination offset (default: 0)
- `take` (optional) - Pagination limit (default: 10)

**Example:**
```bash
curl -X GET "http://localhost:5000/api/prisma/costs?status=pending&take=10"
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "projectId": "uuid",
      "description": "Development tools subscription",
      "amount": 4500,
      "category": "Software",
      "date": "2024-01-15T00:00:00Z",
      "status": "pending",
      "invoiceNumber": "INV-2024-001",
      "submittedBy": "uuid",
      "approvedBy": null,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z",
      "project": { "id": "uuid", "name": "Project Alpha", "code": "PA" },
      "submitted": { "id": "uuid", "name": "John Doe", "email": "john@example.com" },
      "approved": null,
      "attachments": [],
      "approvals": []
    }
  ],
  "pagination": { "total": 25, "skip": 0, "take": 10 }
}
```

---

#### 2. Get Single Cost
```bash
GET /prisma/costs/:id
```

**Example:**
```bash
curl -X GET "http://localhost:5000/api/prisma/costs/550e8400-e29b-41d4-a716-446655440000"
```

**Response:**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "projectId": "uuid",
    "description": "Development tools subscription",
    "amount": 4500,
    "category": "Software",
    "date": "2024-01-15T00:00:00Z",
    "status": "pending",
    "invoiceNumber": "INV-2024-001",
    "submittedBy": "uuid",
    "approvedBy": null,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "project": { "id": "uuid", "name": "Project Alpha", "code": "PA" },
    "submitted": { "id": "uuid", "name": "John Doe", "email": "john@example.com" },
    "approved": null,
    "attachments": [],
    "approvals": [
      {
        "id": "uuid",
        "costId": "uuid",
        "status": "pending",
        "comment": "Awaiting approval",
        "approvedBy": "uuid",
        "approved": { "id": "uuid", "name": "Manager", "email": "manager@example.com" },
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

---

#### 3. Create New Cost
```bash
POST /prisma/costs
Content-Type: application/json
```

**Request Body:**
```json
{
  "projectId": "550e8400-e29b-41d4-a716-446655440000",
  "description": "Development tools subscription",
  "amount": 4500,
  "category": "Software",
  "date": "2024-01-15T00:00:00Z",
  "submittedBy": "550e8400-e29b-41d4-a716-446655440001",
  "invoiceNumber": "INV-2024-001"
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/prisma/costs \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "550e8400-e29b-41d4-a716-446655440000",
    "description": "Development tools subscription",
    "amount": 4500,
    "category": "Software",
    "date": "2024-01-15T00:00:00Z",
    "submittedBy": "550e8400-e29b-41d4-a716-446655440001",
    "invoiceNumber": "INV-2024-001"
  }'
```

**Response:**
```json
{
  "data": { /* cost object */ },
  "message": "Cost created successfully"
}
```

---

#### 4. Update Cost
```bash
PUT /prisma/costs/:id
Content-Type: application/json
```

**Request Body (partial update):**
```json
{
  "amount": 5000,
  "status": "approved"
}
```

**Example:**
```bash
curl -X PUT http://localhost:5000/api/prisma/costs/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "category": "Software Licenses"
  }'
```

**Response:**
```json
{
  "data": { /* updated cost object */ },
  "message": "Cost updated successfully"
}
```

---

#### 5. Delete Cost
```bash
DELETE /prisma/costs/:id
```

**Example:**
```bash
curl -X DELETE http://localhost:5000/api/prisma/costs/550e8400-e29b-41d4-a716-446655440000
```

**Response:**
```json
{
  "data": { /* deleted cost object */ },
  "message": "Cost deleted successfully"
}
```

---

#### 6. Approve Cost
```bash
POST /prisma/costs/:id/approve
Content-Type: application/json
```

**Request Body:**
```json
{
  "approvedBy": "550e8400-e29b-41d4-a716-446655440002",
  "comment": "Approved for processing",
  "approvalStatus": "approved"
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/prisma/costs/550e8400-e29b-41d4-a716-446655440000/approve \
  -H "Content-Type: application/json" \
  -d '{
    "approvedBy": "550e8400-e29b-41d4-a716-446655440002",
    "comment": "Approved for processing",
    "approvalStatus": "approved"
  }'
```

**Response:**
```json
{
  "data": {
    "cost": { /* updated cost */ },
    "approval": { /* approval record */ }
  },
  "message": "Cost approved successfully"
}
```

---

#### 7. Get Cost Summary by Project
```bash
GET /prisma/costs/project/:projectId/summary
```

**Example:**
```bash
curl -X GET "http://localhost:5000/api/prisma/costs/project/550e8400-e29b-41d4-a716-446655440000/summary"
```

**Response:**
```json
{
  "data": {
    "total": 50000,
    "count": 25,
    "byStatus": [
      { "status": "pending", "_sum": { "amount": 10000 }, "_count": 5 },
      { "status": "approved", "_sum": { "amount": 40000 }, "_count": 20 }
    ],
    "byCategory": [
      { "category": "Software", "_sum": { "amount": 25000 }, "_count": 10 },
      { "category": "Hardware", "_sum": { "amount": 15000 }, "_count": 8 }
    ]
  }
}
```

---

## Testing with cURL

### Test 1: Get all costs
```bash
curl -X GET "http://localhost:5000/api/prisma/costs?take=5"
```

### Test 2: Create a test cost (requires valid project & user IDs)
```bash
# First, get a valid project ID
curl -X GET "http://localhost:5000/api/prisma/projects?take=1"

# Then create a cost
curl -X POST http://localhost:5000/api/prisma/costs \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "YOUR_PROJECT_ID",
    "description": "Test Expense",
    "amount": 1500,
    "category": "Testing",
    "submittedBy": "YOUR_USER_ID"
  }'
```

### Test 3: Get pending costs
```bash
curl -X GET "http://localhost:5000/api/prisma/costs?status=pending"
```

### Test 4: Get approved costs
```bash
curl -X GET "http://localhost:5000/api/prisma/costs?status=approved"
```

### Test 5: Filter by date range
```bash
curl -X GET "http://localhost:5000/api/prisma/costs?startDate=2024-01-01T00:00:00Z&endDate=2024-12-31T23:59:59Z"
```

### Test 6: Filter by category
```bash
curl -X GET "http://localhost:5000/api/prisma/costs?category=Software"
```

---

## Database Health Check

Run the provided Node.js script to verify database integrity:

```bash
node check-costs-detailed.js
```

This will:
- Check cost statistics
- List pending approvals
- Show recently approved costs
- Display cost distribution by category
- Analyze costs by project
- Verify approval audit trail
- Check data quality

---

## Common Status Codes

| Code | Description |
|------|-------------|
| 200  | Success |
| 201  | Created |
| 400  | Bad Request (missing required fields) |
| 404  | Not Found |
| 500  | Internal Server Error |

---

## Data Model

### Cost Object
```typescript
{
  id: string (UUID)
  projectId: string (UUID)
  description: string
  amount: number (float)
  category: string (Software, Hardware, Services, etc.)
  date: DateTime (ISO 8601)
  status: string (pending, approved, rejected)
  invoiceNumber?: string
  submittedBy: string (User UUID)
  approvedBy?: string (User UUID)
  createdAt: DateTime
  updatedAt: DateTime
  project?: Project
  submitted?: User
  approved?: User
  attachments?: Attachment[]
  approvals?: CostApproval[]
}
```

### Categories
- Software
- Hardware
- Services
- Labor
- Travel
- Training
- Office
- Other

### Statuses
- `pending` - Awaiting approval
- `approved` - Approved and can be processed
- `rejected` - Rejected and returned for revision

---

## Notes

- All timestamps are in ISO 8601 format with UTC timezone
- All currency amounts are in base units (dollars, euros, etc.) as decimals
- Project and User IDs must exist in the database before creating costs
- Approved costs cannot be deleted (consider implementing soft deletes)
- Implement proper authentication before using in production
