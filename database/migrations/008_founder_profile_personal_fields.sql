ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS skills TEXT,
  ADD COLUMN IF NOT EXISTS experience TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS photo_url TEXT;

  DELETE FROM profiles p
WHERE p.id NOT IN (
  SELECT MIN(id) FROM profiles GROUP BY user_id, role
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_user_id_role_unique'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_user_id_role_unique UNIQUE (user_id, role);
  END IF;
END $$;