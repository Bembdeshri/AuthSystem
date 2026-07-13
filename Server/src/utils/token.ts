import crypto from "crypto";

/**
 * Generates a cryptographically secure 64-character hex token for email verifications.
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Generates a cryptographically secure 64-character hex token for password resets.
 */
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString("hex");
}