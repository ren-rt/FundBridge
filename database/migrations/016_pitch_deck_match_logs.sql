
ALTER TABLE pitches ADD COLUMN IF NOT EXISTS deck_url TEXT;

CREATE TABLE IF NOT EXISTS match_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  investor_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  match_score NUMERIC NOT NULL,
  nlp_sim NUMERIC,
  explanation_tags JSONB,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_match_logs_founder ON match_logs (founder_profile_id, computed_at DESC);
CREATE INDEX IF NOT EXISTS idx_match_logs_investor ON match_logs (investor_profile_id, computed_at DESC);