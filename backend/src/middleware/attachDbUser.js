
const pool = require('../config/db');

async function attachDbUser(req, res, next) {
  try {
    if (!req.user || !req.user.firebase_uid) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { rows } = await pool.query(
      'SELECT id, role, status FROM users WHERE firebase_uid = $1',
      [req.user.firebase_uid]
    );

    if (!rows[0]) {
      return res.status(403).json({ error: 'No matching user record' });
    }

    if (rows[0].status === 'SUSPENDED') {
      return res.status(403).json({ error: 'This account has been suspended' });
    }

    req.user.dbId = rows[0].id;
    req.user.role = rows[0].role;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = attachDbUser;