# Setup Build Commands - Step by Step

## 📋 Checklist: Configure Build Commands

### FRONTEND (ticket-apw)

#### ✅ package.json scripts
Your current setup is correct:
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

#### ✅ vite.config.ts
Your current setup is correct:
```typescript
export default defineConfig({
  base: '/',
  server: {
    port: 5173,
    host: true,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',  // ✅ Already set to 5000
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',  // ✅ Correct output
    sourcemap: true,
  },
})
```

#### ✅ vercel.json
Create/Update vercel.json in root:
```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm ci",
  "devCommand": "npm run dev",
  "framework": "vite",
  "outputDirectory": "dist"
}
```

#### ✅ netlify.toml
Create/Update netlify.toml in root:
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

---

### BACKEND (ticket-apw-backend)

#### ✅ package.json scripts
Use BACKEND_PACKAGE.json as template:
```json
{
  "name": "ticket-apw-backend",
  "type": "commonjs",
  "scripts": {
    "postinstall": "prisma generate",
    "start": "node server/index.js",
    "dev": "nodemon server/index.js",
    "build": "npm run prisma:generate",
    "test": "jest",
    "db:migrate": "prisma migrate dev",
    "db:migrate:deploy": "prisma migrate deploy",
    "db:seed": "node prisma/seed.js",
    "prisma:generate": "prisma generate",
    "db:studio": "prisma studio",
    "lint": "eslint server --ext .js,.ts",
    "format": "prettier --write \"server/**/*.{js,ts}\""
  }
}
```

#### ✅ server/app.js
Your current setup is correct:
```javascript
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      /\.vercel\.app$/,
    ];
    // ... cors validation
  }
}
```

#### ✅ .env (Backend)
Create .env in backend root:
```env
# Environment
NODE_ENV=development

# Database
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]

# JWT & Security
JWT_SECRET=your-secure-jwt-secret-here
SESSION_SECRET=your-secure-session-secret-here

# Server
PORT=5000
CORS_ORIGIN=http://localhost:5173

# Optional
REDIS_URL=redis://localhost:6379
LOG_LEVEL=info
```

#### ✅ vercel.json (Backend)
Use BACKEND_VERCEL.json as template:
```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm ci",
  "devCommand": "npm run dev",
  "framework": null,
  "outputDirectory": "dist",
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

---

## 🚀 Testing Locally

### Terminal 1: Start Frontend
```bash
cd c:/Users/Jakgrits/project-mgnt
npm install
npm run dev
# Expected: http://localhost:5173
```

### Terminal 2: Start Backend
```bash
cd c:/Users/Jakgrits/project-mgnt  # or separate backend folder
npm install
npm run db:migrate  # Setup database
npm run dev
# Expected: http://localhost:5000
```

### Terminal 3: Run Tests
```bash
# Frontend
npm run test

# Backend
npm run test
```

---

## 📦 Build Output Summary

### Frontend Build Output
```
dist/
├── index.html
├── assets/
│   ├── index-xxxxx.js        (~200KB gzipped)
│   ├── vendor-xxxxx.js       (~150KB gzipped)
│   ├── index-xxxxx.css       (~50KB gzipped)
│   └── fonts/
└── favicon.ico
```

**Total**: ~500KB gzipped

### Backend Build Output
```
.prisma/client/        ← Generated Prisma types
node_modules/          ← All dependencies
server/                ← Runs directly from source
└── index.js           ← Entry point
```

**No bundled output** - Runs directly on Node.js

---

## 🌐 Deployment Checklist

### ✅ Vercel Frontend Deploy

1. Connect GitHub repository
2. Select `ticket-apw` project
3. Build settings auto-detected:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Environment Variables:
   ```
   VITE_API_URL=https://ticket-apw-backend.vercel.app
   ```
5. Deploy

### ✅ Vercel Backend Deploy

1. Connect GitHub repository
2. Select `ticket-apw-backend` project
3. Build settings auto-detected:
   - Build Command: `npm run build`
   - Framework: None
4. Environment Variables:
   ```
   DATABASE_URL=postgresql://...
   JWT_SECRET=your-secret-key
   NODE_ENV=production
   ```
5. Deploy

---

## 🔧 Configuration Files Summary

### Frontend Configuration Files
- ✅ `package.json` - NPM scripts
- ✅ `vite.config.ts` - Vite config (port 5173, proxy to 5000)
- ✅ `vercel.json` - Vercel deployment
- ✅ `netlify.toml` - Netlify deployment (optional)
- ✅ `tsconfig.json` - TypeScript config
- ✅ `.env.local` - Environment variables

### Backend Configuration Files
- ✅ `package.json` - NPM scripts
- ✅ `server/app.js` - Express config (port 5000, CORS)
- ✅ `server/index.js` - Entry point
- ✅ `vercel.json` - Vercel deployment
- ✅ `prisma/schema.prisma` - Database schema
- ✅ `.env` - Environment variables

---

## 🛠️ Common Commands Cheat Sheet

```bash
# Frontend Development
npm run dev              # Start dev server on 5173
npm run build            # Build production bundle
npm run preview          # Preview production build
npm run test             # Run tests
npm run test:e2e         # Run E2E tests
npm run lint             # Check code quality
npm run format           # Format code

# Backend Development
npm run dev              # Start dev server on 5000
npm run start            # Start production server
npm run build            # Generate Prisma client
npm run test             # Run tests
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed database with test data
npm run db:studio        # Open Prisma Studio UI
npm run lint             # Check code quality
npm run format           # Format code

# Both (in separate terminals)
npm run dev              # Frontend
npm run dev              # Backend
npm run db:studio        # Prisma Studio (optional)
```

---

## ✨ What Happens When You Deploy

### Frontend to Vercel
```
1. Vercel installs: npm ci
2. Vercel builds: npm run build
3. Vercel deploys: dist/ folder
4. Result: Optimized React app on vercel.app
```

### Backend to Vercel
```
1. Vercel installs: npm ci
2. Vercel generates: npm run build (Prisma)
3. Vercel deploys: Entire repo
4. Result: Express server on vercel.app
```

---

## 📝 Notes

- Frontend uses **Vite** for fast HMR in development
- Backend uses **Express.js** with **nodemon** for auto-reload
- Vite proxy already configured to point to backend on 5000
- CORS configured to allow frontend on 5173
- Production builds use environment variables for API URLs
