// backend/src/modules/adminVerification/adminVerification.controller.js
const { validationResult } = require('express-validator');
const service = require('./adminVerification.service');

exports.listPending = async (req, res) => {
  try {
    const profiles = await service.listPendingVerifications();
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOne = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const profile = await service.getProfileById(req.params.id);
  if (!profile) return res.status(404).json({ error: 'Not found' });
  res.json(profile);
};

exports.approve = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const profile = await service.approveProfile(req.params.id, req.user.dbId);
    if (!profile) return res.status(404).json({ error: 'Not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.reject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const { reason } = req.body;
    const profile = await service.rejectProfile(req.params.id, req.user.dbId, reason);
    if (!profile) return res.status(404).json({ error: 'Not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};