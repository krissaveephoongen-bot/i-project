# Database Enumerated Types - API Aligned

This document describes all enumerated types used across the application, aligned with actual API validation schemas and route handlers.

## Overview

Enums are synchronized between:
- **PostgreSQL database** - Native enum types
- **Prisma schema** - `prisma/schema.prisma`
- **Drizzle ORM schema** - `backend/lib/schema.ts`
- **Backend validation** - `backend/lib/enums/constants.ts`
- **Frontend types** - `next-app/lib/enums.ts`

## Quick Reference

### User & Authentication

| Enum | Values | Source |
|------|--------|--------|
| `UserRole` | `admin`, `manager`, `employee`, `vendor`, `project_manager` | `authSchemas.ts` |
| `UserStatus` | `active`, `inactive`, `locked` | `user-routes.js` |

### Task Management

| Enum | Values | Source |
|------|--------|--------|
| `TaskStatus` | `todo`, `in_progress`, `in_review`, `done`, `cancelled`, `inactive` | `taskSchemas.ts` |
| `TaskPriority` | `low`, `medium`, `high`, `urgent` | `taskSchemas.ts` |
| `TaskCategory` | `development`, `design`, `testing`, `documentation`, `maintenance`, `other` | Task filtering |

### Project Management

| Enum | Values | Source |
|------|--------|--------|
| `ProjectStatus` | `todo`, `in_progress`, `in_review`, `done`, `active`, `inactive`, `planning`, `onHold`, `completed`, `cancelled` | `projectSchemas.ts` |
| `ProjectPriority` | `low`, `medium`, `high`, `urgent` | `projectSchemas.ts` |

### Timesheet & Time Entry

| Enum | Values | Source |
|------|--------|--------|
| `TimeEntryStatus` | `pending`, `approved`, `rejected` | `timesheets-routes.js` |
| `WorkType` | `project`, `office`, `training`, `leave`, `overtime`, `other` | `timesheet.validation.ts` |

### Leave Management

| Enum | Values | Source |
|------|--------|--------|
| `LeaveType` | `annual`, `sick`, `personal`, `maternity`, `unpaid` | `timesheet.validation.ts` |
| `LeaveStatus` | `pending`, `approved`, `rejected`, `cancelled` | Leave management |

### Expense Management

| Enum | Values | Source |
|------|--------|--------|
| `ExpenseStatus` | `pending`, `approved`, `rejected`, `reimbursed` | `expenseSchemas.ts` |
| `ExpenseCategory` | `travel`, `supplies`, `equipment`, `training`, `other` | `expenseSchemas.ts` |
| `PaymentMethod` | `cash`, `credit_card`, `bank_transfer`, `check`, `other` | Expense processing |

### Client Management

| Enum | Values | Source |
|------|--------|--------|
| `ClientStatus` | `active`, `inactive`, `archived` | Client management |
| `ClientType` | `individual`, `company`, `government` | Client classification |

### Risk Management

| Enum | Values | Source |
|------|--------|--------|
| `RiskStatus` | `open`, `mitigated`, `closed`, `accepted` | Risk tracking |
| `RiskLevel` | `low`, `medium`, `high`, `critical` | Risk assessment |
| `RiskProbability` | `low`, `medium`, `high`, `very_high` | Risk analysis |
| `RiskImpact` | `low`, `medium`, `high`, `critical` | Risk evaluation |

### Sales & CRM

| Enum | Values | Source |
|------|--------|--------|
| `SalesStatus` | `prospect`, `qualified`, `proposal`, `negotiation`, `closed_won`, `closed_lost` | Sales pipeline |
| `SalesStage` | `lead`, `contact`, `meeting`, `demo`, `proposal`, `contract`, `won`, `lost` | Sales funnel |

### Resource Management

| Enum | Values | Source |
|------|--------|--------|
| `ResourceType` | `human`, `equipment`, `material`, `software`, `facility`, `other` | Resource allocation |
| `ResourceStatus` | `available`, `in_use`, `maintenance`, `retired`, `archived` | Resource tracking |
| `AllocationStatus` | `requested`, `approved`, `allocated`, `deallocated`, `rejected` | Resource allocation |

### Stakeholder Management

| Enum | Values | Source |
|------|--------|--------|
| `StakeholderType` | `internal`, `external`, `partner` | Stakeholder management |
| `StakeholderRole` | `executive`, `manager`, `team_member`, `client`, `vendor`, `consultant`, `other` | Stakeholder identification |
| `InvolvementLevel` | `high`, `medium`, `low`, `minimal` | Stakeholder analysis |

### Milestone

| Enum | Values | Source |
|------|--------|--------|
| `MilestoneStatus` | `pending`, `in_progress`, `completed`, `cancelled` | Project milestones |

### Activity & Audit

| Enum | Values | Source |
|------|--------|--------|
| `ActivityType` | `create`, `update`, `delete`, `comment`, `assign`, `status_change` | Activity logging |
| `AuditSeverity` | `low`, `medium`, `high`, `critical` | Audit logging |

## Usage Examples

### Backend (Validation Schemas)

```typescript
import Joi from 'joi';
import { TASK_PRIORITIES, TASK_STATUSES } from '@/lib/enums';

export const createTaskSchema = Joi.object({
  title: Joi.string().required(),
  status: Joi.string().valid(...TASK_STATUSES).optional(),
  priority: Joi.string().valid(...TASK_PRIORITIES).optional(),
});
```

### Backend (Route Handlers)

```typescript
import { TIME_ENTRY_STATUSES, WORK_TYPES } from '@/lib/enums';

// Validate work type
if (!WORK_TYPES.includes(workType)) {
  return res.status(400).json({ error: 'Invalid work type' });
}

// Set default status
const newEntry = {
  ...data,
  status: 'pending' as const,
};
```

### Frontend (React Components)

```typescript
import { TaskStatus, TASK_STATUSES, getTaskStatusLabel } from '@/lib/enums';

// Type-safe status
const [status, setStatus] = useState<TaskStatusType>(TaskStatus.TODO);

// Render status options
<select value={status} onChange={(e) => setStatus(e.target.value as TaskStatusType)}>
  {TASK_STATUSES.map((s) => (
    <option key={s} value={s}>{getTaskStatusLabel(s, 'th')}</option>
  ))}
</select>
```

### Prisma Queries

```typescript
import { TaskStatus, ProjectStatus } from '@prisma/client';

// Query tasks by status
const tasks = await prisma.task.findMany({
  where: {
    status: TaskStatus.IN_PROGRESS,
  },
});

// Query projects
const projects = await prisma.project.findMany({
  where: {
    status: { in: [ProjectStatus.ACTIVE, ProjectStatus.PLANNING] },
  },
});
```

## Status Mapping (API ↔ Database)

Some statuses have different conventions between API and database:

| API Status | Database Status | Notes |
|------------|-----------------|-------|
| `todo` | `planning` | Project planning phase |
| `in_progress` | `active` | Active work |
| `in_review` | `active` | Still active, under review |
| `done` | `completed` | Completed work |
| `inactive` | `cancelled` | Cancelled/inactive |

Use the mapping functions in `backend/lib/enums/constants.ts`:

```typescript
import { PROJECT_STATUS_API_TO_DB, PROJECT_STATUS_DB_TO_API } from '@/lib/enums';

// Convert API status to database status
const dbStatus = PROJECT_STATUS_API_TO_DB[apiStatus];

// Convert database status to API status
const apiStatus = PROJECT_STATUS_DB_TO_API[dbStatus];
```

## Files Reference

| File | Purpose |
|------|---------|
| `backend/lib/enums/constants.ts` | Central enum constants for backend |
| `backend/lib/enums/index.ts` | Export barrel file |
| `backend/lib/schema.ts` | Drizzle ORM pgEnum definitions |
| `prisma/schema.prisma` | Prisma enum definitions |
| `next-app/lib/enums.ts` | Frontend enum definitions with labels |
| `backend/db/migrations/0004_create_enums.sql` | PostgreSQL migration |

## Adding New Enums

1. Add to `backend/lib/enums/constants.ts`
2. Add to `prisma/schema.prisma`
3. Add to `backend/lib/schema.ts` (Drizzle)
4. Add to `next-app/lib/enums.ts`
5. Create migration for PostgreSQL
6. Run `npx prisma generate`

## Validation Best Practices

1. **Always use constants** - Never hardcode enum values in validation
2. **Import from central location** - Use `@/lib/enums` for consistency
3. **Type safety** - Use TypeScript types for enum values
4. **Labels** - Use label functions for UI display
5. **i18n** - Support both English and Thai labels
