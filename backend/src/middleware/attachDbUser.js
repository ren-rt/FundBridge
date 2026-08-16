// backend/src/middleware/attachDbUser.js
//
// Must run AFTER verifyFirebaseToken. Unlike requireAdmin, this does NOT
// restrict by role -- it just looks up the internal users.id and role
// for whoever is making the request, so routes can record "who did this"
// regardless of FOUNDER/INVESTOR/ADMIN.
const pool = require('../config/db');

async function attachDbUser(req, res, next) {
  try {
    if (!req.user || !req.user.uid) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { rows } = await pool.query(
      'SELECT id, role FROM users WHERE firebase_uid = $1',
      [req.user.uid]
    );

    if (!rows[0]) {
      return res.status(403).json({ error: 'No matching user record' });
    }

    req.user.dbId = rows[0].id;
    req.user.role = rows[0].role;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = attachDbUser;