
const pool = require('../../config/db');
const { createNotification } = require('../notifications/notifications.service');

async function listUpcoming() {
  const { rows } = await pool.query(
    `SELECT ls.*,
       (SELECT COUNT(*) FROM live_session_registrations r WHERE r.live_session_id = ls.id)::int AS registered_count
     FROM live_sessions ls
     WHERE ls.scheduled_at >= now()
     ORDER BY ls.scheduled_at ASC`
  );
  return rows;
}

async function getById(id) {
  const { rows } = await pool.query(`SELECT * FROM live_sessions WHERE id = $1`, [id]);
  return rows[0] || null;
}

async function create({ title, description, scheduled_at, jitsi_room_name }, createdByUserId) {
  const { rows } = await pool.query(
    `INSERT INTO live_sessions (title, description, scheduled_at, jitsi_room_name, created_by_user_id)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [title, description || null, scheduled_at, jitsi_room_name, createdByUserId]
  );
  return rows[0];
}

async function reschedule(id, scheduled_at) {
  const { rows } = await pool.query(
    `UPDATE live_sessions SET scheduled_at = $1 WHERE id = $2 RETURNING *`,
    [scheduled_at, id]
  );
  const session = rows[0] || null;

  
  if (session) {
    const { rows: registrants } = await pool.query(
      `SELECT user_id FROM live_session_registrations WHERE live_session_id = $1`,
      [id]
    );
    for (const r of registrants) {
      await createNotification(
        r.user_id,
        `"${session.title}" has been rescheduled.`,
        'SYSTEM'
      );
    }
  }

  return session;
}

async function register(liveSessionId, userId) {
  await pool.query(
    `INSERT INTO live_session_registrations (live_session_id, user_id)
     VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [liveSessionId, userId]
  );
}

async function unregister(liveSessionId, userId) {
  await pool.query(
    `DELETE FROM live_session_registrations WHERE live_session_id = $1 AND user_id = $2`,
    [liveSessionId, userId]
  );
}

async function isRegistered(liveSessionId, userId) {
  const { rows } = await pool.query(
    `SELECT 1 FROM live_session_registrations WHERE live_session_id = $1 AND user_id = $2`,
    [liveSessionId, userId]
  );
  return rows.length > 0;
}

module.exports = { listUpcoming, getById, create, reschedule, register, unregister, isRegistered };