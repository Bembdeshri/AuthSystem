import { Router } from "express";
import { registerUser } from "../controllers/authController";

const router = Router();

// POST /api/auth/signup
router.post("/signup", registerUser);

export default router;