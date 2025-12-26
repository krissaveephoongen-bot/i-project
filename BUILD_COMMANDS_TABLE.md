# Build Commands Quick Table

## 📊 Side-by-Side Comparison

| Setting | Frontend (Vite) | Backend (Express) |
|---------|-----------------|------------------|
| **Project Name** | ticket-apw | ticket-apw-backend |
| **Framework** | Vite + React | Express.js + Node.js |
| **Language** | TypeScript/JSX | JavaScript |
| **Dev Server** | Vite | Nodemon |
| **Dev Port** | 5173 | 5000 |
| **Type** | Module (ESM) | CommonJS |

---

## 🔨 Build & Install Commands

| Command Type | Frontend | Backend |
|---|---|---|
| **Install Command** | `npm ci` | `npm ci` |
| **Dev Command** | `npm run dev` | `npm run dev` |
| **Build Command** | `npm run build` | `npm run build` |
| **Output Directory** | `dist` | `dist` (not used) |

### What Each Command Does

```
npm ci
├─ Installs exact versions from package-lock.json
└─ Used in CI/CD and production

npm run dev (Frontend)
├─ Runs: vite
├─ Starts dev server on http://localhost:5173
├─ Hot Module Reload (HMR) enabled
└─ Auto-opens browser

npm run dev (Backend)
├─ Runs: nodemon server/index.js
├─ Starts server on http://localhost:5000
├─ Auto-reloads on file changes
└─ Watches server/ directory

npm run build (Frontend)
├─ Runs: vite build
├─ Bundles React app to dist/
├─ Creates optimized JS/CSS
└─ Generates source maps

npm run build (Backend)
├─ Runs: npm run prisma:generate
├─ Generates Prisma client types
├─ Creates .prisma/client folder
└─ No bundling (runs from source)
```

---

## 📂 Output Directories

### Frontend: `dist/`
```
dist/
├── index.html                 (~2KB)
├── assets/
│   ├── index-xxxxx.js        (~200KB gzipped)
│   ├── vendor-xxxxx.js       (~150KB gzipped)
│   ├── index-xxxxx.css       (~50KB gzipped)
│   └── fonts/
└── favicon.ico

Total Size: ~500KB gzipped
Deployment: Vercel, Netlify, or any static host
```

### Backend: No Build Output
```
Backend runs directly from source:
├── server/
│   ├── index.js              (Entry point)
│   ├── app.js                (Express config)
│   └── routes/               (API endpoints)
├── prisma/
│   ├── schema.prisma         (Database schema)
│   └── migrations/           (Schema versions)
├── .prisma/client/           (Generated types)
└── node_modules/             (Dependencies)

Deployment: Vercel, Railway, AWS Lambda
```

---

## 🚀 npm Scripts Reference

### Frontend Scripts
```bash
npm run start              # Alias for 'vite'
npm run dev                # Development server (5173)
npm run build              # Production bundle
npm run preview            # Preview built dist/
npm run test               # Unit + integration tests
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:e2e           # Playwright E2E tests
npm run test:e2e:ui        # E2E tests with UI
npm run test:e2e:headed    # E2E tests with browser visible
npm run lint               # Check code with ESLint
npm run format             # Auto-format with Prettier
```

### Backend Scripts
```bash
npm run start              # Production start (node)
npm run dev                # Development server (nodemon, 5000)
npm run build              # Generate Prisma client
npm run test               # Jest tests
npm run test:auth          # Auth tests only
npm run test:api           # API tests only
npm run db:test            # Test DB connection
npm run db:migrate         # Run migrations (dev)
npm run db:migrate:deploy  # Run migrations (prod)
npm run db:reset           # Reset database
npm run db:seed            # Seed test data
npm run db:studio          # Prisma Studio UI (5555)
npm run prisma:generate    # Generate Prisma client
npm run create:admin       # Create admin user
npm run admin:init         # Initialize admin users
npm run lint               # Check code with ESLint
npm run format             # Auto-format with Prettier
```

---

## 🔌 Local Development Setup

### Terminal 1: Frontend
```bash
cd c:/Users/Jakgrits/project-mgnt
npm install
npm run dev
# → http://localhost:5173
```

### Terminal 2: Backend
```bash
cd c:/Users/Jakgrits/project-mgnt  # or separate directory
npm install
npm run db:migrate
npm run dev
# → http://localhost:5000
```

### Terminal 3: Database (Optional)
```bash
npm run db:studio
# → http://localhost:5555 (Prisma Studio)
```

---

## 🌐 Environment Setup

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:5000          # Development
# or
VITE_API_URL=https://ticket-apw-backend.vercel.app  # Production
```

### Backend (.env)
```env
NODE_ENV=development
DATABASE_URL=postgresql://user:password@host:port/dbname
JWT_SECRET=your-secure-jwt-secret
SESSION_SECRET=your-secure-session-secret
PORT=5000
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=info
```

---

## 📋 Vercel Configuration

### Frontend (vercel.json)
```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm ci",
  "devCommand": "npm run dev",
  "framework": "vite",
  "outputDirectory": "dist"
}
```

### Backend (vercel.json)
```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm ci",
  "devCommand": "npm run dev",
  "framework": null,
  "outputDirectory": "dist",
  "routes": [
    { "src": "/health", "dest": "/server/index.js" },
    { "src": "/api/(.*)", "dest": "/server/app.js" }
  ]
}
```

---

## ✅ Pre-Deployment Checklist

- [ ] Frontend: `npm run build` passes without errors
- [ ] Frontend: `npm run lint` passes
- [ ] Frontend: `npm run test` passes
- [ ] Backend: `npm run test` passes
- [ ] Backend: `npm run lint` passes
- [ ] Backend: Database migrations up to date
- [ ] Frontend `.env.local` has correct `VITE_API_URL`
- [ ] Backend `.env` has all required variables
- [ ] Vercel projects created on GitHub
- [ ] Environment variables set in Vercel dashboard
- [ ] CORS configured for production domains

---

## 🔍 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 5173 in use | Kill process: `npx kill-port 5173` |
| Port 5000 in use | Kill process: `npx kill-port 5000` |
| Build fails | Clear cache: `rm -rf dist node_modules` |
| DB migration errors | Check DATABASE_URL format |
| VITE_API_URL not working | Check .env.local syntax |
| Proxy not working | Restart dev server |
| Prisma client not found | Run `npm run prisma:generate` |

---

## 📝 Quick Copy-Paste

### Copy-paste for Frontend package.json
```json
"scripts": {
  "start": "vite",
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "test": "npm run test:unit && npm run test:integration",
  "test:unit": "vitest",
  "test:integration": "vitest tests/integration",
  "test:e2e": "playwright test",
  "lint": "eslint src --ext .js,.jsx,.ts,tsx",
  "format": "prettier --write \"src/**/*.{js,jsx,ts,tsx,css,scss}\""
}
```

### Copy-paste for Backend package.json
```json
"scripts": {
  "postinstall": "prisma generate",
  "start": "node server/index.js",
  "dev": "nodemon server/index.js",
  "build": "npm run prisma:generate",
  "test": "jest",
  "db:migrate": "prisma migrate dev",
  "db:seed": "node prisma/seed.js",
  "db:studio": "prisma studio",
  "prisma:generate": "prisma generate",
  "lint": "eslint server --ext .js,.ts",
  "format": "prettier --write \"server/**/*.{js,ts}\""
}
```

