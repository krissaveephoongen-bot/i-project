# Quick Start Guide - Prisma API

## ⚡ 5 Minute Setup

### 1. Initialize Database
```bash
npm run db:prisma:init
```
✅ Creates tables, seeds admin user (admin@example.com / password123)

### 2. Generate Prisma Client
```bash
npm run db:prisma:generate
```

### 3. Start Server
```bash
npm run server
# Server running on http://localhost:5000
```

### 4. Check API
```bash
curl http://localhost:5000/
# Returns endpoint documentation
```

---

## 📝 Common API Calls

### Create Project
```bash
curl -X POST http://localhost:5000/api/prisma/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Project",
    "budget": 50000,
    "startDate": "2024-01-01"
  }'
```

### Create Cost
```bash
curl -X POST http://localhost:5000/api/prisma/costs \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "PROJECT_ID",
    "description": "Development",
    "amount": 5000,
    "category": "Development",
    "submittedBy": "USER_ID"
  }'
```

### Approve Cost
```bash
curl -X POST http://localhost:5000/api/prisma/costs/COST_ID/approve \
  -H "Content-Type: application/json" \
  -d '{
    "approvedBy": "APPROVER_ID",
    "comment": "Approved"
  }'
```

### View Project Budget
```bash
curl http://localhost:5000/api/prisma/projects/PROJECT_ID/budget-analysis
```

### Upload File
```bash
curl -X POST http://localhost:5000/api/prisma/costs/COST_ID/attachments \
  -F "file=@invoice.pdf"
```

### Get Dashboard
```bash
curl http://localhost:5000/api/prisma/dashboard
```

---

## 📚 Complete Documentation

- **[API Endpoints](./docs/API_ENDPOINTS_SUMMARY.md)** - All endpoints with examples
- **[Setup Guide](./docs/PRISMA_SETUP_GUIDE.md)** - Detailed setup & configuration
- **[API Reference](./docs/PRISMA_API.md)** - Full API documentation

---

## 🗄️ Database Schema

```
User
  ├─ createdCosts (costs created by user)
  ├─ approvedCosts (costs approved by user)
  └─ costApprovals (approvals given by user)

Project
  └─ costs (all costs in project)

Cost
  ├─ project (parent project)
  ├─ submitted (creator)
  ├─ approved (approver)
  ├─ attachments (files)
  └─ approvals (approval history)

Attachment
  └─ cost (parent cost)

CostApproval
  ├─ cost (parent cost)
  └─ approved (approver)
```

---

## 🔧 Useful Commands

```bash
# Database
npm run db:prisma:init          # Initialize database
npm run db:prisma:generate      # Generate Prisma client

# Server
npm run server                   # Start API server
npm run dev                      # Dev mode with hot reload

# Testing
npx tsx scripts/test-prisma-api.ts  # Run API tests
```

---

## 📊 API Quick Reference

### Users
```
GET    /api/prisma/users                  - List users
POST   /api/prisma/users                  - Create user
GET    /api/prisma/users/:id              - Get user
PUT    /api/prisma/users/:id              - Update user
DELETE /api/prisma/users/:id              - Delete user
PUT    /api/prisma/users/:id/change-password - Change password
GET    /api/prisma/users/:id/activity     - Get activity
```

### Projects
```
GET    /api/prisma/projects               - List projects
POST   /api/prisma/projects               - Create project
GET    /api/prisma/projects/:id           - Get project
PUT    /api/prisma/projects/:id           - Update project
DELETE /api/prisma/projects/:id           - Delete project
GET    /api/prisma/projects/:id/budget-analysis - Budget analysis
```

### Costs
```
GET    /api/prisma/costs                  - List costs
POST   /api/prisma/costs                  - Create cost
GET    /api/prisma/costs/:id              - Get cost
PUT    /api/prisma/costs/:id              - Update cost
DELETE /api/prisma/costs/:id              - Delete cost
POST   /api/prisma/costs/:id/approve      - Approve cost
GET    /api/prisma/costs/project/:id/summary - Cost summary
```

### Attachments
```
GET    /api/prisma/attachments            - List attachments
GET    /api/prisma/attachments/:id        - Get attachment
POST   /api/prisma/attachments            - Upload file
DELETE /api/prisma/attachments/:id        - Delete attachment
GET    /api/prisma/costs/:id/attachments  - List cost attachments
POST   /api/prisma/costs/:id/attachments  - Upload to cost
```

### Approvals
```
GET    /api/prisma/approvals              - List approvals
POST   /api/prisma/approvals              - Create approval
GET    /api/prisma/approvals/:id          - Get approval
PUT    /api/prisma/approvals/:id          - Update approval
DELETE /api/prisma/approvals/:id          - Delete approval
GET    /api/prisma/costs/:id/approvals    - Cost approvals
GET    /api/prisma/pending-approvals      - Pending approvals
POST   /api/prisma/costs/:id/approve      - Approve cost
POST   /api/prisma/costs/:id/reject       - Reject cost
GET    /api/prisma/approval-statistics    - Statistics
```

### Dashboard
```
GET    /api/prisma/dashboard              - Summary
GET    /api/prisma/dashboard/projects     - Projects overview
GET    /api/prisma/dashboard/costs        - Costs overview
GET    /api/prisma/dashboard/approvals    - Approvals overview
GET    /api/prisma/dashboard/users        - Users statistics
GET    /api/prisma/dashboard/project/:id  - Project dashboard
GET    /api/prisma/dashboard/user/:id     - User dashboard
GET    /api/prisma/dashboard/budget-analysis - Budget analysis
```

---

## 🚀 Common Workflows

### Budget Tracking Workflow
1. Create Project with budget
2. Create Costs for project
3. View budget analysis
4. Approve costs
5. Track spending vs budget

### Cost Approval Workflow
1. Create Cost (status: pending)
2. Upload invoice attachment
3. Approver reviews
4. Approver approves/rejects
5. Cost status updated

### User Analytics Workflow
1. Get user activity stats
2. View user dashboard
3. See costs created/approved
4. Review approval history

---

## 💡 Tips

- **Pagination**: Use `?skip=0&take=10` for large lists
- **Filtering**: Use `?status=approved&category=Development`
- **Search**: Use `?search=keyword` to search names/emails
- **Date Filter**: Use `?startDate=2024-01-01&endDate=2024-12-31`

---

## 🐛 Troubleshooting

**Database Connection Error**
- Check DATABASE_URL in .env file
- Ensure database is accessible

**Port Already in Use**
- Change PORT in .env or kill existing process
- Default: 5000

**Missing User/Project**
- Verify ID exists: GET /api/prisma/users/:id
- Check error response for details

**Budget Error**
- Project budget must be >= cost amount
- Check remaining budget: GET /projects/:id/budget-analysis

---

## 📦 File Structure

```
server/
├── routes/
│   ├── prisma-user-routes.js
│   ├── prisma-project-routes.js
│   ├── prisma-cost-routes.js
│   ├── prisma-approval-routes.js
│   ├── prisma-attachment-routes.js
│   └── prisma-dashboard-routes.js
├── services/
│   └── prisma-service.js
├── app.js
└── prisma-client.ts

prisma/
├── schema.prisma
├── seed.ts
└── migrations/

scripts/
├── init-db.ts
└── test-prisma-api.ts
```

---

## 🔐 Security Notes

- Implement authentication middleware in production
- Use HTTPS for all connections
- Validate all user inputs
- Use environment variables for secrets
- Implement rate limiting
- Add CORS validation

---

## 📈 Next Steps

1. Review [API Endpoints](./docs/API_ENDPOINTS_SUMMARY.md) for detailed docs
2. Run [test script](./scripts/test-prisma-api.ts) to verify API
3. Build your frontend using the API
4. Deploy to production

---

**Need Help?** See full documentation in `/docs` folder
