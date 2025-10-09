import sys
import os

# Add the project root to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from database.database import engine, text

migration_sql_attendance = """
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
"""

def run_migration(sql: str):
    try:
        with engine.connect() as conn:
            conn.execute(text(sql))
            conn.commit()
        print("Migration applied successfully.")
    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    print("Running migration to add attendance table...")
    run_migration(migration_sql_attendance)
