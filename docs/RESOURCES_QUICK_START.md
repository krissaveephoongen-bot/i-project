# Resources Pages - Quick Start Guide

## What's New

Two new pages have been added to manage teams and resource allocations:

1. **Team Management** - `/resources/team`
2. **Resource Allocation** - `/resources/allocation`

## Accessing the Pages

### From the Menu
Both pages appear in the main navigation menu under "Projects" section:
- Look for "Team Management" with a Users icon
- Look for "Resource Allocation" with a GitBranch icon

### Direct URLs
- Team Management: `http://localhost:5173/resources/team`
- Resource Allocation: `http://localhost:5173/resources/allocation`

## Team Management Page Overview

### Main Features
- **View All Teams**: See all teams in a card grid
- **Create New Team**: Add new teams with description
- **Manage Members**: Add/remove team members
- **Assign Roles**: Set member roles (Member, Manager, Lead)
- **Search Teams**: Find teams by name or description

### Quick Actions

#### Create a Team
1. Click **"New Team"** button (top right)
2. Enter team name (required) and description
3. Click **"Create Team"**
4. Team appears in the grid immediately

#### Add Member to Team
1. Click on a team card to select it
2. Scroll to "Team Members" section
3. Click **"Add Member"** button
4. Select user from dropdown
5. Choose role (Member/Manager/Lead)
6. Click **"Add Member"** to confirm

#### Remove Member
1. Select a team
2. Find the member in the list
3. Click the **Trash** icon next to their name
4. Confirm removal

## Resource Allocation Page Overview

### Main Features
- **User Capacity Overview**: See total, allocated, and available hours
- **Utilization Tracking**: Visual progress bar showing capacity usage
- **Project Allocations**: List all projects assigned to each user
- **Smart Allocation**: Add new allocations with project details
- **Filtering**: Find users by name, status, or utilization level

### Color Coding
- **Green**: Low utilization (<70%) ✓ Capacity available
- **Yellow**: Medium utilization (70-90%) ⚠ Approaching capacity
- **Red**: High utilization (>90%) ⚠ Over capacity

### Quick Actions

#### View User Details
1. Click on a user card to select it
2. See full capacity breakdown:
   - Total Capacity (hours)
   - Allocated (currently assigned)
   - Available (remaining)
3. View all active allocations

#### Add Allocation
1. Select a user from the list
2. Click **"Add Allocation"** (or "New Allocation" at top)
3. Fill in the form:
   - **Project Name**: Name of the project (required)
   - **Allocated Hours**: Hours to assign (required)
   - **Role**: User's role in project (optional)
   - **Dates**: Start and end dates
   - **Status**: Active/On Hold/Completed
4. Click **"Create Allocation"**

#### Remove Allocation
1. Select a user with allocations
2. Find the allocation in the "Active Allocations" section
3. Click the **Trash** icon
4. Confirm removal

### Filtering Options

#### Search
- Search by user name or email

#### By Status
- All Statuses (default)
- Over Capacity (>90% utilized)
- Critical (>100% allocated)

#### By Utilization
- All Levels (default)
- High (70%+)
- Medium (50-70%)
- Low (<50%)

## Statistics & Metrics

### Team Management Page
- **Team Cards**: Show member count and creation date
- **Member Details**: Display email and role for each member

### Resource Allocation Page
#### Overview Cards
- **Total Users**: Number of team members
- **Total Allocations**: Number of active allocations
- **Avg. Utilization**: Average capacity usage across team

#### Per-User Metrics
- **Total Capacity**: Weekly/monthly hours available
- **Allocated**: Hours currently assigned
- **Available**: Remaining capacity
- **Utilization %**: Percentage of capacity used

## Best Practices

### Team Management
✓ Create logical team structures aligned with project needs
✓ Assign clear roles within teams (Lead, Manager, Member)
✓ Keep team descriptions updated
✓ Regularly review team membership

### Resource Allocation
✓ Plan allocations to match project timelines
✓ Monitor utilization to prevent overallocation
✓ Balance workload across team members
✓ Update allocation status as projects progress
✓ Keep utilization under 85% for sustainable workload

## Common Tasks

### Task: Move Member to Different Team
1. Go to Team Management
2. Remove member from old team (click trash icon)
3. Go to new team
4. Add same member (click "Add Member")

### Task: Check Team Utilization
1. Go to Resource Allocation
2. View the individual user cards
3. Check their utilization percentage (color-coded)
4. Click on user to see which projects they're allocated to

### Task: Reallocate Resources
1. Go to Resource Allocation
2. Select user with high utilization
3. Remove some allocations (click trash icon)
4. Find user with lower utilization
5. Add the removed allocations to them

### Task: Plan Project Resources
1. Go to Team Management, identify skilled members
2. Go to Resource Allocation
3. Add allocations for these members to the project
4. Monitor utilization as project progresses

## Troubleshooting

### Can't See the Pages?
- Check if you have proper access/role
- Refresh the page (Ctrl+R or Cmd+R)
- Clear browser cache

### Can't Add Member?
- Make sure user isn't already in the team
- Ensure user has been registered in the system
- Check that a team is selected

### Allocation Not Showing?
- Confirm user is selected
- Check dates are in correct format
- Verify hours don't exceed available capacity

### Why is User Showing Over Capacity?
- Their allocations exceed total capacity
- Review and adjust allocations to balance workload
- Check if capacity value is correct

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Close Modal | ESC |
| Search Focus | Ctrl+F (with filter input selected) |
| Navigate | Tab |

## API Integration Notes

For developers integrating with backend:

### Team Endpoints Used
- `GET /teams` - List all teams
- `POST /teams` - Create team
- `GET /teams/{id}/members` - Get team members
- `POST /teams/{id}/members` - Add member
- `DELETE /teams/{id}/members/{userId}` - Remove member
- `DELETE /teams/{id}` - Delete team

### Resource Endpoints Used
- `GET /api/resources/{userId}/capacity` - Get user capacity
- `POST /api/resources/{userId}/allocate` - Create allocation
- `POST /api/resources/{userId}/deallocate` - Remove allocation

### Data Format Expected
```typescript
// Team
{
  id: string;
  name: string;
  description?: string;
  lead_id?: string;
  lead_name?: string;
  member_count: number;
  created_at: string;
  updated_at: string;
}

// Allocation
{
  projectId: string;
  projectName: string;
  allocatedHours: number;
  startDate: Date;
  endDate: Date;
  role: string;
  status: 'active' | 'completed' | 'on-hold';
}
```

## Performance Tips

- Use search/filter to narrow results on large teams
- Allocations load efficiently with virtual scrolling
- Team cards are optimized for grid display
- Modal forms validate client-side before submission

## Support

For issues or feature requests:
1. Check the implementation documentation
2. Review the mock data structure
3. Verify API endpoints are correct
4. Check browser console for errors

---

**Last Updated**: December 2024
**Version**: 1.0
