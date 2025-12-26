# Frontend/Backend Split - Quick Reference

## Local Development (After Separation)

### Terminal 1: Backend
```bash
cd ~/ticket-apw-backend
npm run dev
# Runs on http://localhost:5000
```

### Terminal 2: Frontend
```bash
cd ~/ticket-apw
cp .env.example.frontend .env.local
npm run dev
# Runs on http://localhost:5173
# Automatically connects to http://localhost:5000
```

## Repository URLs

| Repo | Purpose | URL |
|------|---------|-----|
| Frontend | React UI | github.com/krissaveephoongen-bot/ticket-apw |
| Backend | REST API | github.com/krissaveephoongen-bot/ticket-apw-backend |

## Key Environment Variables

### Frontend
```
VITE_API_URL=http://localhost:5000              # Local
VITE_API_URL=https://ticket-apw-backend.vercel.app  # Production
```

### Backend
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key-here
NODE_ENV=development
PORT=5000
```

## Common Commands

### Backend
```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm run db:push          # Sync database
npm run db:studio        # Open database GUI
npm run create:admin     # Create admin user
npm run prisma:generate  # Generate Prisma client
```

### Frontend
```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm run test:e2e         # Run end-to-end tests
npm run lint             # Check for errors
npm run format           # Format code
```

## Deployment

### Backend to Vercel
```bash
cd ~/ticket-apw-backend
vercel deploy --prod
# Note: <backend-url>.vercel.app
```

### Frontend to Vercel
```bash
cd ~/ticket-apw
# Set VITE_API_URL in Vercel env vars
vercel deploy --prod
```

## Troubleshooting

### Backend won't start
```bash
# Check database connection
npm run db:test

# Check env vars
cat .env | grep DATABASE_URL
```

### Frontend API calls fail
```bash
# Check VITE_API_URL
echo $VITE_API_URL

# Check backend is running
curl http://localhost:5000/health

# Check browser console for CORS errors
```

### CORS errors
1. Frontend URL in `server/app.js`?
2. Backend CORS middleware enabled?
3. Check Origin header in request

## File Locations

### Frontend Config
- `.env.example.frontend` - Environment template
- `vite.config.ts` - Build config
- `tailwind.config.js` - Styling
- `tsconfig.json` - TypeScript

### Backend Config
- `.env.example` - Environment template
- `server/app.js` - Express app & CORS
- `server/index.js` - Entry point
- `prisma/schema.prisma` - Database schema

## API Service Files Updated
- `admin-console/utils/api.js`
- `src/admin-console/utils/api.js`
- `services/taskService.js`
- `services/teamService.js`
- `services/resourceService.js`
- `services/expenseService.js`
- `services/dashboardService.js`

All now use `import.meta.env.VITE_API_URL`

## Testing

### Frontend
```bash
npm run test:unit        # Unit tests
npm run test:e2e         # E2E tests
npm run test:e2e:ui      # E2E with UI
```

### Backend
```bash
npm run test             # All tests
npm run test:auth        # Auth tests
npm run test:api         # API tests
npm run db:test          # Database connection
```

## Database

### Local PostgreSQL
```
Host: localhost
Port: 5432
Database: ticket_apw
Connection: postgresql://user:password@localhost:5432/ticket_apw
```

### Prisma
```bash
npm run db:studio        # Visual database editor
npm run db:push          # Sync schema
npm run db:migrate       # Run migrations
npm run db:reset         # Reset database (dev only)
```

## Port Reference

| Service | Port | URL |
|---------|------|-----|
| Frontend (Vite) | 5173 | http://localhost:5173 |
| Backend (Express) | 5000 | http://localhost:5000 |
| PostgreSQL | 5432 | localhost:5432 |
| Redis | 6379 | localhost:6379 |
| Prisma Studio | 5555 | http://localhost:5555 |

## Git Commands

### Clone Repos
```bash
git clone https://github.com/krissaveephoongen-bot/ticket-apw.git
git clone https://github.com/krissaveephoongen-bot/ticket-apw-backend.git
```

### Push Changes
```bash
# Frontend
cd ticket-apw
git add .
git commit -m "Feature: add new component"
git push origin main

# Backend
cd ../ticket-apw-backend
git add .
git commit -m "Fix: update API endpoint"
git push origin main
```

## Vercel Deployment

### Set Environment Variables
```
Vercel Dashboard → Project Settings → Environment Variables
```

**Frontend**:
- `VITE_API_URL` = Backend URL

**Backend**:
- `DATABASE_URL` = PostgreSQL URL
- `JWT_SECRET` = Secret key
- `NODE_ENV` = production

## Docker

### Build Backend Image
```bash
docker build -f Dockerfile -t ticket-apw-backend .
```

### Run Container
```bash
docker run -p 5000:5000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="secret" \
  ticket-apw-backend
```

## Health Checks

### Backend Alive?
```bash
curl http://localhost:5000/health
```

### Database Connected?
```bash
curl http://localhost:5000/api/health
```

### Frontend Loading?
```bash
curl http://localhost:5173
```

## Logs

### Frontend
- Browser DevTools Console (F12)
- Vite terminal output
- Check Network tab for API calls

### Backend
- Terminal output where `npm run dev` was run
- Check response status codes
- Use `npm run prisma:studio` for database inspection

## Documentation Links

| Doc | Purpose |
|-----|---------|
| SEPARATION_SUMMARY.md | Overview of changes |
| SPLIT_SETUP.md | Detailed setup steps |
| MIGRATION_CHECKLIST.md | Verification checklist |
| FRONTEND_README.md | Frontend guide |
| BACKEND_README.md | Backend guide |

## Useful Links

- GitHub: https://github.com/krissaveephoongen-bot
- Vercel: https://vercel.com
- Prisma: https://prisma.io
- Vite: https://vitejs.dev

---

**Remember**: 
1. Backend runs on port 5000
2. Frontend runs on port 5173
3. Use `VITE_API_URL` env var for API URL
4. Check `.env.example` files for all required variables
