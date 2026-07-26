-- Phase 13: Learning Intelligence Platform

CREATE TABLE IF NOT EXISTS bookmarks (
    id TEXT PRIMARY KEY,
    question_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(question_id),
    FOREIGN KEY(question_id) REFERENCES questions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    question_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(question_id),
    FOREIGN KEY(question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Index for quick lookup of bookmarks and notes
CREATE INDEX IF NOT EXISTS idx_bookmarks_question_id ON bookmarks(question_id);
CREATE INDEX IF NOT EXISTS idx_notes_question_id ON notes(question_id);
