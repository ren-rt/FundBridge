
const pool = require('../../config/db');

const SORT_COLUMNS = {
  newest: 'p.created_at DESC',
  ask_amount_high: 'p.ask_amount DESC NULLS LAST',
  ask_amount_low: 'p.ask_amount ASC NULLS LAST',
};

async function getFeed(limit, offset, { sort, industry, stage, viewerUserId } = {}) {
  const conditions = [`p.status = 'SUBMITTED'`];
  const params = [];

  if (industry) {
    params.push(industry);
    conditions.push(`pr.industry = $${params.length}`);
  }
  if (stage) {
    params.push(stage);
    conditions.push(`pr.stage = $${params.length}`);
  }

  const orderBy = SORT_COLUMNS[sort] || SORT_COLUMNS.newest;

  params.push(limit);
  const limitIdx = params.length;
  params.push(offset);
  const offsetIdx = params.length;

  let bookmarkSelect = 'FALSE AS bookmarked';
  if (viewerUserId) {
    params.push(viewerUserId);
    bookmarkSelect = `EXISTS (SELECT 1 FROM pitch_bookmarks b WHERE b.pitch_id = p.id AND b.user_id = $${params.length}) AS bookmarked`;
  }

  const { rows } = await pool.query(
    `SELECT
       p.id, p.title, p.summary, p.ask_amount, p.image_url, p.deck_url, p.created_at,
       COALESCE(pr.company, 'Untitled Pitch') AS company,
       pr.industry, pr.country, pr.stage,
       ${bookmarkSelect}
     FROM pitches p
     JOIN profiles pr ON pr.id = p.profile_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY ${orderBy}
     LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
    params
  );
  return rows;
}

async function toggleBookmark(userId, pitchId) {
  const existing = await pool.query(
    `SELECT 1 FROM pitch_bookmarks WHERE user_id = $1 AND pitch_id = $2`,
    [userId, pitchId]
  );
  if (existing.rows[0]) {
    await pool.query(`DELETE FROM pitch_bookmarks WHERE user_id = $1 AND pitch_id = $2`, [userId, pitchId]);
    return { bookmarked: false };
  }
  const pitchExists = await pool.query(`SELECT 1 FROM pitches WHERE id = $1`, [pitchId]);
  if (!pitchExists.rows[0]) return null;
  await pool.query(`INSERT INTO pitch_bookmarks (user_id, pitch_id) VALUES ($1, $2)`, [userId, pitchId]);
  return { bookmarked: true };
}

async function listBookmarked(userId) {
  const { rows } = await pool.query(
    `SELECT p.*, COALESCE(pr.company, 'Untitled Pitch') AS company
     FROM pitch_bookmarks b
     JOIN pitches p ON p.id = b.pitch_id
     JOIN profiles pr ON pr.id = p.profile_id
     WHERE b.user_id = $1
     ORDER BY b.created_at DESC`,
    [userId]
  );
  return rows;
}

module.exports = { getFeed, toggleBookmark, listBookmarked };