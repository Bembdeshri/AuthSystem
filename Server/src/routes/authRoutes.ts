import { Router } from "express";
import { 
  registerUser,
  loginUser,
  logoutUser,
  verifyEmail,
  verifyOtp,
  resendVerification,
  forgotPassword,
  resetPassword 
} from "../controllers/authController";

const router = Router();

// 🔑 Sign Up & Email Verification Pipelines
router.post("/signup", registerUser); 
router.post("/verify-otp", verifyOtp);
router.post("/resend-verification", resendVerification);
router.get("/verify-email", verifyEmail); // Left intact if you still support direct link verification

// 🚪 Session Lifecycle
router.post("/login", loginUser);
router.post("/logout", logoutUser);

// 🔄 Secure Password Recovery Handshakes
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;