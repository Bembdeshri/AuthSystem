-- ==========================================================
-- AuthSystem
-- Migration 003
-- Create Login History Table
-- ==========================================================

DROP TABLE IF EXISTS login_history CASCADE;

CREATE TABLE login_history (
    id BIGSERIAL PRIMARY KEY,

    user_id BIGINT NOT NULL,

    ip_address INET,

    user_agent TEXT,

    success BOOLEAN NOT NULL,

    login_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_login_history_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_login_history_user_id
ON login_history(user_id);

CREATE INDEX idx_login_history_login_time
ON login_history(login_time);

CREATE INDEX idx_login_history_success
ON login_history(success);