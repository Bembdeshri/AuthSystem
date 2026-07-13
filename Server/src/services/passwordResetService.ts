import { pool } from "../config/database";

interface CreateResetTokenParams {
  userId: string;
  token: string;
  expiresAt: Date;
}

/**
 * Stores a password reset token in the database.
 * Uses ON CONFLICT to overwrite any existing reset token for that user.
 */
export async function createPasswordResetToken({ userId, token, expiresAt }: CreateResetTokenParams): Promise<void> {
  await pool.query(
    `
      INSERT INTO password_reset_tokens (user_id, token, expires_at)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id) 
      DO UPDATE SET token = $2, expires_at = $3, created_at = NOW();
    `,
    [userId, token, expiresAt]
  );
}

/**
 * Validates a token and returns the corresponding user_id if valid.
 */
export async function validateResetToken(token: string): Promise<string | null> {
  const result = await pool.query(
    `
      SELECT user_id, expires_at 
      FROM password_reset_tokens 
      WHERE token = $1
    `,
    [token]
  );

  if (result.rows.length === 0) return null;

  const { user_id, expires_at } = result.rows[0];

  // Check if token is expired
  if (new Date() > new Date(expires_at)) {
    // Clean up expired token
    await deleteResetToken(token);
    return null;
  }

  return user_id;
}

/**
 * Deletes a token after it has been used.
 */
export async function deleteResetToken(token: string): Promise<void> {
  await pool.query("DELETE FROM password_reset_tokens WHERE token = $1", [token]);
}