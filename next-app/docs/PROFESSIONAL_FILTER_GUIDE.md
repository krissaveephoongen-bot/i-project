# Professional Filter System Guide

## Overview

The Professional Filter System is a comprehensive, reusable filtering solution that provides:

- **Dynamic Data Sources**: Filter options are fetched from the database in real-time
- **Multi-Condition Filtering**: Support for multiple filters working together
- **Debounced Search**: Optimized search with 300ms debounce to prevent excessive API calls
- **Reset Functionality**: One-click clear all filters
- **Empty State Handling**: User-friendly messages when no results are found
- **Result Counting**: Shows filtered vs total item counts

## Features

### 1. Dynamic Data Sources
Filter options are automatically loaded from database unique values:
- Project statuses, categories, priorities
- Task statuses, priorities, categories, assignees
- Expense categories and statuses
- Users and clients
- All data is cached for 5 minutes for performance

### 2. Multi-Condition Filtering
- Combine search text with multiple dropdown filters
- Date range filtering support
- All filters work together seamlessly

### 3. Professional UI/UX
- Responsive design (mobile-first)
- Loading states during data fetching
- Active filter badges with individual removal
- Clear all filters button with count indicator
- Smooth transitions and hover effects

### 4. Performance Optimizations
- 300ms debounce on search inputs
- 5-minute cache for dynamic filter options
- Minimal re-renders with React.memo and useMemo
- Efficient SQL queries with proper indexing

## Usage Examples

### Basic Usage

```tsx
import { ProfessionalFilter } from '@/components/ProfessionalFilter';
import { useDynamicFilterOptions } from '@/hooks/useDynamicFilterOptions';

function MyPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const { data: dynamicOptions } = useDynamicFilterOptions();

  const filters = [
    {
      key: 'status',
      label: 'Status',
      value: status,
      type: 'dynamic' as const,
      dynamicOptions: 'projectStatuses' as const,
      onChange: setStatus,
    },
  ];

  return (
    <ProfessionalFilter
      searchPlaceholder="Search items..."
      searchValue={search}
      onSearchChange={setSearch}
      filters={filters}
      resultCount={filteredItems.length}
      totalItems={allItems.length}
    />
  );
}
```

### Advanced Usage with Date Range

```tsx
function AdvancedPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });

  const filters = [
    {
      key: 'status',
      label: 'Status',
      value: status,
      type: 'dynamic' as const,
      dynamicOptions: 'taskStatuses' as const,
      onChange: setStatus,
    },
    {
      key: 'category',
      label: 'Category',
      value: category,
      type: 'dynamic' as const,
      dynamicOptions: 'taskCategories' as const,
      onChange: setCategory,
    },
  ];

  return (
    <ProfessionalFilter
      searchPlaceholder="Search tasks..."
      searchValue={search}
      onSearchChange={setSearch}
      filters={filters}
      dateRange={dateRange}
      onDateRangeChange={setDateRange}
      showDateFilter={true}
      resultCount={filteredTasks.length}
      totalItems={allTasks.length}
      onClearAll={() => {
        setSearch('');
        setStatus('all');
        setCategory('all');
        setDateRange({ from: undefined, to: undefined });
      }}
    />
  );
}
```

### Static Filter Options

```tsx
const filters = [
  {
    key: 'priority',
    label: 'Priority',
    value: priority,
    type: 'static' as const,
    staticOptions: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
    ],
    onChange: setPriority,
  },
];
```

## Filter Types

### Dynamic Options
Available dynamic option types:
- `projectStatuses` - Project statuses from database
- `projectCategories` - Project categories from database
- `taskStatuses` - Task statuses from database
- `taskPriorities` - Task priorities from database
- `taskCategories` - Task categories from database
- `expenseCategories` - Expense categories from database
- `expenseStatuses` - Expense statuses from database
- `clients` - Client list from database
- `users` - User list from database

### Static Options
Use static options when you have a fixed set of choices or need custom labels.

## Props Reference

### ProfessionalFilter Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `searchPlaceholder` | `string` | No | Placeholder text for search input |
| `searchValue` | `string` | No | Current search value |
| `onSearchChange` | `(value: string) => void` | No | Search change handler |
| `filters` | `FilterConfig[]` | No | Array of filter configurations |
| `dateRange` | `DateRange` | No | Current date range selection |
| `onDateRangeChange` | `(range: DateRange) => void` | No | Date range change handler |
| `showDateFilter` | `boolean` | No | Show/hide date range picker |
| `resultCount` | `number` | No | Number of filtered results |
| `totalItems` | `number` | No | Total number of items |
| `onClearAll` | `() => void` | No | Clear all filters handler |
| `isLoading` | `boolean` | No | Loading state for filters |
| `className` | `string` | No | Additional CSS classes |

### FilterConfig Interface

```typescript
interface FilterConfig {
  key: string;                    // Unique identifier
  label: string;                  // Display label
  value: string;                  // Current value
  type: 'static' | 'dynamic';     // Filter type
  dynamicOptions?: DynamicOptionType; // For dynamic filters
  staticOptions?: FilterOption[];     // For static filters
  onChange: (value: string) => void;  // Change handler
}
```

## Backend Integration

The filter system requires the `/api/filters/options` endpoint to be available. This endpoint returns all dynamic filter options from the database.

### API Response Structure

```typescript
{
  projectStatuses: FilterOption[],
  projectCategories: FilterOption[],
  taskStatuses: FilterOption[],
  taskPriorities: FilterOption[],
  taskCategories: FilterOption[],
  expenseCategories: FilterOption[],
  expenseStatuses: FilterOption[],
  userRoles: FilterOption[],
  clients: FilterOption[],
  users: FilterOption[]
}
```

## Best Practices

1. **Use Dynamic Options**: Always prefer dynamic options for database-driven filters
2. **Implement Clear All**: Always provide an `onClearAll` handler
3. **Show Result Counts**: Include `resultCount` and `totalItems` for better UX
4. **Handle Loading States**: Use the `isLoading` prop during data fetching
5. **Debounce Search**: The built-in debounce handles search optimization
6. **Empty States**: The component shows appropriate empty states automatically

## Migration from Old Filter System

To migrate from the old `PageFilter` component:

1. Replace `PageFilter` with `ProfessionalFilter`
2. Update filter configuration to use the new format
3. Add `resultCount` and `totalItems` props
4. Implement `onClearAll` handler
5. Replace static options with dynamic options where possible

### Example Migration

**Before:**
```tsx
<PageFilter
  searchValue={search}
  onSearchChange={setSearch}
  filters={[
    {
      key: 'status',
      label: 'Status',
      value: status,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'completed', label: 'Completed' },
      ],
      onChange: setStatus,
    },
  ]}
/>
```

**After:**
```tsx
<ProfessionalFilter
  searchValue={search}
  onSearchChange={setSearch}
  filters={[
    {
      key: 'status',
      label: 'Status',
      value: status,
      type: 'dynamic',
      dynamicOptions: 'projectStatuses',
      onChange: setStatus,
    },
  ]}
  resultCount={filteredItems.length}
  totalItems={allItems.length}
  onClearAll={() => {
    setSearch('');
    setStatus('all');
  }}
/>
```

## Troubleshooting

### Common Issues

1. **Filter options not loading**: Check that the backend API endpoint is available
2. **TypeScript errors**: Ensure proper typing with `as const` for dynamic options
3. **Performance issues**: Verify that database queries are properly indexed
4. **Empty states not showing**: Ensure `resultCount` and `totalItems` are provided

### Debug Tips

- Check browser network tab for `/api/filters/options` requests
- Verify database connection and query performance
- Use React DevTools to inspect component state
- Check console for any TypeScript or runtime errors
