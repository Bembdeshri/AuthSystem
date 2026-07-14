import { Router, Response } from "express";
import { authenticateToken, AuthRequest } from "../middleware/authMiddleware";

const router = Router();

/**
 * @route   GET /user/profile
 * @desc    Retrieve the current logged-in user profile
 * @access  Private (Requires valid HTTP-only accessToken cookie)
 */
router.get("/profile", authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // 1. Double check that req.user was attached by the auth middleware
    const currentUser = req.user;

    if (!currentUser) {
      res.status(401).json({
        success: false,
        message: "Unauthorized access. No session profile context is active.",
      });
      return;
    }

    // 2. Return the profile payload directly to the dashboard
    res.status(200).json({
      success: true,
      user: {
        id: currentUser.userId,
        email: currentUser.email,
        role: currentUser.role,
        sessionId: currentUser.sessionId,
      },
    });
  } catch (error) {
    console.error("Profile Fetch Error:", error);
    res.status(500).json({
      success: false,
      message: "An unexpected error occurred while fetching your profile.",
    });
  }
});

export default router;