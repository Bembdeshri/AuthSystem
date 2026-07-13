import { pool } from "../config/database";

interface VerificationTokenData {
  userId: number;
  token: string;
  expiresAt: Date;
}

/**
 * Stores a newly generated email verification token in the database.
 */
export async function createVerificationToken(data: VerificationTokenData): Promise<void> {
  await pool.query(
    `
    INSERT INTO email_verification_tokens (user_id, token, expires_at)
    VALUES ($1, $2, $3)
    ON CONFLICT (user_id) 
    DO UPDATE SET token = $2, expires_at = $3;
    `,
    [data.userId, data.token, data.expiresAt]
  );
}

/**
 * Validates the verification token and updates the user's status to verified.
 */
export async function verifyUserEmailService(token: string): Promise<void> {
  // 1. Find the token row
  const tokenResult = await pool.query(
    `SELECT user_id, expires_at FROM email_verification_tokens WHERE token = $1`,
    [token]
  );

  if (tokenResult.rows.length === 0) {
    throw new Error("Invalid or expired verification token.");
  }

  const { user_id, expires_at } = tokenResult.rows[0];

  // 2. Check if the token has expired
  if (new Date() > new Date(expires_at)) {
    // Optional: Delete expired token
    await pool.query(`DELETE FROM email_verification_tokens WHERE token = $1`, [token]);
    throw new Error("Verification token has expired. Please request a new one.");
  }

  // 3. Mark the user as verified
  await pool.query(
    `UPDATE users SET email_verified = true WHERE id = $1`,
    [user_id]
  );

  // 4. Delete the token so it cannot be reused
  await pool.query(`DELETE FROM email_verification_tokens WHERE token = $1`, [token]);
}