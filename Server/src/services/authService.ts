import bcrypt from "bcrypt";
import { pool } from "../config/database";
import { RegisterUserData } from "../types/auth.types";

export async function registerUserService(data: RegisterUserData) {
  const { firstName, lastName, username, email, password } = data;

  // Check if username or email already exists
  const existingUser = await pool.query(
    `
    SELECT id
    FROM users
    WHERE email = $1
       OR username = $2
    `,
    [email, username]
  );

  if (existingUser.rows.length > 0) {
    throw new Error("Email or username already exists.");
  }

  // Hash the password
  const passwordHash = await bcrypt.hash(password, 12);

  // Insert the user
  const result = await pool.query(
    `
    INSERT INTO users
      (
        first_name,
        last_name,
        username,
        email,
        password_hash
      )
    VALUES
      ($1, $2, $3, $4, $5)
    RETURNING
      id,
      username,
      email,
      created_at
    `,
    [
      firstName,
      lastName,
      username,
      email,
      passwordHash,
    ]
  );

  return result.rows[0];
}