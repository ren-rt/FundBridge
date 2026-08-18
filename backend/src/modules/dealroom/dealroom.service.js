const crypto = require('crypto');
const pool = require('../../config/db');
const { deriveRoomKey, encryptBuffer, decryptBuffer } = require('./dealroom.crypto');
const { saveEncryptedFile, readEncryptedFile } = require('./dealroom.storage');

async function logAudit(dealRoomId, actorUserId, action, metadata = null) {
  await pool.query(
    `INSERT INTO deal_room_audit_log (deal_room_id, actor_user_id, action, metadata)
     VALUES ($1, $2, $3, $4)`,
    [dealRoomId, actorUserId, action, metadata ? JSON.stringify(metadata) : null]
  );
}

async function getDealRoomById(dealRoomId) {
  const { rows } = await pool.query('SELECT * FROM deal_rooms WHERE id = $1', [dealRoomId]);
  return rows[0] || null;
}

// Finds the deal room for a founder/investor profile pair, creating it if it
// doesn't exist yet. This is the entry point -- rooms aren't created ahead of
// time, they come into existence the first time either side wants one.
// Only logs DEAL_ROOM_CREATED on an actual creation, not on a repeat lookup
// of an existing room.
async function ensureDealRoom(founderProfileId, investorProfileId, actorUserId) {
  const existing = await pool.query(
    'SELECT * FROM deal_rooms WHERE founder_profile_id = $1 AND investor_profile_id = $2',
    [founderProfileId, investorProfileId]
  );
  if (existing.rows[0]) return existing.rows[0];

  const { rows } = await pool.query(
    `INSERT INTO deal_rooms (founder_profile_id, investor_profile_id)
     VALUES ($1, $2) RETURNING *`,
    [founderProfileId, investorProfileId]
  );

  if (actorUserId) {
    await logAudit(rows[0].id, actorUserId, 'DEAL_ROOM_CREATED', null);
  }

  return rows[0];
}

// Is this user (internal users.id) the founder or investor on this room?
// Admins are handled separately at the controller layer via requireAdmin,
// not through this check.
async function isParticipant(dealRoomId, userId) {
  const { rows } = await pool.query(
    `SELECT 1 FROM deal_rooms dr
     JOIN profiles p ON (p.id = dr.founder_profile_id OR p.id = dr.investor_profile_id)
     WHERE dr.id = $1 AND p.user_id = $2`,
    [dealRoomId, userId]
  );
  return rows.length > 0;
}

async function uploadDocument({ dealRoomId, uploadedByUserId, documentType, fileName, mimeType, buffer }) {
  const roomKey = deriveRoomKey(dealRoomId);
  const { ciphertext, iv, authTag } = encryptBuffer(buffer, roomKey);

  // Generated here, not left to the DB default, so the file on disk and the
  // DB row share the same id from the start.
  const documentId = crypto.randomUUID();
  await saveEncryptedFile(dealRoomId, documentId, ciphertext);

  const { rows } = await pool.query(
    `INSERT INTO deal_room_documents
       (id, deal_room_id, uploaded_by_user_id, document_type, file_name, storage_path,
        mime_type, size_bytes, encryption_iv, encryption_auth_tag)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING id, deal_room_id, uploaded_by_user_id, document_type, file_name,
               mime_type, size_bytes, created_at`,
    [
      documentId,
      dealRoomId,
      uploadedByUserId,
      documentType,
      fileName,
      `${dealRoomId}/${documentId}.enc`,
      mimeType,
      buffer.length,
      iv.toString('base64'),
      authTag.toString('base64'),
    ]
  );

  await logAudit(dealRoomId, uploadedByUserId, 'DOCUMENT_UPLOADED', { documentId, fileName, documentType });

  if (documentType === 'SIGNED_AGREEMENT') {
    await initSignaturesForDocument(documentId, dealRoomId);
  }

  return rows[0];
}

async function listDocuments(dealRoomId) {
  const { rows } = await pool.query(
    `SELECT id, document_type, file_name, mime_type, size_bytes, created_at, uploaded_by_user_id
     FROM deal_room_documents WHERE deal_room_id = $1 ORDER BY created_at DESC`,
    [dealRoomId]
  );
  return rows;
}

// Access is checked here, not just at the route layer, so this function is safe
// to call directly (e.g. from tests, or a future internal job) without relying
// on the controller to have already gated it.
async function downloadDocument(documentId, requestingUserId) {
  const { rows } = await pool.query('SELECT * FROM deal_room_documents WHERE id = $1', [documentId]);
  const doc = rows[0];
  if (!doc) return null;

  const allowed = await isParticipant(doc.deal_room_id, requestingUserId);
  if (!allowed) {
    const err = new Error('Not a participant in this deal room');
    err.statusCode = 403;
    throw err;
  }

  const roomKey = deriveRoomKey(doc.deal_room_id);
  const ciphertext = await readEncryptedFile(doc.deal_room_id, doc.id);
  const iv = Buffer.from(doc.encryption_iv, 'base64');
  const authTag = Buffer.from(doc.encryption_auth_tag, 'base64');
  const plaintext = decryptBuffer(ciphertext, roomKey, iv, authTag);

  await logAudit(doc.deal_room_id, requestingUserId, 'DOCUMENT_DOWNLOADED', {
    documentId: doc.id,
    fileName: doc.file_name,
  });

  return { buffer: plaintext, fileName: doc.file_name, mimeType: doc.mime_type, dealRoomId: doc.deal_room_id };
}

// Full room detail with both parties' identifying info attached, for the
// room header and the wireframe's "Parties" panel. No personal name field
// exists anywhere in the schema (users only has email; profiles only has
// company/firm_name) -- label falls back to email when no company/firm
// name is set, rather than showing blank.
async function getDealRoomWithParties(dealRoomId) {
  const { rows } = await pool.query(
    `SELECT
       dr.*,
       fp.company AS founder_company,
       fu.email AS founder_email,
       fu.id AS founder_user_id,
       ip.firm_name AS investor_firm_name,
       iu.email AS investor_email,
       iu.id AS investor_user_id
     FROM deal_rooms dr
     JOIN profiles fp ON fp.id = dr.founder_profile_id
     JOIN users fu ON fu.id = fp.user_id
     JOIN profiles ip ON ip.id = dr.investor_profile_id
     JOIN users iu ON iu.id = ip.user_id
     WHERE dr.id = $1`,
    [dealRoomId]
  );
  const row = rows[0];
  if (!row) return null;

  return {
    id: row.id,
    status: row.status,
    created_at: row.created_at,
    title: row.founder_company || 'Untitled Pitch',
    founder: { userId: row.founder_user_id, name: row.founder_company || row.founder_email },
    investor: { userId: row.investor_user_id, name: row.investor_firm_name || row.investor_email },
  };
}

// All rooms the given user (internal users.id) belongs to, as either
// founder or investor, with the *other* party's label attached so the
// list page doesn't need a second request per room.
async function listRoomsForUser(userId) {
  const { rows } = await pool.query(
    `SELECT
       dr.id, dr.status, dr.created_at,
       fp.company AS founder_company,
       fu.email AS founder_email,
       ip.firm_name AS investor_firm_name,
       iu.email AS investor_email,
       fp.user_id AS founder_user_id,
       ip.user_id AS investor_user_id
     FROM deal_rooms dr
     JOIN profiles fp ON fp.id = dr.founder_profile_id
     JOIN users fu ON fu.id = fp.user_id
     JOIN profiles ip ON ip.id = dr.investor_profile_id
     JOIN users iu ON iu.id = ip.user_id
     WHERE fp.user_id = $1 OR ip.user_id = $1
     ORDER BY dr.created_at DESC`,
    [userId]
  );

  return rows.map((row) => {
    const isFounder = row.founder_user_id === userId;
    return {
      id: row.id,
      status: row.status,
      created_at: row.created_at,
      title: row.founder_company || 'Untitled Pitch',
      counterparty: isFounder
        ? { role: 'INVESTOR', name: row.investor_firm_name || row.investor_email }
        : { role: 'FOUNDER', name: row.founder_company || row.founder_email },
    };
  });
}
async function getAuditLog(dealRoomId) {
  const { rows } = await pool.query(
    `SELECT
       al.id, al.action, al.metadata, al.created_at,
       al.actor_user_id, u.role AS actor_role,
       COALESCE(fp.company, ip.firm_name, u.email) AS actor_label
     FROM deal_room_audit_log al
     JOIN users u ON u.id = al.actor_user_id
     JOIN deal_rooms dr ON dr.id = al.deal_room_id
     LEFT JOIN profiles fp ON fp.id = dr.founder_profile_id AND fp.user_id = al.actor_user_id
     LEFT JOIN profiles ip ON ip.id = dr.investor_profile_id AND ip.user_id = al.actor_user_id
     WHERE al.deal_room_id = $1
     ORDER BY al.created_at DESC`,
    [dealRoomId]
  );
  return rows;
}

// Creates a PENDING signature row for each party on the room -- called once,
// right after a SIGNED_AGREEMENT document is uploaded, so every agreement
// always has exactly one row per participant from the start. Signing later
// updates these rows rather than creating them on demand, so "has this
// agreement even been assigned to me" is never ambiguous.
async function initSignaturesForDocument(documentId, dealRoomId) {
  const { rows } = await pool.query(
    `SELECT fp.user_id AS founder_user_id, ip.user_id AS investor_user_id
     FROM deal_rooms dr
     JOIN profiles fp ON fp.id = dr.founder_profile_id
     JOIN profiles ip ON ip.id = dr.investor_profile_id
     WHERE dr.id = $1`,
    [dealRoomId]
  );
  const { founder_user_id, investor_user_id } = rows[0];

  await pool.query(
    `INSERT INTO deal_room_signatures (document_id, deal_room_id, signer_user_id, status)
     VALUES ($1, $2, $3, 'PENDING'), ($1, $2, $4, 'PENDING')`,
    [documentId, dealRoomId, founder_user_id, investor_user_id]
  );
}

// Agreements list, scoped to the requesting user's own signature status --
// matches the wireframe, where each person only sees/acts on their own
// "Sign" button, not the counterparty's status.
async function listAgreements(dealRoomId, requestingUserId) {
  const { rows } = await pool.query(
    `SELECT
       d.id AS document_id, d.file_name, d.created_at,
       s.status AS my_status, s.signed_at
     FROM deal_room_documents d
     LEFT JOIN deal_room_signatures s
       ON s.document_id = d.id AND s.signer_user_id = $2
     WHERE d.deal_room_id = $1 AND d.document_type = 'SIGNED_AGREEMENT'
     ORDER BY d.created_at DESC`,
    [dealRoomId, requestingUserId]
  );
  return rows;
}

// Access-checked here, not just at the route layer, same as downloadDocument --
// safe to call directly without relying on the controller having gated it.
async function signAgreement(documentId, signerUserId) {
  const { rows: docRows } = await pool.query(
    'SELECT deal_room_id, file_name FROM deal_room_documents WHERE id = $1',
    [documentId]
  );
  const doc = docRows[0];
  if (!doc) return null;

  const allowed = await isParticipant(doc.deal_room_id, signerUserId);
  if (!allowed) {
    const err = new Error('Not a participant in this deal room');
    err.statusCode = 403;
    throw err;
  }

  const { rows } = await pool.query(
    `UPDATE deal_room_signatures
     SET status = 'SIGNED', signed_at = now()
     WHERE document_id = $1 AND signer_user_id = $2
     RETURNING *`,
    [documentId, signerUserId]
  );
  if (!rows[0]) {
    const err = new Error('No signature request found for this user on this document');
    err.statusCode = 404;
    throw err;
  }

  await logAudit(doc.deal_room_id, signerUserId, 'AGREEMENT_SIGNED', {
    documentId,
    fileName: doc.file_name,
  });

  return { ...rows[0], dealRoomId: doc.deal_room_id, fileName: doc.file_name };
}

// Encrypted the same way as documents -- same per-room derived key,
// same AES-256-GCM. Content is returned as plaintext directly in the
// response since we already have it in memory; no round-trip decrypt
// needed for the sender's own just-sent message.
async function sendMessage({ dealRoomId, senderUserId, content }) {
  const roomKey = deriveRoomKey(dealRoomId);
  const { ciphertext, iv, authTag } = encryptBuffer(Buffer.from(content, 'utf8'), roomKey);

  const { rows } = await pool.query(
    `INSERT INTO deal_room_messages
       (deal_room_id, sender_user_id, ciphertext, encryption_iv, encryption_auth_tag)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, deal_room_id, sender_user_id, created_at`,
    [dealRoomId, senderUserId, ciphertext.toString('base64'), iv.toString('base64'), authTag.toString('base64')]
  );

  return { ...rows[0], content };
}

async function getMessages(dealRoomId, { limit = 50 } = {}) {
  const { rows } = await pool.query(
    `SELECT id, deal_room_id, sender_user_id, ciphertext, encryption_iv, encryption_auth_tag, created_at
     FROM deal_room_messages
     WHERE deal_room_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [dealRoomId, limit]
  );

  const roomKey = deriveRoomKey(dealRoomId);
  // Reverse back to chronological order for display -- fetched DESC so
  // LIMIT grabs the most recent N, not the oldest N.
  return rows.reverse().map((row) => {
    const plaintext = decryptBuffer(
      Buffer.from(row.ciphertext, 'base64'),
      roomKey,
      Buffer.from(row.encryption_iv, 'base64'),
      Buffer.from(row.encryption_auth_tag, 'base64')
    ).toString('utf8');

    return {
      id: row.id,
      deal_room_id: row.deal_room_id,
      sender_user_id: row.sender_user_id,
      content: plaintext,
      created_at: row.created_at,
    };
  });
}

module.exports = {
  ensureDealRoom,
  getDealRoomById,
  getDealRoomWithParties,
  listRoomsForUser,
  isParticipant,
  uploadDocument,
  listDocuments,
  downloadDocument,
  getAuditLog,
  sendMessage,
  getMessages,
  listAgreements,
  signAgreement,
};