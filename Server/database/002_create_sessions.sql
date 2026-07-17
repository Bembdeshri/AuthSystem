-- ==========================================================
-- AuthSystem
-- Migration 002
-- Create Sessions Table
-- ==========================================================

DROP TABLE IF EXISTS sessions CASCADE;

CREATE TABLE sessions (
    id BIGSERIAL PRIMARY KEY,

    user_id BIGINT NOT NULL,

    session_id UUID NOT NULL UNIQUE,

    expires_at TIMESTAMP NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_sessions_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_sessions_user_id
ON sessions(user_id);

CREATE INDEX idx_sessions_id
ON sessions(session_id);

CREATE INDEX idx_sessions_expires_at
ON sessions(expires_at);