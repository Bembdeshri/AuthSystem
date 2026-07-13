-- ==========================================================
-- AuthSystem
-- Migration 005
-- Create Email Verification Tokens Table
-- ==========================================================

DROP TABLE IF EXISTS email_verification_tokens CASCADE;

CREATE TABLE email_verification_tokens (
    id BIGSERIAL PRIMARY KEY,

    user_id BIGINT NOT NULL,

    token TEXT NOT NULL UNIQUE,

    expires_at TIMESTAMP NOT NULL,

    used BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_email_verification_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_email_verification_user_id
ON email_verification_tokens(user_id);

CREATE INDEX idx_email_verification_token
ON email_verification_tokens(token);

CREATE INDEX idx_email_verification_expires_at
ON email_verification_tokens(expires_at);