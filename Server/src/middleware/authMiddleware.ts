import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { getSessionById } from "../services/sessionService";
import { AuthenticatedUser } from "../types/authenticatedUser";
export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export async function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    const decoded = verifyAccessToken(token);

    const session = await getSessionById(decoded.sessionId);

    if (!session) {
      res.status(401).json({
        success: false,
        message: "Session expired or invalid.",
      });
      return;
    }

    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
}