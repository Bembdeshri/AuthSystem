import { pool } from "../config/database";

export async function recordLoginHistory(data: {
  userId: number | null;
  email: string;
  status: "SUCCESS" | "FAILED";
  ipAddress: string;
  userAgent: string;
}) {
  await pool.query(
    `
    INSERT INTO login_history (
      user_id,
      email,
      login_status,
      ip_address,
      user_agent
    )
    VALUES ($1, $2, $3, $4, $5)
    `,
    [
      data.userId,
      data.email,
      data.status,
      data.ipAddress,
      data.userAgent,
    ]
  );
}