const { validationResult } = require('express-validator');
const service = require('./messaging.service');

exports.send = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const result = await service.sendMessage(req.user.dbId, req.body.recipientUserId, req.body.content);
    res.status(201).json(result);
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
    res.status(500).json({ error: err.message });
  }
};

exports.listThreads = async (req, res) => {
  try {
    res.json(await service.listThreads(req.user.dbId));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMessages = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const thread = await service.getThread(req.params.threadId);
    if (!thread) return res.status(404).json({ error: 'Not found' });
    if (!service.isParticipant(thread, req.user.dbId)) {
      return res.status(403).json({ error: 'Not a participant in this conversation' });
    }
    res.json(await service.listMessages(req.params.threadId));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.reply = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const thread = await service.getThread(req.params.threadId);
    if (!thread) return res.status(404).json({ error: 'Not found' });
    const recipientUserId = thread.founder_user_id === req.user.dbId ? thread.investor_user_id : thread.founder_user_id;
    const result = await service.sendMessage(req.user.dbId, recipientUserId, req.body.content);
    res.status(201).json(result);
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
    res.status(500).json({ error: err.message });
  }
};

exports.accept = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const thread = await service.respondToThread(req.params.threadId, req.user.dbId, true);
    if (!thread) return res.status(404).json({ error: 'Not found' });
    res.json(thread);
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
    res.status(500).json({ error: err.message });
  }
};

exports.decline = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const thread = await service.respondToThread(req.params.threadId, req.user.dbId, false);
    if (!thread) return res.status(404).json({ error: 'Not found' });
    res.json(thread);
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
    res.status(500).json({ error: err.message });
  }
};