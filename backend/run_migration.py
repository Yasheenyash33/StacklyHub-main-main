from backend.database import engine, text

# Run the migration to add is_temporary_password column
migration_sql_is_temp_password = """
ALTER TABLE users
ADD COLUMN is_temporary_password BOOLEAN NOT NULL DEFAULT TRUE;
"""

migration_sql_class_link = """
ALTER TABLE sessions ADD COLUMN class_link VARCHAR(500);
"""

migration_sql_session_trainees = """
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
    print("Running migration to add is_temporary_password column...")
    run_migration(migration_sql_is_temp_password)
    print("Running migration to add class_link column...")
    run_migration(migration_sql_class_link)
    print("Running migration to add session_trainees table...")
    run_migration(migration_sql_session_trainees)
