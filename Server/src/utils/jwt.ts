import jwt from "jsonwebtoken";
import { AuthenticatedUser } from "../types/authenticatedUser";

const JWT_SECRET = process.env.JWT_SECRET || "";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in the environment variables.");
}

export function generateAccessToken(
  payload: AuthenticatedUser
): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "1h",
  });
}

export function verifyAccessToken(
  token: string
): AuthenticatedUser {
  return (jwt.verify(token, JWT_SECRET) as unknown) as AuthenticatedUser;
}