// backend/src/modules/posts/posts.service.js
const pool = require('../../config/db');

async function createPost(userId, content) {
  const { rows } = await pool.query(
    `INSERT INTO posts (user_id, content) VALUES ($1, $2) RETURNING *`,
    [userId, content]
  );
  return rows[0];
}

// viewerUserId is used only to compute reacted_by_me for *this* viewer --
// same author-label fallback pattern as dealroom.service.js
// (company -> firm_name -> email).
async function listPosts(viewerUserId, { limit = 20, offset = 0 } = {}) {
  const { rows } = await pool.query(
    `SELECT
       p.id, p.content, p.created_at, p.user_id,
       u.role AS author_role,
       COALESCE(fp.company, ip.firm_name, u.email) AS author_label,
       (SELECT COUNT(*) FROM post_comments c WHERE c.post_id = p.id)::int AS comment_count,
       (SELECT COUNT(*) FROM post_reactions r WHERE r.post_id = p.id)::int AS reaction_count,
       EXISTS (SELECT 1 FROM post_reactions r WHERE r.post_id = p.id AND r.user_id = $3) AS reacted_by_me
     FROM posts p
     JOIN users u ON u.id = p.user_id
     LEFT JOIN profiles fp ON fp.user_id = p.user_id AND fp.role = 'FOUNDER'
     LEFT JOIN profiles ip ON ip.user_id = p.user_id AND ip.role = 'INVESTOR'
     ORDER BY p.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset, viewerUserId]
  );
  return rows;
}

async function postExists(postId) {
  const { rows } = await pool.query(`SELECT 1 FROM posts WHERE id = $1`, [postId]);
  return rows.length > 0;
}

// Returns null on a missing post instead of letting the insert hit the
// post_comments -> posts foreign key and throw a raw 500 -- same
// exists-check-first pattern as dealroom.service.js / founders.service.js.
async function addComment(postId, userId, content) {
  if (!(await postExists(postId))) return null;
  const { rows } = await pool.query(
    `INSERT INTO post_comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING *`,
    [postId, userId, content]
  );
  return rows[0];
}

async function listComments(postId) {
  const { rows } = await pool.query(
    `SELECT
       c.id, c.content, c.created_at, c.user_id,
       COALESCE(fp.company, ip.firm_name, u.email) AS author_label
     FROM post_comments c
     JOIN users u ON u.id = c.user_id
     LEFT JOIN profiles fp ON fp.user_id = c.user_id AND fp.role = 'FOUNDER'
     LEFT JOIN profiles ip ON ip.user_id = c.user_id AND ip.role = 'INVESTOR'
     WHERE c.post_id = $1
     ORDER BY c.created_at ASC`,
    [postId]
  );
  return rows;
}


async function toggleReaction(postId, userId) {
  if (!(await postExists(postId))) return null;

  const existing = await pool.query(
    `SELECT 1 FROM post_reactions WHERE post_id = $1 AND user_id = $2`,
    [postId, userId]
  );
  if (existing.rows[0]) {
    await pool.query(`DELETE FROM post_reactions WHERE post_id = $1 AND user_id = $2`, [postId, userId]);
    return { reacted: false };
  }
  await pool.query(`INSERT INTO post_reactions (post_id, user_id) VALUES ($1, $2)`, [postId, userId]);
  return { reacted: true };
}

module.exports = { createPost, listPosts, addComment, listComments, toggleReaction };