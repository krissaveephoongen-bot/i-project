# AGENTS.md - Development Guidelines

## Build, Lint, Test Commands

### Monorepo Commands (Root)
```bash
# Installation
npm run install:all     # Install dependencies in root, frontend, and backend

# Development (Separated Frontend/Backend)
npm run dev:frontend    # Start frontend dev server (port 5173)
npm run dev:backend     # Start backend server (port 3001)
npm run dev:all         # Start both frontend and backend concurrently

# Build
npm run build:frontend  # Build frontend for production
npm run build:backend   # Build backend
npm run build:all       # Build both frontend and backend

# Testing
npm run test            # Run all tests (unit + integration)
npm run test:unit       # Run unit tests
npm run test:integration # Run integration tests
npm run test:integration:watch # Run integration tests with watch
npm run test:e2e        # Run E2E tests (Playwright)
npm run test:e2e:ui     # Run E2E with UI
npm run test:e2e:headed # Run E2E with headed browser

# Linting & Formatting
npm run lint            # ESLint check
npm run format          # Prettier format
```

### Frontend Commands (frontend/)
```bash
npm run dev             # Start Vite dev server (port 5173)
npm run build           # Build for production
npm run preview         # Preview production build locally
```

### Backend Commands (backend/)
```bash
npm run dev             # Start Express server (port 3001)
npm run start           # Start Express server
```

## Architecture

**Monorepo Structure**: React frontend (Vite), Express backend, PostgreSQL database
- `src/`: Frontend (React 18, TypeScript, Tailwind CSS)
  - `components/`: Reusable UI components
  - `pages/`: Route pages
  - `services/`: API clients & business logic
  - `hooks/`: Custom React hooks
  - `lib/`: Utilities, database schema (Drizzle ORM)
  - `types/`: TypeScript interfaces
- `server/`: Express.js backend with routes
- Database: PostgreSQL + Drizzle ORM (migrations in `src/migrations`)
- UI Libraries: shadcn/ui, Radix UI, Material-UI, Ant Design, Tailwind CSS

**Deployment**:
- Frontend: Vercel (https://ticket-apw.vercel.app)
- Backend API: Vercel (https://ticket-apw-api.vercel.app)
- Architecture: Separated frontend and backend services (see DEPLOYMENT_FIX_GUIDE.md)

## Code Style & Conventions

**TypeScript/React**:
- Use functional components with `React.FC<Props>`
- Interface props (e.g., `EmptyStateProps`) in PascalCase
- Import paths: Use `@/*` alias for `src/*`
- Destructure imports (avoid default exports where possible)

**Naming**:
- Components: PascalCase (`EmptyState.tsx`)
- Files/utilities: camelCase (`useCustomHook.ts`)
- Constants: UPPER_SNAKE_CASE

**Formatting**: Prettier with ESLint (eslint-plugin-simple-import-sort, eslint-plugin-react, eslint-plugin-react-hooks)

**Error Handling**: Comprehensive system with standardized patterns
- Global ErrorBoundary wraps all routes
- Use `useDataFetch` hook for API calls with automatic error handling
- Display errors with `<ErrorState>` component with retry functionality
- Show loading states with `<LoadingState>` or skeletons
- Use `<EmptyState>` for empty data with contextual actions
- All errors parsed via `parseApiError()` for consistent handling
- Support network, timeout (408), and server error (5xx) recovery

**Error Handling Pattern:**
```typescript
import { useDataFetch } from '@/hooks/useDataFetch';
import ErrorState from '@/components/ErrorState';
import LoadingState from '@/components/LoadingState';
import EmptyState from '@/components/EmptyState';

const { data, loading, error, retry } = useDataFetch(fetcher, deps);

if (error) return <ErrorState error={error} onRetry={retry} />;
if (loading) return <LoadingState />;
if (!data?.length) return <EmptyState title="No items" />;
return <YourComponent data={data} />;
```

**Styling**: Tailwind CSS utility classes + shadcn/ui component library

**Testing**: Vitest for unit/integration tests (JSDOM environment)

**Database**: Drizzle ORM with PostgreSQL; migrations in src/migrations

## Error Handling Components

**Available Components:**
- `ErrorState` - Display errors with retry button and optional details
- `DataLoader` - Wrapper for loading/error/empty/success states
- `LoadingState` - Centered spinner with optional message
- `EmptyState` - Contextual empty state with actions
- `Skeleton`, `SkeletonTable`, `SkeletonCard` - Loading placeholders

**Available Hooks:**
- `useDataFetch<T>(fetcher, deps, callbacks)` - Generic data fetching with error handling

**Error Files:**
- `src/lib/error-handler.ts` - Error parsing, severity, recovery suggestions
- `src/lib/api-client.ts` - API calls with timeout and error handling
