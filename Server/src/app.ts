import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

const app = express();

// Security
app.use(helmet());

// Allow frontend requests
app.use(cors());

// Parse JSON requests
app.use(express.json());
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
app.use(express.static("public"));
// Parse cookies
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
// Test Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AuthSystem API is running 🚀"
  });
});

export default app;