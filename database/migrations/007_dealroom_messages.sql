-- Deal Room messages: encrypted the same way as documents (per-room HKDF-derived
-- AES-256-GCM key, see dealroom.crypto.js). Content is never stored in plaintext.
CREATE TABLE IF NOT EXISTS deal_room_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_room_id UUID NOT NULL REFERENCES deal_rooms(id) ON DELETE CASCADE,
  sender_user_id UUID NOT NULL REFERENCES users(id),
  ciphertext TEXT NOT NULL,
  encryption_iv TEXT NOT NULL,
  encryption_auth_tag TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deal_room_messages_room_created
  ON deal_room_messages (deal_room_id, created_at);