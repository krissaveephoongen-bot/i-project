# Project Rules - Feature-Sliced Design (FSD) Architecture

## Overview

This project follows Feature-Sliced Design (FSD) architecture principles adapted for a full-stack Next.js + Express application. FSD organizes code by business features rather than technical layers, promoting scalability and maintainability.

## Core Principles

1. **Feature-First Organization**: Code is organized around business features, not technical concerns
2. **Layered Architecture**: Clear separation between app, processes, pages, widgets, features, entities, and shared layers
3. **Vertical Slicing**: Features are self-contained vertical slices through all layers
4. **Shared Code Isolation**: Common code is properly abstracted and shared
5. **Type Safety**: Strict TypeScript usage throughout

## Folder Structure Convention

### Frontend (Next.js) - Feature-Sliced Design

```
src/
├── app/                          # Next.js App Router (FSD App Layer)
│   ├── (auth)/                   # Route groups for auth flows
│   ├── (dashboard)/              # Route groups for dashboard
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── processes/                    # Business processes (cross-cutting concerns)
│   ├── auth/                     # Authentication process
│   │   ├── model/                # Process state and logic
│   │   └── ui/                   # Process UI components
│   └── project-management/       # Project management process
├── pages/                        # Page components (FSD Pages Layer)
│   ├── dashboard/
│   │   ├── ui/                   # Page-specific UI
│   │   ├── model/                # Page logic and state
│   │   └── index.ts              # Page exports
│   └── projects/
├── widgets/                      # Composite UI components (FSD Widgets)
│   ├── project-card/
│   │   ├── ui/                   # Widget components
│   │   ├── model/                # Widget logic
│   │   └── index.ts
│   └── data-table/
├── features/                     # Business features (FSD Features)
│   ├── project-creation/
│   │   ├── ui/                   # Feature UI components
│   │   ├── model/                # Feature business logic
│   │   ├── api/                  # Feature API calls
│   │   └── index.ts
│   ├── task-management/
│   └── user-management/
├── entities/                     # Business entities (FSD Entities)
│   ├── project/
│   │   ├── ui/                   # Entity UI components
│   │   ├── model/                # Entity types and logic
│   │   ├── api/                  # Entity API calls
│   │   └── index.ts
│   ├── user/
│   └── task/
├── shared/                       # Shared code (FSD Shared)
│   ├── ui/                       # Shared UI components
│   │   ├── components/           # Reusable components
│   │   ├── layouts/              # Layout components
│   │   └── icons/                # Icon components
│   ├── lib/                      # Shared utilities
│   │   ├── api/                  # API utilities
│   │   ├── utils/                # General utilities
│   │   ├── hooks/                # Shared hooks
│   │   └── constants/            # Constants
│   ├── config/                   # Configuration
│   └── types/                    # Global types
└── components.json               # Shadcn/ui config
```

### Backend (Express) - Feature-Based Organization

```
backend/
├── src/
│   ├── features/                 # Business features
│   │   ├── auth/
│   │   │   ├── routes/           # Feature routes
│   │   │   ├── services/         # Business logic
│   │   │   ├── repositories/     # Data access
│   │   │   ├── types/            # Feature types
│   │   │   └── index.ts
│   │   ├── projects/
│   │   └── users/
│   ├── shared/                   # Shared backend code
│   │   ├── middleware/           # Express middleware
│   │   ├── utils/                # Utilities
│   │   ├── database/             # Database connection
│   │   ├── config/               # Configuration
│   │   └── types/                # Global types
│   └── app.ts                    # Express app setup
├── migrations/                   # Database migrations
├── seeds/                        # Data seeds
└── scripts/                      # Utility scripts
```

## Naming Conventions

### Variables

#### camelCase (default)
```typescript
const userName = 'John Doe';
const projectList = [];
const isLoading = false;
const handleSubmit = () => {};
```

#### PascalCase (Components, Types, Classes)
```typescript
interface UserProfile {}
type ProjectStatus = 'active' | 'completed';
class ProjectService {}
function UserCard() {} // React components
```

#### UPPER_SNAKE_CASE (Constants)
```typescript
const API_BASE_URL = '/api';
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_PROJECT_STATUS = 'planning';
```

#### kebab-case (Files and Folders)
```
user-profile.tsx
project-card/
data-table.tsx
```

### Components

#### Component Naming
- Use PascalCase for component names
- Use descriptive, domain-specific names
- Suffix with component type when needed

```typescript
// Good
function ProjectCard() {}
function UserProfileForm() {}
function TaskListItem() {}

// Avoid
function Card() {}        // Too generic
function Project() {}     // Not descriptive enough
function DataTable() {}   // Should be TaskDataTable or similar
```

#### Component File Naming
- Match component name exactly
- Use `.tsx` for TypeScript React components
- Use `index.ts` for barrel exports

```
ProjectCard/
├── ProjectCard.tsx
├── index.ts
└── types.ts
```

#### Component Props
```typescript
interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  isLoading?: boolean;
}

function ProjectCard({ project, onEdit, isLoading }: ProjectCardProps) {
  // Implementation
}
```

### Functions

#### Function Naming
- Use camelCase
- Start with verb for actions
- Be descriptive and specific

```typescript
// Good
function calculateProjectRisk() {}
function validateUserInput() {}
function fetchProjectById() {}
function formatCurrency() {}

// Avoid
function calc() {}           // Too vague
function get() {}            // Not specific
function process() {}        // Too generic
```

#### Function Parameters
- Use descriptive names
- Prefer object parameters for multiple args
- Use optional parameters with defaults

```typescript
// Good
function createProject(data: CreateProjectData) {}
function updateUser(id: string, updates: Partial<User>) {}
function filterProjects(projects: Project[], filters: ProjectFilters) {}

// Avoid
function create(p: any) {}    // Non-descriptive
function update(i, u) {}      // Single letters
```

### API and Data Layer

#### API Functions
```typescript
// Service functions
export async function getProjects(): Promise<Project[]> {}
export async function createProject(data: CreateProjectData): Promise<Project> {}

// API route handlers
export async function GET_projects() {}
export async function POST_projects() {}
```

#### Database/Models
```typescript
// Types
interface ProjectEntity {}
type ProjectStatus = 'planning' | 'active' | 'completed';

// Repository methods
class ProjectRepository {
  async findById(id: string): Promise<ProjectEntity | null> {}
  async findByUser(userId: string): Promise<ProjectEntity[]> {}
  async create(data: CreateProjectData): Promise<ProjectEntity> {}
}
```

## Tech Stack Rules

### Frontend Tech Stack

#### Core Framework
- **Next.js 14+** with App Router
- **React 18+** with TypeScript
- **TypeScript 5.0+** with strict mode enabled

#### State Management
- **React Query (TanStack Query)** for server state
- **Zustand** for client state (if needed)
- **React Context** only for app-wide state (auth, theme)

#### UI/Styling
- **Tailwind CSS** for styling
- **Shadcn/ui** for component library
- **Lucide React** for icons
- **Radix UI** as base for complex components

#### Data Fetching
- **React Query** for API calls
- **Supabase Client** for database operations
- **SWR** for simple caching (if needed)

#### Forms
- **React Hook Form** for form management
- **Zod** for validation schemas

#### Development Tools
- **ESLint** with strict rules
- **Prettier** for code formatting
- **Husky** for git hooks
- **Playwright** for E2E testing

### Backend Tech Stack

#### Runtime & Framework
- **Node.js 18+**
- **Express.js** with TypeScript
- **TypeScript 5.0+** with strict mode

#### Database
- **PostgreSQL** as primary database
- **Drizzle ORM** for query building
- **Prisma** (legacy, migrate to Drizzle)

#### Authentication
- **Supabase Auth** for user management
- **JWT** for API authentication
- **bcrypt** for password hashing

#### API
- **RESTful API** design
- **OpenAPI/Swagger** for documentation
- **Rate limiting** middleware

#### Development Tools
- **Nodemon** for development
- **Jest** for unit testing
- **Supertest** for API testing

## Error Handling Standards

### Frontend Error Handling

#### API Errors
```typescript
// Use React Query error handling
const { data, error, isError } = useQuery({
  queryKey: ['projects'],
  queryFn: getProjects,
  onError: (error) => {
    // Handle error (show toast, log, etc.)
    console.error('Failed to fetch projects:', error);
  }
});

// Custom error hook
function useApiError() {
  const toast = useToast();

  const handleError = (error: unknown) => {
    if (error instanceof ApiError) {
      toast.error(error.message);
    } else {
      toast.error('An unexpected error occurred');
      console.error(error);
    }
  };

  return { handleError };
}
```

#### Error Types
```typescript
class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public value: any
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

#### Component Error Boundaries
```typescript
class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Component error:', error, errorInfo);
    // Log to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

### Backend Error Handling

#### Global Error Middleware
```typescript
// Global error handler
app.use((error: Error, req: Express.Request, res: Express.Response, next: NextFunction) => {
  console.error(error);

  if (error instanceof ValidationError) {
    return res.status(400).json({
      error: 'Validation Error',
      message: error.message,
      field: error.field
    });
  }

  if (error instanceof DatabaseError) {
    return res.status(500).json({
      error: 'Database Error',
      message: 'Internal server error'
    });
  }

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});
```

#### Service Layer Error Handling
```typescript
class ProjectService {
  async createProject(data: CreateProjectData): Promise<Project> {
    try {
      // Validate input
      const validatedData = await this.validateProjectData(data);

      // Check business rules
      await this.checkProjectLimits(data.userId);

      // Create project
      const project = await this.projectRepository.create(validatedData);

      return project;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error; // Re-throw validation errors
      }
      throw new ServiceError('Failed to create project', error);
    }
  }
}
```

#### Database Error Handling
```typescript
class DatabaseError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'DatabaseError';
  }
}

// Repository error handling
class ProjectRepository {
  async findById(id: string): Promise<ProjectEntity | null> {
    try {
      const project = await db.select().from(projects).where(eq(projects.id, id));
      return project[0] || null;
    } catch (error) {
      throw new DatabaseError('Failed to find project', error as Error);
    }
  }
}
```

### Logging Standards

#### Error Logging
```typescript
// Use structured logging
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label })
  }
});

// Usage
logger.error({
  message: 'Failed to create project',
  userId: user.id,
  projectData: data,
  error: error.message
}, 'Project creation failed');
```

#### Frontend Logging
```typescript
// Use console for development, proper logging service for production
const logger = {
  error: (message: string, error?: Error, context?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(message, error, context);
    } else {
      // Send to error reporting service (Sentry, LogRocket, etc.)
      errorReporting.captureException(error, { extra: context });
    }
  }
};
```

## Import/Export Rules

### Barrel Exports
```typescript
// features/project/ui/index.ts
export { ProjectCard } from './ProjectCard';
export { ProjectForm } from './ProjectForm';
export type { ProjectCardProps } from './ProjectCard';

// Use in other files
import { ProjectCard, ProjectForm, type ProjectCardProps } from '@/features/project/ui';
```

### Import Organization
```typescript
// Group imports by type, then alphabetically
import { useState, useEffect } from 'react';           // React imports
import { useQuery } from '@tanstack/react-query';     // External libraries
import { Button } from '@/shared/ui';                  // Shared UI
import { getProjects } from '@/entities/project/api';  // Entities
import { ProjectCard } from '@/features/project/ui';   // Features
import type { Project } from '@/entities/project/model'; // Types
```

## Testing Standards

### File Naming
```
ComponentName.test.tsx
ComponentName.spec.ts
serviceName.test.ts
```

### Test Structure
```typescript
describe('ProjectService', () => {
  describe('createProject', () => {
    it('should create a project successfully', async () => {
      // Arrange
      const mockData = { name: 'Test Project' };

      // Act
      const result = await projectService.createProject(mockData);

      // Assert
      expect(result.name).toBe('Test Project');
    });

    it('should throw ValidationError for invalid data', async () => {
      // Arrange
      const invalidData = { name: '' };

      // Act & Assert
      await expect(projectService.createProject(invalidData))
        .rejects.toThrow(ValidationError);
    });
  });
});
```

## Code Quality Standards

### ESLint Configuration
```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

### Pre-commit Hooks
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{js,jsx}": ["eslint --fix", "prettier --write"]
  }
}
```

This document serves as the **Source of Truth** for all architectural decisions and coding standards. All refactoring and new development must adhere to these rules.