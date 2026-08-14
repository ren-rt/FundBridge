CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('FOUNDER', 'INVESTOR')),

  -- Founder fields
  company TEXT,
  industry TEXT,
  stage TEXT CHECK (stage IN ('PRE_SEED', 'SEED', 'SERIES_A', 'SERIES_B')),
  country TEXT,
  region TEXT,
  funding_amount NUMERIC,
  description TEXT,

  -- Investor fields
  firm_name TEXT,
  primary_domain TEXT,
  secondary_domains JSONB,
  stage_pref JSONB,
  ticket_min NUMERIC,
  ticket_max NUMERIC,
  investment_thesis TEXT,
  location TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);