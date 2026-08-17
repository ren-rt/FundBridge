-- Deal Room: one room per founder/investor pair
CREATE TABLE IF NOT EXISTS deal_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  investor_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CLOSED', 'ARCHIVED')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (founder_profile_id, investor_profile_id)
);

-- Documents: uploads, downloadable templates, and signed agreements
-- Encryption key itself is NOT stored here (handled in app/KMS layer, next branch) —
-- this table only stores what's needed to decrypt given the key: iv + auth tag.
CREATE TABLE IF NOT EXISTS deal_room_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_room_id UUID NOT NULL REFERENCES deal_rooms(id) ON DELETE CASCADE,
  uploaded_by_user_id UUID NOT NULL REFERENCES users(id),
  document_type TEXT NOT NULL CHECK (document_type IN ('UPLOAD', 'TEMPLATE', 'SIGNED_AGREEMENT')),
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  encryption_iv TEXT,
  encryption_auth_tag TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Signatures: one row per required signature on a document
CREATE TABLE IF NOT EXISTS deal_room_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES deal_room_documents(id) ON DELETE CASCADE,
  deal_room_id UUID NOT NULL REFERENCES deal_rooms(id) ON DELETE CASCADE,
  signer_user_id UUID NOT NULL REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SIGNED', 'DECLINED')),
  signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Audit log: append-only, one row per action taken in the room
CREATE TABLE IF NOT EXISTS deal_room_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_room_id UUID NOT NULL REFERENCES deal_rooms(id) ON DELETE CASCADE,
  actor_user_id UUID NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);