
const pool = require('../../config/db');

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

async function getFounderProfileId(userId) {
  const { rows } = await pool.query(
    `SELECT id FROM profiles WHERE user_id = $1 AND role = 'FOUNDER'`,
    [userId]
  );
  return rows[0] ? rows[0].id : null;
}

async function createPitch(profileId, data) {
  const { title, summary, problem, solution, ask_amount, image_url, status } = data;
  const { rows } = await pool.query(
    `INSERT INTO pitches (profile_id, title, summary, problem, solution, ask_amount, image_url, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [profileId, title, summary, problem || null, solution || null, ask_amount || null, image_url || null, status || 'SUBMITTED']
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
  const { title, summary, problem, solution, ask_amount, image_url, status } = data;
  const { rows } = await pool.query(
    `UPDATE pitches
     SET title = $1, summary = $2, problem = $3, solution = $4,
         ask_amount = $5, image_url = $6,
         status = COALESCE($7, status),
         updated_at = now()
     WHERE id = $8
     RETURNING *`,
    [title, summary, problem || null, solution || null, ask_amount || null, image_url || null, status || null, id]
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
};