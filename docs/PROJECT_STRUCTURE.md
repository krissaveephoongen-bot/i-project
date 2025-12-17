# Project Management System - Structure

## 📁 Directory Layout

```
project-mgnt/
├── src/
│   ├── pages/                      # Main pages
│   │   ├── Projects.tsx            # Projects list page
│   │   ├── ProjectDetail.tsx       # Single project details
│   │   ├── Timesheet.tsx           # Time tracking page
│   │   ├── dashboard/
│   │   │   └── Dashboard.tsx       # Main dashboard
│   │   ├── backoffice/             # Admin pages
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Users.tsx
│   │   │   ├── SystemSettings.tsx
│   │   │   └── AuditLogs.tsx
│   │   └── ...
│   │
│   ├── components/                 # Reusable components
│   │   ├── ui/                     # Base UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── badge.tsx
│   │   │   └── ...
│   │   ├── charts/                 # Chart components
│   │   │   ├── SCurveChart.tsx     # S-Curve progress
│   │   │   ├── ProjectChart.tsx
│   │   │   └── ...
│   │   ├── forms/                  # Form components
│   │   │   ├── ProjectForm.tsx
│   │   │   ├── TaskForm.tsx
│   │   │   └── ...
│   │   └── auth/
│   │       └── LoginForm.tsx
│   │
│   ├── services/                   # API & business logic
│   │   ├── projectService.ts       # Project CRUD
│   │   ├── taskService.ts          # Task management
│   │   ├── timesheetService.ts     # Time tracking
│   │   ├── expenseService.ts       # Expense tracking
│   │   ├── authService.ts          # Authentication
│   │   ├── securityService.ts      # Security & encryption
│   │   ├── settingsService.ts      # System settings
│   │   └── ...
│   │
│   ├── hooks/                      # Custom hooks
│   │   ├── use-auth.ts             # Auth context hook
│   │   ├── use-projects.ts         # Projects hook
│   │   └── ...
│   │
│   ├── contexts/                   # React contexts
│   │   ├── AuthContext.tsx
│   │   └── ...
│   │
│   ├── types/                      # TypeScript types
│   │   ├── project.ts
│   │   ├── task.ts
│   │   ├── user.ts
│   │   └── database.types.ts
│   │
│   ├── utils/                      # Utility functions
│   │   ├── formatCurrency.ts
│   │   ├── formatDate.ts
│   │   └── ...
│   │
│   ├── styles/                     # Global styles
│   │   ├── globals.css
│   │   └── ...
│   │
│   ├── lib/                        # Library setup
│   │   ├── schema.ts               # Database schema
│   │   └── ...
│   │
│   └── App.tsx                     # Main app component
│
├── database/                       # Database scripts
│   ├── migrate.ts                  # Create tables
│   ├── reset-projects.ts           # Clean all projects
│   ├── init-fresh.ts               # Initialize sample data
│   ├── add-settings-table.ts       # Add settings table
│   └── full-migrate.ts             # Full schema migration
│
├── server/                         # Backend API
│   ├── index.js
│   ├── routes/
│   │   ├── projects.js
│   │   ├── tasks.js
│   │   ├── auth.js
│   │   └── ...
│   ├── middleware/
│   │   ├── auth.js
│   │   └── ...
│   └── ...
│
├── public/                         # Static assets
│
├── .env.example                    # Environment template
├── .env                            # Environment variables (local)
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript config
├── vite.config.ts                  # Vite config
├── tailwind.config.js              # Tailwind config
│
├── FRESH_START_GUIDE.md            # Getting started guide
├── PROJECT_STRUCTURE.md            # This file
└── README.md                       # Project readme
```

## 🔄 Data Flow

```
User Interface (React Components)
    ↓
API Services (Services Layer)
    ↓
Backend API (Express Routes)
    ↓
Database (PostgreSQL)
```

## 📊 Core Entities

### Project
- Name, code, description
- Status (planning, active, on-hold, completed, cancelled)
- Budget and expenses tracking
- Start/end dates
- Manager and team members
- Project charter

### Task
- Title, description
- Status (todo, in-progress, review, completed)
- Priority (low, medium, high)
- Assigned to user
- Due date
- Parent task (subtasks)

### User
- Email, name, role
- Role (admin, manager, developer, designer)
- Team assignments
- Availability

### TimeEntry
- Hours logged
- Date and work type
- Associated task/project
- Status (pending, approved)
- User who logged

### Expense
- Amount and category
- Associated project/task
- Receipt/documentation
- Status (pending, approved, rejected)

### Client
- Name, contact info
- Industry, website
- Associated projects

## 🎯 Key Features

### Project Management
- ✅ Create/edit/delete projects
- ✅ Define project scope and charter
- ✅ Manage team assignments
- ✅ Track progress with S-Curve

### Task Management
- ✅ Create tasks and subtasks
- ✅ Assign to team members
- ✅ Set priorities and due dates
- ✅ Track status changes

### Time Tracking
- ✅ Log daily hours
- ✅ Assign time to projects/tasks
- ✅ Track work type (project/office/other)
- ✅ Approve/reject timesheets

### Expense Management
- ✅ Log expenses by category
- ✅ Track receipts
- ✅ Approve/reject expenses
- ✅ Budget vs actual tracking

### Reporting
- ✅ S-Curve progress visualization
- ✅ Project dashboard
- ✅ Team workload
- ✅ Budget analysis

## 📱 API Endpoints

### Projects
```
GET    /api/projects              # List all
POST   /api/projects              # Create new
GET    /api/projects/:id          # Get details
PUT    /api/projects/:id          # Update
DELETE /api/projects/:id          # Delete
```

### Tasks
```
GET    /api/projects/:id/tasks    # List by project
POST   /api/projects/:id/tasks    # Create task
PUT    /api/tasks/:id             # Update task
DELETE /api/tasks/:id             # Delete task
```

### Timesheets
```
GET    /api/timesheet             # My entries
POST   /api/timesheet             # Create entry
PUT    /api/timesheet/:id         # Update entry
GET    /api/timesheet/approve     # For approval
```

### Expenses
```
GET    /api/expenses              # My expenses
POST   /api/expenses              # Create
PUT    /api/expenses/:id          # Update
GET    /api/expenses/approve      # For approval
```

## 🔐 Authentication

- JWT-based authentication
- Role-based access control (RBAC)
- Secure password hashing (bcrypt)
- Session management
- Audit logging

## 🎨 UI Framework

- **React** - Component framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible components
- **Ant Design** - Admin components
- **React Router** - Navigation
- **React Hook Form** - Form handling

## 📊 Data Visualization

- **Chart.js** - Charts and graphs
- **Nivo** - Complex visualizations
- **Custom S-Curve** - Progress tracking

## 🗄️ Database

- **PostgreSQL** - Main database
- **Drizzle ORM** - Query builder
- **pg** - Node driver
- **Migrations** - Database versioning

## 📦 State Management

- React Context API - Global state
- useState - Component state
- useEffect - Side effects
- Custom hooks - Logic extraction

## 🧪 Testing

- **Vitest** - Unit tests
- **Playwright** - E2E tests
- **React Testing Library** - Component tests

## 🚀 Deployment

- **Vite** - Build tool
- **Express** - Backend server
- **Docker** - Containerization
- **Nginx** - Reverse proxy

## 📝 Development Commands

```bash
# Start development
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Run E2E tests
npm run test:e2e

# Database operations
npm run db:migrate        # Create schema
npm run db:reset          # Clean projects
npm run db:init           # Initialize sample data
npm run db:clean          # Reset and init together

# Code quality
npm run lint
npm run format
```

## 🔄 Next Steps

1. Read FRESH_START_GUIDE.md for initial setup
2. Run `npm run db:clean` to initialize fresh database
3. Start with `npm run dev`
4. Create your first project
5. Explore features and track progress
