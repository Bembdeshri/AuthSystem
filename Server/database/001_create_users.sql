-- ==========================================================
-- AuthSystem
-- Migration 001
-- Create Users Table
-- ==========================================================

DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,

    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,

    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,

    password_hash TEXT NOT NULL,

    role VARCHAR(20) NOT NULL DEFAULT 'user',

    email_verified BOOLEAN NOT NULL DEFAULT FALSE,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    failed_login_attempts INTEGER NOT NULL DEFAULT 0,

    account_locked_until TIMESTAMP NULL,

    last_password_change TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    last_login TIMESTAMP NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email
ON users(email);

CREATE INDEX idx_users_username
ON users(username);
ALTER TABLE users
ADD CONSTRAINT chk_user_role
CHECK (role IN ('user', 'admin'));