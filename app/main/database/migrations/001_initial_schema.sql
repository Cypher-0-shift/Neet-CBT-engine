-- Phase 3 Approved Schema

-- 1. Test Domain
CREATE TABLE IF NOT EXISTS tests (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL,
    max_marks INTEGER NOT NULL,
    negative_marking_ratio REAL,
    total_questions INTEGER NOT NULL,
    subject_distribution_json TEXT,
    source TEXT,
    year INTEGER,
    import_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    package_hash TEXT UNIQUE,
    metadata_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Subject & Topic Domain
CREATE TABLE IF NOT EXISTS subjects (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS topics (
    id TEXT PRIMARY KEY,
    subject_id TEXT NOT NULL,
    name TEXT NOT NULL,
    chapter_name TEXT,
    FOREIGN KEY(subject_id) REFERENCES subjects(id)
);

CREATE TABLE IF NOT EXISTS subtopics (
    id TEXT PRIMARY KEY,
    topic_id TEXT NOT NULL,
    name TEXT NOT NULL,
    FOREIGN KEY(topic_id) REFERENCES topics(id)
);

-- 3. Question Domain
CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    subtopic_id TEXT NOT NULL,
    difficulty TEXT CHECK(difficulty IN ('Easy', 'Medium', 'Hard')),
    question_type TEXT,
    marks INTEGER NOT NULL,
    negative_marks INTEGER NOT NULL,
    expected_time_seconds INTEGER,
    question_text TEXT,
    question_image_path TEXT,
    additional_images_json TEXT,
    solution_text TEXT,
    solution_image_path TEXT,
    tags_json TEXT,
    source TEXT,
    year INTEGER,
    content_hash TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(subtopic_id) REFERENCES subtopics(id)
);

CREATE TABLE IF NOT EXISTS test_questions (
    test_id TEXT NOT NULL,
    question_id TEXT NOT NULL,
    question_number INTEGER NOT NULL,
    PRIMARY KEY(test_id, question_id),
    FOREIGN KEY(test_id) REFERENCES tests(id) ON DELETE CASCADE,
    FOREIGN KEY(question_id) REFERENCES questions(id)
);

CREATE TABLE IF NOT EXISTS options (
    id TEXT PRIMARY KEY,
    question_id TEXT NOT NULL,
    option_label TEXT NOT NULL,
    option_text TEXT,
    option_image_path TEXT,
    is_correct BOOLEAN NOT NULL CHECK (is_correct IN (0, 1)),
    display_order INTEGER NOT NULL,
    FOREIGN KEY(question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- 4. Session Domain
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    test_id TEXT NOT NULL,
    candidate_name TEXT,
    registration_number TEXT,
    mode TEXT CHECK(mode IN ('Practice', 'Exam')),
    language TEXT,
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    duration_seconds INTEGER,
    time_remaining_seconds INTEGER,
    status TEXT CHECK(status IN ('IN_PROGRESS', 'PAUSED', 'SUBMITTED', 'ABANDONED')),
    total_score INTEGER,
    total_correct INTEGER,
    total_incorrect INTEGER,
    total_skipped INTEGER,
    total_marked_review INTEGER,
    test_version_hash TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(test_id) REFERENCES tests(id)
);

-- 5. Answer Domain
CREATE TABLE IF NOT EXISTS answers (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    question_id TEXT NOT NULL,
    selected_option_id TEXT,
    is_correct BOOLEAN,
    marks_awarded INTEGER,
    time_spent_seconds INTEGER DEFAULT 0,
    visit_count INTEGER DEFAULT 0,
    is_marked_review BOOLEAN DEFAULT 0,
    first_answer_time DATETIME,
    last_answer_time DATETIME,
    answer_change_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(session_id, question_id),
    FOREIGN KEY(session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    FOREIGN KEY(question_id) REFERENCES questions(id),
    FOREIGN KEY(selected_option_id) REFERENCES options(id)
);

-- 6. Event Domain
CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    question_id TEXT,
    event_type TEXT NOT NULL,
    event_data_json TEXT,
    timestamp DATETIME NOT NULL,
    sequence_number INTEGER NOT NULL,
    FOREIGN KEY(session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    FOREIGN KEY(question_id) REFERENCES questions(id)
);

-- 7. Analytics Domain
CREATE TABLE IF NOT EXISTS session_analytics (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    category TEXT NOT NULL,
    metric_key TEXT NOT NULL,
    metric_value REAL,
    details_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_topic_stats (
    topic_id TEXT PRIMARY KEY,
    total_attempts INTEGER DEFAULT 0,
    total_correct INTEGER DEFAULT 0,
    total_time_seconds INTEGER DEFAULT 0,
    weakness_score REAL DEFAULT 0.0,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(topic_id) REFERENCES topics(id)
);

-- 8. Settings & History Domains
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value_json TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS import_history (
    id TEXT PRIMARY KEY,
    test_id TEXT,
    action TEXT CHECK(action IN ('IMPORT', 'DELETE', 'RESTORE')),
    status TEXT CHECK(status IN ('SUCCESS', 'FAILED')),
    details_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes

-- Session Lookups
CREATE INDEX IF NOT EXISTS idx_sessions_test_id ON sessions(test_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);

-- Question Retrieval
CREATE INDEX IF NOT EXISTS idx_test_questions_test_id ON test_questions(test_id);
CREATE INDEX IF NOT EXISTS idx_questions_subtopic ON questions(subtopic_id);
CREATE INDEX IF NOT EXISTS idx_options_question_id ON options(question_id);

-- Event Timeline & Analysis
CREATE INDEX IF NOT EXISTS idx_events_session_time ON events(session_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);

-- Answer Analytics
CREATE INDEX IF NOT EXISTS idx_answers_session ON answers(session_id);
CREATE INDEX IF NOT EXISTS idx_answers_question ON answers(question_id);

-- Topic Analytics
CREATE INDEX IF NOT EXISTS idx_topics_subject ON topics(subject_id);
CREATE INDEX IF NOT EXISTS idx_subtopics_topic ON subtopics(topic_id);
