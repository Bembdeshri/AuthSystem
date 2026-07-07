import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export async function connectDatabase(): Promise<void> {
  try {
    const client = await pool.connect();

    const result = await client.query("SELECT NOW()");

    console.log("=================================");
    console.log("✅ PostgreSQL Connected");
    console.log("🕒 Database Time:", result.rows[0].now);
    console.log("=================================");

    client.release();
  } catch (error) {
    console.error("❌ Database Connection Failed");
    console.error(error);
    process.exit(1);
  }
}