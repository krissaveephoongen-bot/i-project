# Team Member Management Implementation Guide

## Overview
This guide walks you through implementing the complete team member management system for your project management application.

## Files Created

### 1. Database Migration
**File:** `database/migrations/20241215_update_users_table.sql`
- Adds new columns to `users` table: `role`, `department`, `position`, `status`
- Creates indexes on `role`, `status`, and `department` for performance
- Sets up automatic timestamp management with triggers
- Includes data migration for existing records

### 2. Frontend Service
**File:** `src/services/teamMemberService.ts`
- TypeScript service for all team member API operations
- Fully typed interfaces and responses
- Methods:
  - `getTeamMembers()` - Get all members with filters
  - `getProjectManagers()` - Get only project managers
  - `getTeamMembersByRole()` - Get members by role
  - `getTeamMembersByDepartment()` - Get members by department
  - `getActiveTeamMembers()` - Get only active members
  - `getTeamMember()` - Get specific member
  - `createTeamMember()` - Create new member
  - `updateTeamMember()` - Update member details
  - `deleteTeamMember()` - Delete member
  - `updateTeamMemberStatus()` - Change member status
  - `getTeamMemberStatistics()` - Get statistics

### 3. Backend API Routes
**File:** `server/team-member-routes.js`
- Complete REST API endpoints for team member management
- Supports filtering, pagination, and search
- Endpoints:
  - `GET /api/team-members` - List with filters
  - `GET /api/team-members/:memberId` - Get specific member
  - `POST /api/team-members` - Create member
  - `PUT /api/team-members/:memberId` - Update member
  - `DELETE /api/team-members/:memberId` - Delete member
  - `GET /api/team-members/statistics` - Get statistics

### 4. Server Configuration
**File:** `server/app.js` (Updated)
- Added import for `team-member-routes.js`
- Registered routes at `/api` endpoint

## Implementation Steps

### Step 1: Run Database Migration

```bash
# Option A: Using node-sql-parser or direct SQL execution
# Run the migration file against your database
psql -h your-host -U your-user -d your-database -f database/migrations/20241215_update_users_table.sql

# Option B: Using your migration tool (if configured)
npm run db:migrate

# Option C: Manual execution via your database admin panel
# Copy and paste the SQL from the migration file
```

### Step 2: Verify Backend Routes

The routes have been automatically integrated into `server/app.js`. Verify by:

1. Restart your server:
```bash
npm run server
# or
npm run dev:all
```

2. Test the endpoints:
```bash
# Get all team members
curl http://localhost:5001/api/team-members

# Get project managers only
curl "http://localhost:5001/api/team-members?role=Project%20Manager"

# Get active members only
curl "http://localhost:5001/api/team-members?status=active"

# Search by name or email
curl "http://localhost:5001/api/team-members?search=john"
```

### Step 3: Update Frontend Components

#### 3.1 Use the Team Member Service in Projects Component

Replace the current `useTeamMembers` hook with the new service:

```typescript
// src/pages/Projects.tsx
import { useQuery } from '@tanstack/react-query';
import { teamMemberService } from '../services/teamMemberService';

// Replace the old useTeamMembers hook:
const useTeamMembers = () => {
  return useQuery({
    queryKey: ['team-members'],
    queryFn: () => teamMemberService.getActiveTeamMembers(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// For project managers dropdown:
const useProjectManagers = () => {
  return useQuery({
    queryKey: ['project-managers'],
    queryFn: () => teamMemberService.getProjectManagers(),
    staleTime: 1000 * 60 * 5,
  });
};
```

#### 3.2 Update Project Manager Selection

In your project creation/edit form:

```typescript
// Old approach - hardcoded or inefficient
// const projectManagerOptions = ...

// New approach - dynamic from database
const { data: projectManagers = [], isLoading } = useProjectManagers();

const projectManagerOptions = projectManagers.map(pm => ({
  label: pm.name,
  value: pm.id,
}));

// In your select component:
<Select value={selectedManager} onValueChange={setSelectedManager}>
  <SelectTrigger>
    <SelectValue placeholder="Select Project Manager" />
  </SelectTrigger>
  <SelectContent>
    {isLoading ? (
      <SelectItem value="">Loading...</SelectItem>
    ) : (
      projectManagers.map(pm => (
        <SelectItem key={pm.id} value={pm.id}>
          {pm.name} ({pm.position})
        </SelectItem>
      ))
    )}
  </SelectContent>
</Select>
```

#### 3.3 Create Team Member Selection Component

```typescript
// src/components/TeamMemberSelect.tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { teamMemberService } from '../services/teamMemberService';
import { Button } from './ui/button';
import { X } from 'lucide-react';

interface TeamMemberSelectProps {
  value: string[];
  onChange: (members: string[]) => void;
  placeholder?: string;
  maxMembers?: number;
}

export const TeamMemberSelect = ({
  value,
  onChange,
  placeholder = 'Select team members',
  maxMembers,
}: TeamMemberSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const { data: allMembers = [], isLoading } = useQuery({
    queryKey: ['team-members'],
    queryFn: () => teamMemberService.getActiveTeamMembers(),
  });

  const selectedMembers = allMembers.filter(m => value.includes(m.id));
  const availableMembers = allMembers.filter(m => !value.includes(m.id));

  const handleAdd = (memberId: string) => {
    if (maxMembers && value.length >= maxMembers) return;
    onChange([...value, memberId]);
  };

  const handleRemove = (memberId: string) => {
    onChange(value.filter(id => id !== memberId));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {selectedMembers.map(member => (
          <div
            key={member.id}
            className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
          >
            <span>{member.name}</span>
            <button
              onClick={() => handleRemove(member.id)}
              className="hover:text-blue-600"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      {isOpen && (
        <div className="border rounded-lg p-2 bg-white shadow-lg">
          {isLoading ? (
            <div>Loading members...</div>
          ) : (
            availableMembers.map(member => (
              <button
                key={member.id}
                onClick={() => {
                  handleAdd(member.id);
                  if (maxMembers && value.length + 1 >= maxMembers) {
                    setIsOpen(false);
                  }
                }}
                className="w-full text-left p-2 hover:bg-gray-100 rounded"
              >
                {member.name} ({member.position})
                <div className="text-xs text-gray-500">{member.email}</div>
              </button>
            ))
          )}
        </div>
      )}

      {!isOpen && (
        <Button
          variant="outline"
          onClick={() => setIsOpen(true)}
          className="w-full"
        >
          {selectedMembers.length > 0
            ? `Selected ${selectedMembers.length} member(s)`
            : placeholder}
        </Button>
      )}
    </div>
  );
};
```

#### 3.4 Create Team Members Management Page (Optional)

```typescript
// src/pages/TeamMembersManagement.tsx
import { useQuery } from '@tanstack/react-query';
import { teamMemberService } from '../services/teamMemberService';
import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export const TeamMembersManagement = () => {
  const [filters, setFilters] = useState({
    status: 'active' as const,
    role: '',
    department: '',
  });

  const { data: members = [], isLoading, error } = useQuery({
    queryKey: ['team-members', filters],
    queryFn: () => teamMemberService.getTeamMembers(filters),
  });

  const { data: stats } = useQuery({
    queryKey: ['team-stats'],
    queryFn: () => teamMemberService.getTeamMemberStatistics(),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading team members</div>;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalMembers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {stats?.activeMembers}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inactive</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-600">
              {stats?.inactiveMembers}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {members.map(member => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <div className="font-semibold">{member.name}</div>
                  <div className="text-sm text-gray-500">{member.email}</div>
                  <div className="text-xs text-gray-400">
                    {member.position} • {member.department}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm">{member.role}</div>
                  <div
                    className={`text-xs ${
                      member.status === 'active'
                        ? 'text-green-600'
                        : 'text-gray-600'
                    }`}
                  >
                    {member.status.toUpperCase()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
```

### Step 4: Update Existing Components

#### 4.1 In any component using team members:

```typescript
// BEFORE
const [projectManager, setProjectManager] = useState('');
const managers = ['John Doe', 'Jane Smith']; // hardcoded

// AFTER
import { teamMemberService } from '../services/teamMemberService';

const [projectManager, setProjectManager] = useState('');
const { data: managers = [] } = useQuery({
  queryKey: ['project-managers'],
  queryFn: () => teamMemberService.getProjectManagers(),
});
```

### Step 5: Test the Implementation

```bash
# 1. Start your server
npm run server

# 2. Start your development server
npm run dev

# 3. Test the API endpoints
curl http://localhost:5001/api/team-members

# 4. Check browser console for any errors
# Open DevTools → Console

# 5. Try creating a project and selecting a project manager
# Should show dynamic list from database
```

## Database Query Examples

### Get all project managers
```sql
SELECT id, name, email, role, position, department, status
FROM users
WHERE role = 'Project Manager' AND status = 'active'
ORDER BY name ASC;
```

### Get team members by department
```sql
SELECT id, name, email, role, position, department, status
FROM users
WHERE department = 'Engineering' AND status = 'active'
ORDER BY name ASC;
```

### Get team statistics
```sql
SELECT 
  COUNT(*) as total_members,
  SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_members,
  SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive_members
FROM users;
```

## API Endpoint Documentation

### GET /api/team-members
Get all team members with optional filters

**Query Parameters:**
- `role` (string, optional) - Filter by role
- `status` (string, optional) - Filter by status (active/inactive)
- `department` (string, optional) - Filter by department
- `search` (string, optional) - Search by name or email
- `limit` (number, default: 50) - Pagination limit
- `offset` (number, default: 0) - Pagination offset

**Example:**
```
GET /api/team-members?role=Project%20Manager&status=active&limit=20
```

### GET /api/team-members/:memberId
Get specific team member

**Example:**
```
GET /api/team-members/123
```

### POST /api/team-members
Create new team member

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "Project Manager",
  "department": "Engineering",
  "position": "Senior PM",
  "status": "active"
}
```

### PUT /api/team-members/:memberId
Update team member

**Request Body:**
```json
{
  "role": "Lead Project Manager",
  "status": "active"
}
```

### DELETE /api/team-members/:memberId
Delete team member

### GET /api/team-members/statistics
Get team member statistics

**Response:**
```json
{
  "success": true,
  "statistics": {
    "totalMembers": 25,
    "activeMembers": 23,
    "inactiveMembers": 2,
    "byRole": [
      { "role": "Project Manager", "count": 5 },
      { "role": "Developer", "count": 15 }
    ],
    "byDepartment": [
      { "department": "Engineering", "count": 15 },
      { "department": "Operations", "count": 10 }
    ]
  }
}
```

## Troubleshooting

### Migration Fails
- Check if you have database write permissions
- Ensure all parameters are correct in the SQL file
- Verify table exists: `SELECT * FROM users LIMIT 1;`

### API Endpoints Return 404
- Restart server after changes: `npm run server`
- Check that routes are registered in `server/app.js`
- Verify endpoint path matches: `/api/team-members`

### Team Members Not Showing in Dropdown
- Check browser Network tab for API errors
- Verify `teamMemberService` is imported correctly
- Check console for JavaScript errors
- Ensure team members have `status = 'active'`

### Performance Issues
- Use pagination: `?limit=20&offset=0`
- Add filters to reduce result set
- Check database indexes are created
- Monitor query performance in database logs

## Next Steps

1. **Test thoroughly** - Try all endpoints in Postman or curl
2. **Add validation** - Validate email format, required fields
3. **Add permissions** - Only admins can create/delete members
4. **Add auditing** - Log who made changes and when
5. **Add UI** - Create admin page for team management
6. **Add notifications** - Notify when member status changes

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the API endpoint documentation
3. Check browser console for errors
4. Check server logs for backend errors

