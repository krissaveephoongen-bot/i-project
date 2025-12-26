# ticket-apw-backend

RESTful API for Project Management System built with Express.js and PostgreSQL.

## Overview

This is the **backend** repository for the ticket-apw project management system. It provides all the REST API endpoints used by the frontend application.

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL database
- Redis (optional, for caching/rate limiting)

### Installation

```bash
# Clone the repository
git clone https://github.com/krissaveephoongen-bot/ticket-apw-backend.git
cd ticket-apw-backend

# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate
```

### Environment Setup

1. Create `.env` file from template:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your values:
   ```env
   # Database
   DATABASE_URL=postgresql://user:password@localhost:5432/ticket_apw
   
   # JWT
   JWT_SECRET=your-super-secret-key-min-32-characters
   
   # Redis (optional)
   REDIS_URL=redis://localhost:6379
   
   # Environment
   NODE_ENV=development
   PORT=5000
   
   # CORS Origins
   CORS_ORIGIN=http://localhost:5173
   ```

### Database Setup

```bash
# Push Prisma schema to database
npm run db:push

# Or run migrations
npm run db:migrate

# Seed database with initial data (optional)
npm run db:seed
```

### Running Locally

```bash
# Start development server (with auto-reload)
npm run dev

# Server runs on http://localhost:5000
# Test with: curl http://localhost:5000/health
```

## Available Scripts

```bash
# Development
npm run dev                    # Start with nodemon (auto-reload)
npm run start                  # Start production server
npm run build                  # Build for production

# Database
npm run db:push                # Sync Prisma schema to database
npm run db:migrate             # Run database migrations
npm run db:migrate:deploy      # Deploy migrations in production
npm run db:reset               # Reset database (DEV ONLY)
npm run db:seed                # Seed database with initial data
npm run db:studio              # Open Prisma Studio GUI
npm run prisma:generate        # Generate Prisma client

# Testing
npm run test                   # Run all tests
npm run test:auth              # Auth tests only
npm run test:api               # API tests only
npm run db:test                # Test database connection

# Code Quality
npm run lint                   # Check for lint errors
npm run format                 # Format code with Prettier

# Admin
npm run create:admin           # Create admin user
npm run admin:init             # Initialize admin users
npm run security:check         # Run security checks
```

## API Endpoints

### Health & Status
```
GET /health              - Health check
GET /api/health          - API health status
```

### Authentication
```
POST /api/auth/login     - User login
POST /api/auth/logout    - User logout
POST /api/auth/refresh   - Refresh JWT token
POST /api/auth/register  - User registration
```

### Projects
```
GET    /api/projects              - List all projects
POST   /api/projects              - Create project
GET    /api/projects/:id          - Get project details
PUT    /api/projects/:id          - Update project
DELETE /api/projects/:id          - Delete project
GET    /api/projects/:id/members  - Get project members
```

### Tasks
```
GET    /api/tasks              - List tasks
POST   /api/tasks              - Create task
GET    /api/tasks/:id          - Get task details
PUT    /api/tasks/:id          - Update task
DELETE /api/tasks/:id          - Delete task
```

### Users
```
GET    /api/users              - List users
POST   /api/users              - Create user
GET    /api/users/:id          - Get user details
PUT    /api/users/:id          - Update user
DELETE /api/users/:id          - Delete user
```

### Teams
```
GET    /api/teams              - List teams
POST   /api/teams              - Create team
GET    /api/teams/:id          - Get team details
PUT    /api/teams/:id          - Update team
DELETE /api/teams/:id          - Delete team
```

### Additional Endpoints
- `/api/analytics/*` - Analytics and reporting
- `/api/expenses/*` - Expense tracking
- `/api/timeentries/*` - Time tracking
- `/api/reports/*` - Report generation
- `/api/admin/*` - Admin operations
- `/api/worklog/*` - Work logging

[Full API documentation to be generated]

## Project Structure

```
ticket-apw-backend/
├── server/
│   ├── routes/                 # Express route handlers
│   │   ├── auth-routes.js
│   │   ├── project-routes.js
│   │   ├── task-routes.js
│   │   ├── user-routes.js
│   │   └── ...
│   ├── middleware/             # Custom middleware
│   │   ├── auth.js
│   │   ├── validation.js
│   │   └── ...
│   ├── services/               # Business logic
│   │   ├── analyticsService.js
│   │   ├── authService.js
│   │   └── ...
│   ├── utils/                  # Helper utilities
│   ├── app.js                  # Express app setup
│   ├── index.js                # Entry point
│   └── prisma-client.js        # Prisma client singleton
├── api/                        # Vercel serverless functions
│   ├── server.js               # Main handler
│   └── ...
├── prisma/
│   ├── schema.prisma           # Data model
│   └── migrations/             # Database migrations
├── database/                   # Database utilities
├── tests/                      # Test files
├── .env.example                # Example env variables
└── package.json                # Dependencies
```

## Key Dependencies

- **express** - Web framework
- **prisma** - ORM
- **jsonwebtoken** - JWT authentication
- **bcrypt** - Password hashing
- **cors** - CORS middleware
- **helmet** - Security headers
- **redis** - Caching/session store
- **axios** - HTTP client

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS configuration for frontend domain
- Security headers via Helmet
- Rate limiting
- Input validation
- SQL injection prevention (via Prisma ORM)

## Database

### PostgreSQL
- Primary database
- Connection: `DATABASE_URL` environment variable
- Migrations: Prisma migrations in `prisma/migrations/`

### Prisma ORM
- Schema: `prisma/schema.prisma`
- Studio: `npm run db:studio` (GUI for database)
- Type-safe queries

## Authentication

JWT-based authentication with the following flow:

1. User logs in with credentials → Backend validates
2. Backend returns JWT token
3. Client stores token in localStorage
4. Client sends token in `Authorization: Bearer <token>` header
5. Backend validates token on protected routes

### Protected Routes

All `/api/*` routes require valid JWT token except:
- `POST /api/auth/login`
- `POST /api/auth/register`

## CORS Configuration

By default, CORS is configured for:
- `http://localhost:5173` (local frontend)
- `*.vercel.app` (Vercel deployments)

Update `server/app.js` to add your production domain:

```javascript
const allowedOrigins = [
  'http://localhost:5173',           // Local dev
  'https://ticket-apw.vercel.app',   // Frontend domain
  // Add more origins as needed
];
```

## Deployment

### Prerequisites
1. PostgreSQL database (create database instance)
2. Vercel account
3. Environment variables configured

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel deploy --prod
```

### Environment Variables

Set in Vercel Project Settings → Environment Variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for signing JWTs
- `REDIS_URL` - Redis connection (optional)
- `NODE_ENV` - Set to `production`
- `CORS_ORIGIN` - Frontend URL

### Example: Railway Deployment

```bash
# Create Railway project
# Connect GitHub repo
# Set environment variables
# Deploy
```

## Docker Deployment

```bash
# Build image
docker build -f Dockerfile -t ticket-apw-backend .

# Run container
docker run -p 5000:5000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="your-secret" \
  ticket-apw-backend
```

## Related Repositories

- **Frontend**: https://github.com/krissaveephoongen-bot/ticket-apw
- **Main Monorepo** (archived): https://github.com/krissaveephoongen-bot/project-mgnt

## Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
- Ensure PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Test: `npm run db:test`

### JWT Verification Failed
- Ensure `JWT_SECRET` is set in `.env`
- Secret should be 32+ characters
- Token hasn't expired

### Port Already in Use
```bash
# Change PORT in .env to different number (default: 5000)
PORT=5001
```

### CORS Errors from Frontend
1. Check frontend URL is in `allowedOrigins` in `server/app.js`
2. Verify CORS middleware is applied to routes
3. Check headers are correct

## Performance Optimization

- Redis caching for frequent queries
- Database indexing on common fields
- Connection pooling via Prisma
- Gzip compression enabled
- Response time monitoring

## Logging

Logs are output to console. For production, consider:
- Winston logger
- Log aggregation (e.g., LogRocket, Sentry)
- Error tracking

## Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes and test
3. Commit: `git commit -am 'Add feature'`
4. Push: `git push origin feature/my-feature`
5. Create Pull Request

## Support

For issues:
1. Check existing GitHub issues
2. Create new issue with:
   - Error message
   - Steps to reproduce
   - Environment details
3. Contact development team

## License

Proprietary - All rights reserved
