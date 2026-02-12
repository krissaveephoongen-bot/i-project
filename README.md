# i Project - Project Management System

[![Vercel Status](https://vercel.com/appworks-jakgrits-projects/ticket-apw/F3aPLVRGrsm83n7f2xkJ8T49fG5A)](https://ticket-apw.vercel.app/)

## Overview
i Project is a comprehensive project management system built with Next.js frontend and a Node.js (Express) backend.

## Local Development Setup

This guide will help you set up a complete local development environment for the project.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended, check `.nvmrc`)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- [Docker](https://www.docker.com/products/docker-desktop/) and Docker Compose

### 1. Installation

First, clone the repository and install the dependencies for both the frontend and backend.

```bash
# Clone the repository
git clone <your-repo-url>
cd project-mgnt

# Install all dependencies (root, next-app, and backend)
npm run install:all
```

### 2. Start the Local Database

We use Docker to run a local PostgreSQL database, which keeps your development environment clean and isolated from the production database.

From the project root directory, run:

```bash
docker-compose up -d
```
This command starts a PostgreSQL container in the background. The database connection details are pre-configured in `backend/.env.development`.

### 3. Seed the Database

After the database container is running, you need to populate it with initial mock data. This includes creating default users, projects, and tasks.

From the project root directory, run:

```bash
cd backend
npm run db:seed
```

This will execute the `backend/db/seed.js` script, which clears and re-populates the local database. You can re-run this command anytime you want to reset your data to a clean state.

### 4. Run the Backend Server

The backend server connects to the local database. It also includes a WebSocket server for real-time updates.

In a new terminal window, navigate to the `backend` directory and run:

```bash
cd backend
npm run dev
```
The backend API will now be running on `http://localhost:3001`.

### 5. Run the Frontend Server

The frontend is a Next.js application.

In a separate terminal window, run:

```bash
npm run dev
```
The frontend development server will start, and you can access the application at `http://localhost:3000`.

### Accessing the Local Application

- **Frontend:** `http://localhost:3000` (Next.js)
- **Backend API:** `http://localhost:3001`
- **Login Credentials:**
    - **Email:** `jakgrits.ph@appworks.co.th` (or `manager@example.com`, `employee@example.com`)
    - **Password:** `AppWorks@123!`

You are now fully set up for local development! Any changes you make to the frontend or backend code will be reflected in your local environment.

### Testing Frontend Against Live Backend

If you need to test your local frontend changes against the deployed backend API (e.g., on Vercel), you can configure the Next.js development server to proxy API requests to the live backend URL.

1.  **Ensure your local backend is NOT running** (or at least, not on port `3001`).
2.  Create a file named `.env.local` in your `next-app/` directory.
3.  Add the following lines to `next-app/.env.local`:
    ```
    NEXT_PUBLIC_API_URL="https://ticket-apw-api.vercel.app"
    NEXT_PUBLIC_WS_URL="wss://ticket-apw-api.vercel.app" # Use wss for secure WebSocket
    ```
4.  Run your frontend development server as usual:
    ```bash
    npm run dev
    ```
    Now, all API requests from your local frontend will be proxied to `https://ticket-apw-api.vercel.app`, and your WebSocket connection will attempt to connect to `wss://ticket-apw-api.vercel.app`.

This allows you to test your frontend against the production-like environment without needing to deploy your frontend changes.

## Available Scripts

From the project root directory:

- `npm run dev` - Start Next.js frontend development server
- `npm run build` - Build Next.js frontend for production
- `npm run start` - Start Next.js production server
- `npm run dev:backend` - Start backend development server
- `npm run dev:all` - Start both frontend and backend concurrently
- `npm run install:all` - Install dependencies for all packages
- `npm run test` - Run all tests
- `npm run lint` - Run linting on frontend code
- `npm run format` - Format frontend code

## Features
- User Authentication (Admin, Manager, Employee roles)
- Project & Task Management
- Time Tracking and Timesheets
- Expense Tracking
- Client Management
- Real-time progress updates

## Development
(Further development conventions can be added here)
