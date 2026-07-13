import bcrypt from "bcrypt";
import { sendVerificationEmail } from "../utils/email";
import { pool } from "../config/database";
import { RegisterUserData } from "../types/auth.types";
import { generateVerificationToken } from "../utils/token";
import { createVerificationToken } from "./verificationService";

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
    [firstName, lastName, username, email, passwordHash]
  );

  const newUser = result.rows[0];

  // --- EMAIL VERIFICATION TOKEN LOGIC ---
  const token = generateVerificationToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // Token valid for 24 hours

  await createVerificationToken({
    userId: newUser.id,
    token,
    expiresAt,
  });
  try {
  await sendVerificationEmail(newUser.email, token);
       } catch (emailError) {
  // We log the error but don't crash registration if the email fails to dispatch
  console.error("Failed to send verification email:", emailError);
    }

  // Return the user data (Later, we will also trigger the actual email dispatch here)
  return newUser;
}

export async function loginUserService(email: string, password: string) {
  const result = await pool.query(
    `
      SELECT
        id,
        first_name,
        last_name,
        username,
        email,
        password_hash,
        role,
        email_verified,
        is_active
      FROM users
      WHERE email = $1
    `,
    [email]
  );

  if (result.rows.length === 0) {
    throw new Error("Invalid email or password.");
  }

  const user = result.rows[0];

  // Block unverified users from logging in
  if (!user.email_verified) {
    throw new Error("Please verify your email address before logging in.");
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatches) {
    throw new Error("Invalid email or password.");
  }

  return user;
}