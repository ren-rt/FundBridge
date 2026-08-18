const { validationResult } = require('express-validator');
const service = require('./liveSessions.service');

exports.list = async (req, res) => {
  try {
    res.json(await service.listUpcoming());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const session = await service.create(req.body, req.user.dbId);
    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.reschedule = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const session = await service.reschedule(req.params.id, req.body.scheduled_at);
    if (!session) return res.status(404).json({ error: 'Not found' });
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const session = await service.getById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Not found' });
    await service.register(req.params.id, req.user.dbId);
    res.status(201).json({ registered: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.unregister = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    await service.unregister(req.params.id, req.user.dbId);
    res.json({ registered: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.cancel = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const session = await service.getById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Not found' });
    await service.cancel(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.join = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const session = await service.getById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Not found' });

    const registered = await service.isRegistered(req.params.id, req.user.dbId);
    if (!registered) return res.status(403).json({ error: 'Register for this session before joining' });

    res.json({ jitsi_room_name: session.jitsi_room_name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};