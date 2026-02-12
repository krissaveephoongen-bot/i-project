# Enterprise Project Management UI Components

This directory contains a comprehensive set of UI components built with shadcn/ui for the enterprise project management system.

## Component Categories

### Core UI Components (`/ui`)
Basic building blocks following shadcn/ui patterns:

- **Button**: Primary actions, secondary actions, destructive actions
- **Input/Textarea**: Form inputs with validation states
- **Select**: Dropdown selections
- **Checkbox/Radio/Switch**: Form controls
- **Card**: Content containers with header, content, footer
- **Table**: Data display with sorting and pagination
- **Badge**: Status indicators and labels
- **Avatar**: User profile images
- **Progress**: Progress bars and indicators
- **Tabs**: Tabbed navigation
- **Dialog/Sheet**: Modals and side panels
- **Dropdown Menu**: Context menus and actions
- **Popover/Tooltip**: Floating content
- **Toast**: Notifications
- **Calendar**: Date picker component
- **Form**: Form validation and layout

### Advanced Components
Enterprise-specific components:

- **DataTable**: Advanced table with sorting, filtering, pagination, column visibility
- **PageFilter**: Comprehensive filtering UI with search, dropdowns, date ranges

### Layout Components
Application structure:

- **Header**: Top navigation with breadcrumbs and search
- **Sidebar**: Main navigation with role-based menu
- **MainLayout**: Page layout wrapper
- **ProtectedLayout**: Authentication wrapper

### Feature Components
Business logic components:

- **AuthProvider**: Authentication context
- **FinancialChart/TeamLoadChart/etc.**: Data visualization
- **ProjectForm**: Project creation/editing
- **Approval components**: Workflow actions

## Usage Examples

### Basic Form with Validation
```tsx
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function UserForm() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create User</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" placeholder="Enter name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="Enter email" />
        </div>
        <Button className="w-full">Create User</Button>
      </CardContent>
    </Card>
  )
}
```

### Advanced Data Table
```tsx
import { DataTable } from "@/components/data-table"
import { ColumnDef } from "@tanstack/react-table"

interface Project {
  id: string
  name: string
  status: string
  progress: number
}

const columns: ColumnDef<Project>[] = [
  {
    accessorKey: "name",
    header: "Project Name",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.status === "active" ? "default" : "secondary"}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "progress",
    header: "Progress",
    cell: ({ row }) => (
      <Progress value={row.original.progress} className="w-20" />
    ),
  },
]

function ProjectsPage({ projects }: { projects: Project[] }) {
  return (
    <DataTable
      columns={columns}
      data={projects}
      searchKey="name"
      searchPlaceholder="Search projects..."
    />
  )
}
```

### Page with Filters
```tsx
import { PageFilter } from "@/components/page-filter"

function ProjectsPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined })

  return (
    <div className="space-y-6">
      <PageFilter
        searchValue={search}
        onSearchChange={setSearch}
        filters={[
          {
            key: "status",
            label: "Status",
            value: statusFilter,
            options: [
              { value: "active", label: "Active" },
              { value: "completed", label: "Completed" },
              { value: "on-hold", label: "On Hold" },
            ],
            onChange: setStatusFilter,
          },
        ]}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        showDateFilter
      />

      {/* Filtered content */}
    </div>
  )
}
```

## Design System

### Colors
- **Primary**: Blue (#2563EB) for main actions
- **Secondary**: Gray (#6B7280) for secondary actions
- **Destructive**: Red (#DC2626) for dangerous actions
- **Success**: Green (#16A34A) for positive states
- **Warning**: Yellow (#CA8A04) for caution states

### Typography
- **Headings**: Inter font, various sizes
- **Body**: Inter font, 14px base size
- **Labels**: 12px, medium weight

### Spacing
- **Small**: 4px (0.25rem)
- **Medium**: 8px (0.5rem)
- **Large**: 16px (1rem)
- **Extra Large**: 24px (1.5rem)

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## Accessibility

All components follow WCAG 2.1 AA guidelines:
- Keyboard navigation support
- Screen reader compatibility
- High contrast ratios
- Focus management
- Semantic HTML

## Performance

Components are optimized for performance:
- Tree-shakable imports
- Lazy loading where appropriate
- Minimal re-renders
- Efficient state management

## Contributing

When adding new components:
1. Follow the existing patterns
2. Include TypeScript types
3. Add accessibility features
4. Test across breakpoints
5. Update this documentation
6. Add usage examples