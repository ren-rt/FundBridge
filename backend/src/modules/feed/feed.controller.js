// backend/src/modules/feed/feed.controller.js
const { validationResult } = require('express-validator');
const service = require('./feed.service');

exports.getFeed = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const page = req.query.page ? parseInt(req.query.page, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
    const offset = (page - 1) * limit;

    const items = await service.getFeed(limit, offset);
    res.json({ page, limit, items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};