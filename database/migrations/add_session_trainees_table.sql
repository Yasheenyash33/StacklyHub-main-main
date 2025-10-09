-- Migration: Add session_trainees table for many-to-many relationship between sessions and trainees
-- Date: 2024-12-19

-- Create session_trainees table
CREATE TABLE IF NOT EXISTS session_trainees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    trainee_id INT NOT NULL,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (trainee_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_session_trainee (session_id, trainee_id),
    INDEX idx_session_id (session_id),
    INDEX idx_trainee_id (trainee_id)
);

-- Migrate existing data from sessions.trainee_id to session_trainees
INSERT INTO session_trainees (session_id, trainee_id)
SELECT id, trainee_id FROM sessions WHERE trainee_id IS NOT NULL;

-- Remove trainee_id column from sessions table
ALTER TABLE sessions DROP COLUMN trainee_id;
