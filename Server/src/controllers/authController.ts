import { createPasswordResetToken, validateResetToken, deleteResetToken } from "../services/passwordResetService";
import { sendPasswordResetEmail } from "../utils/email";
import { generateSecureToken } from "../utils/token";
import bcrypt from "bcrypt";
import { verifyUserEmailService } from "../services/verificationService";
import { Request, Response } from "express";
import { generateAccessToken, verifyAccessToken } from "../utils/jwt";
import { generateSessionId } from "../utils/session";
import {
  registerUserService,
  loginUserService,
} from "../services/authService";
import { createSession, deleteSession } from "../services/sessionService";
import { recordLoginHistory } from "../services/loginHistoryService";
import { generateVerificationToken } from "../utils/token";
import { createVerificationToken } from "../services/verificationService";
import { sendVerificationEmail } from "../utils/email";
import { pool } from "../config/database"; // To look up the user by email
export async function registerUser(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const user = await registerUserService(req.body);
    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      user,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    res.status(400).json({ success: false, message });
  }
}

export async function loginUser(
  req: Request,
  res: Response
): Promise<void> {
  const { email, password } = req.body;
  try {
    const user = await loginUserService(email, password);
    
    // Fixed req.ip type mismatch by providing a fallback string
    await recordLoginHistory({
      userId: user.id,
      email: user.email,
      status: "SUCCESS",
      ipAddress: req.ip || "Unknown IP",
      userAgent: req.get("user-agent") || "",
    });

    // Create session and JWT
    const sessionId = generateSessionId();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);
    await createSession(user.id, sessionId, expiresAt);
    const token = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionId,
    });
    res
      .cookie("accessToken", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 60 * 60 * 1000,
      })
      .status(200)
      .json({
        success: true,
        message: "Login successful.",
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    
    // Fixed req.ip type mismatch by providing a fallback string
    await recordLoginHistory({
      userId: null,
      email,
      status: "FAILED",
      ipAddress: req.ip || "Unknown IP",
      userAgent: req.get("user-agent") || "",
    });
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    res.status(401).json({ success: false, message });
  }
}

export async function logoutUser(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      res.status(200).json({ success: true, message: "Already logged out." });
      return;
    }
    const payload = verifyAccessToken(token);
    await deleteSession(payload.sessionId);
    res.clearCookie("accessToken").status(200).json({
      success: true,
      message: "Logout successful.",
    });
  } catch (error) {
    res.clearCookie("accessToken");
    res.status(200).json({
      success: true,
      message: "Logout successful.",
    });
  }
}
export async function verifyEmail(
  req: Request,
  res: Response
): Promise<void> {
  const { token } = req.query;

  if (!token || typeof token !== "string") {
    res.status(400).json({ success: false, message: "Token query parameter is required." });
    return;
  }

  try {
    await verifyUserEmailService(token);
    
    res.status(200).json({
      success: true,
      message: "Email verified successfully! You can now log in.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    res.status(400).json({ success: false, message });
  }
}
export async function resendVerification(
  req: Request,
  res: Response
): Promise<void> {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ success: false, message: "Email is required." });
    return;
  }

  try {
    // 1. Check if the user exists
    const userResult = await pool.query(
      "SELECT id, email_verified FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      // Security Best Practice: Don't reveal if an email exists or not.
      // Pretend it succeeded so attackers can't fish for registered emails.
      res.status(200).json({
        success: true,
        message: "If an account exists with that email, a new verification link has been sent.",
      });
      return;
    }

    const user = userResult.rows[0];

    // 2. If already verified, tell them they don't need a token
    if (user.email_verified) {
      res.status(400).json({
        success: false,
        message: "This email address is already verified.",
      });
      return;
    }

    // 3. Generate a fresh token
    const token = generateVerificationToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // 4. Overwrite old token (This leverages our ON CONFLICT unique constraint!)
    await createVerificationToken({
      userId: user.id,
      token,
      expiresAt,
    });

    // 5. Fire off the email
    await sendVerificationEmail(email, token);

    res.status(200).json({
      success: true,
      message: "A new verification link has been sent to your email.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    res.status(500).json({ success: false, message });
  }
}
/**
 * Phase 1: Initiates a password reset request.
 * Generates a token and emails it to the user.
 */
export async function requestPasswordReset(req: Request, res: Response): Promise<void> {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ success: false, message: "Email is required." });
    return;
  }

  try {
    // 1. Force both sides to lowercase to avoid casing mismatches
    const userResult = await pool.query(
      "SELECT id FROM users WHERE LOWER(email) = LOWER($1)", 
      [email]
    );

    // TEMPORARY DEBUG LOG: See how many users Postgres found
    console.log(`🔍 Forgot-Password Lookup for [${email}] found ${userResult.rows.length} rows.`);

    if (userResult.rows.length === 0) {
      res.status(200).json({
        success: true,
        message: "If an account matches that email, a password reset link has been sent.",
      });
      return;
    }

    const userId = userResult.rows[0].id;
    const token = generateSecureToken();
    
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await createPasswordResetToken({ userId, token, expiresAt });
    await sendPasswordResetEmail(email, token);

    res.status(200).json({
      success: true,
      message: "If an account matches that email, a password reset link has been sent.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    res.status(500).json({ success: false, message });
  }
}

/**
 * Phase 2: Consumes the token and updates the user's password.
 */
export async function resetPassword(req: Request, res: Response): Promise<void> {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    res.status(400).json({ success: false, message: "Token and new password are required." });
    return;
  }

  try {
    // 1. Validate token & extract user ID
    const userId = await validateResetToken(token);

    if (!userId) {
      res.status(400).json({
        success: false,
        message: "Password reset token is invalid or has expired.",
      });
      return;
    }

    // 2. Hash new password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // 3. Update the user password row
    await pool.query(
      "UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2",
      [passwordHash, userId]
    );

    // 4. Burn the token so it can never be used again
    await deleteResetToken(token);

    res.status(200).json({
      success: true,
      message: "Your password has been reset successfully. You can now log in with your new credentials.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    res.status(500).json({ success: false, message });
  }
}