const jwt = require('jsonwebtoken');
const auth = require('../../config/firebase');
const pool = require('../../config/db');

exports.loginWithFirebase = async (idToken, role) => {
  const decoded = await auth.verifyIdToken(idToken);
  const { uid, email } = decoded;

  let result = await pool.query('SELECT * FROM users WHERE firebase_uid = $1', [uid]);
  let user = result.rows[0];

  if (!user) {
    if (!role || !['FOUNDER', 'INVESTOR'].includes(role)) {
      throw new Error('New user — role (FOUNDER or INVESTOR) is required on first login');
    }
    const insertResult = await pool.query(
      `INSERT INTO users (firebase_uid, email, role) VALUES ($1, $2, $3) RETURNING *`,
      [uid, email, role]
    );
    user = insertResult.rows[0];
  }

  const token = jwt.sign(
    { user_id: user.id, firebase_uid: user.firebase_uid, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );

  return { token, user };
};