-- Migration to add session_link column to sessions table
ALTER TABLE sessions ADD COLUMN session_link VARCHAR(100) UNIQUE;
CREATE INDEX idx_sessions_session_link ON sessions(session_link);
