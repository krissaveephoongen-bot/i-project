# Enterprise Application - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┬──────────────────┬────────────────────┐   │
│  │ Project Manager │ Timesheet Module │ Cost Management    │   │
│  └─────────────────┴──────────────────┴────────────────────┘   │
│  ┌─────────────────┬──────────────────┬────────────────────┐   │
│  │Resource Manager │ Reports & Export │ Settings & Profile │   │
│  └─────────────────┴──────────────────┴────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────┴───────────────────┐
        │   REACT COMPONENTS & STATE            │
        ├───────────────────────────────────────┤
        │  - useState for local form state      │
        │  - useAuth for user context           │
        │  - useEffect for side effects         │
        │  - Custom hooks for logic             │
        └───────────────────┬───────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER (API Client)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ projectSvc   │  │ timesheetSvc │  │  costSvc     │          │
│  │              │  │              │  │              │          │
│  │ - create()   │  │ - submit()   │  │ - submit()   │          │
│  │ - update()   │  │ - approve()  │  │ - approve()  │          │
│  │ - delete()   │  │ - reject()   │  │ - reject()   │          │
│  │ - getTasks() │  │ - getPending │  │ - getCosts() │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐                             │
│  │ resourceSvc  │  │ calculateSCrv │                            │
│  │              │  │              │                            │
│  │ - allocate() │  │ - Calculate  │                            │
│  │ - release()  │  │   S-Curve    │                            │
│  │ - getUsage() │  │   data       │                            │
│  └──────────────┘  └──────────────┘                             │
│                                                                  │
└─────────────────────┬───────────────────────────────────────────┘
                      │ Fetch + Bearer Token
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│                     REST API ENDPOINTS                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  /api/projects              /api/timesheets     /api/costs      │
│  /api/projects/{id}         /api/timesheets/{id} /api/costs/{id}│
│  /api/projects/{id}/tasks   /api/approvals      /api/approvals │
│                                                                  │
│  /api/resources             /api/health         /api/reports    │
│  /api/resources/{id}        /api/database       /api/export     │
│                                                                  │
└─────────────────────┬───────────────────────────────────────────┘
                      │ JSON Response
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Projects    │  │  Timesheets  │  │   Costs      │          │
│  │  ├─ id       │  │  ├─ id       │  │  ├─ id       │          │
│  │  ├─ name     │  │  ├─ userId   │  │  ├─ projectId│          │
│  │  ├─ budget   │  │  ├─ entries  │  │  ├─ amount   │          │
│  │  ├─ tasks    │  │  ├─ status   │  │  ├─ category │          │
│  │  └─ progress │  │  └─ approved │  │  └─ status   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Tasks      │  │  Resources   │  │   Users      │          │
│  │  ├─ id       │  │  ├─ userId   │  │  ├─ id       │          │
│  │  ├─ name     │  │  ├─ capacity │  │  ├─ name     │          │
│  │  ├─ weight   │  │  ├─ allocated│  │  ├─ role     │          │
│  │  ├─ progress │  │  └─ projects │  │  └─ email    │          │
│  │  └─ dates    │  └──────────────┘  └──────────────┘          │
│  └──────────────┘                                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

### Create Project Flow
```
User Input
    ↓
Form Validation
    ↓
Service.createProject()
    ↓
API POST /api/projects
    ↓
Database Save
    ↓
Response Success
    ↓
Update Component State
    ↓
Show Toast Success
    ↓
Load Fresh Data
```

### Timesheet Approval Flow
```
Manager Views Pending
    ↓
Load getPendingApprovals()
    ↓
Display Timesheet Details
    ↓
Manager Clicks Approve/Reject
    ↓
Service.approveTimesheet() / rejectTimesheet()
    ↓
API POST /api/timesheets/{id}/approve
    ↓
Database Update Status
    ↓
Email Notification (async)
    ↓
Refresh Pending List
    ↓
Show Toast Confirmation
```

### S-Curve Calculation Flow
```
Tasks Added to Project
    ↓
Extract Task Data:
├─ Start/End Dates
├─ Progress Weight
└─ Actual Progress
    ↓
calculateSCurveData()
    ↓
Loop through each week:
├─ Calculate Planned Progress
├─ Calculate Actual Progress
└─ Calculate Variance
    ↓
Return SCurveDataPoint[]
    ↓
Render SCurveChart
    ↓
Display Planned vs Actual
```

---

## Component Tree

```
App
├── AuthProvider
│   └── Router
│       ├── Dashboard
│       ├── ProjectManagementSuite
│       │   └── Tabs
│       │       ├── Overview
│       │       ├── TaskManagement
│       │       ├── SCurveChart
│       │       └── Budget
│       ├── TimesheetManagement
│       │   └── Tabs
│       │       ├── Submit
│       │       └── Approve (Manager Only)
│       ├── CostManagement
│       │   └── Tabs
│       │       ├── Submit
│       │       └── Approve (Manager Only)
│       ├── ResourceManagement
│       │   └── Tabs
│       │       ├── Dashboard
│       │       ├── Capacity
│       │       └── Allocation (Manager Only)
│       ├── Reports
│       │   └── Tabs
│       │       ├── Overview
│       │       ├── Financial
│       │       ├── Timesheet
│       │       ├── Cost
│       │       ├── Resources
│       │       └── Projects
│       └── Settings
│           └── Tabs
│               ├── Profile
│               ├── Notifications
│               ├── Security
│               └── BackOffice (Admin Only)
```

---

## State Management Pattern

```
┌─────────────────────────────────┐
│   Global State (AuthContext)    │
├─────────────────────────────────┤
│ • user                          │
│ • isAuthenticated               │
│ • isLoading                     │
│ • role                          │
└─────┬───────────────────────────┘
      │
      ↓
┌─────────────────────────────────┐
│   Component Local State         │
├─────────────────────────────────┤
│ • Form data (useState)          │
│ • Loading states (useState)     │
│ • Active tab (useState)         │
│ • Filters (useState)            │
│ • List data (useState)          │
└─────────────────────────────────┘
      │
      ↓
┌─────────────────────────────────┐
│   Server State (API Data)       │
├─────────────────────────────────┤
│ • Fetched from API              │
│ • Managed by Services           │
│ • Updated via mutations         │
│ • Cached locally                │
└─────────────────────────────────┘
```

---

## Authentication & Authorization Flow

```
User Login
    ↓
AuthContext.login(email, password)
    ↓
API POST /api/auth/login
    ↓
Server validates
    ↓
Returns JWT Token + User Data
    ↓
Store Token in localStorage
    ↓
Set User in Context
    ↓
Redirect to Dashboard
    ↓
├─ User Role: Admin
│   └─ Show Admin Features
├─ User Role: Manager
│   └─ Show Manager Features
└─ User Role: Member/Viewer
    └─ Show Member Features
```

---

## Error Handling Pattern

```
Try Block
    ↓
Attempt API Call
    ↓
│
├─ Success (200-299)
│   ├─ Parse JSON Response
│   ├─ Update Component State
│   ├─ Show Success Toast
│   └─ Return Data
│
└─ Error (400+)
    ├─ Log Error
    ├─ Show Error Toast
    ├─ Display User-Friendly Message
    └─ Clear Loading State

Finally Block
    └─ Always clear loading state
```

---

## Role-Based Access Control

```
┌─────────────────────────────────┐
│      User Roles                 │
├─────────────────────────────────┤
│ • admin    - All features       │
│ • manager  - Approval features  │
│ • member   - Submit features    │
│ • viewer   - Read-only          │
└─────────────────────────────────┘
         ↓
┌─────────────────────────────────┐
│   Feature Availability          │
├─────────────────────────────────┤
│ Submit Timesheet    → All       │
│ Approve Timesheet   → Manager+ │
│ Submit Cost         → All       │
│ Approve Cost        → Manager+ │
│ Allocate Resource   → Manager+ │
│ System Settings     → Admin     │
│ User Management     → Admin     │
└─────────────────────────────────┘
```

---

## API Response Format

### Success Response
```json
{
  "id": "project-123",
  "name": "Project Name",
  "status": "active",
  "createdAt": "2025-12-01T10:00:00Z",
  "updatedAt": "2025-12-09T15:30:00Z",
  ...
}
```

### Error Response
```json
{
  "error": "Validation Error",
  "message": "Please provide all required fields",
  "details": [
    {
      "field": "name",
      "message": "Name is required"
    }
  ]
}
```

### List Response
```json
{
  "items": [...],
  "total": 50,
  "page": 1,
  "pageSize": 10,
  "hasMore": true
}
```

---

## Type System Architecture

```
Types
├── project.ts
│   ├── Project
│   ├── Task
│   ├── Milestone
│   ├── ProjectBudget
│   ├── ProjectProgress
│   ├── SCurveDataPoint
│   └── ProjectFilters
├── timesheet.ts
│   ├── TimesheetEntry
│   ├── TimesheetWeek
│   ├── TimesheetApproval
│   ├── TimesheetSummary
│   └── WorkType
├── cost.ts
│   ├── Cost
│   ├── CostApproval
│   ├── CostSummary
│   └── BudgetAllocation
└── resource.ts
    ├── ResourceCapacity
    ├── ResourceAllocation
    ├── ResourceUtilization
    └── TeamCapacity
```

---

## Dependency Injection Pattern

```typescript
// Services receive dependencies (implicit)
export const projectService = {
  async createProject(data) {
    const token = localStorage.getItem('accessToken')
    const response = await fetch('/api/projects', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return response.json()
  }
}

// Components use services
const handleCreate = async () => {
  const project = await projectService.createProject(data)
}
```

---

## Deployment Architecture

```
┌──────────────────────────────────┐
│   Client (React App)             │
│   ├─ HTML/CSS/JS                 │
│   ├─ Assets                      │
│   └─ Service Workers (optional)  │
└──────────────┬───────────────────┘
               │ HTTPS
               ↓
┌──────────────────────────────────┐
│   API Server (Node/Express)      │
│   ├─ Auth Endpoints              │
│   ├─ Project APIs                │
│   ├─ Timesheet APIs              │
│   ├─ Cost APIs                   │
│   └─ Resource APIs               │
└──────────────┬───────────────────┘
               │ SQL/NoSQL
               ↓
┌──────────────────────────────────┐
│   Database                       │
│   ├─ PostgreSQL/MongoDB          │
│   ├─ Firestore                   │
│   └─ Cache (Redis optional)      │
└──────────────────────────────────┘
```

---

## Performance Optimization

```
┌──────────────────────────────┐
│   Optimization Strategies    │
├──────────────────────────────┤
│ ✓ Lazy Loading               │
│   └─ Load routes on demand   │
│ ✓ Code Splitting             │
│   └─ Separate bundles        │
│ ✓ Memoization                │
│   └─ React.memo for lists    │
│ ✓ Debouncing                 │
│   └─ API call debounce       │
│ ✓ Pagination                 │
│   └─ Load data in chunks     │
│ ✓ Caching                    │
│   └─ Cache API responses     │
│ ✓ Image Optimization         │
│   └─ Use appropriate formats │
└──────────────────────────────┘
```

---

## Monitoring & Logging

```
┌──────────────────────────────┐
│   Client-Side Logging        │
├──────────────────────────────┤
│ • Console.log for debugging  │
│ • Error boundaries           │
│ • Network tab monitoring     │
└──────────────────────────────┘

┌──────────────────────────────┐
│   Server-Side Logging        │
├──────────────────────────────┤
│ • Request/response logs      │
│ • Error stack traces         │
│ • Performance metrics        │
│ • Database query logs        │
└──────────────────────────────┘

┌──────────────────────────────┐
│   Monitoring                 │
├──────────────────────────────┤
│ • API response times         │
│ • Error rates                │
│ • User activity              │
│ • System health              │
└──────────────────────────────┘
```

---

## Security Layers

```
┌─────────────────────────────────┐
│   Frontend Security             │
├─────────────────────────────────┤
│ ✓ Input validation              │
│ ✓ XSS prevention (React built-in)
│ ✓ CSRF tokens (if applicable)  │
│ ✓ Secure storage (localStorage) │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│   Transport Security            │
├─────────────────────────────────┤
│ ✓ HTTPS/TLS                     │
│ ✓ Bearer tokens in headers      │
│ ✓ Secure cookies (HttpOnly)    │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│   Backend Security              │
├─────────────────────────────────┤
│ ✓ JWT validation                │
│ ✓ Role-based access control    │
│ ✓ Input sanitization            │
│ ✓ SQL injection prevention      │
│ ✓ Rate limiting                 │
│ ✓ Audit logging                 │
└─────────────────────────────────┘
```

---

**Architecture Version:** 1.0  
**Last Updated:** December 2025  
**Status:** Production Ready
