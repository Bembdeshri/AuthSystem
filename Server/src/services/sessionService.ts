import { pool } from "../config/database";

export async function createSession(
  userId: number,
  sessionId: string,
  expiresAt: Date
) {
  const result = await pool.query(
    `
      INSERT INTO sessions (
        user_id,
        session_id,
        expires_at
      )
      VALUES ($1, $2, $3)
      RETURNING
        id,
        user_id,
        session_id,
        expires_at,
        created_at
    `,
    [userId, sessionId, expiresAt]
  );

  return result.rows[0];
}

export async function getSessionById(sessionId: string) {
  const result = await pool.query(
    `
      SELECT *
      FROM sessions
      WHERE session_id = $1
        AND expires_at > CURRENT_TIMESTAMP
      LIMIT 1
    `,
    [sessionId]
  );

  return result.rows[0] ?? null;
}

export async function deleteSession(sessionId: string) {
  await pool.query(
    `
      DELETE FROM sessions
      WHERE session_id = $1
    `,
    [sessionId]
  );
}