
const pool = require('../../config/db');

async function getAnalytics() {
  const [
    usersByRole,
    pitchesByStatus,
    dealRoomCount,
    verificationsByStatus,
    liveSessionCount,
    postCount,
  ] = await Promise.all([
    pool.query(`SELECT role, COUNT(*)::int AS count FROM users GROUP BY role`),
    pool.query(`SELECT status, COUNT(*)::int AS count FROM pitches GROUP BY status`),
    pool.query(`SELECT COUNT(*)::int AS count FROM deal_rooms`),
    pool.query(`SELECT verification_status, COUNT(*)::int AS count FROM profiles WHERE role = 'INVESTOR' GROUP BY verification_status`),
    pool.query(`SELECT COUNT(*)::int AS count FROM live_sessions`),
    pool.query(`SELECT COUNT(*)::int AS count FROM posts`),
  ]);

  return {
    users_by_role: usersByRole.rows,
    pitches_by_status: pitchesByStatus.rows,
    deal_room_count: dealRoomCount.rows[0].count,
    investor_verifications_by_status: verificationsByStatus.rows,
    live_session_count: liveSessionCount.rows[0].count,
    post_count: postCount.rows[0].count,
  };
}

// 
async function getFullAuditLog(limit = 100) {
  const { rows } = await pool.query(
    `SELECT
       'DEAL_ROOM' AS source, al.action, al.created_at, al.actor_user_id,
       u.email AS actor_email, al.deal_room_id::text AS context_id
     FROM deal_room_audit_log al
     JOIN users u ON u.id = al.actor_user_id
     UNION ALL
     SELECT
       'PLATFORM' AS source, pal.action, pal.created_at, pal.actor_user_id,
       u.email AS actor_email, pal.target_id::text AS context_id
     FROM platform_audit_log pal
     JOIN users u ON u.id = pal.actor_user_id
     ORDER BY created_at DESC
     LIMIT $1`,
    [limit]
  );
  return rows;
}

module.exports = { getAnalytics, getFullAuditLog };