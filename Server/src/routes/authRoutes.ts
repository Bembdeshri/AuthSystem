import { Router } from "express";
// 1. Check your import name here. Ensure it maps correctly!
import { registerUser,
   loginUser,
    logoutUser,
     verifyEmail,
    resendVerification,
    requestPasswordReset,
  resetPassword} from "../controllers/authController";

const router = Router();

// 2. Change the route handler back to match your original endpoint
router.post("/signup", registerUser); 
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", resetPassword);
export default router;