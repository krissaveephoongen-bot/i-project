# Project Management System

A modern project management system built with React and Node.js.

## Project Structure

- `/docs` - Documentation
  - `/api` - API documentation and reference
  - `/architecture` - System architecture and security documentation
  - `/database` - Database schema and migration guides
  - `/design` - Design system and UI components
  - `/guides` - Implementation guides and quick starts
  - `/logs` - System logs
  - `/scripts` - Utility scripts
  - `/testing` - Testing documentation and guides

- `/admin-console` - Admin interface
- `/components` - Shared React components
- `/database` - Database scripts and migrations
- `/dist` - Production build output
- `/node_modules` - Dependencies (automatically created)
- `/prisma` - Prisma ORM configuration
- `/public` - Static assets
- `/scripts` - Build and utility scripts
- `/server` - Backend server code
- `/services` - Business logic services
- `/src` - Frontend source code
- `/tests` - Test files
- `/user-portal` - User-facing application
- `/utils` - Utility functions

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. Start the development server:
   ```bash
   npm run dev:all
   ```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Documentation

Detailed documentation is available in the `/docs` directory, organized by category.
