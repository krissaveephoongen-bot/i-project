# Resources Pages - API Integration Guide

## Overview
This guide explains how to integrate the Team Management and Resource Allocation pages with your backend API.

---

## Current State

The pages currently use:
- **Mock data** for demonstration
- **Client-side state management** with React hooks
- **Ready-to-use service layer** for API calls

---

## Service Layer Architecture

### TeamService (Already Implemented)
Located in `src/services/teamService.ts`

**Available Methods:**
```typescript
// Get all teams
teamService.getTeams(filters?: { search?: string; status?: string })

// Get single team with members
teamService.getTeam(teamId: string)

// Create new team
teamService.createTeam(data: { name: string; description?: string; lead_id?: string })

// Update team
teamService.updateTeam(teamId: string, data: Partial<Team>)

// Delete team
teamService.deleteTeam(teamId: string)

// Get team members
teamService.getTeamMembers(teamId: string)

// Add member to team
teamService.addTeamMember(teamId: string, userId: string, role?: string)

// Update team member role
teamService.updateTeamMember(teamId: string, userId: string, role: string)

// Remove member from team
teamService.removeTeamMember(teamId: string, userId: string)

// Get team statistics
teamService.getTeamStatistics(teamId: string)
```

### ResourceService (Already Implemented)
Located in `src/services/resourceService.ts`

**Available Methods:**
```typescript
// Get resource capacity for a user
resourceService.getResourceCapacity(userId: string)

// Update resource capacity
resourceService.updateResourceCapacity(userId: string, totalCapacity: number)

// Allocate resource to project
resourceService.allocateResource(
  userId: string,
  projectId: string,
  allocation: { allocatedHours: number; startDate: Date; endDate: Date; role: string; status: 'active' | 'completed' | 'on-hold' }
)

// Deallocate resource from project
resourceService.deallocateResource(userId: string, projectId: string)

// Get resource utilization
resourceService.getResourceUtilization(userId: string, startDate: Date, endDate: Date)

// Get team capacity
resourceService.getTeamCapacity(projectId: string, startDate: Date, endDate: Date)

// Get all resources
resourceService.getAllResources()
```

---

## Integration Steps

### Step 1: Replace Mock Data in TeamManagement.tsx

**Current State:**
```typescript
const loadData = async () => {
  setLoading(true);
  try {
    await Promise.all([loadTeams(), loadUsers()]);
  } catch (error) {
    console.error('Error loading data:', error);
    toast.error('Failed to load data');
  } finally {
    setLoading(false);
  }
};
```

**Update loadTeams():**
```typescript
const loadTeams = async () => {
  try {
    const response = await teamService.getTeams();
    const teamsWithMembers = await Promise.all(
      response.data.map(async (team) => {
        try {
          const membersResponse = await teamService.getTeamMembers(team.id);
          return {
            ...team,
            members: membersResponse.data || [],
            memberCount: membersResponse.data?.length || 0,
          };
        } catch {
          return {
            ...team,
            members: [],
            memberCount: 0,
          };
        }
      })
    );
    setTeams(teamsWithMembers);
  } catch (error) {
    console.error('Error loading teams:', error);
    toast.error('Failed to load teams');
  }
};
```

**Update loadUsers():**
```typescript
const loadUsers = async () => {
  try {
    const response = await userService.getUsers();
    setAllUsers(response.data || []);
  } catch (error) {
    console.error('Error loading users:', error);
  }
};
```

All team operations already use `teamService`, so they will work with your API!

### Step 2: Replace Mock Data in AllocationManagement.tsx

**Current State (with mock data):**
```typescript
const loadData = async () => {
  setLoading(true);
  try {
    // Mock data - replace with actual API call
    const mockUsers: UserWithAllocations[] = [
      // ... mock data ...
    ];
    setUsers(mockUsers);
  } catch (error) {
    console.error('Error loading data:', error);
    toast.error('Failed to load allocation data');
  } finally {
    setLoading(false);
  }
};
```

**Replace with Real API:**
```typescript
const loadData = async () => {
  setLoading(true);
  try {
    const response = await resourceService.getAllResources();
    const usersWithAllocations: UserWithAllocations[] = response.map((capacity: ResourceCapacity) => ({
      userId: capacity.userId,
      userName: capacity.userName || 'Unknown', // Add to ResourceCapacity type if needed
      userEmail: capacity.userEmail || '',      // Add to ResourceCapacity type if needed
      totalCapacity: capacity.totalCapacity,
      allocatedCapacity: capacity.allocatedCapacity,
      availableCapacity: capacity.availableCapacity,
      utilizationPercentage: (capacity.allocatedCapacity / capacity.totalCapacity) * 100,
      allocations: capacity.projects || [],
    }));
    setUsers(usersWithAllocations);
  } catch (error) {
    console.error('Error loading data:', error);
    toast.error('Failed to load allocation data');
  } finally {
    setLoading(false);
  }
};
```

**Update handleAddAllocation():**
```typescript
const handleAddAllocation = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!selectedUser || !newAllocation.projectName.trim() || !newAllocation.allocatedHours) {
    toast.error('Please fill in all required fields');
    return;
  }

  try {
    // Call API to create allocation
    await resourceService.allocateResource(
      selectedUser.userId,
      `proj_${Date.now()}`, // This should be a real project ID from project selection
      {
        allocatedHours: parseFloat(newAllocation.allocatedHours),
        startDate: new Date(newAllocation.startDate),
        endDate: new Date(newAllocation.endDate),
        role: newAllocation.role,
        status: newAllocation.status,
      }
    );

    toast.success('Allocation created successfully');
    setShowNewAllocationModal(false);
    setNewAllocation({
      projectName: '',
      allocatedHours: '',
      startDate: '',
      endDate: '',
      role: '',
      status: 'active',
    });
    
    // Reload data to reflect changes
    await loadData();
  } catch (error: any) {
    toast.error(error?.response?.data?.message || 'Failed to create allocation');
  }
};
```

**Update handleRemoveAllocation():**
```typescript
const handleRemoveAllocation = async (userId: string, projectId: string) => {
  if (!window.confirm('Remove this allocation?')) return;

  try {
    // Call API to remove allocation
    await resourceService.deallocateResource(userId, projectId);
    
    toast.success('Allocation removed');
    await loadData(); // Reload to reflect changes
  } catch (error: any) {
    toast.error(error?.response?.data?.message || 'Failed to remove allocation');
  }
};
```

---

## Type Definitions to Update

### ResourceCapacity Type Enhancement
**File:** `src/types/resource.ts`

```typescript
export interface ResourceCapacity {
  userId: string;
  userName?: string;           // ADD THIS
  userEmail?: string;          // ADD THIS
  totalCapacity: number;
  availableCapacity: number;
  allocatedCapacity: number;
  projects: ResourceAllocation[];
  updatedAt: Date;
}
```

### API Response Types

**Team Response:**
```typescript
interface TeamResponse {
  success: boolean;
  data: Team | Team[];
}

interface Team {
  id: string;
  name: string;
  description?: string;
  lead_id?: string;
  lead_name?: string;
  status: string;
  member_count?: number;
  created_at: string;
  updated_at: string;
}
```

**Team Member Response:**
```typescript
interface TeamMemberResponse {
  success: boolean;
  data: TeamMember | TeamMember[];
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  user_role: string;
  team_role: string;
  joined_at: string;
}
```

**Resource Allocation Response:**
```typescript
interface ResourceAllocationResponse {
  success: boolean;
  data: ResourceCapacity;
}
```

---

## Backend Requirements

### Team Management Endpoints

```
GET /api/teams
  Query: search?, status?
  Response: { success: boolean; data: Team[] }

POST /api/teams
  Body: { name: string; description?: string; lead_id?: string }
  Response: { success: boolean; data: Team }

GET /api/teams/:id
  Response: { success: boolean; data: Team & { members: TeamMember[] } }

PUT /api/teams/:id
  Body: { name?: string; description?: string; lead_id?: string }
  Response: { success: boolean; data: Team }

DELETE /api/teams/:id
  Response: { success: boolean; message: string }

GET /api/teams/:id/members
  Response: { success: boolean; data: TeamMember[] }

POST /api/teams/:id/members
  Body: { user_id: string; role?: string }
  Response: { success: boolean; data: TeamMember }

PUT /api/teams/:id/members/:userId
  Body: { role: string }
  Response: { success: boolean; data: TeamMember }

DELETE /api/teams/:id/members/:userId
  Response: { success: boolean; message: string }

GET /api/teams/:id/statistics
  Response: { success: boolean; data: TeamStatistics }
```

### Resource Management Endpoints

```
GET /api/resources
  Response: { data: ResourceCapacity[] }

GET /api/resources/:userId/capacity
  Response: ResourceCapacity

PUT /api/resources/:userId/capacity
  Body: { totalCapacity: number }
  Response: ResourceCapacity

POST /api/resources/:userId/allocate
  Body: {
    projectId: string;
    allocatedHours: number;
    startDate: string (ISO);
    endDate: string (ISO);
    role: string;
    status: 'active' | 'completed' | 'on-hold';
  }
  Response: ResourceCapacity

POST /api/resources/:userId/deallocate
  Body: { projectId: string }
  Response: ResourceCapacity

GET /api/resources/:userId/utilization
  Query: startDate, endDate
  Response: ResourceUtilization

GET /api/resources/team/capacity
  Query: projectId, startDate, endDate
  Response: TeamCapacity
```

---

## Error Handling

### Implement Proper Error Handling

```typescript
// Example from TeamManagement.tsx
try {
  const response = await teamService.createTeam(newTeamData);
  toast.success('Team created successfully');
  // ... rest of success logic
} catch (error: any) {
  const errorMessage = error?.response?.data?.message || 
                      error?.message || 
                      'Failed to create team';
  toast.error(errorMessage);
  console.error('Create team error:', error);
}
```

### Common Error Scenarios

1. **Validation Errors** (400)
   - Display field-specific errors
   - Highlight invalid fields in forms

2. **Authentication Errors** (401)
   - Redirect to login
   - Clear stored tokens

3. **Authorization Errors** (403)
   - Show permission denied message
   - Disable unavailable actions

4. **Server Errors** (500)
   - Show generic error message
   - Log to error tracking service
   - Offer retry option

---

## Testing Integration

### Manual Testing Checklist

- [ ] Load teams on page open
- [ ] Create a new team via API
- [ ] Add member to team via API
- [ ] Remove member from team via API
- [ ] Delete team via API
- [ ] Load allocations on page open
- [ ] Create allocation via API
- [ ] Remove allocation via API
- [ ] Error handling for all operations
- [ ] Toast notifications display correctly

### Unit Test Example

```typescript
describe('TeamManagement API Integration', () => {
  it('should load teams from API', async () => {
    const mockTeams = [
      { id: '1', name: 'Team A', member_count: 3, created_at: new Date().toISOString() },
    ];
    
    jest.spyOn(teamService, 'getTeams').mockResolvedValue({ data: mockTeams });
    
    // Test component loading
    // Assert teams are displayed
  });

  it('should handle API errors gracefully', async () => {
    jest.spyOn(teamService, 'getTeams').mockRejectedValue(new Error('API Error'));
    
    // Test error notification
    // Assert error message is shown
  });
});
```

---

## Debugging Tips

### Enable API Logging
Add this to your service calls:

```typescript
const response = await teamService.getTeams();
console.log('Teams Response:', response);
```

### Check Network Requests
1. Open browser DevTools (F12)
2. Go to Network tab
3. Perform actions and inspect requests/responses
4. Check status codes and response bodies

### Common Issues

| Issue | Solution |
|-------|----------|
| 404 errors | Verify API endpoints are correct |
| 401 errors | Check authentication token is valid |
| CORS errors | Verify backend CORS configuration |
| Empty data | Check API is returning data in expected format |
| Slow loading | Implement pagination or lazy loading |

---

## Performance Optimization

### Implement Pagination

```typescript
interface PaginationParams {
  page: number;
  pageSize: number;
  search?: string;
}

// Example API call
const response = await teamService.getTeams({
  page: 1,
  pageSize: 20,
  search: searchTerm,
});
```

### Implement Caching

```typescript
// Use React Query for caching
import { useQuery } from '@tanstack/react-query';

const { data: teams, isLoading } = useQuery({
  queryKey: ['teams', searchTerm],
  queryFn: () => teamService.getTeams({ search: searchTerm }),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

### Virtual Scrolling

For large lists, implement virtual scrolling:

```typescript
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={400}
  itemCount={users.length}
  itemSize={80}
  width="100%"
>
  {UserRow}
</FixedSizeList>
```

---

## Security Considerations

1. **Authentication**: Ensure all requests include authorization header
2. **Validation**: Validate all user inputs on client and server
3. **CSRF Protection**: Implement CSRF tokens for state-changing requests
4. **Rate Limiting**: Handle rate limit responses (429)
5. **Data Encryption**: Use HTTPS for all API calls
6. **Access Control**: Verify user has permission for each action

---

## Deployment Checklist

- [ ] Remove all console.log statements (or use proper logging)
- [ ] Replace mock data with real API calls
- [ ] Update API endpoints for production
- [ ] Configure error tracking (Sentry, etc.)
- [ ] Add proper logging
- [ ] Test all user workflows
- [ ] Verify error handling
- [ ] Check performance with real data
- [ ] Implement analytics tracking
- [ ] Document API changes

---

## Support & Troubleshooting

For issues during integration:
1. Check the NetworkTab in DevTools
2. Review console errors
3. Verify API endpoints and response formats
4. Check authentication tokens
5. Review the type definitions
6. Compare with existing service implementations

---

**Last Updated**: December 2024
**Version**: 1.0
