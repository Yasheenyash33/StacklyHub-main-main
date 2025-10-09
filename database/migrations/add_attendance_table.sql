-- Migration: Add attendance table for tracking session attendance
-- Date: 2024-12-19

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    trainee_id INT NOT NULL,
    present BOOLEAN NOT NULL DEFAULT FALSE,
    marked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (trainee_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_session_trainee_attendance (session_id, trainee_id),
    INDEX idx_session_id (session_id),
    INDEX idx_trainee_id (trainee_id)
);
