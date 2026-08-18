// backend/src/modules/notifications/notifications.service.js
const pool = require('../../config/db');

// Exported for other modules (adminVerification, dealroom, etc.) to call
// directly when something notification-worthy happens -- this isn't only
// reached via the routes below.
async function createNotification(userId, message, notifType) {
  const { rows } = await pool.query(
    `INSERT INTO notifications (user_id, message, notif_type)
     VALUES ($1, $2, $3) RETURNING *`,
    [userId, message, notifType]
  );
  return rows[0];
}

async function listForUser(userId, { page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(
    `SELECT * FROM notifications
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  return rows;
}

async function unreadCount(userId) {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = $1 AND is_read = FALSE`,
    [userId]
  );
  return rows[0].count;
}

async function markRead(notificationId, userId) {
  const { rows } = await pool.query(
    `UPDATE notifications SET is_read = TRUE
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [notificationId, userId]
  );
  return rows[0] || null;
}

async function markAllRead(userId) {
  await pool.query(
    `UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE`,
    [userId]
  );
}

module.exports = { createNotification, listForUser, unreadCount, markRead, markAllRead };