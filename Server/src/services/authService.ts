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

  // 1. Generate a 6-digit numeric string code
  const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

  // 2. Set expiration timestamp to exactly 10 minutes from now
  const otpExpiresAt = new Date();
  otpExpiresAt.setMinutes(otpExpiresAt.getMinutes() + 10);

  // 3. Insert the user including the OTP schema properties
  const result = await pool.query(
    `
    INSERT INTO users
      (
        first_name,
        last_name,
        username,
        email,
        password_hash,
        otp,
        otp_expires_at,
        email_verified
      )
    VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING
      id,
      first_name,
      username,
      email,
      otp,
      created_at
    `,
    [
      firstName, 
      lastName, 
      username, 
      email, 
      passwordHash, 
      generatedOtp, 
      otpExpiresAt, 
      false
    ]
  );

  const newUser = result.rows[0];

  // Return the user data (containing .otp and .first_name for your controller's email function)
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