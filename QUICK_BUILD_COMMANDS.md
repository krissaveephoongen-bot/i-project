# Quick Build Commands Reference

## FRONTEND (ticket-apw)

### Install Command
```bash
npm ci
# or
npm install
```

### Development Command
```bash
npm run dev
# Runs: vite
# Output: http://localhost:5173
```

### Build Command
```bash
npm run build
# Runs: vite build
# Output: dist/
```

### Vercel Configuration
```json
{
  "installCommand": "npm ci",
  "devCommand": "npm run dev",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

### Local Dev Commands
```bash
npm run dev              # Start server
npm run test             # Run tests
npm run test:e2e         # E2E tests
npm run lint             # Check code
npm run format           # Format code
npm run preview          # Preview build
```

---

## BACKEND (ticket-apw-backend)

### Install Command
```bash
npm ci
# or
npm install
```

### Development Command
```bash
npm run dev
# Runs: nodemon server/index.js
# Output: http://localhost:5000
```

### Build Command
```bash
npm run build
# Runs: npm run prisma:generate
# Output: .prisma/client (generated types)
```

### Vercel Configuration
```json
{
  "installCommand": "npm ci",
  "devCommand": "npm run dev",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": null
}
```

### Local Dev Commands
```bash
npm run dev              # Start server with auto-reload
npm run start            # Start server (production)
npm run test             # Run Jest tests
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed test data
npm run db:studio        # Open Prisma Studio
npm run lint             # Check code
npm run format           # Format code
```

---

## 📊 Summary Table

| Aspect | Frontend | Backend |
|--------|----------|---------|
| **installCommand** | `npm ci` | `npm ci` |
| **devCommand** | `npm run dev` | `npm run dev` |
| **buildCommand** | `npm run build` | `npm run build` |
| **outputDirectory** | `dist` | `dist` (not used) |
| **Dev Port** | 5173 | 5000 |
| **Framework** | vite | null |

---

## 🚀 One-Line Starters

```bash
# Frontend - Development
npm run dev

# Frontend - Production build
npm run build && npm run preview

# Backend - Development
npm run dev

# Backend - Production start
npm run start

# Both - Full local setup
npm install && npm run dev  # Run in each directory
```

---

## 🌐 Environment Variables

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:5000
```

### Backend (.env)
```env
NODE_ENV=development
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

