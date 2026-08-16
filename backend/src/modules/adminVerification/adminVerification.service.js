// backend/src/modules/adminVerification/adminVerification.service.js
const pool = require('../../config/db');

async function listPendingVerifications() {
  const { rows } = await pool.query(
    `SELECT id, user_id, role, verification_status, verification_notes, created_at
     FROM profiles
     WHERE verification_status = 'PENDING'
     ORDER BY created_at ASC`
  );
  return rows;
}

async function getProfileById(profileId) {
  const { rows } = await pool.query(
    `SELECT * FROM profiles WHERE id = $1`,
    [profileId]
  );
  return rows[0] || null;
}

async function approveProfile(profileId, adminUserId) {
  const { rows } = await pool.query(
    `UPDATE profiles
     SET verification_status = 'VERIFIED',
         verified_by = $2,
         verified_at = NOW(),
         verification_notes = NULL
     WHERE id = $1
     RETURNING *`,
    [profileId, adminUserId]
  );
  return rows[0] || null;
}

async function rejectProfile(profileId, adminUserId, reason) {
  const { rows } = await pool.query(
    `UPDATE profiles
     SET verification_status = 'REJECTED',
         verified_by = $2,
         verified_at = NOW(),
         verification_notes = $3
     WHERE id = $1
     RETURNING *`,
    [profileId, adminUserId, reason]
  );
  return rows[0] || null;
}

module.exports = {
  listPendingVerifications,
  getProfileById,
  approveProfile,
  rejectProfile,
};