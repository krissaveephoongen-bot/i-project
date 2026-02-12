# i-Project Development Rules & Guidelines

## Project Overview
This is an enterprise project management system built with Next.js, TypeScript, and Supabase. The system supports Thai/English interfaces and focuses on robust project governance, team collaboration, and comprehensive reporting.

## Architecture Standards

### Frontend Stack
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Query (TanStack Query)
- **UI Components**: Radix UI primitives with custom components
- **Authentication**: Custom auth context with JWT tokens
- **Database Client**: Supabase client

### Backend Stack
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL via Supabase
- **ORM**: Prisma with schema-first approach
- **Authentication**: JWT with role-based access control
- **API**: RESTful API with comprehensive error handling

## Code Standards

### TypeScript Rules
- **Strict Mode**: Always use strict TypeScript configuration
- **Type Safety**: All functions must have proper type definitions
- **Interface Naming**: Use PascalCase for interfaces (e.g., `User`, `Project`)
- **Component Props**: Use descriptive prop names with proper types
- **Error Handling**: All async functions must handle errors properly

### React/Next.js Rules
- **Component Structure**: Functional components with hooks
- **State Management**: Prefer React Query over local state for server data
- **File Naming**: 
  - Pages: `kebab-case.tsx` (e.g., `project-details.tsx`)
  - Components: `PascalCase.tsx` (e.g., `ProjectCard.tsx`)
  - Utilities: `camelCase.ts` (e.g., `dateUtils.ts`)
- **Imports**: Absolute imports from `@/` for app internals, relative for lib
- **Error Boundaries**: Wrap pages with error boundaries for better UX

### CSS/Styling Rules
- **Tailwind First**: Use Tailwind classes before custom CSS
- **Component Library**: Prefer shadcn/ui components over custom implementations
- **Responsive Design**: Mobile-first approach with proper breakpoints
- **Theme Consistency**: Use design tokens from `globals.css`
- **No Inline Styles**: Avoid inline styles, use className or styled components

### Database Rules
- **Schema First**: All database changes must start with Prisma schema
- **Migration Safety**: Always review migrations before applying
- **Naming Conventions**: 
  - Tables: `snake_case` (e.g., `project_members`)
  - Columns: `snake_case` (e.g., `created_at`)
  - JavaScript: `camelCase` (e.g., `createdAt`)
- **Relationships**: Use proper foreign key constraints and indexes

## Security Standards

### Authentication & Authorization
- **Password Security**: Use bcrypt with minimum 10 rounds
- **JWT Tokens**: Short-lived tokens with proper expiration
- **Role-Based Access**: Implement RBAC with admin/manager/employee roles
- **Input Validation**: Validate all inputs on both client and server
- **SQL Injection**: Use parameterized queries only (Prisma handles this)

### Data Protection
- **Environment Variables**: Never commit sensitive data to version control
- **API Keys**: Use different keys for development/staging/production
- **PII Handling**: Encrypt sensitive personal information
- **Audit Logging**: Log all data access and modifications

## UI/UX Standards

### Design Principles
- **Consistency**: Maintain consistent design language across all pages
- **Accessibility**: WCAG 2.1 AA compliance minimum
- **Mobile-First**: Design for mobile devices first, then scale up
- **Performance**: Optimize for fast loading and smooth interactions
- **Internationalization**: Support Thai and English languages

### Component Guidelines
- **Reusable Components**: Create reusable, composable components
- **Loading States**: Always show loading indicators for async operations
- **Error States**: Provide clear error messages and recovery options
- **Empty States**: Show helpful messages when no data is available
- **Form Validation**: Real-time validation with clear error messages

### Layout Standards
- **Responsive Grid**: Use CSS Grid and Flexbox for responsive layouts
- **Navigation**: Clear navigation hierarchy with breadcrumbs
- **Sidebar**: Consistent sidebar navigation for main features
- **Header**: Include user profile, notifications, and quick actions

## Data Standards

### API Design
- **RESTful Conventions**: Use proper HTTP methods and status codes
- **Response Format**: Consistent JSON response structure
- **Error Handling**: Standardized error response format
- **Pagination**: Implement pagination for large datasets
- **Rate Limiting**: Protect API endpoints from abuse

### Database Design
- **Normalization**: Follow 3NF normalization principles
- **Indexing**: Add indexes for frequently queried columns
- **Relationships**: Use proper foreign key relationships
- **Soft Deletes**: Use soft deletes with `is_deleted` flags
- **Audit Fields**: Include `created_at`, `updated_at`, `created_by`

## Testing Standards

### Test Coverage
- **Unit Tests**: Minimum 80% coverage for business logic
- **Integration Tests**: Test API endpoints and database operations
- **E2E Tests**: Critical user journeys must be covered
- **Performance Tests**: Load testing for API endpoints
- **Accessibility Tests**: Automated accessibility testing

### Test Organization
```bash
tests/
├── unit/           # Unit tests for utilities and business logic
├── integration/      # API and database integration tests
├── e2e/            # End-to-end user journey tests
└── fixtures/        # Test data and mock data
```

## Deployment Standards

### Environment Management
- **Development**: Local development with hot reload
- **Staging**: Mirror production environment for testing
- **Production**: Optimized builds with proper caching
- **Environment Variables**: Separate configs for each environment

### Build Process
- **Type Checking**: Fail builds on TypeScript errors
- **Code Quality**: Use ESLint and Prettier for consistent formatting
- **Bundle Optimization**: Code splitting and lazy loading
- **Asset Optimization**: Optimize images and other assets

## Documentation Standards

### Code Documentation
- **JSDoc Comments**: Document all public functions and classes
- **README Files**: Update README for each major component/module
- **API Documentation**: Auto-generate API documentation
- **Database Documentation**: Keep schema documentation up to date

### Project Documentation
- **Architecture Decisions**: Document major architectural decisions
- **Setup Instructions**: Clear setup and onboarding instructions
- **Troubleshooting**: Common issues and solutions

## Development Workflow

### Git Workflow
- **Branching Strategy**: GitFlow with feature branches
- **Commit Messages**: Conventional commits with clear descriptions
- **Pull Requests**: Require review and approval before merge
- **Code Reviews**: Focus on code quality, security, and performance

### Code Quality
- **Pre-commit Hooks**: Run linting and formatting before commits
- **CI/CD Pipeline**: Automated testing and deployment
- **Code Coverage**: Monitor and maintain minimum coverage thresholds
- **Security Scanning**: Regular dependency and code security scans

## Internationalization

### Language Support
- **Primary Languages**: Thai (th), English (en)
- **Date/Time Formatting**: Localized date and time formats
- **Number Formatting**: Use locale-appropriate number formatting
- **Currency Support**: Support multiple currencies (THB, USD, etc.)

### Implementation
- **i18n Framework**: Use react-i18next for internationalization
- **Translation Files**: Organized by language and feature
- **RTL Support**: Consider right-to-left language support
- **Cultural Adaptation**: Consider cultural differences in UI/UX

## Performance Guidelines

### Frontend Optimization
- **Bundle Size**: Keep initial bundle under 2MB
- **Loading Performance**: Optimize for fast perceived performance
- **Image Optimization**: Use WebP format and proper sizing
- **Caching Strategy**: Implement browser and CDN caching
- **Code Splitting**: Split code by route and feature

### Backend Optimization
- **Database Queries**: Optimize queries with proper indexing
- **Connection Pooling**: Use connection pooling for database
- **Caching Layer**: Implement Redis or in-memory caching
- **API Response Time**: Target under 500ms for 95th percentile

## Security Checklist

### Authentication Security
- [ ] Password complexity requirements enforced
- [ ] Account lockout after failed attempts
- [ ] Session timeout implementation
- [ ] Multi-factor authentication support
- [ ] Secure password reset flow

### Data Security
- [ ] Input sanitization and validation
- [ ] SQL injection prevention
- [ ] XSS protection in all forms
- [ ] CSRF token implementation
- [ ] Data encryption for sensitive fields

### Infrastructure Security
- [ ] HTTPS enforcement in all environments
- [ ] Security headers configuration
- [ ] Rate limiting implementation
- [ ] DDoS protection measures
- [ ] Regular security audits

## Monitoring & Analytics

### Application Monitoring
- **Error Tracking**: Implement comprehensive error logging
- **Performance Monitoring**: Track Core Web Vitals
- **User Analytics**: Track user behavior and feature usage
- **Uptime Monitoring**: 99.9% uptime target
- **Alert System**: Critical issue alerting

### Business Metrics
- **User Adoption**: Track feature adoption rates
- **Task Completion**: Monitor project completion rates
- **Performance KPIs**: Track page load times, API response times
- **Error Rates**: Monitor and minimize error rates

## Quick Reference

### Common Commands
```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run test             # Run test suite
npm run lint             # Check code quality
npm run type-check        # TypeScript type checking

# Database
npx prisma studio        # Open database studio
npx prisma migrate       # Run database migrations
npx prisma generate      # Generate Prisma client
```

### File Structure Quick Reference
```bash
next-app/
├── app/                    # Next.js app directory
│   ├── (auth)/           # Authentication routes
│   ├── dashboard/          # Main dashboard
│   ├── projects/           # Project management
│   ├── api/               # API routes
│   └── globals.css         # Global styles
├── components/              # Reusable components
│   ├── ui/                # shadcn/ui components
│   ├── forms/              # Form components
│   └── features/           # Feature components
├── lib/                    # Utilities and configurations
├── hooks/                  # Custom React hooks
└── types/                  # TypeScript type definitions
```

### Environment Variables
```env
# Database
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

---

## Current Project Status

### Recently Completed
- **Database Setup**: Fixed Prisma schema and database permissions
- **Authentication**: User creation and login system working
- **Build System**: Resolved missing module imports
- **UI Components**: Added shadcn/ui component library
- **Development Environment**: Frontend and backend servers running

### Current Focus Areas
Based on your refactor plan, prioritize these areas:
1. **UI/UX Enhancement** - Implement responsive design and better accessibility
2. **Security Hardening** - Add advanced authentication and audit logging
3. **Performance Optimization** - Implement caching and optimize database queries
4. **Feature Development** - Build advanced reporting and workflow automation
5. **Testing Infrastructure** - Set up comprehensive testing framework

### Next Steps
1. **Implement shadcn/ui components** across all pages
2. **Set up internationalization** for Thai/English support
3. **Add comprehensive error handling** and user feedback
4. **Implement advanced project features** (Gantt charts, resource allocation)
5. **Set up monitoring and analytics** for production readiness

---

*This document serves as the comprehensive guide for i-Project development. All team members should familiarize themselves with these standards and follow them consistently.*
