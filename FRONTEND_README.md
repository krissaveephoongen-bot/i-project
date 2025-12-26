# ticket-apw (Frontend)

Modern Project Management System Frontend built with React and Vite.

## Overview

This is the **frontend** repository for the ticket-apw project management system. The backend API is now in a separate repository: `ticket-apw-backend`.

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/krissaveephoongen-bot/ticket-apw.git
cd ticket-apw

# Install dependencies
npm install

# Create local environment file
cp .env.example.frontend .env.local
```

### Environment Setup

Create `.env.local` file:

```env
# Development
VITE_API_URL=http://localhost:5000

# Production (update after deploying backend)
# VITE_API_URL=https://ticket-apw-backend.vercel.app
```

### Running Locally

**Make sure the backend is running on `http://localhost:5000`**

```bash
# Start development server
npm run dev

# Open http://localhost:5173 in your browser
```

The app will automatically connect to the backend API at `http://localhost:5000`.

## Available Scripts

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run preview                # Preview production build

# Testing
npm run test                   # Run all tests
npm run test:unit              # Unit tests only
npm run test:e2e               # End-to-end tests
npm run test:e2e:ui            # E2E tests with UI
npm run test:e2e:headed        # E2E tests with browser visible

# Code Quality
npm run lint                   # Check for lint errors
npm run format                 # Format code with Prettier
```

## Project Structure

```
ticket-apw/
├── src/                       # React source code
│   ├── components/            # Reusable components
│   ├── hooks/                 # Custom React hooks
│   ├── pages/                 # Page components
│   ├── services/              # API service calls
│   ├── utils/                 # Utility functions
│   ├── App.tsx                # Main app component
│   └── main.tsx               # Entry point
├── admin-console/             # Admin panel UI
├── user-portal/               # User portal UI
├── public/                    # Static assets
├── tests/                     # Test files
├── index.html                 # HTML template
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── .env.example.frontend      # Example environment variables
└── package.json               # Dependencies
```

## API Integration

The frontend communicates with the backend via HTTP requests. All API calls use the `VITE_API_URL` environment variable.

### API Service Files

- `services/taskService.js` - Task management
- `services/teamService.js` - Team management
- `services/resourceService.js` - Resource management
- `admin-console/utils/api.js` - Admin API calls
- `src/admin-console/utils/api.js` - Admin API calls (alternative location)

### Making API Calls

```javascript
import { taskService } from './services/taskService';

// All requests automatically use VITE_API_URL
const tasks = await taskService.getTasks({ projectId: '123' });
```

## Deployment

### Prerequisites

1. Deploy backend to Vercel first
2. Note the backend URL (e.g., `https://ticket-apw-backend.vercel.app`)

### Deploy to Vercel

```bash
# Login to Vercel
npm run vercel login

# Deploy
npm run vercel deploy --prod
```

### Environment Variables

1. Go to **Vercel Dashboard** → Project Settings → Environment Variables
2. Add:
   ```
   VITE_API_URL=https://ticket-apw-backend.vercel.app
   ```
3. Redeploy the project

### Alternative: Deploy with GitHub

1. Connect GitHub repo to Vercel
2. Set `VITE_API_URL` in Vercel Project Settings
3. Push changes to main branch → auto-deploys

## Frontend Technologies

- **React 18** - UI library
- **Vite** - Build tool
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **React Query** - Data fetching
- **Formik/React Hook Form** - Form management
- **Vitest** - Unit testing
- **Playwright** - E2E testing

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### CORS Errors

If you see CORS errors:

1. Check backend is running: `curl http://localhost:5000/health`
2. Verify `VITE_API_URL` matches backend URL
3. Check backend CORS configuration in `server/app.js`

### API Connection Issues

1. Verify backend is accessible: `curl http://localhost:5000/api/health`
2. Check `.env.local` has correct `VITE_API_URL`
3. Check network tab in DevTools for actual request URL

### Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Clear Vite cache
rm -rf dist .vite
npm run build
```

## Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Commit changes: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/my-feature`
4. Create Pull Request

## Related Repositories

- **Backend**: https://github.com/krissaveephoongen-bot/ticket-apw-backend
- **Main Monorepo** (archived): https://github.com/krissaveephoongen-bot/ticket-apw

## Support

For issues and questions:
1. Check existing GitHub issues
2. Create new issue with details
3. Contact development team

## License

Proprietary - All rights reserved
