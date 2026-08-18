
const pool = require('../../config/db');

async function logAdminAction(actorUserId, action, targetType, targetId, metadata = null) {
  await pool.query(
    `INSERT INTO platform_audit_log (actor_user_id, action, target_type, target_id, metadata)
     VALUES ($1, $2, $3, $4, $5)`,
    [actorUserId, action, targetType, targetId, metadata ? JSON.stringify(metadata) : null]
  );
}

async function listUsers() {
  const { rows } = await pool.query(
    `SELECT id, email, role, status, full_name, created_at FROM users ORDER BY created_at DESC`
  );
  return rows;
}

async function setStatus(userId, status, adminUserId) {
  const { rows } = await pool.query(
    `UPDATE users SET status = $1 WHERE id = $2 RETURNING id, email, role, status`,
    [status, userId]
  );
  const user = rows[0] || null;
  if (user) {
    await logAdminAction(adminUserId, status === 'SUSPENDED' ? 'USER_SUSPENDED' : 'USER_REACTIVATED', 'user', userId);
  }
  return user;
}

async function changeRole(userId, role, adminUserId) {
  const { rows } = await pool.query(
    `UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, role, status`,
    [role, userId]
  );
  const user = rows[0] || null;
  if (user) {
    await logAdminAction(adminUserId, 'USER_ROLE_CHANGED', 'user', userId, { new_role: role });
  }
  return user;
}


async function deleteUser(userId, adminUserId) {
  const { rows } = await pool.query(`DELETE FROM users WHERE id = $1 RETURNING id`, [userId]);
  const deleted = rows[0] || null;
  if (deleted) {
    await logAdminAction(adminUserId, 'USER_DELETED', 'user', userId);
  }
  return deleted;
}

module.exports = { listUsers, setStatus, changeRole, deleteUser, logAdminAction };