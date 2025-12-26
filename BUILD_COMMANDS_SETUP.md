# Build Commands Setup - Frontend & Backend

## 🎯 Overview
This guide explains all build commands, output directories, and development commands for both frontend and backend.

---

## FRONTEND (Vite + React)

### 📦 Project Info
- **Name**: ticket-apw
- **Framework**: Vite + React
- **Port**: 5173
- **Output**: dist/

### ✅ Current NPM Scripts (package.json)
```json
{
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
}
```

### 🚀 Commands Reference

| Command | Purpose | Usage |
|---------|---------|-------|
| `npm run dev` | Start development server | Local development on http://localhost:5173 |
| `npm run build` | Production build | Creates optimized `dist/` folder |
| `npm run preview` | Preview production build | Test built app locally |
| `npm run test` | Run all tests | Unit + integration tests |
| `npm run test:e2e` | E2E tests | Run Playwright tests |
| `npm run lint` | Check code quality | Find ESLint issues |
| `npm run format` | Auto-format code | Fix formatting issues |

### 📋 Vercel Configuration (vercel.json)
```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm ci",
  "devCommand": "npm run dev",
  "framework": "vite",
  "outputDirectory": "dist"
}
```

### 📋 Netlify Configuration (netlify.toml)
```toml
[build]
  command = "npm install --include=dev && npm run build"
  publish = "dist"
  functions = "netlify/functions"

[dev]
  publish = "dist"
  port = 5173
  targetPort = 5173
  framework = "vite"
```

### 🎬 Development Workflow
```bash
# 1. Install dependencies
npm install

# 2. Start development server (with hot reload)
npm run dev
# → Open http://localhost:5173

# 3. Run tests while developing
npm run test:unit -- --watch

# 4. Build for production
npm run build

# 5. Preview production build
npm run preview
```

---

## BACKEND (Express.js + Node.js)

### 📦 Project Info
- **Name**: ticket-apw-backend
- **Framework**: Express.js
- **Runtime**: Node.js
- **Port**: 5000
- **Type**: CommonJS
- **Output**: No build output (runs directly from source)

### ✅ NPM Scripts (BACKEND_PACKAGE.json)
```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "start": "node server/index.js",
    "dev": "nodemon server/index.js",
    "build": "npm run prisma:generate",
    "test": "jest",
    "test:auth": "jest tests/integration/auth",
    "test:api": "jest tests/integration/api",
    "db:test": "node scripts/test-connection.js",
    "db:migrate": "prisma migrate dev",
    "db:migrate:deploy": "prisma migrate deploy",
    "db:reset": "prisma migrate reset --force",
    "db:seed": "node prisma/seed.js",
    "prisma:generate": "prisma generate",
    "db:studio": "prisma studio",
    "create:admin": "node scripts/create-admin.js",
    "admin:init": "node scripts/setup-admin-users.js",
    "lint": "eslint server --ext .js,.ts",
    "format": "prettier --write \"server/**/*.{js,ts}\""
  }
}
```

### 🚀 Commands Reference

| Command | Purpose | Usage |
|---------|---------|-------|
| `npm run dev` | Start with auto-reload | Development on http://localhost:5000 |
| `npm run start` | Production start | Run compiled Node app |
| `npm run build` | Generate Prisma client | Before deployment |
| `npm run test` | Run Jest tests | Test API endpoints |
| `npm run db:migrate` | Create/update DB schema | After schema changes |
| `npm run db:seed` | Populate test data | Initialize DB with sample data |
| `npm run prisma:generate` | Generate Prisma types | After schema.prisma changes |
| `npm run db:studio` | Prisma Studio | Visual DB editor on http://localhost:5555 |
| `npm run lint` | Check code quality | Find ESLint issues |
| `npm run format` | Auto-format code | Fix formatting issues |

### 📋 Vercel Configuration (BACKEND_VERCEL.json)
```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm ci",
  "devCommand": "npm run dev",
  "framework": null,
  "outputDirectory": "dist",
  "functions": {
    "api/**/*.js": {
      "runtime": "@vercel/node@3.1.0"
    }
  },
  "routes": [
    {
      "src": "/health",
      "dest": "/server/index.js"
    },
    {
      "src": "/api/(.*)",
      "dest": "/server/app.js"
    }
  ]
}
```

### 🎬 Development Workflow
```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
# Create .env file with:
# - DATABASE_URL=postgresql://...
# - JWT_SECRET=your-secret
# - PORT=5000
# - NODE_ENV=development

# 3. Run migrations
npm run db:migrate

# 4. Seed test data (optional)
npm run db:seed

# 5. Start development server (with auto-reload via nodemon)
npm run dev
# → Server runs on http://localhost:5000

# 6. Test API endpoints
npm run test

# 7. View database with Prisma Studio
npm run db:studio
# → Opens http://localhost:5555
```

---

## 📂 Directory Structure & Output

### Frontend Build Output
```
ticket-apw/
├── src/
├── vite.config.ts
├── package.json
└── dist/                    ← Production build output
    ├── index.html
    ├── assets/
    │   ├── *.js
    │   ├── *.css
    │   └── *.woff2
    └── favicon.ico
```

**Build size**: ~500KB (gzipped)

### Backend Build Output
```
ticket-apw-backend/
├── server/
│   ├── index.js            ← Entry point (no build step)
│   ├── app.js
│   ├── routes/
│   └── services/
├── prisma/
│   ├── schema.prisma       ← Database schema
│   └── migrations/         ← Schema versions
├── package.json
├── .env                    ← Environment config
└── node_modules/
```

**No build output** - Runs directly from source on Node.js

---

## 🌐 Local Development Setup

### Terminal 1: Start Frontend
```bash
cd c:/Users/Jakgrits/project-mgnt
npm run dev
# → http://localhost:5173
```

### Terminal 2: Start Backend
```bash
cd c:/Users/Jakgrits/project-mgnt  # or separate backend repo
npm run dev
# → http://localhost:5000
```

### Terminal 3: Watch Database
```bash
npm run db:studio
# → http://localhost:5555
```

---

## 🚀 Production Deployment

### Frontend to Vercel
```bash
# Vercel automatically runs these:
1. npm ci                    # Install (install command)
2. npm run build             # Build (build command)
3. Deploys dist/             # Output directory

# Environment: NODE_ENV=production
# Result: https://ticket-apw.vercel.app
```

### Backend to Vercel
```bash
# Vercel automatically runs these:
1. npm ci                    # Install (install command)
2. npm run build             # Build Prisma client (build command)
3. Deploys from ./           # Entire repo (no output dir)

# Environment: DATABASE_URL, JWT_SECRET, etc.
# Result: https://ticket-apw-backend.vercel.app
```

---

## ⚙️ Environment Variables

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:5000        # Dev
# or
VITE_API_URL=https://ticket-apw-backend.vercel.app  # Prod
```

### Backend (.env)
```env
NODE_ENV=development
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

---

## 🔍 Key Differences

| Aspect | Frontend | Backend |
|--------|----------|---------|
| **Framework** | Vite + React | Express.js |
| **Language** | TypeScript/JSX | JavaScript |
| **Dev Port** | 5173 | 5000 |
| **Build** | Bundled to dist/ | No build output |
| **Start** | vite | node server/index.js |
| **Dev Server** | vite (HMR) | nodemon (auto-reload) |
| **Build Command** | vite build | prisma generate |
| **Testing** | vitest, playwright | jest |
| **Deployment** | Vercel + Netlify | Vercel / Railway |

---

## 🛠️ Troubleshooting

### Frontend won't connect to backend
1. Check VITE_API_URL in .env.local
2. Verify backend is running on port 5000
3. Check CORS settings in server/app.js

### Backend won't start
1. Check DATABASE_URL is correct
2. Run `npm run db:migrate`
3. Check PORT 5000 is not in use

### Build fails on Vercel
1. Check `buildCommand` matches package.json
2. Verify `installCommand` is correct
3. Check environment variables are set

