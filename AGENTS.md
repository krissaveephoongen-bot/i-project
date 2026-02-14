# AGENTS.md - Project Development Guidelines

## Build, Test, and Lint Commands

### Root Level
- `npm run dev` - Start Next.js frontend
- `npm run dev:backend` - Start Express backend (port 3001)
- `npm run dev:all` - Start both concurrently
- `npm run install:all` - Install deps for root, next-app, and backend
- `npm run test:unit` - Run Vitest unit tests
- `npm run test:unit -- <file-pattern>` - Run single test file
- `npm run test:integration` - Run integration tests
- `npm run test:e2e:headed` - Run Playwright E2E tests visually

### Frontend (next-app/)
- `npm run dev` - Next.js dev server (port 3000)
- `npm run build` - Production build
- `npm run lint` - ESLint check
- `npm run test:e2e` - Playwright headless tests
- `npm run test:e2e:ui` - Playwright UI mode

### Backend (backend/)
- `npm run dev` - Express dev server (port 3001)
- `npm run build` - TypeScript compilation
- `npm run test` - Vitest tests
- `npm run db:seed` - Reset and seed local PostgreSQL

## Architecture & Structure

**Monorepo with Feature-Sliced Design (FSD)**
- **Frontend**: Next.js 14 (App Router) in `next-app/`
- **Backend**: Express + TypeScript in `backend/`
- **Database**: PostgreSQL (Docker), Prisma + Drizzle ORM
- **Auth**: JWT tokens, user roles (admin/manager/employee)
- **Real-time**: WebSocket for live updates
- **APIs**: REST endpoints, React Query for data fetching

**Key Paths**: `next-app/app/`, `next-app/features/`, `backend/src/features/`, `prisma/` (migrations)

## Code Style Guidelines

**TypeScript Strict Mode**: `strict: true`, `noImplicitAny: true`, `strictNullChecks: true`

**Naming**:
- Components/Types: PascalCase
- Variables/Functions: camelCase
- Constants: UPPER_SNAKE_CASE
- Files/Dirs: kebab-case

**Imports**: Group by React → Libraries → Shared → Entities → Features, use `@/*` path alias

**Components**: Export via barrel files (`index.ts`), use Props interface suffix

**Errors**: Custom error classes extending Error, global error handlers in Express middleware

**Files**: `.tsx` for React, `.ts` for utilities; test files: `.test.ts/.spec.ts`

**Windsurf Rules**: `typescript/enforce-non-nullAssertions: off`, `typescript/disallow-any: warn`
