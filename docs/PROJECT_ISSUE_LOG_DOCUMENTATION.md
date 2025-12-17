# Project Issue Log System Documentation

## Overview
A complete project issue tracking system that allows users to log, track, and manage project issues with status updates, priority levels, and impact assessment.

## System Components

### 1. Database Schema
**File**: `database/migrations/add-project-issues-table.sql`

#### Table: `project_issues`
Stores all project-related issues with comprehensive tracking fields.

**Columns**:
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `object_id` | TEXT | Legacy compatibility ID |
| `project_id` | UUID | Foreign key to projects table |
| `code` | TEXT | Issue identifier (e.g., ISS-001) |
| `title` | TEXT | Issue title |
| `description` | TEXT | Detailed description |
| `category` | ENUM | Issue category |
| `status` | ENUM | Current issue status |
| `priority` | ENUM | Priority level |
| `assigned_to` | TEXT | Person assigned to resolve |
| `reported_by` | TEXT | Person who reported |
| `reported_date` | TIMESTAMP | When issue was reported |
| `resolved_date` | TIMESTAMP | When issue was resolved |
| `due_date` | TIMESTAMP | Target resolution date |
| `impact_on_schedule` | BOOLEAN | Does it affect schedule? |
| `impact_on_budget` | BOOLEAN | Does it affect budget? |
| `estimated_cost` | DECIMAL | Cost impact |
| `resolution_notes` | TEXT | How it was resolved |
| `root_cause` | TEXT | Root cause analysis |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |
| `created_by` | TEXT | Created by user |
| `updated_by` | TEXT | Last updated by user |
| `is_deleted` | BOOLEAN | Soft delete flag |

#### Enums

**issue_status**: `open`, `in-progress`, `resolved`, `closed`, `on-hold`, `cancelled`

**issue_priority**: `low`, `medium`, `high`, `critical`

**issue_category**: `technical`, `schedule`, `budget`, `resource`, `quality`, `communication`, `other`

#### Indexes
- `idx_project_issues_project_id` - Fast filtering by project
- `idx_project_issues_status` - Fast filtering by status
- `idx_project_issues_priority` - Fast filtering by priority
- `idx_project_issues_assigned_to` - Fast lookup by assignee
- `idx_project_issues_category` - Fast filtering by category
- `idx_project_issues_created_at` - Chronological ordering

#### Views
1. **project_issues_summary** - Aggregated statistics by project
2. **critical_project_issues** - All open/critical issues across projects

---

### 2. API Routes
**File**: `server/issue-routes.js`

#### Endpoints

##### Get Issues by Project
```
GET /api/projects/:projectId/issues
```
**Query Parameters**:
- `status` - Filter by status
- `priority` - Filter by priority
- `category` - Filter by category

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "code": "ISS-001",
      "title": "Issue Title",
      "status": "open",
      "priority": "high",
      ...
    }
  ],
  "count": 5
}
```

##### Get Single Issue
```
GET /api/issues/:issueId
```

##### Create Issue
```
POST /api/projects/:projectId/issues
```
**Request Body**:
```json
{
  "code": "ISS-001",
  "title": "Issue Title",
  "description": "Detailed description",
  "category": "technical",
  "priority": "high",
  "assigned_to": "Manager Name",
  "reported_by": "Reporter Name",
  "impact_on_schedule": true,
  "impact_on_budget": false,
  "estimated_cost": 5000,
  "due_date": "2025-12-20"
}
```

##### Update Issue
```
PUT /api/issues/:issueId
```
Partially update any fields (same schema as create)

##### Update Issue Status
```
PATCH /api/issues/:issueId/status
```
**Request Body**:
```json
{
  "status": "resolved",
  "resolved_date": "2025-12-15T10:00:00Z"
}
```

##### Delete Issue
```
DELETE /api/issues/:issueId
```
Soft delete - marks `is_deleted = true`

##### Get Issue Summary
```
GET /api/projects/:projectId/issues/summary
```
**Response**:
```json
{
  "success": true,
  "data": {
    "total_issues": 10,
    "open_issues": 3,
    "in_progress_issues": 2,
    "resolved_issues": 4,
    "closed_issues": 1,
    "critical_issues": 1,
    "high_priority_issues": 3,
    "schedule_impact_count": 2,
    "budget_impact_count": 1,
    "total_issue_cost": 15000
  }
}
```

##### Get Critical Issues
```
GET /api/issues/critical
```
Returns all open or high/critical priority issues across all projects

---

### 3. React Components

#### ProjectIssueLog Component
**File**: `src/pages/ProjectIssueLog.tsx`

**Props**:
```typescript
interface ProjectIssueLogProps {
  projectId: string;
  projectName?: string;
}
```

**Features**:
- Display issue summary cards (total, open, in-progress, critical, resolved)
- Issue list with collapsible details
- Filter by status and priority
- Create new issues modal
- Edit existing issues
- Delete issues
- Update issue status via dropdown
- Responsive design with dark mode support

**Usage**:
```tsx
import ProjectIssueLog from '@/pages/ProjectIssueLog';

export default function MyComponent() {
  return (
    <ProjectIssueLog 
      projectId="project-id-here" 
      projectName="My Project"
    />
  );
}
```

#### useProjectIssues Hook
**File**: `hooks/useProjectIssues.ts`

**Return Type**:
```typescript
interface UseProjectIssuesReturn {
  issues: ProjectIssue[];
  summary: IssueSummary | null;
  isLoading: boolean;
  error: string | null;
  fetchIssues: () => Promise<void>;
  fetchSummary: () => Promise<void>;
  createIssue: (data: Partial<ProjectIssue>) => Promise<ProjectIssue>;
  updateIssue: (issueId: string, data: Partial<ProjectIssue>) => Promise<ProjectIssue>;
  updateIssueStatus: (issueId: string, status: string) => Promise<void>;
  deleteIssue: (issueId: string) => Promise<void>;
}
```

**Usage**:
```tsx
import { useProjectIssues } from '@/hooks/useProjectIssues';

export default function IssueManager() {
  const { issues, summary, isLoading, fetchIssues, createIssue } = useProjectIssues('project-id');
  
  const handleCreate = async () => {
    await createIssue({
      code: 'ISS-001',
      title: 'New Issue',
      priority: 'high'
    });
    await fetchIssues(); // Refresh list
  };
  
  return (
    <div>
      {/* Render issues */}
    </div>
  );
}
```

---

## Status Tracking Flow

### Issue Lifecycle
```
                    ┌─────────────┐
                    │    OPEN     │ (Initial state)
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ IN-PROGRESS │
                    └──────┬──────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
       ┌────▼────┐  ┌─────▼─────┐  ┌─────▼─────┐
       │RESOLVED │  │ ON-HOLD   │  │ CANCELLED │
       └────┬────┘  └───────────┘  └───────────┘
            │
       ┌────▼────┐
       │ CLOSED  │ (Final state)
       └─────────┘
```

### Status Descriptions
- **Open**: Issue just reported, waiting for investigation
- **In-Progress**: Someone is actively working on the issue
- **On-Hold**: Issue paused, waiting for external input
- **Resolved**: Issue fixed, pending closure confirmation
- **Closed**: Issue confirmed resolved and closed
- **Cancelled**: Issue deemed not to be addressed

---

## Priority Levels

| Level | Color | Use Case |
|-------|-------|----------|
| **Critical** | Red | Blocking project delivery, severity level 1 |
| **High** | Orange | Significant impact, needs quick attention |
| **Medium** | Yellow | Moderate impact, should be resolved soon |
| **Low** | Green | Minor issue, can be addressed later |

---

## Issue Categories

| Category | Icon | Purpose |
|----------|------|---------|
| **Technical** | 🔧 | Code bugs, infrastructure issues |
| **Schedule** | 📅 | Timeline delays, deadline risks |
| **Budget** | 💰 | Cost overruns, financial impacts |
| **Resource** | 👥 | Team capacity, staffing issues |
| **Quality** | ✓ | QA failures, testing concerns |
| **Communication** | 💬 | Stakeholder, coordination issues |
| **Other** | 📋 | Miscellaneous issues |

---

## Impact Assessment

### Schedule Impact
When checked, indicates the issue affects project timeline:
- Delays milestone dates
- Extends project duration
- Creates critical path dependencies

### Budget Impact
When checked, indicates financial impact:
- Additional costs
- Increased labor hours
- Resource overhead

**Fields**:
- `estimated_cost` - Quantify the financial impact
- `impact_on_schedule` - Boolean flag
- `impact_on_budget` - Boolean flag

---

## Issue Analysis

### Root Cause Analysis
Document the underlying reason for the issue:
- System limitations
- Process gaps
- Resource constraints
- External dependencies

### Resolution Notes
Document the solution implemented:
- Actions taken
- Resources used
- Timeline for resolution
- Lessons learned

---

## Filtering & Search

The component supports filtering by:
- **Status**: Open, In Progress, Resolved, Closed, On-Hold, Cancelled
- **Priority**: Low, Medium, High, Critical

Filters can be combined for refined views:
- All critical open issues: `status=open`, `priority=critical`
- In-progress tasks: `status=in-progress`
- Budget-impacting issues: Filter in UI by description/category

---

## Summary Statistics

The Issue Summary Card displays:
- **Total Issues**: All issues for the project
- **Open Issues**: Unresolved, initial state issues
- **In Progress**: Issues being actively worked on
- **Critical Issues**: All critical priority issues
- **Resolved Issues**: Fixed but not yet closed
- **Schedule Impact Count**: Issues affecting timeline
- **Budget Impact Count**: Issues affecting costs
- **Total Issue Cost**: Sum of all estimated costs

---

## Integration Examples

### 1. Add to Project Detail Page
```tsx
import ProjectIssueLog from '@/pages/ProjectIssueLog';

export default function ProjectDetail() {
  return (
    <div>
      <h1>Project Details</h1>
      <ProjectIssueLog projectId={projectId} projectName={projectName} />
    </div>
  );
}
```

### 2. Separate Issues Management Page
```tsx
import ProjectIssueLog from '@/pages/ProjectIssueLog';

export default function IssuesPage() {
  const { projectId } = useParams();
  
  return <ProjectIssueLog projectId={projectId} />;
}
```

### 3. Use Hook in Custom Component
```tsx
import { useProjectIssues } from '@/hooks/useProjectIssues';

export default function CustomIssueBoard() {
  const { issues, summary, createIssue } = useProjectIssues(projectId);
  
  // Custom rendering logic
}
```

---

## Error Handling

The system includes:
- API error catching and logging
- User-friendly error messages
- Graceful degradation
- Loading states during data fetching
- Validation of required fields

---

## Performance Considerations

### Optimizations
- Lazy loading of issue details
- Efficient filtering (client-side)
- Indexed database queries
- Minimal API calls

### Scalability
- Pagination support (can be added)
- Soft deletes instead of hard deletes
- Archive old issues
- Database view aggregation

---

## Database Migration

Run the migration to add the issue tracking tables:
```bash
# Execute the migration script
psql -U your_user -d your_db -f database/migrations/add-project-issues-table.sql

# Or insert sample data
SELECT insert_sample_project_issues();
```

---

## Sample Data

The migration includes sample issues:
- Database Connection Timeout (Technical, High)
- Scope Creep Risk (Schedule, Critical)
- Team Resource Shortage (Resource, High)
- UI Responsive Issues (Quality, Medium)

Access via: `/api/issues/critical`

---

## Browser Compatibility
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (responsive)

## Accessibility
- Semantic HTML structure
- Color-blind friendly badges
- Keyboard navigation support
- Dark mode support
- ARIA labels for interactive elements

---

## Security Considerations

### Authentication
All endpoints require user authentication via credentials

### Authorization
Implement role-based access control:
- Admins: Full CRUD access
- Project Managers: Can view/edit project issues
- Team Members: Can view and report issues

### Data Protection
- Soft deletes preserve audit trail
- is_deleted flag prevents exposure
- created_by/updated_by tracks changes

---

## Future Enhancements

1. **Issue Dependencies**: Link related issues
2. **Comments/Discussion**: Add comments to issues
3. **Attachments**: Upload issue-related documents
4. **Automation**: Auto-escalate old critical issues
5. **Notifications**: Alert assignees of status changes
6. **Reports**: Generate issue trend reports
7. **SLA Tracking**: Track resolution time SLAs
8. **Integration**: Link to code commits, PRs

---

## Troubleshooting

### Issues not loading
- Check API endpoint connectivity
- Verify projectId is correct
- Check browser console for errors
- Verify authentication token

### Summary stats incorrect
- Check for soft-deleted issues
- Verify database triggers updated_at properly
- Run `SELECT * FROM project_issues_summary` to debug

### Modal form not submitting
- Check console for validation errors
- Verify all required fields filled
- Check API response for errors

---

## Support & Contact
For issues or questions about the project issue log system, contact the development team or refer to the main project documentation.
