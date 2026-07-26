-- Up
ALTER TABLE questions ADD COLUMN correct_option_id TEXT;
ALTER TABLE questions ADD COLUMN explanation TEXT;
ALTER TABLE questions ADD COLUMN concept_tested TEXT;
ALTER TABLE questions ADD COLUMN common_mistakes TEXT;

-- Migrate correct_option_id to questions (using old options table)
UPDATE questions
SET correct_option_id = (
  SELECT id FROM options WHERE question_id = questions.id AND is_correct = 1 LIMIT 1
);

-- Create solution_images table to handle array of images
CREATE TABLE solution_images (
  id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL,
  image_path TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);
