// backend/src/modules/feed/feed.service.js
const pool = require('../../config/db');

async function getFeed(limit, offset) {
  const { rows } = await pool.query(
    `SELECT
       p.id,
       p.title,
       p.summary,
       p.ask_amount,
       p.image_url,
       p.created_at,
       pr.company,
       pr.industry,
       pr.country
     FROM pitches p
     JOIN profiles pr ON pr.id = p.profile_id
     ORDER BY p.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return rows;
}

module.exports = { getFeed };