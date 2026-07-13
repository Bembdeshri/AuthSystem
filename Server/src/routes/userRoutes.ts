import { Router, Response } from "express";
import {
  authenticateToken,
  AuthRequest,
} from "../middleware/authMiddleware";
import { getUserProfile } from "../controllers/userController";
 
const router = Router();

/**
 * GET /api/user/dashboard
 * Protected route that acts as the main entry portal for authenticated users
 */
router.get("/dashboard", authenticateToken, (req: AuthRequest, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Welcome to your dashboard!",
    user: req.user,
  });
});

/**
 * GET /api/user/profile
 * Protected route that forwards execution to the controller to return detailed user session data
 */
router.get("/profile", authenticateToken, getUserProfile);

export default router;