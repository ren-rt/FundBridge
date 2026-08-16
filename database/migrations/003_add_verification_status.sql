-- database/migrations/003_add_verification_status.sql
-- Add this filename as '003_add_verification_status.sql' to
-- MIGRATION_ORDER in backend/scripts/migrate.js -- coordinate with the
-- team in the daily sync first, in case someone else added 003 already.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED')),
  ADD COLUMN IF NOT EXISTS verification_notes TEXT,
  ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_profiles_verification_status
  ON profiles (verification_status);