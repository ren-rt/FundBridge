

CREATE TABLE IF NOT EXISTS pitch_bookmarks (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pitch_id UUID NOT NULL REFERENCES pitches(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, pitch_id)
);