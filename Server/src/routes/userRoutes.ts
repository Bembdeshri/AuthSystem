import { Router, Response } from "express";
import { authenticateToken, AuthRequest } from "../middleware/authMiddleware";
import { pool } from "../config/database";

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

    // 2. Fetch full user details from the database
    const userResult = await pool.query(
      "SELECT id, first_name, last_name, username, email, role FROM users WHERE id = $1",
      [currentUser.userId]
    );

    if (userResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "User not found.",
      });
      return;
    }

    const dbUser = userResult.rows[0];

    // 3. Return the full profile payload to the dashboard
    res.status(200).json({
      success: true,
      user: {
        id: dbUser.id,
        firstName: dbUser.first_name,
        lastName: dbUser.last_name,
        username: dbUser.username,
        email: dbUser.email,
        role: dbUser.role,
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

/**
 * @route   GET /user/login-history
 * @desc    Fetch recent login history for the current user
 * @access  Private
 */
router.get("/login-history", authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUser = req.user;
    if (!currentUser) {
      res.status(401).json({ success: false, message: "Unauthorized." });
      return;
    }
    const historyResult = await pool.query(
      "SELECT id, login_status, ip_address, user_agent, success, login_time FROM login_history WHERE user_id = $1 OR LOWER(email) = LOWER($2) ORDER BY login_time DESC LIMIT 10",
      [currentUser.userId, currentUser.email]
    );
    res.status(200).json({ success: true, history: historyResult.rows });
  } catch (error) {
    console.error("Fetch Login History Error:", error);
    res.status(500).json({ success: false, message: "An error occurred fetching login history." });
  }
});

/**
 * @route   GET /user/active-sessions
 * @desc    Fetch all active sessions for the current user
 * @access  Private
 */
router.get("/active-sessions", authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUser = req.user;
    if (!currentUser) {
      res.status(401).json({ success: false, message: "Unauthorized." });
      return;
    }
    const sessionsResult = await pool.query(
      "SELECT session_id, expires_at, created_at FROM sessions WHERE user_id = $1 AND expires_at > NOW() ORDER BY created_at DESC",
      [currentUser.userId]
    );
    res.status(200).json({ success: true, sessions: sessionsResult.rows });
  } catch (error) {
    console.error("Fetch Sessions Error:", error);
    res.status(500).json({ success: false, message: "An error occurred fetching active sessions." });
  }
});

/**
 * @route   DELETE /user/sessions/:sessionId
 * @desc    Revoke a specific active session
 * @access  Private
 */
router.delete("/sessions/:sessionId", authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUser = req.user;
    if (!currentUser) {
      res.status(401).json({ success: false, message: "Unauthorized." });
      return;
    }
    const { sessionId } = req.params;
    await pool.query(
      "DELETE FROM sessions WHERE session_id = $1 AND user_id = $2",
      [sessionId, currentUser.userId]
    );
    res.status(200).json({ success: true, message: "Session revoked successfully." });
  } catch (error) {
    console.error("Revoke Session Error:", error);
    res.status(500).json({ success: false, message: "An error occurred while revoking session." });
  }
});

export default router;