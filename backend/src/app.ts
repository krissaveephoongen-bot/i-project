import express, {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "express";
import cors from "cors";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import { checkDatabaseConnection } from "./shared/database/connection";
import { validateEnvironment } from "./shared/validation/env.validation";
import { AppError } from "./shared/errors/AppError";
import { errorResponse, ErrorCode } from "./shared/types/api-response";
import { sanitizeRequest } from "./shared/middleware/sanitizeRequest";
import logger, { logHttpRequest, logInfo } from "./shared/logging/logger";

// Import feature routes
import { authRoutes } from "./features/auth/routes/authRoutes";
import { projectRoutes } from "./features/projects/routes/projectRoutes";
import { userRoutes } from "./features/users/routes/userRoutes";
import { taskRoutes } from "./features/tasks/routes/taskRoutes";
import { dashboardRoutes } from "./features/dashboard/routes/dashboardRoutes";
import { expenseRoutes } from "./features/expenses/routes/expenseRoutes";
import { clientRoutes } from "./features/clients/routes/clientRoutes";
import filterRoutes from "./features/filters/routes/filterRoutes";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: [
      "https://ticket-apw.vercel.app",
      "https://ticket-apw-api.vercel.app",
      "http://localhost:5173",
      "http://localhost:3000",
      "http://localhost:3001",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "cache-control",
      "expires",
      "pragma",
      "x-requested-with",
      "accept",
      "origin",
    ],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sanitize all inputs (prevent XSS)
app.use(sanitizeRequest());

// Add request ID for tracing
app.use((req: Request, res: Response, next: NextFunction) => {
  const requestId = req.headers["x-request-id"] || uuidv4();
  (req as any).id = requestId;
  res.setHeader("X-Request-ID", requestId);
  next();
});

// Structured request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    logHttpRequest(
      (req as any).id,
      req.method,
      req.path,
      res.statusCode,
      duration,
    );
  });
  next();
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Feature routes with v1 prefix
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/expenses", expenseRoutes);
app.use("/api/v1/clients", clientRoutes);
app.use("/api/v1/filters", filterRoutes);

// Health check with v1 prefix
app.get("/api/v1/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: "2.0.0"
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "i-Project API Backend",
    version: "2.0.0",
    architecture: "Feature-based organization",
    endpoints: {
      health: "/api/v1/health",
      auth: "/api/v1/auth",
      projects: "/api/v1/projects",
      users: "/api/v1/users",
      tasks: "/api/v1/tasks",
      dashboard: "/api/v1/dashboard",
      expenses: "/api/v1/expenses",
      clients: "/api/v1/clients",
      filters: "/api/v1/filters",
    },
  });
});

// Global error handler
const globalErrorHandler: ErrorRequestHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const requestId = (req as any).id;
  const isDevelopment = process.env.NODE_ENV === "development";

  // Default to 500
  let statusCode = 500;
  let errorCode = ErrorCode.INTERNAL_ERROR;
  let message = "An internal server error occurred";
  let details: any = undefined;

  // Handle known error types
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    errorCode = error.code || ErrorCode.OPERATION_FAILED;
    message = error.message;
    details = error.details;
  } else if (error.name === "ValidationError") {
    statusCode = 400;
    errorCode = ErrorCode.VALIDATION_ERROR;
    message = "Validation failed";
    details = error.errors || error.message;
  } else if (error.code === "ENOENT") {
    statusCode = 404;
    errorCode = ErrorCode.NOT_FOUND;
    message = "Resource not found";
  } else if (error.code === "ECONNREFUSED") {
    statusCode = 503;
    errorCode = ErrorCode.DATABASE_ERROR;
    message = "Database connection failed";
  } else if (error.message?.includes("Unauthorized")) {
    statusCode = 401;
    errorCode = ErrorCode.UNAUTHORIZED;
    message = "Unauthorized access";
  } else if (error.message?.includes("Forbidden")) {
    statusCode = 403;
    errorCode = ErrorCode.FORBIDDEN;
    message = "Access forbidden";
  } else if (isDevelopment) {
    // Show more details in development
    message = error.message || message;
  }

  // Log error using structured logger
  logHttpRequest((req as any).id, req.method, req.path, statusCode, 0);
  logger.error(`${statusCode} - ${errorCode}: ${message}`, {
    requestId,
    error: error instanceof Error ? error.message : String(error),
    ...(isDevelopment && {
      stack: error instanceof Error ? error.stack : undefined,
    }),
  });

  // Send response
  res
    .status(statusCode)
    .json(
      errorResponse(
        errorCode,
        message,
        isDevelopment ? details || error.message : details,
        req.path,
        requestId,
      ),
    );
};

app.use(globalErrorHandler);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Validate environment variables first (CRITICAL)
    validateEnvironment();
    logInfo("✅ Environment validation passed");

    // Check database connection
    await checkDatabaseConnection();

    app.listen(PORT, () => {
      logInfo(`🚀 Server running on port ${PORT}`);
      logInfo(`📊 Health check: http://localhost:${PORT}/api/health`);
      logInfo(`🏗️  Architecture: Feature-based organization`);
      logInfo(`🔐 Security: JWT validation enabled`);
    });
  } catch (error) {
    logger.error("Failed to start server:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    process.exit(1);
  }
}

startServer();

export default app;
