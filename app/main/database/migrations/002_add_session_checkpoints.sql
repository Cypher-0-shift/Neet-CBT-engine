-- Phase 9 Checkpoints

CREATE TABLE IF NOT EXISTS session_checkpoints (
    session_id TEXT PRIMARY KEY,
    current_question_index INTEGER NOT NULL,
    current_subject TEXT,
    time_remaining_seconds INTEGER NOT NULL,
    answers_json TEXT NOT NULL,
    marked_for_review_json TEXT NOT NULL,
    visited_questions_json TEXT NOT NULL,
    navigation_history_json TEXT NOT NULL,
    app_version TEXT,
    checkpoint_version INTEGER,
    timestamp DATETIME NOT NULL,
    FOREIGN KEY(session_id) REFERENCES sessions(id) ON DELETE CASCADE
);
