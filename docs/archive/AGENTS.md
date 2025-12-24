# AGENTS.md - Project Management System

## Build/Test/Lint Commands

```sh
npm run dev              # Start dev server (Vite, port 3000)
npm run build            # Build production bundle
npm run preview          # Preview production build

npm run test             # Run unit tests (Vitest with jsdom)
npm run test -- src/components/Dashboard.spec.tsx  # Single test file
npm run test:e2e         # Run E2E tests (Playwright)
npm run test:e2e:ui      # E2E tests with UI

npm run lint             # ESLint src/ directory
npm run format           # Format with Prettier
```

## Architecture

**Frontend**: React 18 + TypeScript, Vite bundler, @ alias for src/  
**Backend**: Express.js (Node) on port 5000, proxied from frontend  
**Database**: PostgreSQL with Prisma ORM (also Drizzle ORM configured)  
**Styling**: Tailwind CSS + custom CSS  
**Charts**: Recharts, Chart.js, Nivo  

**Key directories**:
- `src/` - React app (components, pages, services, hooks, types, utils)
- `server/` - Express routes and middleware
- `prisma/` - Database schema and migrations
- `admin-console/`, `user-portal/` - Separate portal applications
- `tests/` - E2E tests, `src/**/*.{test,spec}` - Unit tests

## Code Style

**Imports**: Use `@/` alias for src files. ESLint enforces simple-import-sort.  
**Formatting**: Prettier (config in package.json), ESLint with TypeScript parser.  
**Types**: Strict mode enabled (noImplicitAny, strictNullChecks, etc).  
**Naming**: camelCase for functions/variables, PascalCase for components/classes.  
**Error handling**: React Error Boundary for component errors, try/catch for async.  
**Exports**: Named exports preferred, default for single-export files.
