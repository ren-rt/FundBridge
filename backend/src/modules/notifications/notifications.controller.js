// backend/src/modules/notifications/notifications.controller.js
const { validationResult } = require('express-validator');
const service = require('./notifications.service');

exports.listMine = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const notifications = await service.listForUser(req.user.dbId, { page, limit });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.unreadCount = async (req, res) => {
  try {
    const count = await service.unreadCount(req.user.dbId);
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.markRead = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const notification = await service.markRead(req.params.id, req.user.dbId);
    if (!notification) return res.status(404).json({ error: 'Not found' });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    await service.markAllRead(req.user.dbId);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};