

ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS video_url TEXT,
  ADD COLUMN IF NOT EXISTS text_content TEXT;

CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  question_type TEXT NOT NULL CHECK (question_type IN ('MID_VIDEO', 'FINAL')),
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_option_index INT NOT NULL,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  question_type TEXT NOT NULL CHECK (question_type IN ('MID_VIDEO', 'FINAL')),
  score INT NOT NULL,
  total INT NOT NULL,
  passed BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_course ON quiz_questions (course_id, question_type, order_index);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_course ON quiz_attempts (user_id, course_id, question_type, created_at DESC);