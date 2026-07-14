import { Request, Response } from "express";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { pool } from "../config/database";
import { 
  registerUserService, 
  loginUserService 
} from "../services/authService";
import { 
  createSession, 
  deleteSession 
} from "../services/sessionService";
import { recordLoginHistory } from "../services/loginHistoryService";
import { 
  verifyUserEmailService, 
  createVerificationToken 
} from "../services/verificationService";
import { 
  createPasswordResetToken, 
  validateResetToken, 
  deleteResetToken 
} from "../services/passwordResetService";
import { 
  generateAccessToken, 
  verifyAccessToken 
} from "../utils/jwt";
import { generateSessionId } from "../utils/session";
import { 
  generateSecureToken, 
  generateVerificationToken 
} from "../utils/token";

// Import your Nodemailer mail services
import { 
  sendOtpEmail, 
  sendResetPasswordEmail 
} from "../services/mailService";

/**
 * Register user and dispatch a 6-digit verification OTP
 */
export async function registerUser(req: Request, res: Response): Promise<void> {
  try {
    // 1. Save user to PostgreSQL (Service generates a 6-digit OTP code with a 10-min expiry)
    const user = await registerUserService(req.body);

    // Retrieve or generate a numeric fallback OTP
    const otpCode = (user as any).otp || Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Direct-dispatch the styled OTP email
    try {
      await sendOtpEmail({
        email: user.email,
        firstName: user.first_name,
        otp: otpCode,
      });
      console.log(`🔑 OTP code [${otpCode}] sent successfully to: ${user.email}`);
    } catch (mailError) {
      console.error("❌ Failed to dispatch OTP email:", mailError);
    }

    res.status(201).json({
      success: true,
      message: "Registration successful! A 6-digit verification code was sent to your email.",
      user,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    res.status(400).json({ success: false, message });
  }
}

/**
 * Verify User Email via Direct 6-Digit OTP Code Check on the User Row
 */
export async function verifyOtp(req: Request, res: Response): Promise<void> {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      res.status(400).json({ success: false, message: "Email and OTP code are required." });
      return;
    }

    // 1. Fetch the user directly from the users table using your existing 'pool'
    const result = await pool.query(
      "SELECT otp, otp_expires_at FROM users WHERE LOWER(email) = LOWER($1)", 
      [email.trim()]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: "User account not found." });
      return;
    }

    const user = result.rows[0];

    // 2. Validate that the code matches and hasn't expired yet
    if (!user.otp || user.otp !== otp.trim()) {
      res.status(400).json({ success: false, message: "Invalid verification code." });
      return;
    }

    if (new Date() > new Date(user.otp_expires_at)) {
      res.status(400).json({ success: false, message: "Verification code has expired (10-minute limit reached)." });
      return;
    }

    // 3. Update the user row directly to mark them verified and wipe out the temporary OTP data
    await pool.query(
      "UPDATE users SET email_verified = true, otp = NULL, otp_expires_at = NULL, updated_at = NOW() WHERE LOWER(email) = LOWER($1)",
      [email.trim()]
    );

    res.status(200).json({
      success: true,
      message: "Email verified successfully! Your profile is now active. You can now log in."
    });
  } catch (error) {
    console.error("OTP Verification Database Crash:", error);
    res.status(500).json({ success: false, message: "An unexpected verification error occurred." });
  }
}

/**
 * Password Reset Request Handler (Generates in-table token & emails link)
 */
export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const { email } = req.body;

  try {
    if (!email) {
      res.status(400).json({ success: false, message: "Email is required." });
      return;
    }

    // Check if user exists using case-insensitive lookup
    const result = await pool.query(
      "SELECT id, first_name, email FROM users WHERE LOWER(email) = LOWER($1)", 
      [email.trim()]
    );
    
    if (result.rows.length === 0) {
      // Security best practice: don't reveal if email exists, just return a generic message
      res.status(200).json({ success: true, message: "If that email exists, a reset link has been sent." });
      return;
    }

    const user = result.rows[0];

    // Generate secure 32-character hex token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15-minute expiry

    // Save token & expiry directly to the user's row
    await pool.query(
      "UPDATE users SET reset_token = $1, reset_token_expires_at = $2 WHERE id = $3",
      [token, expiresAt, user.id]
    );

    // Send the styled reset recovery email link
    await sendResetPasswordEmail({
      email: user.email,
      firstName: user.first_name,
      resetToken: token,
    });

    res.status(200).json({
      success: true,
      message: "A password recovery reset link has been dispatched to your email inbox.",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ success: false, message: "An unexpected error occurred." });
  }
}

/**
 * Handle "Reset Password" Submission (Validates token directly on the user row)
 */
export async function resetPassword(req: Request, res: Response): Promise<void> {
  const { token, password } = req.body;

  try {
    if (!token || !password) {
      res.status(400).json({ success: false, message: "Token and password are required." });
      return;
    }

    // Find the user with this active, unexpired token directly in the table
    const result = await pool.query(
      "SELECT id FROM users WHERE reset_token = $1 AND reset_token_expires_at > NOW()",
      [token]
    );

    if (result.rows.length === 0) {
      res.status(400).json({ success: false, message: "Invalid or expired reset token." });
      return;
    }

    const user = result.rows[0];

    // Hash the new password using registration work cost factors
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Save password_hash directly to user row and clear token properties completely
    await pool.query(
      "UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires_at = NULL, updated_at = NOW() WHERE id = $2",
      [hashedPassword, user.id]
    );

    res.status(200).json({
      success: true,
      message: "Password updated successfully! You can now log in.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ success: false, message: "An unexpected error occurred." });
  }
}

/**
 * User Login Handler
 */
export async function loginUser(req: Request, res: Response): Promise<void> {
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
        secure: false, // Set to true in production with HTTPS
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
    
    await recordLoginHistory({
      userId: null,
      email,
      status: "FAILED",
      ipAddress: req.ip || "Unknown IP",
      userAgent: req.get("user-agent") || "",
    });

    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    res.status(401).json({ success: false, message });
  }
}

/**
 * User Logout Handler
 */
export async function logoutUser(req: Request, res: Response): Promise<void> {
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

/**
 * Legacy Token-based Verification Handler (Optional Fallback)
 */
export async function verifyEmail(req: Request, res: Response): Promise<void> {
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
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    res.status(400).json({ success: false, message });
  }
}

/**
 * Resend Verification OTP (Updated to use Direct user table rows with 10-minute limits)
 */
export async function resendVerification(req: Request, res: Response): Promise<void> {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ success: false, message: "Email is required." });
    return;
  }

  try {
    // 1. Check if the user exists
    const userResult = await pool.query(
      "SELECT id, first_name, email_verified FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      res.status(200).json({
        success: true,
        message: "If an account exists with that email, a new verification link has been sent.",
      });
      return;
    }

    const user = userResult.rows[0];

    // 2. If already verified, exit
    if (user.email_verified) {
      res.status(400).json({
        success: false,
        message: "This email address is already verified.",
      });
      return;
    }

    // 3. Generate a fresh numeric OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // Synchronized to the direct 10-minute expiry rule

    // 4. Overwrite old OTP properties directly in the user row
    await pool.query(
      "UPDATE users SET otp = $1, otp_expires_at = $2, updated_at = NOW() WHERE id = $3",
      [otpCode, expiresAt, user.id]
    );

    // 5. Fire off the email
    await sendOtpEmail({
      email: email,
      firstName: user.first_name,
      otp: otpCode,
    });

    res.status(200).json({
      success: true,
      message: "A new verification code has been sent to your email.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    res.status(500).json({ success: false, message });
  }
}