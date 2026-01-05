import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// API Routes
import projectRoutes from './routes/project-routes.js';
import taskRoutes from './routes/task-routes.js';
import userRoutes from './routes/user-routes.js';
import authRoutes from './routes/auth-routes.js';

app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// Serve static files in production
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));

  // Handle SPA routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

const PORT = process.env.PORT || 3001;

// Only start the server if not in Vercel environment
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
