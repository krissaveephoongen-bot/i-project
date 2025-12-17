# Prisma Database Setup & API Guide

## Quick Start

### 1. Database Initialization
```bash
npm run db:prisma:init
```

This will:
- Create all database tables
- Seed admin user (admin@example.com / password123)
- Create sample project

### 2. Generate Prisma Client
```bash
npm run db:prisma:generate
```

### 3. Start Server
```bash
npm run server
```

Server will run on `http://localhost:5000`

---

## Project Structure

```
server/
├── routes/
│   ├── prisma-user-routes.js      # User management endpoints
│   ├── prisma-project-routes.js   # Project management endpoints
│   ├── prisma-cost-routes.js      # Cost tracking endpoints
│   ├── prisma-approval-routes.js  # Approval workflow endpoints
│   ├── prisma-attachment-routes.js # File upload endpoints
│   └── prisma-dashboard-routes.js # Analytics & dashboards
├── services/
│   └── prisma-service.js          # Business logic layer
├── prisma-client.ts               # Global Prisma Client instance
└── app.js                         # Express server setup

prisma/
├── schema.prisma                  # Database schema
├── seed.ts                        # Database seeding
└── migrations/                    # Migration files

scripts/
├── init-db.ts                     # Database initialization script
└── test-prisma-api.ts             # API testing script
```

---

## Database Schema

### Models
- **User** - Users with roles (admin, user)
- **Project** - Projects with budget tracking
- **Cost** - Cost entries with approval workflow
- **Attachment** - File attachments for costs
- **CostApproval** - Approval records and history

### Relations
```
User
├── createdCosts (One-to-Many with Cost)
├── approvedCosts (One-to-Many with Cost)
└── costApprovals (One-to-Many with CostApproval)

Project
└── costs (One-to-Many with Cost)

Cost
├── project (Many-to-One with Project)
├── submitted (Many-to-One with User)
├── approved (Many-to-One with User)
├── attachments (One-to-Many with Attachment)
└── approvals (One-to-Many with CostApproval)

Attachment
└── cost (Many-to-One with Cost)

CostApproval
├── cost (Many-to-One with Cost)
└── approved (Many-to-One with User)
```

---

## API Endpoints Overview

### Users (`/api/prisma/users`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | List all users |
| GET | `/users/:id` | Get user details |
| POST | `/users` | Create new user |
| PUT | `/users/:id` | Update user |
| DELETE | `/users/:id` | Delete user |
| PUT | `/users/:id/change-password` | Change password |
| GET | `/users/:id/activity` | Get user activity |

### Projects (`/api/prisma/projects`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects` | List all projects |
| GET | `/projects/:id` | Get project details |
| POST | `/projects` | Create new project |
| PUT | `/projects/:id` | Update project |
| DELETE | `/projects/:id` | Delete project |
| GET | `/projects/:id/budget-analysis` | Get budget analysis |

### Costs (`/api/prisma/costs`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/costs` | List all costs |
| GET | `/costs/:id` | Get cost details |
| POST | `/costs` | Create new cost |
| PUT | `/costs/:id` | Update cost |
| DELETE | `/costs/:id` | Delete cost |
| POST | `/costs/:id/approve` | Approve cost |
| GET | `/costs/project/:projectId/summary` | Get cost summary |

### Attachments (`/api/prisma/attachments`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/attachments` | List all attachments |
| GET | `/attachments/:id` | Get attachment |
| POST | `/attachments` | Upload attachment |
| DELETE | `/attachments/:id` | Delete attachment |
| GET | `/costs/:costId/attachments` | Get cost attachments |
| POST | `/costs/:costId/attachments` | Upload to cost |

### Approvals (`/api/prisma/approvals`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/approvals` | List all approvals |
| GET | `/approvals/:id` | Get approval |
| POST | `/approvals` | Create approval |
| PUT | `/approvals/:id` | Update approval |
| DELETE | `/approvals/:id` | Delete approval |
| GET | `/costs/:costId/approvals` | Get cost approvals |
| GET | `/pending-approvals` | Get pending approvals |
| POST | `/costs/:costId/approve` | Approve cost |
| POST | `/costs/:costId/reject` | Reject cost |
| GET | `/approval-statistics` | Get statistics |

### Dashboard (`/api/prisma/dashboard`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Dashboard summary |
| GET | `/dashboard/projects` | Projects overview |
| GET | `/dashboard/costs` | Costs overview |
| GET | `/dashboard/approvals` | Approvals overview |
| GET | `/dashboard/users` | Users statistics |
| GET | `/dashboard/project/:projectId` | Project dashboard |
| GET | `/dashboard/user/:userId` | User dashboard |
| GET | `/dashboard/budget-analysis` | Budget analysis |

---

## Usage Examples

### Create a Project
```bash
curl -X POST http://localhost:5000/api/prisma/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mobile App",
    "description": "iOS and Android app",
    "budget": 100000,
    "startDate": "2024-01-01",
    "status": "active"
  }'
```

### Create a Cost
```bash
curl -X POST http://localhost:5000/api/prisma/costs \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "project-uuid",
    "description": "Backend Development",
    "amount": 25000,
    "category": "Development",
    "submittedBy": "user-uuid"
  }'
```

### Get Project with Stats
```bash
curl http://localhost:5000/api/prisma/projects/project-uuid
```

Response includes:
- Project details
- All costs with status
- Budget analysis
- Cost statistics

### Approve Cost
```bash
curl -X POST http://localhost:5000/api/prisma/costs/cost-uuid/approve \
  -H "Content-Type: application/json" \
  -d '{
    "approvedBy": "approver-uuid",
    "comment": "Approved"
  }'
```

### Upload File Attachment
```bash
curl -X POST http://localhost:5000/api/prisma/costs/cost-uuid/attachments \
  -H "Authorization: Bearer token" \
  -F "file=@invoice.pdf"
```

### Get Dashboard
```bash
curl http://localhost:5000/api/prisma/dashboard
```

---

## Testing

### Run API Tests
```bash
npx tsx scripts/test-prisma-api.ts
```

This will test:
- All CRUD operations
- Approval workflow
- File uploads
- Dashboard endpoints
- Error handling

---

## Error Handling

All endpoints return consistent error responses:

### Success Response
```json
{
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "error": "Error message",
  "status": 400
}
```

### Common Status Codes
- `200` - OK
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `409` - Conflict (duplicate, constraint violation)
- `500` - Server Error

---

## Prisma Service Layer

The `prisma-service.js` provides high-level business logic:

```javascript
const prismaService = require('./services/prisma-service');

// Create cost with validation
const cost = await prismaService.createCost({
  projectId,
  description,
  amount,
  category,
  submittedBy
});

// Get project with stats
const project = await prismaService.getProjectWithStats(projectId);

// Approve cost with transaction
const result = await prismaService.approveCost(costId, approvedBy);

// Get dashboard summary
const summary = await prismaService.getDashboardSummary();
```

---

## Database Constraints

### Referential Integrity
- Costs must belong to a valid project
- Costs must have a valid submitter (user)
- Approvals must reference valid costs and users
- Attachments must reference valid costs

### Cascade Deletes
- Deleting a project deletes all its costs
- Deleting a cost deletes all its attachments and approvals

### Restrictions
- Cannot delete users with active costs (foreign key restrict)
- Duplicate emails not allowed
- Budget cannot be negative

---

## Performance Optimization

### Indexes
Database has indexes on frequently queried fields:
- `Cost.projectId`
- `Cost.submittedBy`
- `Cost.approvedBy`
- `Cost.status`
- `Cost.date`
- `Project.status`
- `Attachment.costId`
- `CostApproval.costId`
- `CostApproval.approvedBy`

### Query Optimization
- Pagination is built-in (skip/take)
- Relations are selectively included
- Aggregations use database-level grouping
- Transactions for multi-step operations

---

## Environment Variables

Required in `.env`:
```env
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require&connection_limit=1"
DIRECT_URL="postgresql://user:pass@host/db?sslmode=require"
```

---

## Common Use Cases

### Budget Tracking
```javascript
// Get project budget status
const analysis = await api.get(`/projects/:id/budget-analysis`);
// Returns: budget, spent, remaining, percentage
```

### Cost Approval Workflow
```javascript
// Create cost (status: pending)
const cost = await api.post('/costs', { ... });

// Approver reviews and approves
const approval = await api.post(`/costs/${costId}/approve`, {
  approvedBy: approverId,
  comment: 'Approved'
});
// Cost status changes to: approved
```

### Cost Categorization
```javascript
// Filter costs by category
const devCosts = await api.get('/costs?category=Development');

// Get breakdown by category
const analysis = await api.get(`/projects/${projectId}/budget-analysis`);
// Returns: costBreakdown by category
```

### User Analytics
```javascript
// Get user activity
const activity = await api.get(`/users/${userId}/activity`);
// Returns: costsCreated, costsApproved, approvalsGiven

// Get user dashboard
const dashboard = await api.get(`/dashboard/user/${userId}`);
// Returns: recent costs, approvals, statistics
```

---

## Troubleshooting

### Database Connection Error
```
Error: Connection terminated unexpectedly
```
**Solution**: Check DATABASE_URL is correct and database is accessible

### Validation Error: Missing Required Fields
```
Error: Missing required fields: projectId, amount
```
**Solution**: Check request body matches schema requirements

### Foreign Key Constraint Error
```
Error: Foreign key constraint failed
```
**Solution**: Ensure referenced entities exist (valid projectId, userId, etc.)

### Insufficient Budget Error
```
Error: Insufficient budget. Remaining: 1000, Required: 2000
```
**Solution**: Project budget is insufficient for the cost amount

---

## Related Documentation

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Database Schema Diagram](./SCHEMA_DIAGRAM.md)
- [API Endpoints](./PRISMA_API.md)
- [Migration Guide](./MIGRATIONS.md)
