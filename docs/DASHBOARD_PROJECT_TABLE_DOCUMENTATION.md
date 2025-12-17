# Dashboard Project Table & Charts Documentation

## Overview
A comprehensive project management table has been added to the dashboard with detailed project information, progress tracking, and analytical charts.

## Files Modified
1. **src/pages/dashboard/Dashboard.tsx** - Added ProjectTableView import and component
2. **src/pages/dashboard/DashboardRedesigned.tsx** - Added ProjectTableView import and component

## New Component Created
**src/pages/dashboard/ProjectTableView.tsx** - Main project table and charts component

---

## Project Table Features

### Table Columns (11 columns)
| Column | Description | Data Source |
|--------|-------------|-------------|
| ลำดับ (No.) | Row number/sequence | Auto-generated |
| Project Code | Project code | `projects.code` |
| ชื่อโครงการ (Project Name) | Project name | `projects.name` |
| มูลค่าสัญญา (Contract Value) | Contract amount in currency | `projects.contract_amount` |
| วันที่เริ่มสัญญา (Start Date) | Contract start date | `projects.start_date` |
| วันสิ้นสุดสัญญา (End Date) | Contract end date | `projects.end_date` |
| ดำเนินการไปแล้ว (วัน) (Days Executed) | Days elapsed since project start | Calculated from start_date |
| คงเหลือ (วัน) (Days Remaining) | Days until project end | Calculated from end_date |
| Project Manager | Assigned project manager | `projects.project_manager` |
| ความคืบหน้า แผนงาน (Plan %) | Planned progress percentage | `projects.planned_progress` |
| แผนจริง (Actual %) | Actual progress percentage | `projects.actual_progress` |
| Risk Project Status | Risk level badge | `projects.risk_level` |

### Risk Status Colors & Icons
- **Low** (Green): ✓ Check icon
- **Medium** (Yellow): ⚠ Alert icon
- **High** (Orange): ⚠ Alert icon
- **Critical** (Red): 🔺 Triangle icon

### Interactive Features
- **Sortable columns**: Click on column headers to sort
- **Sort indicators**: Up/down chevrons show active sort
- **Responsive design**: Horizontal scroll on mobile
- **Dark mode support**: Full dark mode styling

---

## Analytics Charts

### 1. Project Manager Assigned (Bar Chart)
- **Type**: Horizontal/Vertical Bar Chart
- **Data**: Count of projects assigned to each project manager
- **Purpose**: Shows workload distribution among project managers
- **Height**: 300px
- **Data Source**: Aggregated from `projects.project_manager` field

### 2. Risk Project Status Count (Pie Chart)
- **Type**: Pie Chart
- **Data**: Distribution of projects by risk level
  - Low
  - Medium
  - High
  - Critical
- **Purpose**: Visual representation of project risk portfolio
- **Data Source**: Aggregated from `projects.risk_level` field

---

## Data Calculation Logic

### Duration Calculations
```typescript
const start = new Date(p.start_date);
const end = new Date(p.end_date);
const today = new Date();

// Total days from start to end
const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

// Days elapsed from start to today
const daysExecuted = Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

// Remaining days (never negative)
const remainingDays = Math.max(0, totalDays - daysExecuted);
```

### Manager Statistics
- Groups projects by `project_manager` field
- Counts total projects per manager
- Excludes null/empty manager values

### Risk Statistics
- Groups projects by `risk_level` field
- Counts projects in each risk category
- Defaults to 'medium' if not specified

---

## API Integration

### Data Source
**Endpoint**: `GET /api/projects`

**Response Format**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "code": "PAIN-001",
      "name": "Project Name",
      "contract_amount": 550000.00,
      "start_date": "2025-11-01T00:00:00Z",
      "end_date": "2026-02-28T00:00:00Z",
      "project_manager": "Manager Name",
      "planned_progress": 75,
      "actual_progress": 80,
      "risk_level": "medium",
      "status": "active"
    }
  ]
}
```

### Error Handling
- Loading state with skeleton animation
- Error logging in console
- Graceful fallback for missing data
- Empty state message when no projects found

---

## Component Structure

### Props
None - Component fetches its own data

### State Management
```typescript
- projects: Project[] - All fetched projects
- isLoading: boolean - Loading state
- sortConfig: { key, direction } - Sort configuration
- managerStats: ProjectManagerCount[] - Manager statistics
- riskStats: RiskStatusCount[] - Risk statistics
```

### Hooks Used
- `useState` - State management
- `useEffect` - Data fetching on mount

---

## Styling & Responsiveness

### Breakpoints
- **Mobile**: Single column layout, horizontal scroll for table
- **Tablet (md)**: 2-column grid for charts
- **Desktop**: Full layout

### Colors & Dark Mode
- Supports Tailwind dark mode
- Dynamic risk status colors
- Hover states on table rows
- Smooth transitions

---

## Performance Considerations

### Optimizations
- Data fetching once on component mount
- No real-time updates (initial load only)
- Efficient sorting (client-side)
- Minimal re-renders

### Future Enhancements
- Pagination for large datasets
- Real-time data updates
- Advanced filtering
- Column visibility toggles
- Export to CSV/PDF

---

## Integration with Dashboard

### Import in Dashboard
```typescript
import ProjectTableView from './ProjectTableView';
```

### Usage in Dashboard Component
```typescript
<div className="space-y-6">
  {/* ... other dashboard sections ... */}
  
  {/* Project Table View with Charts */}
  <ProjectTableView />
</div>
```

---

## Database Schema Reference

### Projects Table Columns Used
- `id` (UUID) - Primary key
- `code` (TEXT) - Project code
- `name` (TEXT) - Project name
- `contract_amount` (DECIMAL) - Contract value
- `start_date` (TIMESTAMP) - Contract start date
- `end_date` (TIMESTAMP) - Contract end date
- `project_manager` (TEXT) - Project manager name
- `planned_progress` (DECIMAL) - Planned progress %
- `actual_progress` (DECIMAL) - Actual progress %
- `risk_level` (ENUM) - Risk level (low, medium, high, critical)

---

## Browser Compatibility
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (responsive)

## Accessibility
- Semantic HTML table structure
- Sort button keyboard accessible
- Color-blind friendly risk status display
- Proper text contrast
- ARIA labels where applicable

---

## Troubleshooting

### Table not loading
- Check API endpoint: `/api/projects`
- Verify authentication/credentials in fetch
- Check browser console for errors

### Charts not rendering
- Ensure ProjectChart component is available
- Verify data format matches expected structure
- Check console for chart library errors

### Performance issues
- Monitor network requests
- Check for large datasets
- Consider implementing pagination

---

## Support & Maintenance
For issues or updates, refer to the project management documentation or contact the development team.
