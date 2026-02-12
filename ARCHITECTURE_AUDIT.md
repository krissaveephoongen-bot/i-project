# Architecture Audit Report

## High-Level Architecture Diagram

```
Project Management System
├── Backend (Node.js/Express)
│   ├── app.js (Main Express app)
│   ├── routes/ (Feature-specific route handlers)
│   │   ├── project-routes.js
│   │   ├── user-routes.js
│   │   └── ... (20+ route files)
│   ├── db/
│   │   ├── migrations/ (Database schema migrations)
│   │   ├── seeds/ (Data seeding)
│   │   ├── models/ (Data models)
│   │   ├── queries/ (Complex queries)
│   │   └── types/ (Type definitions)
│   ├── lib/
│   │   ├── db.js (Database connection)
│   │   └── schema.js (Database schemas)
│   ├── config/ (Configuration files)
│   └── migrations/security/ (Security-related migrations)
├── Frontend (Next.js)
│   ├── app/
│   │   ├── api/ (API routes with mixed business logic)
│   │   │   ├── dashboard/kpi/route.ts
│   │   │   └── ... (20+ API routes)
│   │   ├── components/
│   │   │   ├── ui/ (Shadcn/ui components)
│   │   │   ├── Header.tsx, Sidebar.tsx, etc.
│   │   │   └── ... (50+ components)
│   │   ├── lib/
│   │   │   ├── projects.ts (Data access)
│   │   │   ├── auth.ts (Authentication utilities)
│   │   │   └── utils.ts (General utilities)
│   │   ├── hooks/ (Custom React hooks)
│   │   └── pages/ (Next.js pages with business logic)
│   │       ├── projects/page.tsx
│   │       └── ... (20+ pages)
│   └── components.json (Shadcn config)
├── Shared
│   ├── lib/prisma.ts (Prisma client)
│   └── Database schemas (Drizzle/Prisma)
└── Configuration
    ├── package.json files
    ├── tsconfig.json
    ├── drizzle.config.ts
    └── Docker/Deployment configs
```

## Separation of Concerns Analysis

### Current State
The application follows a basic layered architecture but has significant violations of separation of concerns:

1. **Presentation Layer (UI)**: Next.js pages and components
2. **Application Layer**: Partially in API routes, partially in components
3. **Domain Layer**: Missing - business logic scattered
4. **Infrastructure Layer**: Database access in lib/, backend routes

### Issues Identified

#### 1. Business Logic Mixed with UI
- **API Routes**: Business calculations (KPI aggregations, risk calculations) are embedded directly in API handlers
  - Example: `next-app/app/api/dashboard/kpi/route.ts` contains portfolio value calculations, SPI averaging, and billing forecasts
- **Page Components**: Complex business logic resides in React components
  - Example: `next-app/app/projects/page.tsx` contains risk level calculations, date calculations, and filtering logic
  - Helper functions like `calculateRiskLevel()`, `calculateDaysRemaining()`, `getStatusColor()` are defined inline

#### 2. Data Access Mixed with Business Logic
- API routes perform both data retrieval and business calculations
- No clear service layer separating data access from business rules

#### 3. Cross-Cutting Concerns
- Authentication and authorization logic scattered across components and API routes
- Audit logging mixed into mutation handlers
- Error handling inconsistent across layers

## Redundant Code Patterns and Spaghetti Code Areas

### 1. Duplicated Utility Functions
- **getStatusColor()**: Implemented in 6+ different files with slight variations
  - `next-app/app/projects/page.tsx`
  - `next-app/app/projects/page-refactored.tsx`
  - `next-app/app/projects/[id]/tasks/page.tsx`
  - `next-app/app/projects/[id]/milestones/page.tsx`
  - `next-app/app/approval/page.tsx`
  - `next-app/components/DatabaseStatus.tsx`

- **Risk Calculation Logic**: Duplicated between `page.tsx` and `page-refactored.tsx`

### 2. Spaghetti Code Areas
- **Large Page Components**: `projects/page.tsx` is 590 lines with mixed concerns
- **Inline Business Logic**: Calculations, filtering, and state management all in one place
- **Mixed Data Fetching**: React Query hooks mixed with business logic in components
- **Inconsistent Error Handling**: Different patterns across API routes and components

### 3. Architecture Smells
- **God Components**: Page components handling UI, business logic, data fetching, and state management
- **Data Clumping**: Related business logic scattered across multiple files
- **Feature Envy**: Components reaching into data structures they shouldn't know about
- **Primitive Obsession**: Using primitive types instead of domain objects

## Recommendations

### 1. Implement Clean Architecture
```
Domain Layer (Business Logic)
├── Entities (Project, User, Task)
├── Value Objects (RiskLevel, Status)
├── Domain Services (RiskCalculator, ProjectService)
└── Repositories (Interfaces)

Application Layer
├── Use Cases / Commands
├── Application Services
└── DTOs

Infrastructure Layer
├── Repository Implementations
├── External APIs
└── Database Access

Presentation Layer
├── Controllers (API Routes)
├── Views (Components)
└── View Models
```

### 2. Extract Business Logic
- Move calculations to domain services
- Create dedicated service classes for complex operations
- Implement repository pattern for data access

### 3. Consolidate Utilities
- Create shared utility modules in `lib/utils/`
- Implement consistent status color mappings
- Centralize date/time calculations

### 4. Improve Component Architecture
- Extract custom hooks for business logic
- Implement container/presentational component pattern
- Use compound components for complex UI logic

### 5. API Route Refactoring
- Thin API routes that delegate to services
- Implement proper error handling middleware
- Add input validation and sanitization

### 6. Testing Strategy
- Unit tests for domain logic
- Integration tests for services
- Component tests for UI logic
- E2E tests for critical user journeys

## Priority Actions

1. **High Priority**: Extract business logic from components into services
2. **High Priority**: Consolidate duplicated utility functions
3. **Medium Priority**: Implement repository pattern
4. **Medium Priority**: Add comprehensive error handling
5. **Low Priority**: Implement domain-driven design patterns

## Metrics to Track

- Cyclomatic complexity of components
- Number of lines per file
- Test coverage by layer
- Code duplication percentage
- Build and deployment success rates