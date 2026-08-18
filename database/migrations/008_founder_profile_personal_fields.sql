
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS skills TEXT,
  ADD COLUMN IF NOT EXISTS experience TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS photo_url TEXT;

DELETE FROM profiles p
WHERE p.id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY user_id, role ORDER BY created_at ASC, id ASC) AS rn
    FROM profiles
  ) ranked
  WHERE ranked.rn > 1
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_user_id_role_unique'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_user_id_role_unique UNIQUE (user_id, role);
  END IF;
END $$;