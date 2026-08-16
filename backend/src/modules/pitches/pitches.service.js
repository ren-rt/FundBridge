// backend/src/modules/pitches/pitches.service.js
const pool = require('../../config/db');

async function getFounderProfileId(userId) {
  const { rows } = await pool.query(
    `SELECT id FROM profiles WHERE user_id = $1 AND role = 'FOUNDER'`,
    [userId]
  );
  return rows[0] ? rows[0].id : null;
}

async function createPitch(profileId, data) {
  const { title, summary, problem, solution, ask_amount, image_url } = data;
  const { rows } = await pool.query(
    `INSERT INTO pitches (profile_id, title, summary, problem, solution, ask_amount, image_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [profileId, title, summary, problem || null, solution || null, ask_amount || null, image_url || null]
  );
  return rows[0];
}

async function listAllPitches() {
  const { rows } = await pool.query(`SELECT * FROM pitches ORDER BY created_at DESC`);
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

async function updatePitch(id, data) {
  const { title, summary, problem, solution, ask_amount, image_url } = data;
  const { rows } = await pool.query(
    `UPDATE pitches
     SET title = $1, summary = $2, problem = $3, solution = $4,
         ask_amount = $5, image_url = $6, updated_at = now()
     WHERE id = $7
     RETURNING *`,
    [title, summary, problem || null, solution || null, ask_amount || null, image_url || null, id]
  );
  return rows[0] || null;
}

async function deletePitch(id) {
  const { rows } = await pool.query(`DELETE FROM pitches WHERE id = $1 RETURNING id`, [id]);
  return rows[0] || null;
}

module.exports = {
  getFounderProfileId,
  createPitch,
  listAllPitches,
  listPitchesByProfile,
  getPitchById,
  updatePitch,
  deletePitch,
};