# NEET CBT Engine Database Schema

The application uses a local SQLite database running in WAL (Write-Ahead Logging) mode to ensure high concurrency and resilience during large CBT package imports. The schema is carefully normalized.

## Tables

### 1. `tests`
Stores the metadata for a specific mock exam package.
- `id` (TEXT, PK): UUID.
- `package_hash` (TEXT, UNIQUE): SHA-256 hash of the ZIP file to prevent duplicate imports.
- `name` (TEXT): Title of the exam.
- `duration_minutes` (INTEGER).
- `max_marks` (INTEGER).
- `negative_marking_ratio` (REAL).
- `subject_distribution_json` (TEXT): JSON string defining sections (e.g. Physics, Chemistry, Biology).

### 2. `questions`
A global repository of all questions extracted from all imported packages. Deduplicated using `content_hash`.
- `id` (TEXT, PK): UUID.
- `subtopic_id` (TEXT, FK): Links to taxonomy.
- `difficulty` (TEXT): 'EASY', 'MEDIUM', 'HARD'.
- `question_type` (TEXT): e.g. 'MCQ'.
- `marks` (INTEGER).
- `negative_marks` (INTEGER).
- `question_text` (TEXT): HTML string.
- `question_image_path` (TEXT).
- `content_hash` (TEXT, UNIQUE): Hash of text + options to deduplicate identical questions.
- `correct_option_id` (TEXT).
- `explanation` (TEXT).

### 3. `options`
The available choices for a question.
- `id` (TEXT, PK).
- `question_id` (TEXT, FK).
- `option_label` (TEXT): 'A', 'B', 'C', 'D'.
- `option_text` (TEXT).
- `option_image_path` (TEXT).
- `display_order` (INTEGER).

### 4. `test_questions`
Mapping table linking `tests` to `questions`.
- `test_id` (TEXT, FK).
- `question_id` (TEXT, FK).
- `question_number` (INTEGER).

### 5. `exam_sessions`
Records an instance of a user taking a test.
- `id` (TEXT, PK).
- `test_id` (TEXT, FK).
- `start_time` (INTEGER).
- `end_time` (INTEGER).
- `status` (TEXT): 'IN_PROGRESS', 'COMPLETED'.
- `score` (REAL).
- `total_time_spent` (INTEGER).

### 6. `session_responses`
Tracks user interaction per question during a session.
- `session_id` (TEXT, FK).
- `question_id` (TEXT, FK).
- `selected_option_id` (TEXT).
- `time_spent_seconds` (INTEGER).
- `is_marked_for_review` (INTEGER, BOOLEAN).
- `is_correct` (INTEGER, BOOLEAN).

### 7. Taxonomy Tables
- `subjects` (id, name).
- `topics` (id, subject_id, name).
- `subtopics` (id, topic_id, name).
