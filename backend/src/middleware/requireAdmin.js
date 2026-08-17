// backend/src/middleware/requireAdmin.js
//
// Must run AFTER verifyJWT (auth.middleware.js) -- depends on
// req.user.uid being set from the decoded Firebase token.
//
// Firebase only proves who the caller is; it doesn't know their app
// role. This looks the role up from users by firebase_uid, and also
// attaches the internal users.id as req.user.dbId, since profiles.
// verified_by references users(id), not the Firebase uid.
const pool = require('../config/db');

async function requireAdmin(req, res, next) {
  try {
    if (!req.user || !req.user.firebase_uid) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { rows } = await pool.query(
      'SELECT id, role FROM users WHERE firebase_uid = $1',
      [req.user.firebase_uid]
    );

    if (!rows[0]) {
      return res.status(403).json({ error: 'No matching user record' });
    }

    if (rows[0].role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.user.dbId = rows[0].id;
    req.user.role = rows[0].role;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = requireAdmin;