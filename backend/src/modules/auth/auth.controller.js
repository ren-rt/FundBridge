const authService = require('./auth.service');

exports.login = async (req, res) => {
  const { idToken, role, fullName } = req.body;
  if (!idToken) return res.status(400).json({ error: 'idToken is required' });

  try {
    const { token, user } = await authService.loginWithFirebase(idToken, role, fullName);
    res.json({ token, user: { id: user.id, email: user.email, role: user.role, full_name: user.full_name } });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};