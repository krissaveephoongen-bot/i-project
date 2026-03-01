import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { authMiddleware } from "../../../shared/middleware/authMiddleware";
import { validateRequest } from "../../../shared/middleware/validateRequest";
import { loginSchema, registerSchema } from "../schemas/authSchemas";

const router = Router();
const authController = new AuthController();

// Public routes
router.post("/login", validateRequest(loginSchema), authController.login);
router.post(
  "/register",
  validateRequest(registerSchema),
  authController.register,
);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

// Protected routes
router.get("/me", authMiddleware, authController.getMe);
router.post("/logout", authMiddleware, authController.logout);
router.put("/profile", authMiddleware, authController.updateProfile);
router.put("/password", authMiddleware, authController.changePassword);

export { router as authRoutes };
