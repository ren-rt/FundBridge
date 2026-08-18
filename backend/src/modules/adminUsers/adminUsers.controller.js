const { validationResult } = require('express-validator');
const service = require('./adminUsers.service');

exports.list = async (req, res) => {
  try {
    res.json(await service.listUsers());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.suspend = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const user = await service.setStatus(req.params.id, 'SUSPENDED', req.user.dbId);
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.reactivate = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const user = await service.setStatus(req.params.id, 'ACTIVE', req.user.dbId);
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.changeRole = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const user = await service.changeRole(req.params.id, req.body.role, req.user.dbId);
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const user = await service.deleteUser(req.params.id, req.user.dbId);
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.status(204).send();
  } catch (err) {
    // Foreign key violation -- this user has activity elsewhere
    // (deal rooms, live sessions, etc.) that isn't safe to cascade-delete.
    if (err.code === '23503') {
      return res.status(409).json({ error: 'Cannot delete a user with existing platform activity. Suspend the account instead.' });
    }
    res.status(500).json({ error: err.message });
  }
};