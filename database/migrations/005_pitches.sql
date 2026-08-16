-- database/migrations/005_pitches.sql
-- Add '005_pitches.sql' to MIGRATION_ORDER in backend/scripts/migrate.js
-- Coordinate the number with the team first in case someone else added 005.

CREATE TABLE IF NOT EXISTS pitches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  problem TEXT,
  solution TEXT,
  ask_amount NUMERIC,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pitches_profile_id ON pitches (profile_id);