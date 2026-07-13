import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware"; // Adjust path if needed

/**
 * GET /api/user/profile
 * Protected route that returns the currently logged-in user's session data
 */
export async function getUserProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    // Because your middleware sets req.user, we have full access here!
    const currentUser = req.user;

    res.status(200).json({
      success: true,
      message: "Profile retrieved successfully.",
      user: currentUser,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    res.status(500).json({ success: false, message });
  }
}