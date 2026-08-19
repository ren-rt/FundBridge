const pool = require('../../config/db');
const { createNotification } = require('../notifications/notifications.service');

async function getFounderProfileId(userId) {
  const { rows } = await pool.query(
    `SELECT id FROM profiles WHERE user_id = $1 AND role = 'FOUNDER'`,
    [userId]
  );
  return rows[0] ? rows[0].id : null;
}

// True only if courses exist AND every one is completed by this user.
// If there are no courses at all, don't block submission on an empty
// curriculum -- that would make submission permanently impossible.
async function hasCompletedAllModules(userId) {
  const { rows } = await pool.query(
    `SELECT
       (SELECT COUNT(*) FROM courses)::int AS total,
       (SELECT COUNT(*) FROM user_progress WHERE user_id = $1 AND completed_at IS NOT NULL)::int AS completed`,
    [userId]
  );
  const { total, completed } = rows[0];
  return total > 0 && completed >= total;
}

async function assertCanSubmit(userId) {
  const eligible = await hasCompletedAllModules(userId);
  if (!eligible) {
    const err = new Error('Complete all Startup School modules before submitting a pitch');
    err.statusCode = 403;
    throw err;
  }
}

async function createPitch(profileId, data) {
  const { title, summary, problem, solution, ask_amount, image_url, deck_url, status } = data;
  const { rows } = await pool.query(
    `INSERT INTO pitches (profile_id, title, summary, problem, solution, ask_amount, image_url, deck_url, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [profileId, title, summary, problem || null, solution || null, ask_amount || null, image_url || null, deck_url || null, status || 'SUBMITTED']
  );
  return rows[0];
}

async function listAllPitches() {
  const { rows } = await pool.query(
    `SELECT * FROM pitches WHERE status = 'SUBMITTED' ORDER BY created_at DESC`
  );
  return rows;
}

async function listPitchesByProfile(profileId) {
  const { rows } = await pool.query(
    `SELECT * FROM pitches WHERE profile_id = $1 ORDER BY created_at DESC`,
    [profileId]
  );
  return rows;
}

async function getPitchById(id) {
  const { rows } = await pool.query(`SELECT * FROM pitches WHERE id = $1`, [id]);
  return rows[0] || null;
}

async function recordView(id) {
  const { rows } = await pool.query(
    `UPDATE pitches SET view_count = view_count + 1 WHERE id = $1 RETURNING view_count`,
    [id]
  );
  return rows[0] ? rows[0].view_count : null;
}

async function updatePitch(id, data) {
  const { title, summary, problem, solution, ask_amount, image_url, deck_url, status } = data;
  const { rows } = await pool.query(
    `UPDATE pitches
     SET title = $1, summary = $2, problem = $3, solution = $4,
         ask_amount = $5, image_url = $6, deck_url = $7,
         status = COALESCE($8, status),
         updated_at = now()
     WHERE id = $9
     RETURNING *`,
    [title, summary, problem || null, solution || null, ask_amount || null, image_url || null, deck_url || null, status || null, id]
  );
  return rows[0] || null;
}

async function archivePitch(id) {
  const { rows } = await pool.query(
    `UPDATE pitches SET status = 'ARCHIVED', updated_at = now() WHERE id = $1 RETURNING *`,
    [id]
  );
  return rows[0] || null;
}

async function deletePitch(id) {
  const { rows } = await pool.query(`DELETE FROM pitches WHERE id = $1 RETURNING id`, [id]);
  return rows[0] || null;
}


async function toggleInterest(pitchId, investorUserId) {
  const verifiedResult = await pool.query(
    `SELECT verification_status FROM profiles WHERE user_id = $1 AND role = 'INVESTOR'`,
    [investorUserId]
  );
  if (!verifiedResult.rows[0]) {
    const err = new Error('Only investors can express interest in a pitch');
    err.statusCode = 403;
    throw err;
  }
  if (verifiedResult.rows[0].verification_status !== 'VERIFIED') {
    const err = new Error('Your investor profile must be admin-verified before expressing interest');
    err.statusCode = 403;
    throw err;
  }

  const pitchResult = await pool.query(
    `SELECT pi.*, p.user_id AS founder_user_id, COALESCE(p.company, 'Untitled Pitch') AS company
     FROM pitches pi JOIN profiles p ON p.id = pi.profile_id WHERE pi.id = $1`,
    [pitchId]
  );
  const pitch = pitchResult.rows[0];
  if (!pitch) return null;

  const existing = await pool.query(
    `SELECT 1 FROM pitch_interests WHERE pitch_id = $1 AND investor_user_id = $2`,
    [pitchId, investorUserId]
  );

  if (existing.rows[0]) {
    await pool.query(`DELETE FROM pitch_interests WHERE pitch_id = $1 AND investor_user_id = $2`, [pitchId, investorUserId]);
    return { interested: false };
  }

  await pool.query(`INSERT INTO pitch_interests (pitch_id, investor_user_id) VALUES ($1, $2)`, [pitchId, investorUserId]);

  await createNotification(
    pitch.founder_user_id,
    `An investor expressed interest in "${pitch.title}".`,
    'SYSTEM'
  );

  return { interested: true };
}

async function listInterestedInvestors(pitchId) {
  const { rows } = await pool.query(
    `SELECT pi.investor_user_id, pi.created_at, COALESCE(p.firm_name, u.email) AS investor_label
     FROM pitch_interests pi
     JOIN users u ON u.id = pi.investor_user_id
     LEFT JOIN profiles p ON p.user_id = pi.investor_user_id AND p.role = 'INVESTOR'
     WHERE pi.pitch_id = $1
     ORDER BY pi.created_at DESC`,
    [pitchId]
  );
  return rows;
}

module.exports = {
  getFounderProfileId,
  hasCompletedAllModules,
  assertCanSubmit,
  createPitch,
  listAllPitches,
  listPitchesByProfile,
  getPitchById,
  recordView,
  updatePitch,
  archivePitch,
  deletePitch,
  toggleInterest,
  listInterestedInvestors,
};