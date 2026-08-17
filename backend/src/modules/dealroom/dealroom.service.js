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
async function ensureDealRoom(founderProfileId, investorProfileId) {
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

  return { buffer: plaintext, fileName: doc.file_name, mimeType: doc.mime_type };
}

async function getAuditLog(dealRoomId) {
  const { rows } = await pool.query(
    `SELECT id, actor_user_id, action, metadata, created_at
     FROM deal_room_audit_log WHERE deal_room_id = $1 ORDER BY created_at DESC`,
    [dealRoomId]
  );
  return rows;
}

module.exports = {
  ensureDealRoom,
  getDealRoomById,
  isParticipant,
  uploadDocument,
  listDocuments,
  downloadDocument,
  getAuditLog,
};