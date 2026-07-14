import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";

const app = express();

// Security Header Safeguards
app.use(helmet());

// 1. FULLY CONFIGURED CORS MIDDLEWARE FOR HTTP-ONLY COOKIES
app.use(
  cors({
    origin: "http://localhost:5173", // Explicitly allow your Vite Frontend Server
    credentials: true,               // Crucial for exchanging HTTP-Only session cookies
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// Parse JSON requests
app.use(express.json());

// Parse cookies
app.use(cookieParser());

// 2. BACKEND ROUTE PREFIXES
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

// Root Health Test Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AuthSystem API is running 🚀"
  });
});

export default app;