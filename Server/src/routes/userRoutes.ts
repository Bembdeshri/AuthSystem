import { Router, Response } from "express";
import {
  authenticateToken,
  AuthRequest,
} from "../middleware/authMiddleware";

const router = Router();

router.get("/dashboard", authenticateToken, (req: AuthRequest, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Welcome to your dashboard!",
    user: req.user,
  });
});

export default router;